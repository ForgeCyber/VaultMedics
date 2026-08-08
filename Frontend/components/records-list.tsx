'use client'

import { useEffect, useState } from 'react'
import { getMedicalRecords, deleteMedicalRecord } from '@/app/actions/records'
import { Trash2, FileText, Download, Zap, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RecordDetail } from './record-detail'

interface MedicalRecord {
  id: number
  user_id: string
  title: string
  description: string | null
  record_type: string
  file_url: string | null
  file_name: string | null
  file_size: number | null
  mime_type: string | null
  uploaded_at: Date
  created_at: Date
  updated_at: Date
}

export function RecordsList() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)

  const loadRecords = async () => {
    try {
      setLoading(true)
      const data = await getMedicalRecords()
      setRecords(data)
    } catch (error) {
      console.error('Failed to load records:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      setDeleting(id)
      await deleteMedicalRecord(id)
      setRecords(records.filter((r) => r.id !== id))
    } catch (error) {
      console.error('Failed to delete record:', error)
    } finally {
      setDeleting(null)
    }
  }

  const getRecordTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      lab_report: 'Lab Report',
      scan: 'Medical Scan',
      prescription: 'Prescription',
      diagnosis: 'Diagnosis',
      procedure: 'Procedure',
      vaccine: 'Vaccination',
      other: 'Other',
    }
    return labels[type] || type
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading records...</p>
        </div>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          No records yet
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Upload your first medical record to get started
        </p>
        <Button onClick={loadRecords}>Reload</Button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {records.map((record) => (
        <div
          key={record.id}
          className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-medium rounded-full">
                  {getRecordTypeLabel(record.record_type)}
                </span>
                {record.file_url && (
                  <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs font-medium rounded-full">
                    ✓ Uploaded
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                {record.title}
              </h3>
              {record.description && (
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 line-clamp-2">
                  {record.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span>📅 {formatDate(record.uploaded_at)}</span>
                {record.file_size && <span>📦 {formatFileSize(record.file_size)}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRecord(record)}
                className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                title="View Details"
              >
                <Eye size={18} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRecord(record)}
                className="text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                title="AI Summary"
              >
                <Zap size={18} />
              </Button>
              {record.file_url && (
                <a
                  href={`/api/records/download?recordId=${record.id}`}
                  className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download size={18} />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
      </div>
      <RecordDetail 
        record={selectedRecord} 
        onClose={() => setSelectedRecord(null)}
        onDelete={deleteMedicalRecord}
      />
    </>
  )
}
