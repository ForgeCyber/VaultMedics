import { createClient } from '@/lib/supabase/server'
import { generateMedicalSummary } from '@/lib/ai/gemini'
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

    const { recordId } = await request.json()

    if (!recordId) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 })
    }

    // Get the medical record
    const { data: record, error: recordError } = await supabase
      .from('medical_records')
      .select('*')
      .eq('id', recordId)
      .eq('user_id', user.id)
      .single()

    if (recordError || !record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    // Check if summary already exists
    const { data: existingSummary } = await supabase
      .from('record_summaries')
      .select('*')
      .eq('record_id', recordId)
      .eq('user_id', user.id)
      .single()

    if (existingSummary) {
      return NextResponse.json({
        summary: existingSummary.summary,
        keyFindings: existingSummary.key_findings,
        recommendations: existingSummary.recommendations,
        cached: true,
      })
    }

    // Generate summary using Gemini
    const contentToAnalyze = `
Title: ${record.title}
Type: ${record.record_type}
Description: ${record.description || 'No description provided'}
`

    const summary = await generateMedicalSummary(contentToAnalyze)

    // Store the summary
    const { data: storedSummary, error: storeError } = await supabase
      .from('record_summaries')
      .insert({
        record_id: recordId,
        user_id: user.id,
        summary: summary.summary,
        key_findings: summary.keyFindings,
        recommendations: summary.recommendations,
        generated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (storeError) {
      throw new Error(storeError.message)
    }

    return NextResponse.json({
      summary: storedSummary.summary,
      keyFindings: storedSummary.key_findings,
      recommendations: storedSummary.recommendations,
      cached: false,
    })
  } catch (error) {
    console.error('VaultMedics Summarization error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
