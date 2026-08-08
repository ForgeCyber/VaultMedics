'use client'

import { useState, useEffect } from 'react'
import { useBlockchainRegistry } from '@/hooks/use-blockchain-registry'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, AlertCircle, Copy, ExternalLink, Lock, ShieldCheck } from 'lucide-react'
import { ethers } from 'ethers'
import { createClient } from '@/lib/supabase/client'
import { COSTON2_CHAIN_ID } from '@/lib/blockchain/wagmi-config'

interface BlockchainBadgeProps {
  record: {
    id: number
    title: string
    record_type: string
    file_url: string | null
    description: string | null
  }
}

export function BlockchainBadge({ record }: BlockchainBadgeProps) {
  const { 
    createRecord, 
    getRecord, 
    updateRecordIPFS,
    deactivateRecord,
    reactivateRecord,
    connected, 
    address, 
    chainId, 
    connectWallet, 
    loading: blockchainLoading 
  } = useBlockchainRegistry()
  
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [verified, setVerified] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [reactivating, setReactivating] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isOnChainActive, setIsOnChainActive] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkVerificationStatus()
  }, [record.id, connected])

  const checkVerificationStatus = async () => {
    if (!connected || !record.id) return

    try {
      // In a real app, we'd store the recordHash in our database after verification
      // For this demo/hackathon, we'll generate the hash and check the blockchain
      const recordHash = ethers.keccak256(
        ethers.toUtf8Bytes(`${record.id}-${record.title}-${record.record_type}`)
      )

      const onChainRecord = await getRecord(recordHash)
      if (onChainRecord && onChainRecord.timestamp > 0n) {
        setVerified(true)
        setIsOnChainActive(onChainRecord.isActive)
        // Note: We don't have the tx hash unless we stored it,
        // but we know it's verified if it exists on-chain
      } else {
        setIsOnChainActive(false)
      }
    } catch (err) {
      // Record not found on-chain, which is fine
      console.log('Record not yet verified on-chain')
      setIsOnChainActive(false)
    }
  }

  const verifyOnBlockchain = async () => {
    try {
      if (!connected) {
        await connectWallet()
        return
      }

      setError(null)
      setVerifying(true)

      // Create a unique hash for this record
      const recordHash = ethers.keccak256(
        ethers.toUtf8Bytes(`${record.id}-${record.title}-${record.record_type}`)
      )

      // The IPFS hash is where the encrypted content is (we use the file URL as a proxy)
      const ipfsHash = record.file_url || 'no-file-attached'

      const result = await createRecord(
        recordHash,
        record.record_type,
        ipfsHash
      )

      const { data: { user } } = await supabase.auth.getUser()

      const { data, error: insertError } = await supabase.from('blockchain_records').insert({
        record_id: record.id,
        user_id: user?.id,
        blockchain_hash: recordHash,
        transaction_hash: result.transactionHash,
        verification_timestamp: new Date().toISOString(),
        is_verified: true,
        chain_id: COSTON2_CHAIN_ID,
        contract_address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (result.success) {
        setVerified(true)
        setTransactionHash(result.transactionHash)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed'
      if (message.includes('Record already exists')) {
        setVerified(true)
        setError('This record is already verified on-chain.')
      } else {
        setError(message)
      }
      console.error('[v0] Blockchain verification error:', message)
    } finally {
      setVerifying(false)
    }
  }

  const copyToClipboard = () => {
    if (transactionHash) {
      navigator.clipboard.writeText(transactionHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const updateOnChain = async () => {
    if (!record.file_url) {
      setError('No file URL available to update on-chain')
      return
    }

    if (!connected) {
      await connectWallet()
    }

    try {
      setActionMessage(null)
      setError(null)
      setUpdating(true)

      const recordHash = ethers.keccak256(
        ethers.toUtf8Bytes(`${record.id}-${record.title}-${record.record_type}`)
      )

      const result = await updateRecordIPFS(recordHash, record.file_url)

      const { data: { user } } = await supabase.auth.getUser()

      const { data, error: updateError } = await supabase.from('blockchain_records').update({
        record_id: record.id,
        user_id: user?.id,
        blockchain_hash: recordHash,
        transaction_hash: result.transactionHash,
        verification_timestamp: new Date().toISOString(),
        is_verified: true,
        chain_id: COSTON2_CHAIN_ID,
        contract_address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      console.log('Update result:', data, updateError)

      if (result.success) {
        setActionMessage('On-chain IPFS pointer updated successfully.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update on-chain record'
      setError(message)
      console.error('[v0] On-chain update failed:', message)
    } finally {
      setUpdating(false)
    }
  }

  const deactivateOnChain = async () => {
    if (!connected) {
      await connectWallet()
    }

    try {
      setActionMessage(null)
      setError(null)
      setDeactivating(true)

      const recordHash = ethers.keccak256(
        ethers.toUtf8Bytes(`${record.id}-${record.title}-${record.record_type}`)
      )

      const result = await deactivateRecord(recordHash)
      if (result.success) {
        setActionMessage('Record deactivated on chain.')
        // Refresh on-chain status
        await checkVerificationStatus()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate record on-chain'
      setError(message)
      console.error('[v0] On-chain deactivate failed:', message)
    } finally {
      setDeactivating(false)
    }
  }

  const reactivateOnChain = async () => {
    if (!connected) {
      await connectWallet()
    }

    try {
      setActionMessage(null)
      setError(null)
      setReactivating(true)

      const recordHash = ethers.keccak256(
        ethers.toUtf8Bytes(`${record.id}-${record.title}-${record.record_type}`)
      )

      const result = await reactivateRecord(recordHash)
      if (result.success) {
        setActionMessage('Record reactivated on chain.')
        // Refresh on-chain status
        await checkVerificationStatus()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reactivate record on-chain'
      setError(message)
      console.error('[v0] On-chain reactivate failed:', message)
    } finally {
      setReactivating(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Lock size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Flare Blockchain Attestation
            </h3>
            <p className="text-xs text-slate-500">Immutable proof of record existence</p>
          </div>
        </div>
        {verified && (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-900">
            Verified <ShieldCheck size={12} />
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-300 font-medium">{error}</p>
        </div>
      )}
      {actionMessage && (
        <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
          <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">{actionMessage}</p>
        </div>
      )}

      {!verified ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Secure this medical record by creating an immutable cryptographic proof on the Flare network. This allows providers to verify its authenticity without relying on a central authority.
          </p>
          <Button
            onClick={verifyOnBlockchain}
            disabled={verifying || blockchainLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11"
          >
            {verifying ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Signing & Securing...
              </>
            ) : !connected ? (
              <>
                <Lock size={18} className="mr-2" />
                Connect Wallet to Attest
              </>
            ) : (
              <>
                <ShieldCheck size={18} className="mr-2" />
                Attest on Flare Network
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">Status</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                On-Chain <CheckCircle size={12} />
              </span>
            </div>
            
            {transactionHash ? (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Transaction Proof</div>
                <div className="flex items-center gap-2">
                  <code className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2 py-1.5 rounded flex-1 truncate border border-slate-100 dark:border-slate-700 font-mono">
                    {transactionHash}
                  </code>
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                  >
                    {copied ? <CheckCircle size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </Button>
                </div>
                <a
                  href={`https://coston2-explorer.flare.network/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-xs font-bold pt-1"
                >
                  View on Coston2 Explorer
                  <ExternalLink size={12} />
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 italic">
                This record was previously verified. View your profile to manage on-chain proofs.
              </p>
            )}

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                onClick={updateOnChain}
                disabled={updating || !record.file_url || blockchainLoading}
                variant="secondary"
                className={`w-full text-sm h-11 ${isOnChainActive ? 'block' : 'hidden'}`}
              >
                {updating ? 'Updating on-chain...' : 'Update IPFS on Chain'}
              </Button>
              <Button
                onClick={deactivateOnChain}
                disabled={deactivating || blockchainLoading}
                variant="outline"
                className={`w-full text-sm h-11 ${isOnChainActive ? 'block' : 'hidden'}`}
              >
                {deactivating ? 'Deactivating...' : 'Deactivate Record'}
              </Button>
              <Button
                onClick={reactivateOnChain}
                disabled={reactivating || blockchainLoading}
                variant="outline"
                className={`w-full text-sm h-11 ${isOnChainActive ? 'hidden' : 'block'}`}
              >
                {reactivating ? 'Reactivating...' : 'Reactivate Record'}
              </Button>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-lg">
             <p className="text-[10px] text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
              Attestation Complete: This record is now immutably linked to your identity on Flare. Authorized providers can verify the integrity of this document using its cryptographic fingerprint.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
