import { createClient } from '@/lib/supabase/server'
import { chatWithMedicalAssistant } from '@/lib/ai/chat'
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

    const { message, history = [] } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const { data: records } = await supabase
      .from('medical_records')
      .select('record_type')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false })
      .limit(5)

    const reply = await chatWithMedicalAssistant(message, history, {
      recordCount: records?.length ?? 0,
      recentTypes: records?.map((r) => r.record_type) ?? [],
    })

    await supabase.from('consent_logs').insert({
      user_id: user.id,
      action: 'ai_chat',
      resource_type: 'ai_assistant',
      details: `AI chat: ${message.slice(0, 100)}`,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('[VaultMedics] AI chat error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chat failed' },
      { status: 500 }
    )
  }
}
