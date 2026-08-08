import { createClient } from '@/lib/supabase/server'
import { generateEncryptionKey, pinFileToIPFS } from '@/lib/pinata'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const recordId = formData.get('recordId') as string
    const rawFiles = formData.getAll('file')
    const files = rawFiles.filter((item): item is File => item instanceof File)

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (!recordId) {
      return NextResponse.json({ error: 'No record ID provided' }, { status: 400 })
    }

    const uploadedFiles: Array<{
      fileUrl: string
      fileName: string
      fileSize: number
      mimeType: string
      encryptionKey: string
    }> = []

    const MAX_FILE_SIZE = 50 * 1024 * 1024

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 50MB limit` },
          { status: 400 }
        )
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const encryptionKey = generateEncryptionKey()
      const uploadResult = await pinFileToIPFS(buffer, file.name, file.type, encryptionKey)
      const fileUrl = uploadResult.fileUrl

      uploadedFiles.push({
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        encryptionKey,
      })

      const { error: attachmentError } = await supabase.from('record_attachments').insert({
        record_id: Number(recordId),
        user_id: user.id,
        file_url: fileUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        encryption_key: encryptionKey,
      })

      if (attachmentError) {
        throw new Error(attachmentError.message)
      }
    }

    return NextResponse.json({ files: uploadedFiles })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    )
  }
}
