'use client'

import { useEffect, useState } from 'react'
import { getAuditLogs } from '@/app/actions/audit'
import {
  Upload,
  Trash2,
  Eye,
  Share2,
  MessageSquare,
  Shield,
  Clock,
  Monitor,
} from 'lucide-react'

interface AuditLog {
  id: number
  action: string
  resource_type: string
  resource_id: number | null
  details: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

const ACTION_CONFIG: Record<string, { icon: typeof Upload; color: string; label: string }> = {
  upload: { icon: Upload, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950', label: 'Upload' },
  delete: { icon: Trash2, color: 'text-red-600 bg-red-50 dark:bg-red-950', label: 'Delete' },
  view: { icon: Eye, color: 'text-green-600 bg-green-50 dark:bg-green-950', label: 'View' },
  share: { icon: Share2, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950', label: 'Share' },
  ai_chat: { icon: MessageSquare, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950', label: 'AI Chat' },
  consent_grant: { icon: Shield, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950', label: 'Consent Granted' },
  consent_revoke: { icon: Shield, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950', label: 'Consent Revoked' },
}

export function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAuditLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Audit Trail</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete transparency — see who accessed what and when
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <Shield className="mx-auto h-10 w-10 mb-3 opacity-50" />
          <p>No audit events recorded yet. Activity will appear here as you use VaultMedics.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const config = ACTION_CONFIG[log.action] || {
              icon: Eye,
              color: 'text-slate-600 bg-slate-50 dark:bg-slate-800',
              label: log.action,
            }
            const Icon = config.icon

            return (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-900 dark:text-white">{config.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {log.resource_type}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{log.details}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                    {log.user_agent && (
                      <span className="flex items-center gap-1 truncate max-w-xs">
                        <Monitor size={12} />
                        {log.user_agent.includes('Mobile') ? 'Mobile' : 'Desktop'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
