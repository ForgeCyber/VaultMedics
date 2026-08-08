'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RecordsList } from '@/components/records-list'
import { UploadRecordForm } from '@/components/upload-record-form'
import { ConsentManager } from '@/components/consent-manager'
import { HealthTimeline } from '@/components/health-timeline'
import { AuditTrail } from '@/components/audit-trail'
import { AiAssistant } from '@/components/ai-assistant'
import { HealthCard } from '@/components/health-card'
import { DashboardOverview } from '@/components/dashboard-overview'
import { WalletConnector } from '@/components/wallet-connector'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  ScrollText,
  Heart,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTheme } from '@/hooks/use-theme'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface DashboardClientProps {
  user: User
}

type Section = 'overview' | 'records' | 'timeline' | 'ai' | 'permissions' | 'audit' | 'health-card'

const NAV_ITEMS: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'records', label: 'My Records', icon: FileText },
  { id: 'timeline', label: 'Health Timeline', icon: Clock },
  { id: 'ai', label: 'AI Assistant', icon: Sparkles },
  { id: 'permissions', label: 'Permissions', icon: ShieldCheck },
  { id: 'audit', label: 'Audit Trail', icon: ScrollText },
  { id: 'health-card', label: 'Health Card', icon: Heart },
]

const SECTION_TITLES: Record<Section, { title: string; subtitle: string }> = {
  overview: { title: 'Dashboard', subtitle: 'Your health vault at a glance' },
  records: { title: 'Medical Records', subtitle: 'Secure management of your medical documents' },
  timeline: { title: 'Health Timeline', subtitle: 'Chronological view of your medical history' },
  ai: { title: 'AI Medical Assistant', subtitle: 'Understand your health information with AI' },
  permissions: { title: 'Consent Management', subtitle: 'Control who can access your records' },
  audit: { title: 'Audit Trail', subtitle: 'Complete transparency of all vault activity' },
  'health-card': { title: 'Emergency Health Card', subtitle: 'QR-coded emergency medical information' },
}

export function DashboardClient({ user }: DashboardClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('overview')
  const router = useRouter()
  const authClient = createClient()
  const { theme } = useTheme()

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    await authClient.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const sectionInfo = SECTION_TITLES[activeSection]

  return (
    <div className="flex h-screen">
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'
          } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col shrink-0`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Image
                src={theme === 'dark' ? '/icon-dark.png' : '/icon-light.png'}
                alt="VaultMedics Logo"
                width={32}
                height={32}
                className="shrink-0 rounded-lg"
              />
              <span className="text-lg font-bold bg-linear-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                VaultMedics
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveSection(id)
                setShowUpload(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${activeSection === id
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-200'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              title={label}
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}
          <WalletConnector className="flex md:hidden" />
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
              <Image
                src={`${user.image?.[0] || 'placeholder-user.jpg'}`}
                alt='User Logo'
                width={1000}
                height={1000}
                className='rounded-full border-2 border-slate-500 dark:border-slate-200'
              />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            )}
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut size={16} className="mr-2" />
            {sidebarOpen && (
              <span>Sign Out</span>
            )}
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{sectionInfo.title}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">{sectionInfo.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <WalletConnector className="hidden md:flex" />
              {activeSection === 'records' && (
                <Button
                  onClick={() => setShowUpload(!showUpload)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {showUpload ? 'Cancel' : '+ Upload Record'}
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeSection === 'overview' && (
            <DashboardOverview
              onNavigate={(section) => setActiveSection(section as Section)}
              onUpload={() => {
                setActiveSection('records')
                setShowUpload(true)
              }}
            />
          )}

          {activeSection === 'records' && (
            <>
              {showUpload && (
                <div className="mb-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Upload Medical Record
                  </h2>
                  <UploadRecordForm onSuccess={() => setShowUpload(false)} />
                </div>
              )}
              <RecordsList />
            </>
          )}

          {activeSection === 'timeline' && <HealthTimeline />}
          {activeSection === 'ai' && <AiAssistant />}
          {activeSection === 'permissions' && <ConsentManager userId={user.id} />}
          {activeSection === 'audit' && <AuditTrail />}
          {activeSection === 'health-card' && (
            <HealthCard userName={user.name || user.email} userEmail={user.email} userId={user.id} />
          )}
        </div>
      </main>
    </div>
  )
}
