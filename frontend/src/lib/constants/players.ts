import type { FootballPlayer } from '@/lib/contracts/types'

// 88 players across all positions.
// Stats (pace, shooting, passing, tackling): 0–100 each.
// Distribution: GK×10, ST×14, LW×9, RW×9, CM×9, CDM×9, CAM×8, CB×8, LB×6, RB×6 = 88
export const FOOTBALL_PLAYERS: FootballPlayer[] = [
  // ─── GK (10) ────────────────────────────────────────────────────────────────
  { name: 'Yashin',     position: 'GK', pace: 42, shooting: 12, passing: 62, tackling: 18 },
  { name: 'Buffon',     position: 'GK', pace: 40, shooting: 11, passing: 65, tackling: 20 },
  { name: 'Casillas',   position: 'GK', pace: 44, shooting: 10, passing: 68, tackling: 22 },
  { name: 'Neuer',      position: 'GK', pace: 55, shooting: 14, passing: 70, tackling: 25 },
  { name: 'De Gea',     position: 'GK', pace: 38, shooting: 10, passing: 60, tackling: 15 },
  { name: 'Oblak',      position: 'GK', pace: 41, shooting: 11, passing: 63, tackling: 19 },
  { name: 'Alisson',    position: 'GK', pace: 48, shooting: 12, passing: 72, tackling: 20 },
  { name: 'Ederson',    position: 'GK', pace: 52, shooting: 13, passing: 75, tackling: 18 },
  { name: 'Lloris',     position: 'GK', pace: 45, shooting: 10, passing: 64, tackling: 17 },
  { name: 'Courtois',   position: 'GK', pace: 43, shooting: 11, passing: 66, tackling: 21 },

  // ─── ST (14) ────────────────────────────────────────────────────────────────
  { name: 'Messi',          position: 'ST', pace: 88, shooting: 96, passing: 92, tackling: 38 },
  { name: 'Ronaldo',        position: 'ST', pace: 92, shooting: 95, passing: 80, tackling: 34 },
  { name: 'Lewandowski',    position: 'ST', pace: 78, shooting: 93, passing: 74, tackling: 42 },
  { name: 'Haaland',        position: 'ST', pace: 95, shooting: 92, passing: 66, tackling: 36 },
  { name: 'Benzema',        position: 'ST', pace: 76, shooting: 90, passing: 82, tackling: 40 },
  { name: 'Ibrahimovic',    position: 'ST', pace: 78, shooting: 91, passing: 80, tackling: 38 },
  { name: 'Aguero',         position: 'ST', pace: 80, shooting: 92, passing: 74, tackling: 36 },
  { name: 'Suarez',         position: 'ST', pace: 77, shooting: 90, passing: 76, tackling: 44 },
  { name: 'Kane',           position: 'ST', pace: 68, shooting: 90, passing: 84, tackling: 46 },
  { name: 'Ronaldo R9',     position: 'ST', pace: 96, shooting: 93, passing: 72, tackling: 32 },
  { name: 'Van Nistelrooy', position: 'ST', pace: 72, shooting: 90, passing: 66, tackling: 38 },
  { name: 'Inzaghi',        position: 'ST', pace: 70, shooting: 88, passing: 62, tackling: 30 },
  { name: 'Cavani',         position: 'ST', pace: 76, shooting: 89, passing: 68, tackling: 40 },
  { name: 'Torres',         position: 'ST', pace: 84, shooting: 86, passing: 68, tackling: 36 },

  // ─── LW (9) ─────────────────────────────────────────────────────────────────
  { name: 'Mbappe',     position: 'LW', pace: 98, shooting: 90, passing: 80, tackling: 38 },
  { name: 'Salah',      position: 'LW', pace: 92, shooting: 88, passing: 80, tackling: 40 },
  { name: 'Robben',     position: 'LW', pace: 90, shooting: 86, passing: 78, tackling: 36 },
  { name: 'Ribery',     position: 'LW', pace: 88, shooting: 80, passing: 82, tackling: 40 },
  { name: 'Nedved',     position: 'LW', pace: 82, shooting: 82, passing: 84, tackling: 56 },
  { name: 'Shevchenko', position: 'LW', pace: 88, shooting: 90, passing: 74, tackling: 36 },
  { name: 'Di Maria',   position: 'LW', pace: 90, shooting: 80, passing: 84, tackling: 40 },
  { name: 'Hazard',     position: 'LW', pace: 88, shooting: 82, passing: 86, tackling: 38 },
  { name: 'Henry',      position: 'LW', pace: 92, shooting: 88, passing: 78, tackling: 36 },

  // ─── RW (9) ─────────────────────────────────────────────────────────────────
  { name: 'Neymar',     position: 'RW', pace: 90, shooting: 86, passing: 84, tackling: 36 },
  { name: 'Dembele',    position: 'RW', pace: 94, shooting: 82, passing: 76, tackling: 36 },
  { name: 'Figo',       position: 'RW', pace: 84, shooting: 80, passing: 86, tackling: 48 },
  { name: 'Beckham',    position: 'RW', pace: 76, shooting: 82, passing: 92, tackling: 48 },
  { name: 'Totti',      position: 'RW', pace: 72, shooting: 86, passing: 88, tackling: 46 },
  { name: 'Del Piero',  position: 'RW', pace: 74, shooting: 88, passing: 84, tackling: 42 },
  { name: 'Riquelme',   position: 'RW', pace: 62, shooting: 78, passing: 92, tackling: 40 },
  { name: 'Zola',       position: 'RW', pace: 76, shooting: 82, passing: 86, tackling: 42 },
  { name: 'Ronaldinho', position: 'RW', pace: 84, shooting: 86, passing: 90, tackling: 40 },

  // ─── CM (9) ─────────────────────────────────────────────────────────────────
  { name: 'Pirlo',      position: 'CM', pace: 58, shooting: 78, passing: 95, tackling: 62 },
  { name: 'Iniesta',    position: 'CM', pace: 78, shooting: 76, passing: 94, tackling: 68 },
  { name: 'Xavi',       position: 'CM', pace: 74, shooting: 72, passing: 96, tackling: 70 },
  { name: 'Scholes',    position: 'CM', pace: 66, shooting: 82, passing: 90, tackling: 74 },
  { name: 'Gerrard',    position: 'CM', pace: 76, shooting: 82, passing: 86, tackling: 78 },
  { name: 'Lampard',    position: 'CM', pace: 70, shooting: 88, passing: 84, tackling: 74 },
  { name: 'Modric',     position: 'CM', pace: 76, shooting: 76, passing: 92, tackling: 72 },
  { name: 'De Bruyne',  position: 'CM', pace: 78, shooting: 86, passing: 94, tackling: 64 },
  { name: 'Seedorf',    position: 'CM', pace: 72, shooting: 80, passing: 86, tackling: 70 },

  // ─── CDM (9) ────────────────────────────────────────────────────────────────
  { name: 'Makelele',   position: 'CDM', pace: 70, shooting: 52, passing: 76, tackling: 90 },
  { name: 'Vidal',      position: 'CDM', pace: 74, shooting: 76, passing: 78, tackling: 86 },
  { name: 'Kante',      position: 'CDM', pace: 80, shooting: 62, passing: 76, tackling: 92 },
  { name: 'Busquets',   position: 'CDM', pace: 60, shooting: 58, passing: 86, tackling: 84 },
  { name: 'Vieira',     position: 'CDM', pace: 76, shooting: 68, passing: 80, tackling: 88 },
  { name: 'Essien',     position: 'CDM', pace: 78, shooting: 70, passing: 76, tackling: 86 },
  { name: 'Cambiasso',  position: 'CDM', pace: 66, shooting: 64, passing: 78, tackling: 84 },
  { name: 'Mascherano', position: 'CDM', pace: 72, shooting: 48, passing: 74, tackling: 90 },
  { name: 'Ballack',    position: 'CDM', pace: 74, shooting: 76, passing: 80, tackling: 82 },

  // ─── CAM (8) ────────────────────────────────────────────────────────────────
  { name: 'Ozil',     position: 'CAM', pace: 74, shooting: 76, passing: 94, tackling: 50 },
  { name: 'Fabregas', position: 'CAM', pace: 72, shooting: 76, passing: 92, tackling: 58 },
  { name: 'D. Silva', position: 'CAM', pace: 76, shooting: 78, passing: 90, tackling: 56 },
  { name: 'Deco',     position: 'CAM', pace: 72, shooting: 76, passing: 88, tackling: 62 },
  { name: 'Rivaldo',  position: 'CAM', pace: 78, shooting: 88, passing: 88, tackling: 46 },
  { name: 'Baggio',   position: 'CAM', pace: 74, shooting: 88, passing: 86, tackling: 44 },
  { name: 'Zidane',   position: 'CAM', pace: 74, shooting: 82, passing: 94, tackling: 60 },
  { name: 'Platini',  position: 'CAM', pace: 66, shooting: 86, passing: 92, tackling: 56 },

  // ─── CB (8) ─────────────────────────────────────────────────────────────────
  { name: 'Maldini',   position: 'CB', pace: 74, shooting: 44, passing: 74, tackling: 94 },
  { name: 'Baresi',    position: 'CB', pace: 70, shooting: 42, passing: 72, tackling: 92 },
  { name: 'Nesta',     position: 'CB', pace: 72, shooting: 40, passing: 70, tackling: 92 },
  { name: 'Ferdinand', position: 'CB', pace: 76, shooting: 42, passing: 68, tackling: 88 },
  { name: 'Terry',     position: 'CB', pace: 68, shooting: 46, passing: 64, tackling: 88 },
  { name: 'Pique',     position: 'CB', pace: 72, shooting: 50, passing: 76, tackling: 86 },
  { name: 'Van Dijk',  position: 'CB', pace: 78, shooting: 52, passing: 72, tackling: 90 },
  { name: 'Ramos',     position: 'CB', pace: 76, shooting: 60, passing: 70, tackling: 88 },

  // ─── LB (6) ─────────────────────────────────────────────────────────────────
  { name: 'Roberto Carlos', position: 'LB', pace: 88, shooting: 76, passing: 78, tackling: 80 },
  { name: 'Evra',           position: 'LB', pace: 82, shooting: 52, passing: 72, tackling: 82 },
  { name: 'Alba',           position: 'LB', pace: 88, shooting: 58, passing: 76, tackling: 78 },
  { name: 'Marcelo',        position: 'LB', pace: 84, shooting: 62, passing: 78, tackling: 74 },
  { name: 'Cole A.',        position: 'LB', pace: 82, shooting: 52, passing: 70, tackling: 82 },
  { name: 'Lizarazu',       position: 'LB', pace: 80, shooting: 50, passing: 72, tackling: 80 },

  // ─── RB (6) ─────────────────────────────────────────────────────────────────
  { name: 'Cafu',     position: 'RB', pace: 88, shooting: 66, passing: 76, tackling: 82 },
  { name: 'Lahm',     position: 'RB', pace: 78, shooting: 56, passing: 82, tackling: 84 },
  { name: 'D. Alves', position: 'RB', pace: 84, shooting: 62, passing: 80, tackling: 78 },
  { name: 'Zanetti',  position: 'RB', pace: 78, shooting: 52, passing: 74, tackling: 84 },
  { name: 'Maicon',   position: 'RB', pace: 82, shooting: 64, passing: 72, tackling: 80 },
  { name: 'Belletti', position: 'RB', pace: 76, shooting: 54, passing: 68, tackling: 78 },
]
