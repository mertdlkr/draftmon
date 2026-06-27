import type { Address } from 'viem'
import type { MatchSimulation } from '@/lib/simulation/types'

export type RoomStatus = 'open' | 'drafting' | 'betting' | 'simulating' | 'finished'
export type MatchRound = 'R16' | 'QF' | 'SF' | 'Final'
export type PositionGroup = 'ATT' | 'MID' | 'DEF' | 'GK'

export interface FootballPlayer {
  name: string
  position: string // ST | LW | RW | CM | CDM | CAM | CB | LB | RB | GK
  pace: number     // 0–100
  shooting: number
  passing: number
  tackling: number
}

export interface Room {
  id: string
  name: string
  status: RoomStatus
  capacity: number                   // 4 | 8 | 16
  entry_fee_wei: string
  contract_room_id: `0x${string}`
  draft_started_at: string | null
  betting_started_at: string | null
  winner_wallet: Address | null
  created_at: string
}

export interface RoomPlayer {
  id: string
  room_id: string
  wallet: Address
  tx_hash: `0x${string}`
  squad_json: FootballPlayer[] | null
  draft_done: boolean
  joined_at: string
}

export interface Match {
  id: string
  room_id: string
  round: MatchRound
  match_index: number
  home_wallet: Address
  away_wallet: Address
  home_score: number
  away_score: number
  winner_wallet: Address
  sim_data: MatchSimulation | null
  played_at: string
}

export interface Bet {
  id: string
  room_id: string
  bettor_wallet: Address
  target_wallet: Address
  amount_wei: string
  tx_hash: `0x${string}`
  payout_wei: string | null
  won: boolean | null
  placed_at: string
}

export interface LeaderboardEntry {
  wallet: Address
  wins: number
  losses: number
  draws: number
  goals_for: number
  goals_against: number
  tournaments_played: number
  total_earned_wei: string
}

export interface RoomDetail {
  room: Room
  players: RoomPlayer[]
  matches: Match[]
  bets: Bet[]
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: number; message: string } }
