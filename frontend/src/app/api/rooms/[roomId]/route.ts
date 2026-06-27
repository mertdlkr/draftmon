import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { ApiResponse, RoomDetail } from '@/lib/contracts/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    const db = createSupabaseAdminClient()

    const [roomRes, playersRes, matchesRes, betsRes] = await Promise.all([
      db.from('rooms').select('*').eq('id', roomId).single(),
      db.from('players').select('*').eq('room_id', roomId).order('joined_at', { ascending: true }),
      db.from('matches').select('*').eq('room_id', roomId).order('match_index', { ascending: true }),
      db.from('bets').select('*').eq('room_id', roomId).order('placed_at', { ascending: true }),
    ])

    if (roomRes.error || !roomRes.data) {
      return NextResponse.json({ success: false, error: { code: 404, message: 'Room not found' } }, { status: 404 })
    }

    const data: RoomDetail = {
      room: roomRes.data as unknown as RoomDetail['room'],
      players: (playersRes.data ?? []) as unknown as RoomDetail['players'],
      matches: (matchesRes.data ?? []) as unknown as RoomDetail['matches'],
      bets: (betsRes.data ?? []) as unknown as RoomDetail['bets'],
    }

    return NextResponse.json({ success: true, data } satisfies ApiResponse<RoomDetail>)
  } catch (e) {
    return NextResponse.json({ success: false, error: { code: 500, message: String(e) } }, { status: 500 })
  }
}
