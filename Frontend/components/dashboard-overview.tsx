'use client'

import { useEffect, useState } from 'react'
import { getDashboardStats } from '@/app/actions/audit'
import { getMedicalRecords } from '@/app/actions/records'
import { FileText, Sparkles, Shield, Activity, Upload, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardOverviewProps {
  onNavigate: (section: string) => void
  onUpload: () => void
}

export function DashboardOverview({ onNavigate, onUpload }: DashboardOverviewProps) {
  const [stats, setStats] = useState({ totalRecords: 0, aiSummaries: 0, verifiedOnChain: 0, auditEvents: 0 })
  const [recentRecords, setRecentRecords] = useState<{ id: number; title: string; record_type: string; uploaded_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardStats(), getMedicalRecords()])
      .then(([s, records]) => {
        setStats(s)
        setRecentRecords(records.slice(0, 3))
      })
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Medical Records', value: stats.totalRecords, icon: FileText, color: 'blue', action: 'records' },
    { label: 'AI Summaries', value: stats.aiSummaries, icon: Sparkles, color: 'purple', action: 'ai' },
    { label: 'Blockchain Verified', value: stats.verifiedOnChain, icon: Shield, color: 'emerald', action: 'records' },
    { label: 'Audit Events', value: stats.auditEvents, icon: Activity, color: 'amber', action: 'audit' },
  ]

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Your Health Vault</h2>
        <p className="text-blue-100 mb-4">
          Your records. Your control. AI-powered insights with blockchain-verified integrity.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Button onClick={onUpload} className="bg-white text-blue-600 hover:bg-blue-50">
            <Upload size={16} className="mr-2" />
            Upload Record
          </Button>
          <Button
            onClick={() => onNavigate('ai')}
            variant="outline"
            className="border-white/30 text-blue-600 hover:bg-white/10 dark:text-white"
          >
            <Sparkles size={16} className="mr-2" />
            Ask AI Assistant
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          const colorClasses: Record<string, { bg: string; text: string }> = {
            blue: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-600 dark:text-blue-400' },
            purple: { bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-600 dark:text-purple-400' },
            emerald: { bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-600 dark:text-emerald-400' },
            amber: { bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-600 dark:text-amber-400' },
          }
          const colors = colorClasses[card.color]
          return (
            <button
              key={card.label}
              onClick={() => onNavigate(card.action)}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 text-left hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700"
            >
              <div className={`inline-flex p-2 rounded-lg ${colors.bg} mb-3`}>
                <Icon size={20} className={colors.text} />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            </button>
          )
        })}
      </div>

      {/* Quick Actions + Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'View Health Timeline', section: 'timeline' },
              { label: 'Manage Doctor Permissions', section: 'permissions' },
              { label: 'Emergency Health Card', section: 'health-card' },
              { label: 'Review Audit Trail', section: 'audit' },
            ].map((action) => (
              <button
                key={action.section}
                onClick={() => onNavigate(action.section)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
                <ArrowRight size={16} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Recent Records</h3>
          {recentRecords.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No records yet. Upload your first medical document.</p>
          ) : (
            <div className="space-y-3">
              {recentRecords.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{r.title}</p>
                    <p className="text-xs text-slate-500">{r.record_type.replace('_', ' ')}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(r.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
