import type { MatchRound } from "./types";

export interface StrategyInfo {
    id: number;
    name: string;
    emoji: string;
    description: string;
    neededStats: string;
    strongStats: string;
    beats: number[];
    losesTo: number[];
}

export const STRATEGIES: Record<number, StrategyInfo> = {
    1: {
        id: 1,
        name: "High Press",
        emoji: "⚡",
        description: "Relentless high-intensity pressing to force turnovers",
        neededStats: "Discipline, Attack",
        strongStats: "Pace, Tackling",
        beats: [2],
        losesTo: [3],
    },
    2: {
        id: 2,
        name: "Possession",
        emoji: "🎯",
        description: "Control the game through superior ball retention",
        neededStats: "Discipline",
        strongStats: "Passing, Shooting",
        beats: [4],
        losesTo: [1],
    },
    3: {
        id: 3,
        name: "Counter Attack",
        emoji: "🚀",
        description: "Deep defence, then devastating pace on the break",
        neededStats: "Defense, Attack",
        strongStats: "Pace, Shooting",
        beats: [1],
        losesTo: [4],
    },
    4: {
        id: 4,
        name: "Park the Bus",
        emoji: "🚌",
        description: "Solid defensive block, grind out results",
        neededStats: "Defense, Discipline",
        strongStats: "Tackling, Passing",
        beats: [3, 5],
        losesTo: [2],
    },
    5: {
        id: 5,
        name: "Wing Play",
        emoji: "🏃",
        description: "Exploit wide spaces with pacey wingers",
        neededStats: "Attack",
        strongStats: "Pace, Passing",
        beats: [6],
        losesTo: [4],
    },
    6: {
        id: 6,
        name: "Through Middle",
        emoji: "🎲",
        description: "High-IQ central combinations to carve open defences",
        neededStats: "Attack, Discipline",
        strongStats: "Passing, Shooting",
        beats: [1],
        losesTo: [5],
    },
};

/**
 * Deterministically converts raw power scores into realistic football goals.
 *
 * Uses the absolute power difference to pick a scoreline tier:
 * - Tiny gap  → tight games   (1-0, 2-1, 2-2→winner gets +1)
 * - Small gap → close wins    (2-0, 3-2, 3-1)
 * - Medium    → clear wins    (3-1, 4-2, 2-0)
 * - Large     → dominant wins (4-1, 5-2, 3-0)
 * - Huge      → blowouts      (5-1, 6-2, 4-0)
 *
 * A simple deterministic hash based on the power scores picks among
 * several options per tier so results aren't repetitive.
 */
export function powerToGoals(
    powerA: number,
    powerB: number,
    winnerAddr: string,
    teamAAddr: string
): { goalsA: number; goalsB: number } {
    const total = powerA + powerB;
    if (total === 0) return { goalsA: 0, goalsB: 0 };

    const diff = Math.abs(powerA - powerB);

    // Simple deterministic seed from the scores
    const seed = ((powerA * 7 + powerB * 13) % 97);

    // Scoreline options per tier: [winnerGoals, loserGoals]
    type ScoreLine = [number, number];

    let options: ScoreLine[];

    if (diff < 20) {
        // Very tight — nail-biters
        options = [[1, 0], [2, 1], [3, 2], [1, 0], [2, 1]];
    } else if (diff < 60) {
        // Small gap — close matches
        options = [[2, 1], [3, 2], [2, 0], [1, 0], [3, 2]];
    } else if (diff < 120) {
        // Medium gap — clear victories
        options = [[3, 1], [2, 0], [4, 2], [3, 1], [4, 3]];
    } else if (diff < 200) {
        // Large gap — comfortable wins
        options = [[3, 0], [4, 1], [3, 1], [5, 2], [4, 1]];
    } else if (diff < 350) {
        // Big gap — dominant performances
        options = [[4, 0], [5, 1], [4, 1], [5, 2], [6, 2]];
    } else {
        // Huge gap — complete blowouts
        options = [[5, 0], [6, 1], [5, 1], [7, 2], [6, 0]];
    }

    const pick = options[seed % options.length];
    const [winnerGoals, loserGoals] = pick;

    const aWon = winnerAddr.toLowerCase() === teamAAddr.toLowerCase();
    return {
        goalsA: aWon ? winnerGoals : loserGoals,
        goalsB: aWon ? loserGoals : winnerGoals,
    };
}

/** Returns the round label based on an 8-team knockout bracket match index */
export function getMatchRound(matchIndex: number): MatchRound {
    if (matchIndex < 4) return "Quarter Final";
    if (matchIndex < 6) return "Semi Final";
    return "Final";
}
