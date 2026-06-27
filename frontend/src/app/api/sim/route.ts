import { NextRequest, NextResponse } from 'next/server'
import { runTournamentSim } from '@/lib/sim-engine'
import type { ApiResponse } from '@/lib/contracts/types'

export async function POST(req: NextRequest) {
  try {
    const { roomId, adminSecret } = await req.json()

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: { code: 401, message: 'Unauthorized' } }, { status: 401 })
    }

    const { winner, matchCount } = await runTournamentSim(roomId)

    return NextResponse.json({ success: true, data: { winner, matchCount } } satisfies ApiResponse<{ winner: string; matchCount: number }>)
  } catch (e) {
    return NextResponse.json({ success: false, error: { code: 500, message: String(e) } }, { status: 500 })
  }
}
