import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase Admin Client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/permissions/grant
 * Grant provider permission to access patient records
 * 
 * Body:
 * {
 *   "patientId": string, // Supabase user ID (optional if patientWalletAddress provided)
 *   "patientWalletAddress": string, // Patient wallet address (optional if patientId provided)
 *   "providerWalletAddress": string,
 *   "expiresAt": string | null, // ISO date string or null for no expiration
 *   "blockchainTxHash": string | null // Optional blockchain transaction hash
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { patientId, patientWalletAddress, providerWalletAddress, expiresAt, blockchainTxHash } = await request.json()

    if (!providerWalletAddress) {
      return NextResponse.json({ error: 'Missing required parameter: providerWalletAddress' }, { status: 400 })
    }

    if (!patientId && !patientWalletAddress) {
      return NextResponse.json({ error: 'Missing required parameter: patientId or patientWalletAddress' }, { status: 400 })
    }

    // Resolve patient ID and wallet address
    let resolvedPatientId = patientId
    let resolvedPatientWalletAddress = patientWalletAddress

    if (patientWalletAddress && !patientId) {
      // Resolve patient ID from wallet address (check auth.users)
      const { data: patientUser, error: userError } = await supabaseAdmin
        .from('auth.users')
        .select('id')
        .or(`raw_user_meta_data->>wallet_address.eq.${patientWalletAddress.toLowerCase()},user_metadata->>wallet_address.eq.${patientWalletAddress.toLowerCase()}`)
        .single()

      if (userError || !patientUser) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
      }

      resolvedPatientId = patientUser.id
      resolvedPatientWalletAddress = patientWalletAddress
    } else if (patientId && !patientWalletAddress) {
      // Resolve patient wallet address from patient ID (check auth.users)
      const { data: patientUser, error: userError } = await supabaseAdmin
        .from('auth.users')
        .select('raw_user_meta_data, user_metadata')
        .eq('id', patientId)
        .single()

      if (userError || !patientUser) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
      }

      const userData = patientUser as any
      resolvedPatientWalletAddress = userData?.raw_user_meta_data?.wallet_address || userData?.user_metadata?.wallet_address
    }

    // Normalize wallet address to lowercase
    const normalizedWalletAddress = providerWalletAddress.toLowerCase()

    // Check if permission already exists
    const { data: existingPermission, error: fetchError } = await supabaseAdmin
      .from('provider_permissions')
      .select('*')
      .eq('patient_id', resolvedPatientId)
      .eq('provider_wallet_address', normalizedWalletAddress)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[GrantPermission] Error checking existing permission:', fetchError)
      return NextResponse.json({ error: 'Failed to check existing permission' }, { status: 500 })
    }

    if (existingPermission) {
      // Update existing permission
      const { data: updatedPermission, error: updateError } = await supabaseAdmin
        .from('provider_permissions')
        .update({
          is_active: true,
          expires_at: expiresAt || null,
          blockchain_tx_hash: blockchainTxHash || existingPermission.blockchain_tx_hash,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPermission.id)
        .select()
        .single()

      if (updateError) {
        console.error('[GrantPermission] Error updating permission:', updateError)
        return NextResponse.json({ error: 'Failed to update permission' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Permission updated successfully',
        permission: updatedPermission,
      })
    }

    // Insert new permission
    const { data: newPermission, error: insertError } = await supabaseAdmin
      .from('provider_permissions')
      .insert({
        patient_id: resolvedPatientId,
        patient_wallet_address: resolvedPatientWalletAddress,
        provider_wallet_address: normalizedWalletAddress,
        expires_at: expiresAt || null,
        blockchain_tx_hash: blockchainTxHash || null,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[GrantPermission] Error inserting permission:', insertError)
      return NextResponse.json({ error: 'Failed to grant permission' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Permission granted successfully',
      permission: newPermission,
    })
  } catch (error) {
    console.error('[GrantPermission] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to grant permission' },
      { status: 500 }
    )
  }
}
