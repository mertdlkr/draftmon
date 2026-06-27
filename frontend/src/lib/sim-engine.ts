import { simulateMatch } from '@/lib/simulation'
import type { FootballPlayer, MatchRound } from '@/lib/contracts/types'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const DEFAULT_AGENT = { name: 'Player', attack: 15, defense: 15, discipline: 15 }

function autoStrategy(squad: FootballPlayer[]): number {
  const att = squad.filter(p => ['ST', 'LW', 'RW'].includes(p.position)).length
  const def = squad.filter(p => ['CB', 'LB', 'RB'].includes(p.position)).length
  const mid = squad.filter(p => ['CM', 'CDM', 'CAM'].includes(p.position)).length
  if (att >= 3) return 3
  if (def >= 5) return 4
  if (mid >= 4) return 2
  return 1
}

function squadPower(squad: FootballPlayer[]): number {
  if (!squad.length) return 50
  const total = squad.reduce((s, p) => s + p.pace + p.shooting + p.passing + p.tackling, 0)
  return total / squad.length / 4  // 0-100 normalized
}

type RoundSpec = { round: MatchRound; count: number }

function getRoundSpecs(capacity: number): RoundSpec[] {
  if (capacity === 4)  return [{ round: 'SF', count: 2 }, { round: 'Final', count: 1 }]
  if (capacity === 8)  return [{ round: 'QF', count: 4 }, { round: 'SF', count: 2 }, { round: 'Final', count: 1 }]
  return [{ round: 'R16', count: 8 }, { round: 'QF', count: 4 }, { round: 'SF', count: 2 }, { round: 'Final', count: 1 }]
}

interface PlayerEntry {
  wallet: string
  squad: FootballPlayer[]
  name: string
}

export async function runTournamentSim(roomId: string): Promise<{ winner: string; matchCount: number }> {
  const db = createSupabaseAdminClient()

  // 1. Odayı ve oyuncuları çek
  const { data: room } = await db.from('rooms').select('*').eq('id', roomId).single()
  if (!room) throw new Error(`Room not found: ${roomId}`)

  const { data: players } = await db
    .from('players')
    .select('*')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true })
  if (!players || players.length < 2) throw new Error('Not enough players')

  // 2. Bracket round spesifikasyonlarını al
  const roundSpecs = getRoundSpecs(room.capacity)

  // 3. Mevcut oyuncuları hazırla
  let currentParticipants: PlayerEntry[] = players.map((p, i) => ({
    wallet: p.wallet,
    squad: (p.squad_json as FootballPlayer[] | null) ?? [],
    name: `Player ${i + 1}`,
  }))

  let totalMatchCount = 0

  // 4. Her round'u simüle et
  for (const spec of roundSpecs) {
    const roundWinners: PlayerEntry[] = []

    for (let matchIndex = 0; matchIndex < spec.count; matchIndex++) {
      const home = currentParticipants[matchIndex * 2]
      const away = currentParticipants[matchIndex * 2 + 1]

      const scoreA = squadPower(home.squad)
      const scoreB = squadPower(away.squad)

      const result = simulateMatch({
        teamA: {
          players: home.squad,
          strategyId: autoStrategy(home.squad),
          agent: DEFAULT_AGENT,
          name: home.name,
        },
        teamB: {
          players: away.squad,
          strategyId: autoStrategy(away.squad),
          agent: DEFAULT_AGENT,
          name: away.name,
        },
        power: { scoreA, scoreB },
      })

      const winnerEntry = result.goalsA >= result.goalsB ? home : away

      await db.from('matches').insert({
        room_id: roomId,
        round: spec.round,
        match_index: matchIndex,
        home_wallet: home.wallet,
        away_wallet: away.wallet,
        home_score: result.goalsA,
        away_score: result.goalsB,
        winner_wallet: winnerEntry.wallet,
        sim_data: result as unknown as import('@/lib/supabase/types').Json,
      })

      roundWinners.push(winnerEntry)
      totalMatchCount++
    }

    currentParticipants = roundWinners
  }

  const champion = currentParticipants[0].wallet

  // 5. Odayı güncelle
  await db.from('rooms').update({
    status: 'simulating',
    winner_wallet: champion,
  }).eq('id', roomId)

  return { winner: champion, matchCount: totalMatchCount }
}
