import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase Admin Client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/provider/notes
 * Get provider notes for a specific record
 * 
 * Query params:
 * - recordId: The medical record ID
 * - providerWalletAddress: The provider's wallet address
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const recordId = searchParams.get('recordId')
    const providerWalletAddress = searchParams.get('providerWalletAddress')

    if (!recordId || !providerWalletAddress) {
      return NextResponse.json({ error: 'Missing required parameters: recordId and providerWalletAddress' }, { status: 400 })
    }

    const { data: notes, error } = await supabaseAdmin
      .from('provider_notes')
      .select('*')
      .eq('record_id', recordId)
      .eq('provider_wallet_address', providerWalletAddress.toLowerCase())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[ProviderNotes] Error fetching notes:', error)
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      notes: notes || [],
    })
  } catch (error) {
    console.error('[ProviderNotes] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/provider/notes
 * Create a new provider note for a record
 * 
 * Body:
 * {
 *   "recordId": number,
 *   "providerWalletAddress": string,
 *   "note": string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { recordId, providerWalletAddress, note } = await request.json()

    if (!recordId || !providerWalletAddress || !note) {
      return NextResponse.json({ error: 'Missing required parameters: recordId, providerWalletAddress, and note' }, { status: 400 })
    }

    const { data: newNote, error } = await supabaseAdmin
      .from('provider_notes')
      .insert({
        record_id: recordId,
        provider_wallet_address: providerWalletAddress.toLowerCase(),
        note,
      })
      .select()
      .single()

    if (error) {
      console.error('[ProviderNotes] Error creating note:', error)
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Note created successfully',
      note: newNote,
    })
  } catch (error) {
    console.error('[ProviderNotes] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create note' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/provider/notes
 * Update an existing provider note
 * 
 * Body:
 * {
 *   "noteId": number,
 *   "note": string
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const { noteId, note } = await request.json()

    if (!noteId || !note) {
      return NextResponse.json({ error: 'Missing required parameters: noteId and note' }, { status: 400 })
    }

    const { data: updatedNote, error } = await supabaseAdmin
      .from('provider_notes')
      .update({
        note,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .select()
      .single()

    if (error) {
      console.error('[ProviderNotes] Error updating note:', error)
      return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Note updated successfully',
      note: updatedNote,
    })
  } catch (error) {
    console.error('[ProviderNotes] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update note' },
      { status: 500 }
    )
  }
}
