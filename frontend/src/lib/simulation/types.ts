import type { Player, AgentProfile } from "@/lib/contracts/types";

export type { Player, AgentProfile };

export type MatchEventType =
    | "KICKOFF"
    | "HALF_TIME"
    | "FULL_TIME"
    | "GOAL"
    | "SHOT_SAVED"
    | "SHOT_MISS"
    | "PASS"
    | "TACKLE"
    | "DRIBBLE"
    | "CORNER"
    | "FREE_KICK"
    | "OFFSIDE"
    | "YELLOW_CARD";

export interface Pos {
    x: number; // 0–100% of pitch width
    y: number; // 0–100% of pitch height
}

export interface MatchEvent {
    id: number;
    minute: number;   // 1–90
    second: number;   // 0–59
    type: MatchEventType;
    team: "A" | "B";
    player: string;   // player name
    position: Pos;    // ball/event position
    targetPosition?: Pos;
    description: string;
}

export interface PlayerFrame {
    name: string;
    position: Pos; // current position this tick
}

export interface MatchTick {
    tick: number;
    minute: number;
    ballPosition: Pos;
    possession: "A" | "B";
    playersA: PlayerFrame[];
    playersB: PlayerFrame[];
    activeEvent?: MatchEvent;
}

export interface SimInput {
    teamA: {
        players: Player[];
        strategyId: number;
        agent: AgentProfile;
        name: string;
    };
    teamB: {
        players: Player[];
        strategyId: number;
        agent: AgentProfile;
        name: string;
    };
    power: {
        scoreA: number;
        scoreB: number;
    };
}

export interface MatchSimulation {
    seed: number;
    goalsA: number;
    goalsB: number;
    events: MatchEvent[];
    ticks: MatchTick[];
}
