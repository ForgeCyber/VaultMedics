import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase Admin Client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/patient/notes
 * Get all provider notes for a specific record (patient view)
 * 
 * Query params:
 * - recordId: The medical record ID
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const recordId = searchParams.get('recordId')

    if (!recordId) {
      return NextResponse.json({ error: 'Missing required parameter: recordId' }, { status: 400 })
    }

    // Fetch all provider notes for this record
    const { data: notes, error } = await supabaseAdmin
      .from('provider_notes')
      .select('*')
      .eq('record_id', recordId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[PatientNotes] Error fetching notes:', error)
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      notes: notes || [],
    })
  } catch (error) {
    console.error('[PatientNotes] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}
