import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { verifyBetTx } from '@/lib/viem-client'
import type { ApiResponse } from '@/lib/contracts/types'

export async function POST(req: NextRequest) {
  try {
    const { roomId, contractRoomId, bettorWallet, targetWallet, amountWei, txHash } = await req.json()

    await verifyBetTx(txHash, contractRoomId, bettorWallet, targetWallet)

    const db = createSupabaseAdminClient()
    const { error } = await db.from('bets').insert({
      room_id: roomId,
      bettor_wallet: bettorWallet,
      target_wallet: targetWallet,
      amount_wei: amountWei,
      tx_hash: txHash,
    })

    if (error) throw error

    return NextResponse.json({ success: true, data: { betPlaced: true } } satisfies ApiResponse<{ betPlaced: true }>)
  } catch (e) {
    const msg = String(e)
    const isTxError = msg.includes('event not found') || msg.includes('TX reverted')
    return NextResponse.json(
      { success: false, error: { code: isTxError ? 400 : 500, message: msg } },
      { status: isTxError ? 400 : 500 }
    )
  }
}
