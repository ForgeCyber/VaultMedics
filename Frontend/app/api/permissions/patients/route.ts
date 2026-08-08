import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Supabase Admin Client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/permissions/patients
 * List all patients that a provider has permission to access
 * 
 * Query params:
 * - providerWalletAddress: string
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const providerWalletAddress = searchParams.get('providerWalletAddress')

    if (!providerWalletAddress) {
      return NextResponse.json({ error: 'Missing required parameter: providerWalletAddress' }, { status: 400 })
    }

    // Normalize wallet address to lowercase
    const normalizedWalletAddress = providerWalletAddress.toLowerCase()

    // Get all active permissions for this provider
    const { data: permissions, error: permError } = await supabaseAdmin
      .from('provider_permissions')
      .select('patient_id, granted_at, expires_at, is_active')
      .eq('provider_wallet_address', normalizedWalletAddress)
      .eq('is_active', true)

    if (permError) {
      console.error('[ListPatients] Error fetching permissions:', permError)
      return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
    }

    if (!permissions || permissions.length === 0) {
      return NextResponse.json({
        success: true,
        patients: [],
      })
    }

    // Get patient details for each permission
    const patientIds = permissions.map(p => p.patient_id)
    const { data: patients, error: userError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email, raw_user_meta_data')
      .in('id', patientIds)

    if (userError) {
      console.error('[ListPatients] Error fetching patients:', userError)
      return NextResponse.json({ error: 'Failed to fetch patient details' }, { status: 500 })
    }

    // Combine permissions with patient details
    const patientsWithPermissions = patients?.map(patient => {
      const permission = permissions.find(p => p.patient_id === patient.id)
      return {
        id: patient.id,
        email: patient.email,
        walletAddress: patient.raw_user_meta_data?.wallet_address,
        grantedAt: permission?.granted_at,
        expiresAt: permission?.expires_at,
        isActive: permission?.is_active,
      }
    }) || []

    return NextResponse.json({
      success: true,
      patients: patientsWithPermissions,
    })
  } catch (error) {
    console.error('[ListPatients] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list patients' },
      { status: 500 }
    )
  }
}
