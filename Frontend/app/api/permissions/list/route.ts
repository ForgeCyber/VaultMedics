import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase Admin Client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/permissions/list
 * List all permissions for a patient or provider
 * 
 * Query params:
 * - patientId: string (optional) - list permissions granted by this patient
 * - providerWalletAddress: string (optional) - list permissions granted to this provider
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get('patientId')
    const providerWalletAddress = searchParams.get('providerWalletAddress')

    if (!patientId && !providerWalletAddress) {
      return NextResponse.json({ error: 'Missing required parameter: patientId or providerWalletAddress' }, { status: 400 })
    }

    let query = supabaseAdmin.from('provider_permissions').select('*')

    if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    if (providerWalletAddress) {
      query = query.eq('provider_wallet_address', providerWalletAddress.toLowerCase())
    }

    const { data: permissions, error } = await query.order('granted_at', { ascending: false })

    if (error) {
      console.error('[ListPermissions] Error:', error)
      return NextResponse.json({ error: 'Failed to list permissions' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      permissions,
    })
  } catch (error) {
    console.error('[ListPermissions] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list permissions' },
      { status: 500 }
    )
  }
}
