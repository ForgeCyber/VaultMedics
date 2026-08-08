'use client'

import { useState, useCallback } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { createClient } from '@/lib/supabase/client'

interface BlockchainVerificationResult {
  blockchainHash: string
  transactionHash: string
  isVerified: boolean
  chainId: number
}

export function useBlockchainVerification() {
  const { address, isConnected, chainId } = useAccount()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { writeContractAsync } = useWriteContract()

  const verifyRecord = useCallback(
    async (recordId: number, recordHash: string): Promise<BlockchainVerificationResult | null> => {
      if (!isConnected || !address) {
        setError('Wallet not connected')
        return null
      }

      try {
        setLoading(true)
        setError(null)

        // For now, we'll create a local verification record
        // In production, you'd call your smart contract here with writeContractAsync
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('User not authenticated')
        }

        // Create blockchain record in Supabase
        const { data, error: insertError } = await supabase
          .from('blockchain_records')
          .insert({
            record_id: recordId,
            user_id: user.id,
            blockchain_hash: recordHash,
            transaction_hash: `0x${Math.random().toString(16).slice(2)}`, // Mock transaction hash
            verification_timestamp: new Date().toISOString(),
            is_verified: true,
            chain_id: chainId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (insertError) {
          throw new Error(insertError.message)
        }

        return {
          blockchainHash: data.blockchain_hash,
          transactionHash: data.transaction_hash,
          isVerified: data.is_verified,
          chainId: data.chain_id,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Verification failed'
        setError(message)
        console.error('[v0] Blockchain verification error:', message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [isConnected, address, chainId]
  )

  return {
    verifyRecord,
    loading,
    error,
    isConnected,
    address,
    chainId,
  }
}
