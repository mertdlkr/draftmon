export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type RoomStatus = 'open' | 'drafting' | 'betting' | 'simulating' | 'finished'
export type MatchRound  = 'R16' | 'QF' | 'SF' | 'Final'

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id:                 string
          name:               string
          status:             RoomStatus
          capacity:           number
          entry_fee_wei:      string
          contract_room_id:   string
          draft_started_at:   string | null
          betting_started_at: string | null
          winner_wallet:      string | null
          created_at:         string
        }
        Insert: {
          id:                  string
          name:                string
          status?:             RoomStatus
          capacity:            number
          entry_fee_wei:       string
          contract_room_id:    string
          draft_started_at?:   string | null
          betting_started_at?: string | null
          winner_wallet?:      string | null
          created_at?:         string
        }
        Update: {
          id?:                 string
          name?:               string
          status?:             RoomStatus
          capacity?:           number
          entry_fee_wei?:      string
          contract_room_id?:   string
          draft_started_at?:   string | null
          betting_started_at?: string | null
          winner_wallet?:      string | null
          created_at?:         string
        }
        Relationships: []
      }
      players: {
        Row: {
          id:         string
          room_id:    string
          wallet:     string
          tx_hash:    string
          squad_json: Json | null
          draft_done: boolean
          joined_at:  string
        }
        Insert: {
          id?:         string
          room_id:     string
          wallet:      string
          tx_hash:     string
          squad_json?: Json | null
          draft_done?: boolean
          joined_at?:  string
        }
        Update: {
          id?:         string
          room_id?:    string
          wallet?:     string
          tx_hash?:    string
          squad_json?: Json | null
          draft_done?: boolean
          joined_at?:  string
        }
        Relationships: [
          { foreignKeyName: 'players_room_id_fkey'; columns: ['room_id']; referencedRelation: 'rooms'; referencedColumns: ['id'] }
        ]
      }
      matches: {
        Row: {
          id:            string
          room_id:       string
          round:         MatchRound
          match_index:   number
          home_wallet:   string
          away_wallet:   string
          home_score:    number
          away_score:    number
          winner_wallet: string
          sim_data:      Json | null
          played_at:     string
        }
        Insert: {
          id?:            string
          room_id:        string
          round:          MatchRound
          match_index:    number
          home_wallet:    string
          away_wallet:    string
          home_score:     number
          away_score:     number
          winner_wallet:  string
          sim_data?:      Json | null
          played_at?:     string
        }
        Update: {
          id?:            string
          room_id?:       string
          round?:         MatchRound
          match_index?:   number
          home_wallet?:   string
          away_wallet?:   string
          home_score?:    number
          away_score?:    number
          winner_wallet?: string
          sim_data?:      Json | null
          played_at?:     string
        }
        Relationships: [
          { foreignKeyName: 'matches_room_id_fkey'; columns: ['room_id']; referencedRelation: 'rooms'; referencedColumns: ['id'] }
        ]
      }
      bets: {
        Row: {
          id:            string
          room_id:       string
          bettor_wallet: string
          target_wallet: string
          amount_wei:    string
          tx_hash:       string
          payout_wei:    string | null
          won:           boolean | null
          placed_at:     string
        }
        Insert: {
          id?:            string
          room_id:        string
          bettor_wallet:  string
          target_wallet:  string
          amount_wei:     string
          tx_hash:        string
          payout_wei?:    string | null
          won?:           boolean | null
          placed_at?:     string
        }
        Update: {
          id?:            string
          room_id?:       string
          bettor_wallet?: string
          target_wallet?: string
          amount_wei?:    string
          tx_hash?:       string
          payout_wei?:    string | null
          won?:           boolean | null
          placed_at?:     string
        }
        Relationships: [
          { foreignKeyName: 'bets_room_id_fkey'; columns: ['room_id']; referencedRelation: 'rooms'; referencedColumns: ['id'] }
        ]
      }
      leaderboard: {
        Row: {
          wallet:             string
          wins:               number
          losses:             number
          draws:              number
          goals_for:          number
          goals_against:      number
          tournaments_played: number
          total_earned_wei:   string
          updated_at:         string
        }
        Insert: {
          wallet:              string
          wins?:               number
          losses?:             number
          draws?:              number
          goals_for?:          number
          goals_against?:      number
          tournaments_played?: number
          total_earned_wei?:   string
          updated_at?:         string
        }
        Update: {
          wallet?:             string
          wins?:               number
          losses?:             number
          draws?:              number
          goals_for?:          number
          goals_against?:      number
          tournaments_played?: number
          total_earned_wei?:   string
          updated_at?:         string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
