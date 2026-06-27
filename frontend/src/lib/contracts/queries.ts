/**
 * queries.ts
 *
 * All on-chain data fetching functions for the MonaDraft Next.js frontend.
 * These are intended for server-side use (Next.js Server Components / Route Handlers).
 * They read from the public Monad RPC — no wallet or signing required.
 */

import { ethers } from "ethers";
import { getContract } from "./client";
import { STRATEGIES, getMatchRound } from "./strategies";
import { simulateMatch } from "@/lib/simulation";
import type {
    AgentProfile,
    Tournament,
    TournamentAgent,
    TournamentDetail,
    TournamentEntry,
    MatchResult,
    LeagueSummary,
    Player,
    LiveParticipant,
    LiveTournamentState,
} from "./types";
import { TournamentState, TournamentType } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TOURNAMENT_STATE_LABELS: Record<TournamentState, string> = {
    [TournamentState.OPEN]: "Open",
    [TournamentState.DRAFTING]: "Drafting",
    [TournamentState.STRATEGY]: "Strategy Phase",
    [TournamentState.COMPLETED]: "Completed",
};

function mapPlayer(raw: { name: string; position: string; pace: bigint; shooting: bigint; passing: bigint; tackling: bigint }): Player {
    return {
        name: raw.name,
        position: raw.position,
        pace: Number(raw.pace),
        shooting: Number(raw.shooting),
        passing: Number(raw.passing),
        tackling: Number(raw.tackling),
    };
}

// ─── Agents ───────────────────────────────────────────────────────────────────

/**
 * Returns the full list of all globally registered AI agents.
 */
export async function fetchAllAgents(): Promise<AgentProfile[]> {
    const contract = getContract();
    const addresses: string[] = await contract.getRegisteredAgents();

    const profiles = await Promise.all(
        addresses.map(async (addr) => {
            const raw = await contract.agents(addr);
            return {
                address: addr,
                name: raw.name,
                attack: Number(raw.attack),
                defense: Number(raw.defense),
                discipline: Number(raw.discipline),
                isRegistered: raw.isRegistered,
            } as AgentProfile;
        })
    );

    return profiles;
}

// ─── Tournaments ──────────────────────────────────────────────────────────────

/**
 * Fetches basic Tournament metadata for a given ID.
 */
export async function fetchTournament(tId: number): Promise<Tournament> {
    const contract = getContract();
    const [raw, participants] = await Promise.all([
        contract.tournaments(tId),
        contract.getParticipants(tId),
    ]);

    return {
        id: tId,
        type: Number(raw.tType) as TournamentType,
        state: Number(raw.state) as TournamentState,
        stateLabel: TOURNAMENT_STATE_LABELS[Number(raw.state) as TournamentState],
        prizePool: ethers.formatEther(raw.prizePool),
        champion: raw.champion,
        participants: [...participants],
    };
}

/**
 * Fetches all tournaments from ID 1 to currentTournamentId.
 */
export async function fetchAllTournaments(): Promise<Tournament[]> {
    const contract = getContract();
    const currentId = Number(await contract.currentTournamentId());

    const results = await Promise.allSettled(
        Array.from({ length: currentId }, (_, i) => fetchTournament(i + 1))
    );

    // Filter out any tournaments that failed to load (e.g. incomplete on-chain state)
    return results
        .filter((r): r is PromiseFulfilledResult<Tournament> => r.status === "fulfilled")
        .map((r) => r.value);
}

// ─── Tournament Roster (Agents + Entries) ─────────────────────────────────────

/**
 * Fetches the full roster for a tournament: each participant's profile,
 * team, strategy id/name, and AI reasoning.
 */
export async function fetchTournamentRoster(tId: number): Promise<TournamentAgent[]> {
    const contract = getContract();
    const participants: string[] = await contract.getParticipants(tId);

    // Fetch ONE participant at a time with 300ms gaps to stay safely under 15 req/sec rate limit
    // Each participant = 2 parallel calls (agents + getTournamentEntry), so ~7 req/sec total
    const agents: TournamentAgent[] = [];

    for (let i = 0; i < participants.length; i++) {
        const addr = participants[i];
        const [profileRaw, entryRaw] = await Promise.all([
            contract.agents(addr),
            contract.getTournamentEntry(tId, addr),
        ]);

        const profile: AgentProfile = {
            address: addr,
            name: profileRaw.name,
            attack: Number(profileRaw.attack),
            defense: Number(profileRaw.defense),
            discipline: Number(profileRaw.discipline),
            isRegistered: profileRaw.isRegistered,
        };

        const strategyId = Number(entryRaw.strategyId);
        const entry: TournamentEntry = {
            hasEntered: entryRaw.hasEntered,
            hasTeam: entryRaw.hasTeam,
            strategyId,
            strategyName: STRATEGIES[strategyId]?.name ?? "Unknown",
            reasoning: entryRaw.reasoning,
            team: Array.from({ length: 11 }, (_, j) => mapPlayer(entryRaw.team[j])),
        };

        agents.push({ profile, entry } as TournamentAgent);

        if (i < participants.length - 1) {
            await new Promise((r) => setTimeout(r, 300));
        }
    }

    return agents;
}

// ─── Match Results ────────────────────────────────────────────────────────────

/**
 * Fetches all match results for a tournament and annotates each with its round label.
 * Goal counts are derived from simulateMatch() — identical to what the replay shows.
 */
export async function fetchMatchResults(tId: number, agents: TournamentAgent[]): Promise<MatchResult[]> {
    const contract = getContract();
    const raw: Array<{ teamA: string; teamB: string; winner: string; scoreA: bigint; scoreB: bigint }> =
        await contract.getMatches(tId);

    return raw.map((m, i) => {
        const scoreA = Number(m.scoreA);
        const scoreB = Number(m.scoreB);

        // Look up both agents so we can pass full team + strategy data to the simulation
        const agentA = agents.find((a) => a.profile.address.toLowerCase() === m.teamA.toLowerCase());
        const agentB = agents.find((a) => a.profile.address.toLowerCase() === m.teamB.toLowerCase());

        let goalsA = 0;
        let goalsB = 0;

        if (agentA && agentB) {
            const sim = simulateMatch({
                teamA: {
                    name: agentA.profile.name,
                    players: agentA.entry.team,
                    strategyId: agentA.entry.strategyId,
                    agent: agentA.profile,
                },
                teamB: {
                    name: agentB.profile.name,
                    players: agentB.entry.team,
                    strategyId: agentB.entry.strategyId,
                    agent: agentB.profile,
                },
                power: { scoreA, scoreB },
            });
            goalsA = sim.goalsA;
            goalsB = sim.goalsB;
        }

        return {
            teamA: m.teamA,
            teamB: m.teamB,
            winner: m.winner,
            scoreA,
            scoreB,
            goalsA,
            goalsB,
            round: getMatchRound(i),
        };
    });
}

// ─── Full Tournament Detail ───────────────────────────────────────────────────

/**
 * Returns a fully hydrated TournamentDetail: tournament metadata, agents with
 * teams/strategies/reasoning, and all annotated match results.
 *
 * Agents are fetched first so their team/strategy data can be passed to
 * fetchMatchResults(), which derives goal counts via simulateMatch() — ensuring
 * the bracket and scoreboard always show the same goals as the replay.
 */
export async function fetchTournamentDetail(tId: number): Promise<TournamentDetail> {
    const [tournament, agents] = await Promise.all([
        fetchTournament(tId),
        fetchTournamentRoster(tId),
    ]);
    const matches = await fetchMatchResults(tId, agents);

    return { ...tournament, agents, matches };
}

// ─── Full League Summary ──────────────────────────────────────────────────────

/**
 * Fetches the complete state of the league:
 * - All registered agents globally
 * - All tournaments with full details (roster + match results)
 *
 * Ideal for the main dashboard page (cached/revalidated server component).
 */
export async function fetchLeagueSummary(): Promise<LeagueSummary> {
    const contract = getContract();
    const currentTournamentId = Number(await contract.currentTournamentId());

    const [registeredAgents, tournaments] = await Promise.all([
        fetchAllAgents(),
        Promise.all(
            Array.from({ length: currentTournamentId }, (_, i) => fetchTournamentDetail(i + 1))
        ),
    ]);

    return { currentTournamentId, registeredAgents, tournaments };
}

// ─── Live Tournament Snapshot ─────────────────────────────────────────────────

/**
 * Returns a lightweight live snapshot of a tournament's current state.
 * Used by the SSE route handler, polled every 3 seconds.
 *
 * - Shows which agents have joined (OPEN / DRAFTING states)
 * - Shows which agents have committed strategies and reveals reasoning (STRATEGY state)
 * - Includes champion address when COMPLETED
 */
export async function fetchLiveTournamentState(tId: number): Promise<LiveTournamentState> {
    const contract = getContract();

    const [raw, participants] = await Promise.all([
        contract.tournaments(tId),
        contract.getParticipants(tId),
    ]);

    const state = Number(raw.state) as TournamentState;
    const MAX_CAPACITY = 8; // KNOCKOUT_8 only for now

    // Fetch ONE participant at a time with 300ms gaps to stay under 15 req/sec rate limit
    const addrs = participants as string[];
    const liveParticipants: LiveParticipant[] = [];

    for (let i = 0; i < addrs.length; i++) {
        const addr = addrs[i];
        const [profileRaw, entryRaw] = await Promise.all([
            contract.agents(addr),
            contract.getTournamentEntry(tId, addr),
        ]);

        const strategyId = Number(entryRaw.strategyId);
        const strategyCommitted = strategyId > 0 && entryRaw.reasoning !== "";

        liveParticipants.push({
            profile: {
                address: addr,
                name: profileRaw.name,
                attack: Number(profileRaw.attack),
                defense: Number(profileRaw.defense),
                discipline: Number(profileRaw.discipline),
                isRegistered: profileRaw.isRegistered,
            },
            hasTeam: entryRaw.hasTeam,
            team: entryRaw.hasTeam
                ? Array.from({ length: 11 }, (_, j) => mapPlayer(entryRaw.team[j]))
                : [],
            strategyCommitted,
            strategyId: strategyCommitted ? strategyId : null,
            strategyName: strategyCommitted ? (STRATEGIES[strategyId]?.name ?? null) : null,
            reasoning: strategyCommitted ? entryRaw.reasoning : null,
        } as LiveParticipant);

        if (i < addrs.length - 1) {
            await new Promise((r) => setTimeout(r, 300));
        }
    }

    return {
        tournamentId: tId,
        state,
        stateLabel: TOURNAMENT_STATE_LABELS[state],
        spotsLeft: Math.max(0, MAX_CAPACITY - participants.length),
        prizePool: ethers.formatEther(raw.prizePool),
        champion: raw.champion !== ethers.ZeroAddress ? raw.champion : null,
        participants: liveParticipants,
    };
}

