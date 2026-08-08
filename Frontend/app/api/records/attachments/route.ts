import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
    if (!recordId) {
      return NextResponse.json({ error: 'Missing recordId' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('record_attachments')
      .select('id,file_name,file_size,mime_type,uploaded_at')
      .eq('record_id', Number(recordId))
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ attachments: data || [] })
  } catch (error) {
    console.error('[v0] Attachments fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch attachments' },
      { status: 500 }
    )
  }
}
