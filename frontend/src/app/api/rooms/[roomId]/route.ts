import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { FOOTBALL_PLAYERS } from '@/lib/constants/players'
import { POS_GROUP } from '@/lib/constants/squad'
import type { ApiResponse, RoomDetail, FootballPlayer } from '@/lib/contracts/types'

function generateRandomSquad(): FootballPlayer[] {
  const gks = FOOTBALL_PLAYERS.filter(p => POS_GROUP[p.position] === 'GK')
  const atts = FOOTBALL_PLAYERS.filter(p => POS_GROUP[p.position] === 'ATT')
  const mids = FOOTBALL_PLAYERS.filter(p => POS_GROUP[p.position] === 'MID')
  const defs = FOOTBALL_PLAYERS.filter(p => POS_GROUP[p.position] === 'DEF')

  const shuffle = (arr: FootballPlayer[]) => [...arr].sort(() => 0.5 - Math.random())

  const selectedGk = shuffle(gks).slice(0, 1)
  const selectedAtt = shuffle(atts).slice(0, 3)
  const selectedMid = shuffle(mids).slice(0, 4)
  const selectedDef = shuffle(defs).slice(0, 3)

  return [...selectedGk, ...selectedAtt, ...selectedMid, ...selectedDef]
}

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

    let roomData = roomRes.data
    let playersData = playersRes.data ?? []

    if (roomData.status === 'drafting' && roomData.draft_started_at) {
      const elapsed = Date.now() - new Date(roomData.draft_started_at).getTime()
      const DRAFT_DURATION_MS = 60_000
      if (elapsed > DRAFT_DURATION_MS) {
        // Find players who haven't completed drafting
        const pendingPlayers = playersData.filter(p => !p.draft_done)
        if (pendingPlayers.length > 0) {
          for (const p of pendingPlayers) {
            const randomSquad = generateRandomSquad()
            await db.from('players').update({
              squad_json: randomSquad as any,
              draft_done: true,
            }).eq('room_id', roomId).eq('wallet', p.wallet)
          }

          // Re-fetch players after update
          const freshPlayersRes = await db.from('players')
            .select('*')
            .eq('room_id', roomId)
            .order('joined_at', { ascending: true })
          playersData = freshPlayersRes.data ?? []
        }

        // Transition room to betting
        const { data: updatedRoom } = await db.from('rooms').update({
          status: 'betting',
          betting_started_at: new Date().toISOString(),
        }).eq('id', roomId).select().single()

        if (updatedRoom) {
          roomData = updatedRoom
        }
      }
    }

    const data: RoomDetail = {
      room: roomData as unknown as RoomDetail['room'],
      players: playersData as unknown as RoomDetail['players'],
      matches: (matchesRes.data ?? []) as unknown as RoomDetail['matches'],
      bets: (betsRes.data ?? []) as unknown as RoomDetail['bets'],
    }

    return NextResponse.json({ success: true, data } satisfies ApiResponse<RoomDetail>)
  } catch (e) {
    return NextResponse.json({ success: false, error: { code: 500, message: String(e) } }, { status: 500 })
  }
}
