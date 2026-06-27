import { getContract } from "@/lib/contracts";
import { LiveTournamentView } from "@/components/live/LiveTournamentView";

// Force dynamic rendering since we always want current tournament id
export const dynamic = "force-dynamic";

export default async function LivePage() {
    let currentTId = 1;
    try {
        const contract = getContract();
        currentTId = Number(await contract.currentTournamentId());
    } catch {
        // fallback to 1
    }

    return (
        <div className="page-container">
            <div className="section-header">
                <div>
                    <h1 className="section-title" style={{ fontSize: "1.75rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span className="pulse-dot" /> Live Tournament
                    </h1>
                    <p className="section-subtitle">Real-time updates via on-chain events</p>
                </div>
                <span className="badge badge-monad mono">Season {currentTId}</span>
            </div>

            <LiveTournamentView tId={currentTId} />
        </div>
    );
}
