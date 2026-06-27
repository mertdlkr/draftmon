import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { calculateBetPayouts, executePayout } from '@/lib/payout'
import type { ApiResponse } from '@/lib/contracts/types'

export async function POST(req: NextRequest) {
  try {
    const { roomId, adminSecret } = await req.json()

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
    }

    const db = createSupabaseAdminClient()
    const { data: room, error: roomError } = await db
      .from('rooms').select('*').eq('id', roomId).single()
    if (roomError || !room) throw new Error('Room not found')
    if (!room.winner_wallet) throw new Error('No winner set — run sim first')

    const betPayouts = await calculateBetPayouts(roomId, room.winner_wallet)

    const { winnerTx, betTx } = await executePayout(
      room.contract_room_id as `0x${string}`,
      room.winner_wallet as `0x${string}`,
      betPayouts
    )

    // Oda'yı finished olarak işaretle
    await db.from('rooms').update({ status: 'finished' }).eq('id', roomId)

    // Leaderboard güncelle
    const { data: players } = await db.from('players').select('wallet').eq('room_id', roomId)
    
    const uniqueParticipants = new Set<string>()
    if (players) {
      players.forEach(p => uniqueParticipants.add(p.wallet.toLowerCase()))
    }
    betPayouts.forEach(bp => uniqueParticipants.add(bp.wallet.toLowerCase()))

    for (const participantWallet of uniqueParticipants) {
      const { data: currentEntry } = await db
        .from('leaderboard')
        .select('*')
        .eq('wallet', participantWallet)
        .maybeSingle()

      const isWinner = participantWallet === room.winner_wallet.toLowerCase()
      const isManager = players ? players.some(p => p.wallet.toLowerCase() === participantWallet) : false

      // Kazanç hesaplama
      // Turnuva kazananı giriş havuzunu (entry fee * oyuncu sayısı) alır
      const earnedFromEntry = isWinner ? (BigInt(room.entry_fee_wei) * BigInt(players?.length ?? 0)) : 0n
      // Bahis kazananı bahis havuzundan payını alır
      const earnedFromBet = betPayouts.find(bp => bp.wallet.toLowerCase() === participantWallet)?.amountWei ?? 0n
      const totalEarnedThisRoom = earnedFromEntry + earnedFromBet

      const wins = (currentEntry?.wins ?? 0) + (isWinner ? 1 : 0)
      const losses = (currentEntry?.losses ?? 0) + ((isManager && !isWinner) ? 1 : 0)
      const tournaments_played = (currentEntry?.tournaments_played ?? 0) + (isManager ? 1 : 0)
      const total_earned_wei = (BigInt(currentEntry?.total_earned_wei ?? '0') + totalEarnedThisRoom).toString()

      await db.from('leaderboard').upsert({
        wallet: participantWallet,
        wins,
        losses,
        tournaments_played,
        total_earned_wei,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'wallet',
      })
    }

    return NextResponse.json({ success: true, data: { winnerTx, betTx } } satisfies ApiResponse<{ winnerTx: string; betTx: string | null }>)
  } catch (e) {
    return NextResponse.json({ success: false, error: { code: 500, message: String(e) } }, { status: 500 })
  }
}
