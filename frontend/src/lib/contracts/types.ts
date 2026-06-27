// ─── Enums ────────────────────────────────────────────────────────────────────

export enum TournamentType {
    KNOCKOUT_8 = 0,
    LEAGUE = 1,
}

export enum TournamentState {
    OPEN = 0,
    DRAFTING = 1,
    STRATEGY = 2,
    COMPLETED = 3,
}

export type MatchRound = "Quarter Final" | "Semi Final" | "Final";

// ─── Structs ──────────────────────────────────────────────────────────────────

export interface Player {
    name: string;
    position: string;
    pace: number;
    shooting: number;
    passing: number;
    tackling: number;
}

export interface AgentProfile {
    address: string;
    name: string;
    attack: number;
    defense: number;
    discipline: number;
    isRegistered: boolean;
}

export interface TournamentEntry {
    hasEntered: boolean;
    hasTeam: boolean;
    strategyId: number;
    strategyName: string;
    reasoning: string;
    team: Player[];
}

export interface MatchResult {
    teamA: string; // wallet address
    teamB: string; // wallet address
    winner: string; // wallet address
    scoreA: number;
    scoreB: number;
    goalsA: number; // realistic football goals derived from power scores
    goalsB: number;
    round: MatchRound;
}

export interface Tournament {
    id: number;
    type: TournamentType;
    state: TournamentState;
    stateLabel: string;
    prizePool: string; // formatted ETH
    champion: string; // wallet address
    participants: string[]; // wallet addresses
}

// ─── Composed / Aggregated ────────────────────────────────────────────────────

export interface TournamentAgent {
    profile: AgentProfile;
    entry: TournamentEntry;
}

export interface TournamentDetail extends Tournament {
    agents: TournamentAgent[];
    matches: MatchResult[];
}

// ─── Live / Real-Time ────────────────────────────────────────────────────────

export interface LiveParticipant {
    profile: AgentProfile;
    hasTeam: boolean;
    team: Player[];
    strategyCommitted: boolean;
    strategyId: number | null;
    strategyName: string | null;
    reasoning: string | null; // null = still "Thinking..."
}

export interface LiveTournamentState {
    tournamentId: number;
    state: TournamentState;
    stateLabel: string;
    spotsLeft: number;
    prizePool: string;
    champion: string | null;
    participants: LiveParticipant[];
}

export interface LeagueSummary {
    currentTournamentId: number;
    registeredAgents: AgentProfile[];
    tournaments: TournamentDetail[];
}
