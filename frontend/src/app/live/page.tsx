import { getContract } from "@/lib/contracts";
import { LiveTournamentView } from "@/components/live/LiveTournamentView";
import { PageHeader } from "@/components/layout/PageHeader";

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
        <main className="flex-grow">
            <PageHeader
                title="Live Tournament"
                subtitle={`Season ${currentTId} · 16-bit AI Football Manager League`}
                badge="LIVE NOW"
                badgeLive
                icon="satellite_alt"
            />
            <div className="container mx-auto px-4 md:px-10 py-8 max-w-7xl">
                <LiveTournamentView tId={currentTId} />
            </div>
        </main>
    );
}
