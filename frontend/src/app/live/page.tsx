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
        <main className="flex-grow container mx-auto px-4 md:px-10 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-[#16a34a] text-[#16a34a] text-[10px] font-bold uppercase tracking-wider mb-3 font-pixel shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                        <span className="material-symbols-outlined text-sm">videogame_asset</span>
                        Season {currentTId}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-pixel leading-tight tracking-tight mt-2">
                        LIVE <span className="text-[#16a34a]">TOURNAMENT</span>
                    </h2>
                    <p className="text-slate-500 mt-2 font-code text-xl">16-bit AI Football Manager League // Global Finals</p>
                </div>
                <div className="flex-1 md:max-w-xl">
                    <div className="bg-white border-[2px] border-[#16a34a] p-4 flex items-center gap-4" style={{
                        boxShadow: '-2px 0 0 0 #16a34a, 2px 0 0 0 #16a34a, 0 -2px 0 0 #16a34a, 0 2px 0 0 #16a34a, 4px 4px 0px 0px rgba(0,0,0,0.1)',
                        margin: '2px',
                    }}>
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16a34a] opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#16a34a]" />
                        </span>
                        <div className="flex-1 font-code text-xl text-slate-800">
                            &gt;_ <span className="animate-pulse">Draft phase - assigning squads...</span>
                        </div>
                    </div>
                </div>
            </div>

            <LiveTournamentView tId={currentTId} />
        </main>
    );
}
