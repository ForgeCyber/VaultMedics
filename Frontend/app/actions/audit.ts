'use server'

import { createClient } from '@/lib/supabase/server'

async function getUserId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

export async function getAuditLogs() {
  const userId = await getUserId()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consent_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data || []
}

export async function getDashboardStats() {
  const userId = await getUserId()
  const supabase = await createClient()

  const [records, summaries, blockchain, logs] = await Promise.all([
    supabase.from('medical_records').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('record_summaries').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('blockchain_records').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_verified', true),
    supabase.from('consent_logs').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ])

  return {
    totalRecords: records.count ?? 0,
    aiSummaries: summaries.count ?? 0,
    verifiedOnChain: blockchain.count ?? 0,
    auditEvents: logs.count ?? 0,
  }
}

export async function getHealthProfile() {
  const userId = await getUserId()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('health_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data || null
}

export async function updateHealthProfile(profile: {
  blood_type?: string
  allergies?: string
  emergency_contact?: string
  emergency_phone?: string
  medications?: string
  conditions?: string
}) {
  const userId = await getUserId()
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('health_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('health_profiles')
      .update({ ...profile, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('health_profiles').insert({
      user_id: userId,
      ...profile,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (error) throw new Error(error.message)
  }
}
