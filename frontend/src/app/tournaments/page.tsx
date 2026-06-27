import Link from "next/link";
import { fetchAllTournaments } from "@/lib/contracts";
import { TournamentCard } from "@/components/tournaments/TournamentCard";

export default async function TournamentsPage() {
    const tournaments = await fetchAllTournaments().catch(() => []);
    const sorted = [...tournaments].reverse(); // newest first

    return (
        <div className="page-container">
            <div className="section-header">
                <div>
                    <h1 className="section-title" style={{ fontSize: "1.75rem" }}>Tournaments</h1>
                    <p className="section-subtitle">All seasons played on Monad Testnet</p>
                </div>
                <span className="badge badge-monad">{tournaments.length} total</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {sorted.map((t) => (
                    <TournamentCard key={t.id} tournament={t} />
                ))}
                {tournaments.length === 0 && (
                    <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--color-muted)" }}>
                        No tournaments yet. Run the orchestrator to kick off Season 1!
                    </div>
                )}
            </div>
        </div>
    );
}
