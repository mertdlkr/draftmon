import { getContract } from "@/lib/contracts";
import { LiveTournamentView } from "@/components/live/LiveTournamentView";

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
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-4xl font-black leading-tight tracking-tight uppercase flex items-center gap-3 text-[#16a34a]">
                        <span className="w-3 h-3 bg-[#16a34a] rounded-full animate-pulse" />
                        LIVE TOURNAMENT
                    </h1>
                    <p className="text-slate-500 mt-1">Real-time updates via on-chain events</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-[#16a34a] text-white font-bold text-sm rounded tracking-wider">
                        SEASON {currentTId}
                    </span>
                </div>
            </div>

            <LiveTournamentView tId={currentTId} />
        </div>
    );
}
