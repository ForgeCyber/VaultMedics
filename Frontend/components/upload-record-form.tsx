'use client'

import { useState } from 'react'
import { createMedicalRecord, updateMedicalRecord } from '@/app/actions/records'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

interface UploadRecordFormProps {
  onSuccess?: () => void
}

const RECORD_TYPES = [
  { value: 'lab_report', label: 'Lab Report' },
  { value: 'scan', label: 'Medical Scan' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'vaccine', label: 'Vaccination' },
  { value: 'other', label: 'Other' },
]

export function UploadRecordForm({ onSuccess }: UploadRecordFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [recordType, setRecordType] = useState('lab_report')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reloadRecords = () => {
    window.location.reload()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // First, create the record
      const record = await createMedicalRecord({
        title: title.trim(),
        description: description.trim() || undefined,
        record_type: recordType,
      })

      // If files are provided, upload them and save metadata for the first uploaded file
      if (files.length > 0) {
        const formData = new FormData()
        files.forEach((fileItem) => formData.append('file', fileItem))
        formData.append('recordId', record.id.toString())

        const uploadResponse = await fetch('/api/records/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          const responseText = await uploadResponse.text()
          throw new Error(responseText || 'Failed to upload files')
        }

        const responseData = await uploadResponse.json()

        if (responseData.files?.length > 0) {
          const firstFile = responseData.files[0]
          await updateMedicalRecord(record.id, {
            file_url: firstFile.fileUrl,
            file_name: firstFile.fileName,
            file_size: firstFile.fileSize || undefined,
            mime_type: firstFile.mimeType || undefined,
            encryption_key: firstFile.encryptionKey,
          })
        }
      }

      setTitle('')
      setDescription('')
      setRecordType('lab_report')
      setFiles([])
      onSuccess?.()
      reloadRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload record')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Record Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Annual Physical Exam"
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Record Type *
        </label>
        <select
          id="type"
          value={recordType}
          onChange={(e) => setRecordType(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {RECORD_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any notes about this record..."
          rows={3}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div>
        <label htmlFor="file" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
          Attach Files (Optional)
        </label>
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
          <input
            id="file"
            type="file"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            multiple
          />
          <label htmlFor="file" className="cursor-pointer block">
            <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Click to select files'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              PDF, DOC, DOCX, JPG, PNG, GIF up to 10MB each
            </p>
          </label>
        </div>
        {files.length > 0 && (
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {files.map((fileItem) => (
              <p key={fileItem.name} className="truncate">
                • {fileItem.name} ({Math.round(fileItem.size / 1024)} KB)
              </p>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !title.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? 'Uploading...' : 'Create Record'}
      </Button>
    </form>
  )
}
