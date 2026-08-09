'use client'

import { useState, useEffect } from 'react'
import { useBlockchainRegistry } from '@/hooks/use-blockchain-registry'
import {
  FileText,
  Search,
  ExternalLink,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Calendar,
  Tag,
  X,
  Eye,
  Notebook,
  Pen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'

interface DoctorDashboardProps {
  patientAddress: string
}

interface BlockchainRecord {
  recordHash: string
  patient: string
  creator: string
  timestamp: bigint
  recordType: string
  ipfsHash: string
  isActive: boolean
  description: string
  recordId?: number
  recordName: string
}

export function DoctorDashboard({ patientAddress }: DoctorDashboardProps) {
  const { getPatientRecords, getRecord, address, signer, loading: blockchainLoading } = useBlockchainRegistry()
  const [records, setRecords] = useState<BlockchainRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewMimeType, setPreviewMimeType] = useState('application/octet-stream')
  const [previewTitle, setPreviewTitle] = useState('Medical Record Preview')
  const [previewText, setPreviewText] = useState('')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewingRecordHash, setPreviewingRecordHash] = useState<string | null>(null)
  const [providerNotes, setProviderNotes] = useState<Record<string, string>>({})
  const [savingNote, setSavingNote] = useState(false)

  useEffect(() => {
    if (patientAddress) {
      fetchRecords()
    }
  }, [patientAddress])

  const fetchNotes = async (recordId: number) => {
    if (!address) return

    try {
      const response = await fetch(`/api/provider/notes?recordId=${recordId}&providerWalletAddress=${address}`)
      const data = await response.json()
      if (data.success && data.notes.length > 0) {
        setProviderNotes(prev => ({
          ...prev,
          [String(recordId)]: data.notes[0].note
        }))
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const saveNote = async (recordId?: number) => {
    if (!address || !recordId) {
      console.error('Cannot save note: missing required data', { address, recordId })
      return
    }

    const note = providerNotes[String(recordId)]
    if (!note?.trim()) {
      console.error('Cannot save note: note is empty')
      return
    }

    try {
      setSavingNote(true)
      const response = await fetch('/api/provider/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordId,
          providerWalletAddress: address,
          note,
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Note is already in state, no need to refresh
      }
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setSavingNote(false)
    }
  }

  const openRecordPreview = async (recordHash: string, patient: string, recordType: string) => {
    if (!address || !signer) {
      setPreviewError('Connect your doctor wallet before previewing a record.')
      setIsPreviewOpen(true)
      return
    }

    try {
      setPreviewError(null)
      setPreviewingRecordHash(recordHash)
      setPreviewTitle(`${getRecordTypeLabel(recordType)} Preview`)
      setPreviewText('')

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(null)

      const signature = await signer.signMessage(`View record ${recordHash}`)

      const response = await fetch('/api/doctor/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockchainHash: recordHash,
          patientAddress: patient,
          doctorAddress: address,
          signature,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'Unable to preview this record right now.')
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream'
      const documentUrl = response.headers.get('document')
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)

      console.log('[DoctorDashboard] File received:', {
        contentType,
        blobSize: blob.size,
        objectUrl,
        recordHash
      })

      if (contentType.startsWith('text/') || contentType.includes('json') || contentType.includes('xml')) {
        const text = await blob.text()
        setPreviewText(text)
      }

      setPreviewMimeType(contentType)
      setPreviewUrl(objectUrl)
      setIsPreviewOpen(true)
    } catch (err) {
      console.error('Error previewing record:', err)
      setPreviewError(err instanceof Error ? err.message : 'Unable to preview this record.')
      setIsPreviewOpen(true)
    } finally {
      setPreviewingRecordHash(null)
    }
  }

  const fetchRecords = async () => {
    try {
      setLoading(true)
      setError(null)

      const recordHashes = await getPatientRecords(patientAddress)

      if (!recordHashes || recordHashes.length === 0) {
        setRecords([])
        return
      }

      const recordDetails = await Promise.all(
        recordHashes.map(async (hash: string) => {
          const blockchainRecord = await getRecord(hash)

          // Convert array response to object if needed
          let formattedRecord: BlockchainRecord
          if (Array.isArray(blockchainRecord)) {
            formattedRecord = {
              recordHash: blockchainRecord[0],
              patient: blockchainRecord[1],
              creator: blockchainRecord[2],
              timestamp: blockchainRecord[3],
              recordType: blockchainRecord[4],
              ipfsHash: blockchainRecord[5],
              isActive: blockchainRecord[6],
              description: '',
              recordName: '',
            }
          } else {
            formattedRecord = blockchainRecord as BlockchainRecord
          }

          // Fetch record details from database to get record ID and description
          try {
            const response = await fetch(`/api/medical-records/by-hash?hash=${hash}`)
            const data = await response.json()
            console.log('data for hash:', hash, data)
            if (data.success && data.record) {
              formattedRecord = {
                ...formattedRecord,
                recordId: data.record.id,
                recordName: data.record.title,
                description: data.record.description || '',
              }
            }
          } catch (error) {
            console.error('Error fetching record details:', error)
          }

          return formattedRecord
        })
      )

      // Filter active records and sort by timestamp
      const activeRecords = recordDetails
        .filter((r: BlockchainRecord) => r.isActive)
        .sort((a: BlockchainRecord, b: BlockchainRecord) => Number(b.timestamp - a.timestamp))

      setRecords(activeRecords)

      console.log('record details', recordDetails)
      console.log('active records', activeRecords)

      // Fetch notes for all records that have a recordId
      if (address) {
        activeRecords.forEach((record: BlockchainRecord) => {
          if (record.recordId) {
            fetchNotes(record.recordId)
          }
        })
      }
    } catch (err) {
      console.error('Error fetching records:', err)
      setError('Failed to fetch patient records from blockchain. Ensure you have authorized access.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRecordTypeColor = (type: string) => {
    const types: Record<string, string> = {
      lab_report: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      scan: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      prescription: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      diagnosis: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      default: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
    }
    return types[type] || types.default
  }

  const getRecordTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Fetching patient records from Blockchain...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h3 className="text-lg font-bold text-red-900 dark:text-red-100">Access Error</h3>
        <p className="text-red-800 dark:text-red-200 max-w-md mx-auto">{error}</p>
        <Button onClick={fetchRecords} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
          Try Again
        </Button>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Blockchain Records Found</h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          This patient has not yet registered any medical records on the blockchain or has not granted you visibility permissions.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-600" size={20} />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Patient Record Vault</h2>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600">
          {records.length} Records Found
        </span>
      </div>

      <div className="grid gap-4">
        {records.map((record, index) => (
          <Card key={record.recordHash} className="overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row">
              <div className="p-6 flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${getRecordTypeColor(record.recordType)}`}>
                        {getRecordTypeLabel(record.recordType)}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(record.timestamp)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Record Proof: {record.recordHash.slice(0, 10)}...{record.recordHash.slice(-8)} - {record.recordName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Verification</p>
                      <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 justify-end">
                        On-Chain <ShieldCheck size={12} />
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <User size={12} /> Patient Address
                    </p>
                    <p className="font-mono text-xs truncate text-slate-700 dark:text-slate-300">
                      {record.patient}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <ExternalLink size={12} /> Encrypted Content (IPFS/Vercel)
                    </p>
                    <p className="font-mono text-xs truncate text-blue-600 dark:text-blue-400">
                      {record.ipfsHash}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <Notebook size={12} /> Record Description
                    </p>
                    <p className="font-mono text-xs text-slate-700 dark:text-slate-300">
                      {record.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <Pen size={12} /> Write Notes
                    </p>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      saveNote(record.recordId)
                    }}>
                      <textarea
                        value={record.recordId ? providerNotes[String(record.recordId)] || '' : ''}
                        onChange={(e) => {
                          if (record.recordId) {
                            setProviderNotes(prev => ({
                              ...prev,
                              [String(record.recordId)]: e.target.value
                            }))
                          }
                        }}
                        placeholder="Write notes here..."
                        className="w-full bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-300 resize-none"
                        rows={2}
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="text-xs mt-2"
                        disabled={savingNote || !record.recordId}
                      >
                        {savingNote ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                        Save Note
                      </Button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 p-6 flex flex-row md:flex-col justify-center gap-3">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Link 
                    href={record.ipfsHash} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className='flex flex-row items-center gap-1'
                  >
                    <ExternalLink size={14} className="mr-2" />
                    Open Source
                  </Link>
                </Button>
                <Button
                  onClick={() => openRecordPreview(record.recordHash, record.patient, record.recordType)}
                  disabled={previewingRecordHash === record.recordHash}
                  size="sm"
                  variant="default"
                  className="w-full text-xs"
                >
                  {previewingRecordHash === record.recordHash ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                  ) : (
                    <Eye size={14} className="mr-2" />
                  )}
                  {previewingRecordHash === record.recordHash ? 'Preparing Preview...' : 'Decrypt and View'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
        <div className="text-sm">
          <p className="font-bold text-amber-900 dark:text-amber-100 mb-1">Confidential Compute Note</p>
          <p className="text-amber-800 dark:text-amber-200">
            This dashboard demonstrates medical record verification via BOT Chain. In a production environment, sensitive data would be processed using BOT Network Technology to ensure data is never decrypted outside of secure enclaves.
          </p>
        </div>
      </div>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{previewTitle}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Decrypted in-session and shown inline without a download link.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsPreviewOpen(false)}>
                <X size={16} className="mr-2" />
                Close
              </Button>
            </div>

            <div className="max-h-[calc(90vh-72px)] overflow-auto bg-slate-50 p-4 dark:bg-slate-950/60">
              {previewError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
                  {previewError}
                </div>
              ) : previewUrl && previewMimeType.startsWith('image/') ? (
                <div className="flex justify-center">
                  <img src={previewUrl} alt="Medical record preview" className="max-w-full rounded-lg border border-slate-200 dark:border-slate-800" />
                </div>
              ) : previewUrl && previewMimeType === 'application/pdf' ? (
                <div className="flex flex-col items-center space-y-4">
                  <iframe 
                    src={previewUrl} 
                    title={previewTitle} 
                    className="h-[70vh] w-full rounded-lg border border-slate-200 dark:border-slate-800" 
                  />
                </div>
              ) : previewUrl && (previewMimeType.startsWith('text/') || previewMimeType.includes('json') || previewMimeType.includes('xml')) ? (
                <pre 
                  className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-4 font-mono text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  {previewText || 'The file contents were loaded successfully.'}
                </pre>
              ) : previewUrl ? (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  <p className="font-semibold">This file type cannot be rendered inline in the browser.</p>
                  <p className="mt-2">The decrypted content was retrieved successfully, but your browser does not support a built-in preview for this format.</p>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-10 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading decrypted content...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
