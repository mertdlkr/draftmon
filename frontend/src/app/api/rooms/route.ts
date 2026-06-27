import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { waitForTransactionReceipt } from 'viem/actions'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { walletClient, publicClient } from '@/lib/contracts/client'
import { TOURNAMENT_POOL_ABI } from '@/lib/contracts/abi'
import { toBytes32 } from '@/lib/utils/format'
import type { ApiResponse, Room } from '@/lib/contracts/types'

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'object' && e !== null && 'message' in e) return String((e as { message: unknown }).message)
  return JSON.stringify(e)
}

export async function GET() {
  try {
    const db = createSupabaseAdminClient()
    const { data, error } = await db
      .from('rooms')
      .select('*')
      .in('status', ['open', 'drafting', 'betting'])
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, data: data as unknown as Room[] } satisfies ApiResponse<Room[]>)
  } catch (e) {
    return NextResponse.json({ success: false, error: { code: 500, message: errMsg(e) } }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { adminSecret, name, capacity, entryFeeWei } = body

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
    }

    const id = nanoid(10)
    const contractRoomId = toBytes32(id)

    const db = createSupabaseAdminClient()
    const { data: room, error } = await db.from('rooms').insert({
      id,
      name,
      capacity,
      entry_fee_wei: entryFeeWei,
      contract_room_id: contractRoomId,
      status: 'open',
    }).select().single()

    if (error) throw error

    const txHash = await walletClient.writeContract({
      abi: TOURNAMENT_POOL_ABI,
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      functionName: 'createRoom',
      args: [contractRoomId as `0x${string}`, BigInt(entryFeeWei)],
    })
    await waitForTransactionReceipt(publicClient, { hash: txHash })

    const origin = req.headers.get('origin') ?? ''
    const qrUrl = `${origin}/join/${id}`

    return NextResponse.json({ success: true, data: { room: room as unknown as Room, qrUrl } } satisfies ApiResponse<{ room: Room; qrUrl: string }>)
  } catch (e) {
    return NextResponse.json({ success: false, error: { code: 500, message: errMsg(e) } }, { status: 500 })
  }
}
