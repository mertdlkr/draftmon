/**
 * GET /api/test
 *
 * Development test endpoint — validates all data fetching functions.
 * Returns structured JSON of agents, tournaments, live state, and match results.
 * Remove or guard this route before production deployment.
 */
import { NextResponse } from "next/server";
import {
    fetchAllAgents,
    fetchAllTournaments,
    fetchLiveTournamentState,
    fetchMatchResults,
} from "@/lib/contracts";

export async function GET() {
    try {
        const [agents, tournaments] = await Promise.all([
            fetchAllAgents(),
            fetchAllTournaments(),
        ]);

        // Fetch live state and matches for the current (most recent) tournament
        const currentTId = tournaments.length;
        const [liveState, matches] = currentTId > 0
            ? await Promise.all([
                fetchLiveTournamentState(currentTId),
                fetchMatchResults(currentTId),
            ])
            : [null, []];

        return NextResponse.json({
            ok: true,
            summary: {
                totalAgents: agents.length,
                totalTournaments: tournaments.length,
                currentTournamentId: currentTId,
                currentState: liveState?.stateLabel ?? "—",
            },
            agents,
            tournaments,
            currentLiveState: liveState,
            currentMatches: matches,
        });
    } catch (err) {
        console.error("[/api/test] Error:", err);
        return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
    }
}
