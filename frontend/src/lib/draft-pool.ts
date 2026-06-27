import { FOOTBALL_PLAYERS } from '@/lib/constants/players'
import { POS_GROUP } from '@/lib/constants/squad'
import type { FootballPlayer, PositionGroup } from '@/lib/contracts/types'

export function getDraftPool(group: PositionGroup, count: number): FootballPlayer[] {
  const filtered = FOOTBALL_PLAYERS.filter(p => POS_GROUP[p.position] === group)
  // Fisher-Yates shuffle
  const arr = [...filtered]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, count)
}

export function randomFillSquad(
  partial: Partial<Record<PositionGroup, FootballPlayer[]>>
): FootballPlayer[] {
  const att = partial.ATT ?? []
  const mid = partial.MID ?? []
  const def = partial.DEF ?? []
  const gk  = partial.GK  ?? []

  const filledAtt = att.length >= 1 ? att : [...att, ...getDraftPool('ATT', 1 - att.length)]
  const filledMid = mid.length >= 2 ? mid : [...mid, ...getDraftPool('MID', 2 - mid.length)]
  const filledGk  = gk.length  >= 1 ? gk  : getDraftPool('GK', 1)

  // DEF fills remaining slots (must total 11)
  const fieldUsed = filledAtt.length + filledMid.length
  const defNeeded = Math.max(3, 10 - fieldUsed)
  const filledDef = def.length >= defNeeded
    ? def.slice(0, defNeeded)
    : [...def, ...getDraftPool('DEF', defNeeded - def.length)]

  return [...filledAtt, ...filledMid, ...filledDef, ...filledGk]
}

export function getSlotConstraints(
  picked: Record<PositionGroup, number>
): Record<PositionGroup, { min: number; max: number }> {
  const { ATT: att, MID: mid, DEF: def } = picked
  const fieldRemaining = 10 - att - mid - def

  return {
    ATT: { min: 1, max: Math.min(4, fieldRemaining - 2 - 3 + att) },
    MID: { min: 2, max: Math.min(4, fieldRemaining - 3 + mid) },
    DEF: { min: Math.max(3, fieldRemaining), max: Math.min(6, fieldRemaining) },
    GK:  { min: 1, max: 1 },
  }
}
