import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getSlotConstraints } from '@/lib/draft-pool'
import { POS_GROUP } from '@/lib/constants/squad'
import type { ApiResponse, FootballPlayer, PositionGroup } from '@/lib/contracts/types'

function validateSquad(squad: FootballPlayer[]): string | null {
  if (squad.length !== 11) return `Squad must have 11 players, got ${squad.length}`

  const counts: Record<PositionGroup, number> = { ATT: 0, MID: 0, DEF: 0, GK: 0 }
  for (const p of squad) {
    const group = POS_GROUP[p.position] as PositionGroup
    if (!group) return `Unknown position: ${p.position}`
    counts[group]++
  }

  const constraints = getSlotConstraints({ ATT: 0, MID: 0, DEF: 0, GK: 0 })
  for (const group of Object.keys(counts) as PositionGroup[]) {
    const { min, max } = constraints[group]
    if (counts[group] < min || counts[group] > max) {
      return `${group}: got ${counts[group]}, expected ${min}-${max}`
    }
  }

  return null
}

export async function POST(req: NextRequest) {
  try {
    const { roomId, wallet, squadJson } = await req.json()

    const validationError = validateSquad(squadJson)
    if (validationError) {
      return NextResponse.json(
        { success: false, error: { code: 400, message: validationError } },
        { status: 400 }
      )
    }

    const db = createSupabaseAdminClient()

    const { error: updateError } = await db.from('players').update({
      squad_json: squadJson,
      draft_done: true,
    }).eq('room_id', roomId).eq('wallet', wallet)

    if (updateError) throw updateError

    // Tüm oyuncular draft_done mu kontrol et
    const { data: players } = await db.from('players').select('draft_done').eq('room_id', roomId)
    const allDone = players?.every(p => p.draft_done) ?? false

    let bettingStarted = false
    if (allDone) {
      await db.from('rooms').update({
        status: 'betting',
        betting_started_at: new Date().toISOString(),
      }).eq('id', roomId)
      bettingStarted = true
    }

    return NextResponse.json({ success: true, data: { saved: true, bettingStarted } } satisfies ApiResponse<{ saved: true; bettingStarted: boolean }>)
  } catch (e) {
    return NextResponse.json({ success: false, error: { code: 500, message: String(e) } }, { status: 500 })
  }
}
