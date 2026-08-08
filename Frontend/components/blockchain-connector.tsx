'use client'

import { useBlockchainRegistry } from '@/hooks/use-blockchain-registry'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Wallet, Unplug, AlertCircle, CheckCircle } from 'lucide-react'

export function BlockchainConnector() {
  const {
    connected,
    address,
    chainId,
    connectWallet,
    disconnectWallet,
    loading,
    error,
  } = useBlockchainRegistry()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (connected && address) {
    return (
      <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
        <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            Wallet Connected
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 truncate">
            {address}
          </p>
          {chainId && (
            <p className="text-xs text-green-700 dark:text-green-300">
              Chain ID: {chainId}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnectWallet}
          className="text-green-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <Unplug size={16} />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <AlertCircle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
      <Button
        onClick={connectWallet}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? (
          <>
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet size={16} className="mr-2" />
            Connect Wallet for Blockchain
          </>
        )}
      </Button>
      <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
        Connect your wallet to enable blockchain verification of medical records
      </p>
    </div>
  )
}
