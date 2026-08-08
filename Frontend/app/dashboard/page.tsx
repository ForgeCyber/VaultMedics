import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard-client'

export const metadata = {
  title: 'VaultMedics - Your Medical Vault',
  description: 'Secure medical record management with AI insights and blockchain verification',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <DashboardClient
        user={{
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email || 'User',
          image: user.user_metadata?.avatar_url || '',
        }}
      />
    </main>
  )
}
