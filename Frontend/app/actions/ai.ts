'use server'

import { generateMedicalSummary } from '@/lib/ai/gemini'
import { createClient } from '@/lib/supabase/server'

async function getUserId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

export async function summarizeRecord(recordId: number, content: string) {
  const userId = await getUserId()
  const supabase = await createClient()

  // Check if user owns this record
  const { data: record, error: recordError } = await supabase
    .from('medical_records')
    .select('id')
    .eq('id', recordId)
    .eq('user_id', userId)
    .single()

  if (recordError || !record) {
    throw new Error('Record not found or unauthorized')
  }

  // Check if summary already exists
  const { data: existingSummary } = await supabase
    .from('record_summaries')
    .select('*')
    .eq('record_id', recordId)
    .eq('user_id', userId)
    .single()

  if (existingSummary) {
    return existingSummary
  }

  // Generate new summary
  const summary = await generateMedicalSummary(content)

  // Save to database
  const { data: savedSummary, error: saveError } = await supabase
    .from('record_summaries')
    .insert({
      record_id: recordId,
      user_id: userId,
      summary: summary.summary,
      key_findings: summary.keyFindings,
      recommendations: summary.recommendations,
      generated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (saveError) throw new Error(saveError.message)

  return savedSummary
}

export async function getRecordSummary(recordId: number) {
  const userId = await getUserId()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('record_summaries')
    .select('*')
    .eq('record_id', recordId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data || null
}
