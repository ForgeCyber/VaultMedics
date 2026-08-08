import { useState } from 'react'

interface RecordSummary {
  summary: string
  keyFindings: string
  recommendations: string
  cached: boolean
}

export function useRecordSummary() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSummary = async (recordId: number): Promise<RecordSummary | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/records/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recordId }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { generateSummary, loading, error }
}
