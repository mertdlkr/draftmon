import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { ApiResponse, Bet } from '@/lib/contracts/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    const db = await createSupabaseServerClient()

    const { data, error } = await db
      .from('bets')
      .select('*')
      .eq('room_id', roomId)
      .order('placed_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, data: (data ?? []) as unknown as Bet[] } satisfies ApiResponse<Bet[]>)
  } catch (e) {
    return NextResponse.json({ success: false, error: { code: 500, message: String(e) } }, { status: 500 })
  }
}
