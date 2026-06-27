import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { ApiResponse, LeaderboardEntry } from '@/lib/contracts/types'

export async function GET() {
  try {
    const db = createSupabaseAdminClient()
    const { data, error } = await db
      .from('leaderboard')
      .select('*')
      .order('wins', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: (data ?? []) as unknown as LeaderboardEntry[],
    } satisfies ApiResponse<LeaderboardEntry[]>)
  } catch (e) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e)
    return NextResponse.json({ success: false, error: { code: 500, message: msg } }, { status: 500 })
  }
}
