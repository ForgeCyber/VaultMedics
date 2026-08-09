import { createConfig, http } from 'wagmi'

const botTestnet = {
  id: 968,
  name: 'BOT Chain Test',
  network: 'BOT',
  nativeCurrency: { name: 'BOT Chain Test', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.bohr.life'] },
  },
  blockExplorers: {
    default: { name: 'BOT Chain Test', url: 'https://scan.bohr.life/' },
  },
  testnet: true,
}

const botMainnet = {
  id: 677,
  name: 'BOT Chain',
  network: 'BOT',
  nativeCurrency: { name: 'BOT Chain', symbol: 'BOT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.botchain.ai'] },
  },
  blockExplorers: {
    default: { name: 'BOT Chain', url: 'https://scan.botchain.ai/' },
  },
}

export const config = createConfig({
  // getDefaultConfig({
    // appName: 'VaultMedics',
    // projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default',
    chains: [botTestnet, botMainnet],
    transports: {
      [botTestnet.id]: http(botTestnet.rpcUrls.default.http[0]),
      [botMainnet.id]: http(botMainnet.rpcUrls.default.http[0]),
    },
  })
// )

export const BOT_CHAIN_ID = botMainnet.id
export const BOT_TESTNET_CHAIN_ID = botTestnet.id
