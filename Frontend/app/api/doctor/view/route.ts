import { createClient } from '@supabase/supabase-js'
import { decryptBuffer, getIpfsHashFromUri, buildPinataGatewayUrl } from '@/lib/pinata'
import { MEDICAL_RECORD_REGISTRY_ABI, CONTRACT_ADDRESSES } from '@/lib/blockchain/contract-abi'
import { ethers } from 'ethers'
import { NextRequest, NextResponse } from 'next/server'
import { BOT_CHAIN_ID } from '@/lib/blockchain/wagmi-config'

// Initialize Supabase Admin Client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fetchIpfsFile(ipfsUri: string) {
  const hash = getIpfsHashFromUri(ipfsUri)
  const gatewayUrl = buildPinataGatewayUrl(hash)
  const response = await fetch(gatewayUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch file from IPFS gateway: ${response.status} ${response.statusText}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

async function getDatabasePermission(
  patientAddress: string,
  doctorAddress: string,
  patientUser: any = null
) {
  const normalizedPatientAddress = patientAddress.toLowerCase()
  const normalizedDoctorAddress = doctorAddress.toLowerCase()

  const { data: permissions, error } = await supabaseAdmin
    .from('provider_permissions')
    .select('*')
    .eq('is_active', true)
    .ilike('provider_wallet_address', normalizedDoctorAddress)
    .limit(200)

  if (error || !permissions?.length) {
    return false
  }

  return permissions.some((permission: any) => {
    const matchesPatientId = !!patientUser?.id && permission.patient_id === patientUser.id
    const matchesWallet = !!permission.patient_wallet_address && permission.patient_wallet_address.toLowerCase() === normalizedPatientAddress
    const matchesProvider = !!permission.provider_wallet_address && permission.provider_wallet_address.toLowerCase() === normalizedDoctorAddress

    if (!matchesProvider) {
      return false
    }

    if (matchesPatientId || matchesWallet) {
      if (!permission.expires_at) {
        return true
      }

      return new Date(permission.expires_at) >= new Date()
    }

    return false
  })
}

export async function POST(request: NextRequest) {
  try {
    const { blockchainHash, patientAddress, doctorAddress, signature } = await request.json()

    if (!blockchainHash || !patientAddress || !doctorAddress || !signature) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // 1. Verify doctor's signature to ensure they are who they say they are
    const message = `View record ${blockchainHash}`
    const recoveredAddress = ethers.verifyMessage(message, signature)
    
    if (recoveredAddress.toLowerCase() !== doctorAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 2. Try to get patient user ID from wallet address (for database permission check)
    let patientUser = null
    let hasDatabasePermission = false

    try {
      const { data: user, error: userError } = await supabaseAdmin
        .from('auth.users')
        .select('id, raw_user_meta_data, user_metadata')
        .or(`raw_user_meta_data->>wallet_address.eq.${patientAddress.toLowerCase()},user_metadata->>wallet_address.eq.${patientAddress.toLowerCase()}`)
        .limit(1)
        .maybeSingle()

      if (!userError && user) {
        patientUser = user
      } else {
        console.log('[DoctorView] Patient not found in auth.users, checking wallet-based permission rows')
      }

      hasDatabasePermission = await getDatabasePermission(patientAddress, doctorAddress, patientUser)
    } catch (error) {
      console.log('[DoctorView] Patient lookup failed, will rely on blockchain consent only:', error)
    }

    // 4. Verify blockchain consent (required if no database permission)
    const provider = new ethers.JsonRpcProvider(BOT_CHAIN_ID.toString())
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.botChain,
      MEDICAL_RECORD_REGISTRY_ABI,
      provider
    )

    let hasBlockchainConsent = false
    try {
      hasBlockchainConsent = await contract.hasAccess(patientAddress, doctorAddress)
      console.log('[DoctorView] Blockchain consent check:', { patientAddress, doctorAddress, hasBlockchainConsent, hasDatabasePermission })
    } catch (error) {
      console.error('[DoctorView] Blockchain check failed:', error)
    }

    if (!hasBlockchainConsent && !hasDatabasePermission) {
      return NextResponse.json({
        error: 'No authorized access for this patient. Please ensure you have been granted permission either through the database or blockchain consent.',
        details: {
          hasBlockchainConsent,
          hasDatabasePermission,
          patientAddress,
          doctorAddress,
          patientFound: !!patientUser
        }
      }, { status: 403 })
    }

    // 5. Get record details from Supabase using blockchain hash
    const { data: blockchainRecord, error: brError } = await supabaseAdmin
      .from('blockchain_records')
      .select('record_id')
      .eq('blockchain_hash', blockchainHash)
      .single()

    if (brError || !blockchainRecord) {
      // Fallback: search by ipfsHash if blockchain_hash doesn't match (due to different hashing methods)
      // First get record from blockchain to get ipfsHash
      const onChainRecord = await contract.getRecord(blockchainHash)
      const ipfsHash = onChainRecord.ipfsHash
      
      const { data: medicalRecordByIpfs, error: mrError } = await supabaseAdmin
        .from('medical_records')
        .select('*')
        .eq('file_url', ipfsHash)
        .single()
      
      if (mrError || !medicalRecordByIpfs) {
        return NextResponse.json({ error: 'Record not found in database' }, { status: 404 })
      }
      
      const resolvedMetadata = await resolveFileMetadata(supabaseAdmin, medicalRecordByIpfs)
      return await serveFile(resolvedMetadata)
    }

    const { data: medicalRecord, error: mrError } = await supabaseAdmin
      .from('medical_records')
      .select('*')
      .eq('id', blockchainRecord.record_id)
      .single()

    if (mrError || !medicalRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 })
    }

    const resolvedMetadata = await resolveFileMetadata(supabaseAdmin, medicalRecord)
    return await serveFile(resolvedMetadata)

  } catch (error) {
    console.error('[DoctorView] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to view record' },
      { status: 500 }
    )
  }
}

async function resolveFileMetadata(supabase: any, medicalRecord: any) {
  const baseMetadata = {
    file_url: medicalRecord.file_url,
    file_name: medicalRecord.file_name,
    mime_type: medicalRecord.mime_type,
    encryption_key: medicalRecord.encryption_key,
  }

  if (!medicalRecord.id) {
    return baseMetadata
  }

  const { data: attachments, error } = await supabase
    .from('record_attachments')
    .select('file_url,file_name,mime_type,encryption_key')
    .eq('record_id', medicalRecord.id)
    .order('uploaded_at', { ascending: true })

  if (error || !attachments?.length) {
    return baseMetadata
  }

  const attachment = attachments[0]
  if (!attachment) {
    return baseMetadata
  }

  return {
    file_url: attachment.file_url || baseMetadata.file_url,
    file_name: attachment.file_name || baseMetadata.file_name,
    mime_type: attachment.mime_type || baseMetadata.mime_type,
    encryption_key: attachment.encryption_key || baseMetadata.encryption_key,
  }
}

function detectMimeType(fileBuffer: Buffer, fallbackMimeType?: string) {
  const fileHeader = fileBuffer.subarray(0, 5).toString('ascii')
  if (fileHeader === '%PDF-') {
    return 'application/pdf'
  }

  if (fallbackMimeType && fallbackMimeType.toLowerCase().includes('pdf')) {
    return 'application/pdf'
  }

  return fallbackMimeType || 'application/octet-stream'
}

async function serveFile(medicalRecord: any) {
  const fileUrl = medicalRecord.file_url
  if (!fileUrl) {
    return NextResponse.json({ error: 'No file associated with this record' }, { status: 404 })
  }

  const bytes = await fetchIpfsFile(fileUrl)
  const decryptedBytes = medicalRecord.encryption_key ? decryptBuffer(bytes, medicalRecord.encryption_key) : bytes
  const mimeType = detectMimeType(decryptedBytes, medicalRecord.mime_type)

  // Return file for viewing (inline) without download capability
  return new NextResponse(decryptedBytes, {
    status: 200,
    headers: {
      'Content-Type': mimeType,
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'",
    },
  })
}
