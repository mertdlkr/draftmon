"use client";

import { create } from "zustand";
import type { FootballPlayer, PositionGroup } from "@/lib/contracts/types";
import { DRAFT_CONSTRAINTS, DRAFT_PHASE_ORDER } from "@/constants";

interface DraftState {
  phase: PositionGroup;
  picks: Record<PositionGroup, FootballPlayer[]>;
  pool: Record<PositionGroup, FootballPlayer[]>;
  isSubmitting: boolean;
  
  // Actions
  setPool: (group: PositionGroup, players: FootballPlayer[]) => void;
  togglePick: (player: FootballPlayer) => void;
  confirmPhase: (roomId: string, wallet: string, onComplete: () => void) => Promise<void>;
  resetDraft: () => void;
  autoFillRemaining: (roomId: string, wallet: string, onComplete: () => void) => Promise<void>;
}

export const useDraftStore = create<DraftState>((set, get) => ({
  phase: "ATT",
  picks: {
    ATT: [],
    MID: [],
    DEF: [],
    GK: [],
  },
  pool: {
    ATT: [],
    MID: [],
    DEF: [],
    GK: [],
  },
  isSubmitting: false,

  setPool: (group, players) => {
    set((state) => ({
      pool: { ...state.pool, [group]: players },
    }));
  },

  togglePick: (player) => {
    const { phase, picks } = get();
    const currentPicks = picks[phase];
    const limits = getSlotLimits(phase, picks);

    const isAlreadyPicked = currentPicks.some((p) => p.name === player.name);

    if (isAlreadyPicked) {
      set((state) => ({
        picks: {
          ...state.picks,
          [phase]: currentPicks.filter((p) => p.name !== player.name),
        },
      }));
    } else {
      if (currentPicks.length >= limits.max) return; // Limit reached
      set((state) => ({
        picks: {
          ...state.picks,
          [phase]: [...currentPicks, player],
        },
      }));
    }
  },

  confirmPhase: async (roomId, wallet, onComplete) => {
    const { phase, picks } = get();
    const currentPicks = picks[phase];
    const limits = getSlotLimits(phase, picks);

    if (currentPicks.length < limits.min) return;

    if (phase === "GK") {
      // Last phase completed, submit to API
      set({ isSubmitting: true });
      try {
        const allSquad = [
          ...picks.ATT,
          ...picks.MID,
          ...picks.DEF,
          ...picks.GK,
        ];
        const res = await fetch("/api/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, wallet, squadJson: allSquad }),
        });
        if (res.ok) {
          onComplete();
        }
      } catch (err) {
        console.error("Failed to submit draft", err);
      } finally {
        set({ isSubmitting: false });
      }
    } else {
      // Go to next phase
      const currentIndex = DRAFT_PHASE_ORDER.indexOf(phase);
      const nextPhase = DRAFT_PHASE_ORDER[currentIndex + 1];
      set({ phase: nextPhase });
    }
  },

  autoFillRemaining: async (roomId, wallet, onComplete) => {
    set({ isSubmitting: true });
    try {
      // Gather current picks and fill blanks randomly from pool or global list
      const { picks, pool } = get();
      
      const getRandomPicks = (group: PositionGroup, count: number): FootballPlayer[] => {
        const groupPool = pool[group].length > 0 ? pool[group] : [];
        const selectedNames = picks[group].map((p) => p.name);
        const available = groupPool.filter((p) => !selectedNames.includes(p.name));
        const shuffled = [...available].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      };

      const finalPicks = { ...picks };

      // Ensure min/max constraints are satisfied
      // GK: exactly 1
      if (finalPicks.GK.length < 1) {
        finalPicks.GK = [...finalPicks.GK, ...getRandomPicks("GK", 1 - finalPicks.GK.length)];
      }

      // Compute limits dynamically
      const attLimit = getSlotLimits("ATT", finalPicks);
      if (finalPicks.ATT.length < attLimit.min) {
        finalPicks.ATT = [...finalPicks.ATT, ...getRandomPicks("ATT", attLimit.min - finalPicks.ATT.length)];
      }

      const midLimit = getSlotLimits("MID", finalPicks);
      if (finalPicks.MID.length < midLimit.min) {
        finalPicks.MID = [...finalPicks.MID, ...getRandomPicks("MID", midLimit.min - finalPicks.MID.length)];
      }

      // DEF fills up the rest of the 10 outfield spots
      const currentOutfieldCount = finalPicks.ATT.length + finalPicks.MID.length + finalPicks.DEF.length;
      const neededDef = 10 - finalPicks.ATT.length - finalPicks.MID.length;
      if (finalPicks.DEF.length < neededDef) {
        finalPicks.DEF = [...finalPicks.DEF, ...getRandomPicks("DEF", neededDef - finalPicks.DEF.length)];
      }

      const allSquad = [
        ...finalPicks.ATT,
        ...finalPicks.MID,
        ...finalPicks.DEF,
        ...finalPicks.GK,
      ];

      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, wallet, squadJson: allSquad }),
      });
      if (res.ok) {
        onComplete();
      }
    } catch (err) {
      console.error("Auto fill squad failed", err);
    } finally {
      set({ isSubmitting: false });
    }
  },

  resetDraft: () => {
    set({
      phase: "ATT",
      picks: { ATT: [], MID: [], DEF: [], GK: [] },
      pool: { ATT: [], MID: [], DEF: [], GK: [] },
      isSubmitting: false,
    });
  },
}));

// Helper to calculate limits dynamically based on previous picks
export function getSlotLimits(phase: PositionGroup, picks: Record<PositionGroup, FootballPlayer[]>) {
  const attCount = picks.ATT.length;
  const midCount = picks.MID.length;
  const defCount = picks.DEF.length;

  if (phase === "ATT") {
    // 10 field player slots. We must reserve at least 2 for MID and 3 for DEF.
    // So max_att = 10 - 2 - 3 = 5. But the absolute max is 4.
    return { min: 1, max: 4 };
  }

  if (phase === "MID") {
    // We must reserve at least 3 for DEF.
    // So max_mid = 10 - attCount - 3.
    const maxMid = Math.min(4, 10 - attCount - 3);
    // Min is 2, but if remaining outfield slots can only fit less, adjust min.
    return { min: 2, max: maxMid };
  }

  if (phase === "DEF") {
    // Must fill exactly the remaining of the 10 outfield spots.
    const remaining = 10 - attCount - midCount;
    return { min: remaining, max: remaining };
  }

  // GK is always 1
  return { min: 1, max: 1 };
}
