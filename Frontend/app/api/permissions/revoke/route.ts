import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase Admin Client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/permissions/revoke
 * Revoke provider permission to access patient records
 * 
 * Body:
 * {
 *   "patientId": string, // Supabase user ID (optional if patientWalletAddress provided)
 *   "patientWalletAddress": string, // Patient wallet address (optional if patientId provided)
 *   "providerWalletAddress": string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { patientId, patientWalletAddress, providerWalletAddress } = await request.json()

    if (!providerWalletAddress) {
      return NextResponse.json({ error: 'Missing required parameter: providerWalletAddress' }, { status: 400 })
    }

    if (!patientId && !patientWalletAddress) {
      return NextResponse.json({ error: 'Missing required parameter: patientId or patientWalletAddress' }, { status: 400 })
    }

    // Resolve patient ID if wallet address is provided
    let resolvedPatientId = patientId
    if (patientWalletAddress && !patientId) {
      const { data: patientUser, error: userError } = await supabaseAdmin
        .from('auth.users')
        .select('id')
        .or(`raw_user_meta_data->>wallet_address.eq.${patientWalletAddress.toLowerCase()},user_metadata->>wallet_address.eq.${patientWalletAddress.toLowerCase()}`)
        .single()

      if (userError || !patientUser) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
      }

      resolvedPatientId = patientUser.id
    }

    // Normalize wallet address to lowercase
    const normalizedWalletAddress = providerWalletAddress.toLowerCase()

    // Update permission to inactive
    const { data: revokedPermission, error: updateError } = await supabaseAdmin
      .from('provider_permissions')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('patient_id', resolvedPatientId)
      .eq('provider_wallet_address', normalizedWalletAddress)
      .select()
      .single()

    if (updateError) {
      console.error('[RevokePermission] Error revoking permission:', updateError)
      return NextResponse.json({ error: 'Failed to revoke permission' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Permission revoked successfully',
      permission: revokedPermission,
    })
  } catch (error) {
    console.error('[RevokePermission] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to revoke permission' },
      { status: 500 }
    )
  }
}
