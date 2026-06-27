import { createPublicClient, http, defineChain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { createWalletClient } from 'viem'

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'MonadScan', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
})

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(process.env.MONAD_TESTNET_RPC_URL || 'https://testnet-rpc.monad.xyz'),
})

export function getOwnerWalletClient() {
  const account = privateKeyToAccount(process.env.OWNER_PRIVATE_KEY as `0x${string}`)
  return createWalletClient({ account, chain: monadTestnet, transport: http() })
}
