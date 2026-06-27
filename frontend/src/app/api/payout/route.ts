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
    if (players) {
      for (const p of players) {
        const isWinner = p.wallet.toLowerCase() === room.winner_wallet.toLowerCase()
        await db.from('leaderboard').upsert({
          wallet: p.wallet,
          wins: isWinner ? 1 : 0,
          losses: isWinner ? 0 : 1,
          tournaments_played: 1,
        }, {
          onConflict: 'wallet',
          ignoreDuplicates: false,
        })
      }
    }

    return NextResponse.json({ success: true, data: { winnerTx, betTx } } satisfies ApiResponse<{ winnerTx: string; betTx: string | null }>)
  } catch (e) {
    return NextResponse.json({ success: false, error: { code: 500, message: String(e) } }, { status: 500 })
  }
}
