export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`
export const DRAFT_DURATION_MS  = 25_000
export const BETTING_DURATION_MS = 10_000
export const ROOM_CAPACITIES = [4, 8, 16] as const

// Draft slot constraints per position group
export const DRAFT_CONSTRAINTS = {
  ATT: { min: 1, max: 4 },
  MID: { min: 2, max: 4 },
  DEF: { min: 3, max: 6 },
  GK:  { min: 1, max: 1 },
} as const

export const DRAFT_PHASE_ORDER = ['ATT', 'MID', 'DEF', 'GK'] as const
export const DRAFT_POOL_SIZE   = { ATT: 10, MID: 10, DEF: 10, GK: 3 } as const
