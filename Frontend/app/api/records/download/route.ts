import { createClient } from '@/lib/supabase/server'
import { decryptBuffer, getIpfsHashFromUri, buildPinataGatewayUrl } from '@/lib/pinata'
import { NextRequest, NextResponse } from 'next/server'

async function fetchIpfsFile(ipfsUri: string) {
  const hash = getIpfsHashFromUri(ipfsUri)
  const gatewayUrl = buildPinataGatewayUrl(hash)
  const response = await fetch(gatewayUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch file from IPFS gateway: ${response.status} ${response.statusText}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

async function resolveFileMetadata(supabase: any, fileRecord: any) {
  const baseMetadata = {
    file_url: fileRecord.file_url,
    file_name: fileRecord.file_name,
    mime_type: fileRecord.mime_type,
    encryption_key: fileRecord.encryption_key,
  }

  if (!fileRecord.id) {
    return baseMetadata
  }

  const { data: attachments, error } = await supabase
    .from('record_attachments')
    .select('file_url,file_name,mime_type,encryption_key')
    .eq('record_id', fileRecord.id)
    .order('uploaded_at', { ascending: true })

  if (error || !attachments?.length) {
    return baseMetadata
  }

  const attachment = attachments.find((item: any) => item.encryption_key) || attachments[0]
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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recordId = request.nextUrl.searchParams.get('recordId')
    const attachmentId = request.nextUrl.searchParams.get('attachmentId')

    if (!recordId && !attachmentId) {
      return NextResponse.json({ error: 'recordId or attachmentId is required' }, { status: 400 })
    }

    let fileRecord: {
      id?: number | null
      file_url: string | null
      file_name: string | null
      mime_type: string | null
      encryption_key?: string | null
    } | null = null

    if (attachmentId) {
      const { data, error } = await supabase
        .from('record_attachments')
        .select('file_url,file_name,mime_type,encryption_key')
        .eq('id', Number(attachmentId))
        .eq('user_id', user.id)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      fileRecord = data
    } else if (recordId) {
      const { data, error } = await supabase
        .from('medical_records')
        .select('file_url,file_name,mime_type,encryption_key')
        .eq('id', Number(recordId))
        .eq('user_id', user.id)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      fileRecord = data
    }

    if (!fileRecord?.file_url) {
      return NextResponse.json({ error: 'No file found for download' }, { status: 404 })
    }

    const resolvedFileRecord = await resolveFileMetadata(supabase, fileRecord)
    if (!resolvedFileRecord.encryption_key) {
      return NextResponse.json({ error: 'Encryption key not found for this file' }, { status: 400 })
    }

    const fileName = resolvedFileRecord.file_name || 'download'
    const mimeType = resolvedFileRecord.mime_type || 'application/octet-stream'
    const bytes = await fetchIpfsFile(resolvedFileRecord.file_url)
    const fileBuffer = decryptBuffer(bytes, resolvedFileRecord.encryption_key)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('[v0] Download error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download file' },
      { status: 500 }
    )
  }
}
