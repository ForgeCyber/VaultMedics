'use client'

import { X, Download, Trash2, Copy, CheckCircle, Sparkles, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useRecordSummary } from '@/hooks/use-record-summary'
import { BlockchainBadge } from './blockchain-badge'
import { updateMedicalRecord } from '@/app/actions/records'
import Link from 'next/link'

interface MedicalRecord {
  id: number
  userId?: string
  user_id?: string
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

interface RecordDetailProps {
  record: MedicalRecord | null
  onClose: () => void
  onDelete?: (id: number) => Promise<void>
}

export function RecordDetail({ record, onClose, onDelete }: RecordDetailProps) {
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [summary, setSummary] = useState<{
    summary: string
    keyFindings: string
    recommendations: string
    cached: boolean
  } | null>(null)
  const [attachments, setAttachments] = useState<Array<{
    id: number
    file_name: string
    file_size: number | null
    mime_type: string | null
    uploaded_at: string
  }>>([])
  const [attachmentsLoading, setAttachmentsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadingAttachments, setUploadingAttachments] = useState(false)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const [attachmentSuccess, setAttachmentSuccess] = useState<string | null>(null)
  const [providerNotes, setProviderNotes] = useState<Array<{
    id: number
    provider_wallet_address: string
    note: string
    created_at: string
    updated_at: string
  }>>([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const { generateSummary, loading: summaryLoading } = useRecordSummary()

  useEffect(() => {
    if (record?.id) {
      fetchAttachments()
      fetchProviderNotes()
    }
  }, [record?.id])

  const fetchAttachments = async () => {
    if (!record?.id) return

    setAttachmentsLoading(true)
    try {
      const response = await fetch(`/api/records/attachments?recordId=${record.id}`)
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Failed to load attachments')
      }
      const data = await response.json()
      setAttachments(data.attachments || [])
    } catch (err) {
      console.error('Failed to load attachments:', err)
    } finally {
      setAttachmentsLoading(false)
    }
  }

  const fetchProviderNotes = async () => {
    if (!record?.id) return

    setLoadingNotes(true)
    try {
      const response = await fetch(`/api/patient/notes?recordId=${record.id}`)
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Failed to load provider notes')
      }
      const data = await response.json()
      setProviderNotes(data.notes || [])
    } catch (err) {
      console.error('Failed to load provider notes:', err)
    } finally {
      setLoadingNotes(false)
    }
  }

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(Array.from(e.target.files || []))
    setAttachmentError(null)
    setAttachmentSuccess(null)
  }

  const handleUploadAttachments = async () => {
    if (!selectedFiles.length || !record?.id) return

    setUploadingAttachments(true)
    setAttachmentError(null)
    setAttachmentSuccess(null)

    try {
      const formData = new FormData()
      selectedFiles.forEach((fileItem) => formData.append('file', fileItem))
      formData.append('recordId', record.id.toString())

      const response = await fetch('/api/records/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Failed to upload attachments')
      }

      const data = await response.json()
      setAttachmentSuccess(`Uploaded ${data.files?.length || selectedFiles.length} attachment(s)`)
      setSelectedFiles([])

      if (data.files?.length > 0) {
        const firstFile = data.files[0]
        await updateMedicalRecord(record.id, {
          file_url: firstFile.fileUrl,
          file_name: firstFile.fileName,
          file_size: firstFile.fileSize || undefined,
          mime_type: firstFile.mimeType || undefined,
          encryption_key: firstFile.encryptionKey,
        })
      }

      fetchAttachments()
    } catch (err) {
      setAttachmentError(err instanceof Error ? err.message : 'Failed to upload attachments')
      console.error('[v0] Attachment upload error:',)
    } finally {
      setUploadingAttachments(false)
    }
  }

  if (!record) return null

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const copyToClipboard = () => {
    if (record?.id) {
      const downloadUrl = `${window.location.origin}/api/records/download?recordId=${record.id}`
      navigator.clipboard.writeText(downloadUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Kindly deactivate record from blockchain before deleting. Are you sure you want to delete this record? This action cannot be undone.')) return
    try {
      setDeleting(true)
      if (onDelete) {
        await onDelete(record.id)
        onClose()
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{record.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {getRecordTypeLabel(record.record_type)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {record.description && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Description
              </h3>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {record.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">
                Type
              </p>
              <p className="text-slate-900 dark:text-white font-medium">
                {getRecordTypeLabel(record.record_type)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">
                Uploaded
              </p>
              <p className="text-slate-900 dark:text-white font-medium">
                {formatDate(record.uploaded_at)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">
                File Size
              </p>
              <p className="text-slate-900 dark:text-white font-medium">
                {record.file_size ? formatFileSize(record.file_size) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">
                Status
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-slate-900 dark:text-white font-medium">Stored Securely</span>
              </div>
            </div>
          </div>

          {/* File Section */}
          {/* {record.file_url && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                File Information
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4 break-all font-mono">
                {record.file_name}
              </p>
              <div className="flex gap-2 flex-wrap">
                <a
                  href={`/api/records/download?recordId=${record.id}`}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Download size={16} />
                  Download File
                </a>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {copied ? (
                    <>
                      <CheckCircle size={16} className="mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-1" />
                      Copy URL
                    </>
                  )}
                </Button>
              </div>
            </div>
          )} */}

          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Add More Attachments
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload additional supporting files for this record.
                </p>
              </div>
              <Upload size={20} className="text-slate-500 dark:text-slate-400" />
            </div>

            <div className="space-y-3">
              <input
                id="attachment-files"
                type="file"
                multiple
                onChange={handleAttachmentSelect}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />

              {selectedFiles.length > 0 && (
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  {selectedFiles.map((fileItem) => (
                    <p key={fileItem.name} className="truncate">
                      • {fileItem.name} ({Math.round(fileItem.size / 1024)} KB)
                    </p>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {attachmentError && (
                  <div className="text-sm text-red-700 dark:text-red-300">{attachmentError}</div>
                )}
                {attachmentSuccess && (
                  <div className="text-sm text-emerald-700 dark:text-emerald-300">{attachmentSuccess}</div>
                )}
                <Button
                  onClick={handleUploadAttachments}
                  disabled={uploadingAttachments || selectedFiles.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {uploadingAttachments ? 'Uploading attachments...' : 'Upload Attachments'}
                </Button>
              </div>
            </div>
          </div>

          {attachmentsLoading ? (
            <div className="text-sm text-slate-500">Loading attachments...</div>
          ) : attachments.length > 0 ? (
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Attachments</h3>
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900">
                    <div className="min-w-0">
                      <Link
                        href={`/api/records/download?attachmentId=${attachment.id}`}
                        className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate block"
                      >
                        {attachment.file_name}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {attachment.mime_type || 'Unknown format'} • {attachment.file_size ? formatFileSize(attachment.file_size) : 'Unknown size'}
                      </p>
                    </div>
                    <Link
                      href={`/api/records/download?attachmentId=${attachment.id}`}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <Download size={14} />
                      Download
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Provider Notes Section */}
          {loadingNotes ? (
            <div className="text-sm text-slate-500">Loading provider notes...</div>
          ) : providerNotes.length > 0 ? (
            <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">Provider Notes</h3>
              <div className="space-y-3">
                {providerNotes.map((note) => (
                  <div key={note.id} className="bg-white dark:bg-slate-900 rounded-lg border border-purple-200 dark:border-purple-800 p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                        Provider: {note.provider_wallet_address.slice(0, 6)}...{note.provider_wallet_address.slice(-4)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {note.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Blockchain Verification Section */}
          <BlockchainBadge record={record} />

          {/* AI Summary Section */}
          {summary ? (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">AI-Generated Summary</h3>
                {summary.cached && (
                  <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    Cached
                  </span>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Summary</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">{summary.summary}</p>
              </div>

              {summary.keyFindings && (
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Key Findings</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                    {summary.keyFindings}
                  </p>
                </div>
              )}

              {summary.recommendations && (
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Recommendations</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                    {summary.recommendations}
                  </p>
                </div>
              )}

              <p className="text-xs text-blue-700 dark:text-blue-300 italic">
                Note: This is an AI-generated analysis for informational purposes only and should not replace professional medical advice.
              </p>
            </div>
          ) : (
            <Button
              onClick={async () => {
                if (record) {
                  const result = await generateSummary(record.id)
                  if (result) setSummary(result)
                }
              }}
              disabled={summaryLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {summaryLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating AI Summary...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Generate AI Summary
                </>
              )}
            </Button>
          )}

          {/* Security Notice */}
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
              Privacy & Security
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200">
              This record is encrypted and stored securely. Only you can access it unless you explicitly grant permission to healthcare providers. AI summaries are generated locally and not shared.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-2 justify-end p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                Delete Record
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
