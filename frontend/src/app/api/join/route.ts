import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { verifyEntryTx } from '@/lib/viem-client'
import type { ApiResponse } from '@/lib/contracts/types'

export async function POST(req: NextRequest) {
  try {
    const { roomId, contractRoomId, wallet, txHash } = await req.json()

    await verifyEntryTx(txHash, contractRoomId, wallet)

    const db = createSupabaseAdminClient()
    const { error } = await db.from('players').insert({
      room_id: roomId,
      wallet,
      tx_hash: txHash,
    })

    if (error) throw error

    return NextResponse.json({ success: true, data: { joined: true } } satisfies ApiResponse<{ joined: true }>)
  } catch (e) {
    const msg = String(e)
    const isTxError = msg.includes('event not found') || msg.includes('TX reverted')
    return NextResponse.json(
      { success: false, error: { code: isTxError ? 400 : 500, message: msg } },
      { status: isTxError ? 400 : 500 }
    )
  }
}
