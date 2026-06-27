import { decodeEventLog } from 'viem'
import { publicClient } from '@/lib/contracts/client'
import { TOURNAMENT_POOL_ABI } from '@/lib/contracts/abi'

export async function verifyEntryTx(
  txHash: `0x${string}`,
  contractRoomId: `0x${string}`,
  wallet: string
): Promise<void> {
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash })
  if (receipt.status !== 'success') throw new Error('TX reverted')

  const entryLog = receipt.logs.find(log => {
    try {
      const decoded = decodeEventLog({ abi: TOURNAMENT_POOL_ABI, ...log })
      if (decoded.eventName !== 'EntryPaid') return false
      const args = decoded.args as { roomId: `0x${string}`; player: string }
      return (
        args.roomId.toLowerCase() === contractRoomId.toLowerCase() &&
        args.player.toLowerCase() === wallet.toLowerCase()
      )
    } catch { return false }
  })

  if (!entryLog) throw new Error('EntryPaid event not found for this wallet/room')
}

export async function verifyBetTx(
  txHash: `0x${string}`,
  contractRoomId: `0x${string}`,
  bettorWallet: string,
  targetWallet: string
): Promise<void> {
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash })
  if (receipt.status !== 'success') throw new Error('TX reverted')

  const betLog = receipt.logs.find(log => {
    try {
      const decoded = decodeEventLog({ abi: TOURNAMENT_POOL_ABI, ...log })
      if (decoded.eventName !== 'BetPlaced') return false
      const args = decoded.args as { roomId: `0x${string}`; bettor: string; target: string }
      return (
        args.roomId.toLowerCase() === contractRoomId.toLowerCase() &&
        args.bettor.toLowerCase() === bettorWallet.toLowerCase() &&
        args.target.toLowerCase() === targetWallet.toLowerCase()
      )
    } catch { return false }
  })

  if (!betLog) throw new Error('BetPlaced event not found for this bettor/room')
}
