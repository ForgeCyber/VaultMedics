'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

export async function getMedicalRecords() {
  const userId = await getUserId()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getMedicalRecord(id: number) {
  const userId = await getUserId()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data || null
}

export async function createMedicalRecord(data: {
  title: string
  description?: string
  record_type: string
  file_url?: string
  file_name?: string
  file_size?: number
  mime_type?: string
  encryption_key?: string
}) {
  const userId = await getUserId()
  const supabase = await createClient()

  const { data: record, error } = await supabase
    .from('medical_records')
    .insert({
      user_id: userId,
      ...data,
      uploaded_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Log for HIPAA compliance
  await supabase.from('consent_logs').insert({
    user_id: userId,
    action: 'upload',
    resource_type: 'medical_record',
    resource_id: record.id,
    details: `Uploaded ${data.record_type}: ${data.title}`,
    created_at: new Date().toISOString(),
  })

  revalidatePath('/')
  return record
}

export async function updateMedicalRecord(
  id: number,
  data: {
    title?: string
    description?: string
    record_type?: string
    file_url?: string
    file_name?: string
    file_size?: number
    mime_type?: string
    encryption_key?: string
  }
) {
  const userId = await getUserId()
  const supabase = await createClient()

  const { error } = await supabase
    .from('medical_records')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function getMedicalRecordAttachments(recordId: number) {
  const userId = await getUserId()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('record_attachments')
    .select('*')
    .eq('record_id', recordId)
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function deleteMedicalRecord(id: number) {
  const user_id = await getUserId()
  const supabase = await createClient()

  // Log for HIPAA compliance
  await supabase.from('consent_logs').insert({
    user_id,
    action: 'delete',
    resource_type: 'medical_record',
    resource_id: id,
    details: 'Record deleted',
    created_at: new Date().toISOString(),
  })

  const { error } = await supabase.from('medical_records').delete().eq('id', id).eq('user_id', user_id)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function getEncryptionKeyForAttachment(attachmentId: number) {
  const userId = await getUserId()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('record_attachments')
    .select('encryption_key')
    .eq('id', attachmentId)
    .eq('user_id', userId)
    .single()

  if (error) throw new Error(error.message)
  return data?.encryption_key || null
}
