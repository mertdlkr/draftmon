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

/** Returns the round label based on an 8-team knockout bracket match index */
export function getMatchRound(matchIndex: number): MatchRound {
    if (matchIndex < 4) return "Quarter Final";
    if (matchIndex < 6) return "Semi Final";
    return "Final";
}
