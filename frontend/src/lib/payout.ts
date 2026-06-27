import { waitForTransactionReceipt } from 'viem/actions'
import { publicClient, walletClient } from '@/lib/contracts/client'
import { TOURNAMENT_POOL_ABI } from '@/lib/contracts/abi'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export interface BetPayout {
  wallet: string
  amountWei: bigint
}

export async function calculateBetPayouts(
  roomId: string,
  winnerWallet: string
): Promise<BetPayout[]> {
  const db = createSupabaseAdminClient()

  const { data: bets } = await db.from('bets').select('*').eq('room_id', roomId)
  if (!bets || bets.length === 0) return []

  const totalPool = bets.reduce((s, b) => s + BigInt(b.amount_wei), 0n)
  const winningBets = bets.filter(b => b.target_wallet.toLowerCase() === winnerWallet.toLowerCase())
  const totalWinningStake = winningBets.reduce((s, b) => s + BigInt(b.amount_wei), 0n)

  const payouts: BetPayout[] = []

  for (const bet of bets) {
    const won = bet.target_wallet.toLowerCase() === winnerWallet.toLowerCase()
    let payoutWei = 0n

    if (won && totalWinningStake > 0n) {
      payoutWei = (BigInt(bet.amount_wei) * totalPool) / totalWinningStake
    }

    await db.from('bets').update({
      won,
      payout_wei: payoutWei.toString(),
    }).eq('id', bet.id)

    if (won) payouts.push({ wallet: bet.bettor_wallet, amountWei: payoutWei })
  }

  return payouts
}

export async function executePayout(
  contractRoomId: `0x${string}`,
  winnerWallet: `0x${string}`,
  betPayouts: BetPayout[]
): Promise<{ winnerTx: string; betTx: string | null }> {
  // 1. closeRoom
  const closeTxHash = await walletClient.writeContract({
    abi: TOURNAMENT_POOL_ABI,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'closeRoom',
    args: [contractRoomId],
  })
  await waitForTransactionReceipt(publicClient, { hash: closeTxHash })

  // 2. declareWinner
  const winnerTxHash = await walletClient.writeContract({
    abi: TOURNAMENT_POOL_ABI,
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    functionName: 'declareWinner',
    args: [contractRoomId, winnerWallet],
  })
  await waitForTransactionReceipt(publicClient, { hash: winnerTxHash })

  // 3. distributeBetWinners (varsa)
  let betTxHash: string | null = null
  if (betPayouts.length > 0) {
    const winners = betPayouts.map(p => p.wallet as `0x${string}`)
    const amounts = betPayouts.map(p => p.amountWei)

    const txHash = await walletClient.writeContract({
      abi: TOURNAMENT_POOL_ABI,
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      functionName: 'distributeBetWinners',
      args: [contractRoomId, winners, amounts],
    })
    await waitForTransactionReceipt(publicClient, { hash: txHash })
    betTxHash = txHash
  }

  return { winnerTx: winnerTxHash, betTx: betTxHash }
}
