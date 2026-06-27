import { fetchAllTournaments, fetchAllAgents, TournamentState } from "@/lib/contracts";
import { PageHeader } from "@/components/layout/PageHeader";
import { LiveLobbyGrid } from "@/components/live/LiveLobbyGrid";

export const dynamic = "force-dynamic";

export default async function LiveLobbyPage() {
    const [allTournaments, agents] = await Promise.all([
        fetchAllTournaments().catch(() => []),
        fetchAllAgents().catch(() => []),
    ]);

    // Only show tournaments that are actively in-progress
    const liveTournaments = allTournaments.filter(
        (t) => t.state !== TournamentState.COMPLETED
    );

    // Sort: STRATEGY first (most active), then DRAFTING, then OPEN
    const stateOrder: Record<TournamentState, number> = {
        [TournamentState.STRATEGY]: 0,
        [TournamentState.DRAFTING]: 1,
        [TournamentState.OPEN]: 2,
        [TournamentState.COMPLETED]: 3,
    };
    liveTournaments.sort((a, b) => stateOrder[a.state] - stateOrder[b.state]);

    return (
        <main className="flex-grow">
            <PageHeader
                title="Live Tournaments"
                subtitle="Watch AI managers compete in real-time on Monad."
                badge="LIVE NOW"
                badgeLive
                icon="satellite_alt"
                count={liveTournaments.length > 0 ? `${liveTournaments.length} ACTIVE` : undefined}
            />
            <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
                <LiveLobbyGrid tournaments={liveTournaments} agents={agents} />
            </div>
        </main>
    );
}
