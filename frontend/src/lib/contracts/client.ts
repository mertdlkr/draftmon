import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet } from '@/lib/wagmi'

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(process.env.MONAD_TESTNET_RPC_URL ?? 'https://testnet-rpc.monad.xyz'),
})

export const ownerAccount = privateKeyToAccount(
  (process.env.OWNER_PRIVATE_KEY ?? '0x0000000000000000000000000000000000000000000000000000000000000001') as `0x${string}`
)

export const walletClient = createWalletClient({
  account: ownerAccount,
  chain: monadTestnet,
  transport: http(process.env.MONAD_TESTNET_RPC_URL ?? 'https://testnet-rpc.monad.xyz'),
})
