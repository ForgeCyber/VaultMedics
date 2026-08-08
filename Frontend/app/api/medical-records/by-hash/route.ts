import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase Admin Client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/medical-records/by-hash
 * Get medical record details by blockchain hash
 * 
 * Query params:
 * - hash: The blockchain hash of the record
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hash = searchParams.get('hash')

    if (!hash) {
      return NextResponse.json({ error: 'Missing required parameter: hash' }, { status: 400 })
    }

    // Get record from blockchain_records table
    const { data: blockchainRecord, error: brError } = await supabaseAdmin
      .from('blockchain_records')
      .select('record_id')
      .eq('blockchain_hash', hash)
      .single()

    if (brError || !blockchainRecord) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    // Get full record details from medical_records table
    const { data: medicalRecord, error: mrError } = await supabaseAdmin
      .from('medical_records')
      .select('id, title, description, record_type, file_name, mime_type, created_at')
      .eq('id', blockchainRecord.record_id)
      .single()

    if (mrError || !medicalRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      record: medicalRecord,
    })
  } catch (error) {
    console.error('[MedicalRecordsByHash] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch record' },
      { status: 500 }
    )
  }
}
