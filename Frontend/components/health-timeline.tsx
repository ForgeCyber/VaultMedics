'use client'

import { useEffect, useState } from 'react'
import { getMedicalRecords } from '@/app/actions/records'
import {
  Activity,
  FileText,
  Pill,
  Syringe,
  Stethoscope,
  Scan,
  Calendar,
} from 'lucide-react'

interface TimelineEvent {
  id: number
  title: string
  type: string
  date: Date
  description?: string | null
}

const TYPE_CONFIG: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  lab_report: { icon: Activity, color: 'bg-blue-500', label: 'Lab Report' },
  scan: { icon: Scan, color: 'bg-purple-500', label: 'Medical Scan' },
  prescription: { icon: Pill, color: 'bg-green-500', label: 'Prescription' },
  diagnosis: { icon: Stethoscope, color: 'bg-red-500', label: 'Diagnosis' },
  procedure: { icon: FileText, color: 'bg-orange-500', label: 'Procedure' },
  vaccine: { icon: Syringe, color: 'bg-teal-500', label: 'Vaccination' },
  other: { icon: FileText, color: 'bg-slate-500', label: 'Other' },
}

export function HealthTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMedicalRecords()
      .then((records) => {
        setEvents(
          records.map((r) => ({
            id: r.id,
            title: r.title,
            type: r.record_type,
            date: new Date(r.uploaded_at),
            description: r.description,
          }))
        )
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
        <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No timeline events yet</h3>
        <p className="text-slate-600 dark:text-slate-400">
          Upload medical records to build your health timeline automatically.
        </p>
      </div>
    )
  }

  const sorted = [...events].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Health Timeline</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Chronological view of your medical history
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

        <div className="space-y-6">
          {sorted.map((event) => {
            const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.other
            const Icon = config.icon

            return (
              <div key={event.id} className="relative flex gap-4 pl-12">
                <div
                  className={`absolute left-2.5 w-5 h-5 rounded-full ${config.color} flex items-center justify-center ring-4 ring-white dark:ring-slate-900`}
                >
                  <Icon size={10} className="text-white" />
                </div>

                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {config.label}
                      </span>
                      <h3 className="font-semibold text-slate-900 dark:text-white mt-0.5">{event.title}</h3>
                    </div>
                    <time className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {event.date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  {event.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
