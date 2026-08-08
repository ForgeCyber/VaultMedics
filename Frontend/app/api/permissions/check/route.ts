import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase Admin Client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/permissions/check
 * Check if a provider has permission to access a patient's records
 * 
 * Query params:
 * - providerWalletAddress: string
 * - patientId: string
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const providerWalletAddress = searchParams.get('providerWalletAddress')
    const patientId = searchParams.get('patientId')

    if (!providerWalletAddress || !patientId) {
      return NextResponse.json({ error: 'Missing required parameters: providerWalletAddress and patientId' }, { status: 400 })
    }

    // Normalize wallet address to lowercase
    const normalizedWalletAddress = providerWalletAddress.toLowerCase()

    const { data: permission, error } = await supabaseAdmin
      .from('provider_permissions')
      .select('*')
      .eq('patient_id', patientId)
      .eq('provider_wallet_address', normalizedWalletAddress)
      .eq('is_active', true)
      .single()

    if (error || !permission) {
      return NextResponse.json({
        success: true,
        hasPermission: false,
        message: 'No active permission found',
      })
    }

    // Check if permission has expired
    if (permission.expires_at && new Date(permission.expires_at) < new Date()) {
      return NextResponse.json({
        success: true,
        hasPermission: false,
        message: 'Permission has expired',
      })
    }

    return NextResponse.json({
      success: true,
      hasPermission: true,
      permission,
    })
  } catch (error) {
    console.error('[CheckPermission] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check permission' },
      { status: 500 }
    )
  }
}
