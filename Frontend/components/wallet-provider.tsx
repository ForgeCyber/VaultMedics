'use client'

import { ReactNode, useEffect } from 'react'
import { WagmiProvider, useConnection, useSwitchChain } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BOT_CHAIN_ID, config } from '@/lib/blockchain/wagmi-config'

const queryClient = new QueryClient()

function BotChainGuard({ children }: { children: ReactNode }) {
  const { isConnected, chainId } = useConnection()
  const { mutateAsync: switchChain } = useSwitchChain()

  useEffect(() => {
    if (!isConnected || !chainId || chainId === BOT_CHAIN_ID) return

    // Automatically request the wallet to switch to BOT Chain Mainnet.
    switchChain({ chainId: BOT_CHAIN_ID })
  }, [isConnected, chainId, switchChain])

  return <>{children}</>
}

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BotChainGuard>{children}</BotChainGuard>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
