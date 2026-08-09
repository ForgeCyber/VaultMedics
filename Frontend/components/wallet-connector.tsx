'use client'

import { useEffect, useState } from 'react'
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Wallet, LogOut, ChevronDown, Copy, ExternalLink } from 'lucide-react'
import Image from 'next/image'

export function WalletConnector( {className}: {className?: string} ) {
  const [mounted, setMounted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const { connectors, connect } = useConnect()
  const { address, isConnected, chain, chainId } = useAccount()
  const { disconnect } = useDisconnect()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const truncateAddress = (addr: string | undefined) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setShowAccountModal(false)
  }



  if (isConnected) {
    return (
      <div className={`${className}`}>
        <div className={`flex items-center gap-2`}>
          <Button
            onClick={() => setShowAccountModal(true)}
            variant="outline"
            size="sm"
            className="gap-2 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800"
          >
            <span className="text-lg">
              <Wallet className="w-6 h-6" />
            </span>
            <span className="font-medium hidden md:block">{truncateAddress(address)}</span>
            <ChevronDown size={16} />
          </Button>
        </div>

        {/* Account Modal */}
        {showAccountModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAccountModal(false)}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Account</h3>
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Connected with</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Injected Wallet</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg"><Wallet className='w-6 h-6' /></span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{chain?.name || 'Unknown'}</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm font-mono text-slate-700 dark:text-slate-300">{truncateAddress(address)}</span>
                  <Button
                    onClick={copyAddress}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    {copied ? <span className="text-green-600">✓</span> : <Copy size={16} />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={copyAddress}
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Copy size={16} />
                  Copy Address
                </Button>
                <Button
                  onClick={() => window.open(`${chainId === 677 ? `https://scan.botchain.ai/address/${address}` : `https://scan.bohr.life/address/${address}`}`, '_blank')}
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <ExternalLink size={16} />
                  View on Explorer
                </Button>
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 border-red-200 dark:border-red-800"
                >
                  <LogOut size={16} />
                  Disconnect
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        size="sm"
        className={`gap-2 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800 ${className}`}
      >
        <Wallet size={16} />
        <span className='hidden md:block'>Connect Wallet</span>
      </Button>

      {/* Connect Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Connect Wallet</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              Connect your wallet to access your medical records and manage permissions.
            </p>

            <div className="space-y-2">
              {connectors.map((connector) => (
                <Button
                  key={connector.uid}
                  onClick={() => {
                    connect({ connector })
                    setShowModal(false)
                  }}
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    <Image 
                      src={connector.icon || ''}
                      alt='Network Icon'
                      width={500}
                      height={500}
                      className=''
                    />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-slate-900 dark:text-white">{connector.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Injected Wallet</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
