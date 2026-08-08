import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, flare, flareTestnet } from 'wagmi/chains'

const coston2Chain = {
  id: 114,
  name: 'Coston2 Testnet',
  network: 'coston2',
  nativeCurrency: { name: 'Coston Flare', symbol: 'cFLR', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
    public: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Coston2 Explorer', url: 'https://coston2-explorer.flare.network' },
  },
  testnet: true,
}

export const config = createConfig({
  // getDefaultConfig({
    // appName: 'VaultMedics',
    // projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default',
    chains: [flareTestnet, flare],
    transports: {
      [flareTestnet.id]: http(flareTestnet.rpcUrls.default.http[0]),
      [flare.id]: http(flare.rpcUrls.default.http[0]),
    },
    
  })
// )

export const FLARE_CHAIN_ID = flare.id
export const COSTON2_CHAIN_ID = flareTestnet.id
