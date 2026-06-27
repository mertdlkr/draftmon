import Link from "next/link";
import { fetchAllTournaments } from "@/lib/contracts";

export default async function TournamentsPage() {
    const tournaments = await fetchAllTournaments().catch(() => []);
    const sorted = [...tournaments].reverse();

    return (
        <div className="flex-grow w-full max-w-[960px] mx-auto px-4 py-8 md:py-12 flex flex-col">
            {/* Header and Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10 border-b-2 border-dashed border-[#0e1b13]/20 pb-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-[#0e1b13] text-2xl md:text-4xl font-pixel leading-tight tracking-tighter uppercase">TOURNAMENTS</h1>
                        <span className="bg-[#16a249]/10 border border-[#16a249] text-[#16a249] px-2 py-1 text-[10px] font-pixel font-bold rounded-none">
                            {tournaments.length} TOTAL
                        </span>
                    </div>
                    <p className="text-slate-500 font-medium max-w-lg mt-2 font-display text-base">
                        Manage your AI agents, compete in leagues, and win MON prizes. Join the next season now.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                    {["ALL", "LIVE", "COMPLETED"].map((tab, i) => (
                        <button
                            key={tab}
                            className={`h-8 px-4 text-xs font-bold font-pixel border-2 border-[#0e1b13] shadow-[2px_2px_0px_0px_#0e1b13] hover:-translate-y-0.5 transition-transform cursor-pointer ${i === 0
                                ? "bg-[#0e1b13] text-white"
                                : "bg-white text-[#0e1b13] hover:bg-gray-50"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tournament List Stack */}
            <div className="flex flex-col gap-6">
                {sorted.map((t) => {
                    const isLive = t.state !== 3;
                    const isCompleted = t.state === 3;

                    return (
                        <Link
                            key={t.id}
                            href={`/tournaments/${t.id}`}
                            className={`group relative flex flex-col md:flex-row items-stretch bg-white border-l-[6px] border-r-2 border-y-2 border-[#0e1b13] shadow-[3px_3px_0px_0px_#0e1b13] transition-all duration-200 cursor-pointer overflow-hidden no-underline text-slate-900 ${isLive ? 'border-l-[#eab308] hover:shadow-[5px_5px_0px_0px_#16a249] hover:-translate-y-[2px] hover:border-[#16a249]' : 'border-l-[#16a249] hover:shadow-[5px_5px_0px_0px_#16a249] hover:-translate-y-[2px] opacity-90 hover:opacity-100'}`}
                        >
                            {isLive && (
                                <div className="absolute -right-8 top-4 bg-orange-500 text-white text-[9px] font-pixel px-8 py-1 rotate-45 border-y-2 border-[#0e1b13] shadow-sm z-10">LATEST</div>
                            )}

                            {/* Season number box */}
                            <div className="w-full md:w-32 bg-gray-50 border-b-2 md:border-b-0 md:border-r-2 border-[#0e1b13] flex flex-col items-center justify-center p-4 group-hover:bg-[#f0fdf4] transition-colors">
                                <span className="font-pixel text-4xl text-[#0e1b13]">S{String(t.id).padStart(2, "0")}</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 p-5 flex flex-col gap-4">
                                <div className="flex flex-wrap justify-between items-start gap-2">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            {isLive ? (
                                                <>
                                                    <div className="size-2 rounded-full bg-[#eab308] animate-pulse"></div>
                                                    <span className="text-[#eab308] font-pixel text-xs tracking-wide">LIVE NOW</span>
                                                </>
                                            ) : (
                                                <span className="text-[#16a249] font-pixel text-xs tracking-wide">COMPLETED</span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-xl text-[#0e1b13] font-display">Season {String(t.id).padStart(2, "0")}</h3>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm font-medium text-slate-600 bg-[#faf7f2] px-3 py-1 border border-[#0e1b13] border-dashed">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-lg">groups</span>
                                            <span className="font-display font-medium">{t.participants.length}/8 Agents</span>
                                        </div>
                                        <div className="w-px h-4 bg-slate-300"></div>
                                        <div className="flex items-center gap-1 text-[#15803d] font-bold">
                                            <span className="material-symbols-outlined text-lg">monetization_on</span>
                                            <span className="font-display font-bold">{t.prizePool} MON</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-auto pt-2">
                                    <div className={`flex items-center gap-3 w-full md:w-auto p-2 border ${isCompleted && t.champion && t.champion !== "0x0000000000000000000000000000000000000000" ? 'bg-amber-50 border-amber-200' : 'bg-transparent border-transparent'}`}>
                                        {isCompleted && t.champion && t.champion !== "0x0000000000000000000000000000000000000000" && (
                                            <>
                                                <span className="material-symbols-outlined text-[#eab308]">crown</span>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Champion</span>
                                                    <span className="text-sm font-bold text-[#0e1b13] font-pixel">{t.champion.slice(0, 6)}…{t.champion.slice(-4)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <button className={`w-full md:w-auto px-6 py-2 font-pixel text-[10px] transition-colors border-2 cursor-pointer ${isLive ? 'bg-[#0e1b13] text-white border-transparent hover:border-[#0e1b13] hover:bg-[#16a249] hover:text-[#0e1b13]' : 'bg-gray-100 text-[#0e1b13] border-[#0e1b13] hover:bg-[#0e1b13] hover:text-white'}`}>
                                        {isLive ? 'WATCH LIVE' : 'VIEW RESULTS'}
                                    </button>
                                </div>
                            </div>
                        </Link>
                    );
                })}
                {tournaments.length === 0 && (
                    <div className="text-center p-12 text-slate-500 font-body text-2xl border-2 border-dashed border-[#cfe7d7]">
                        No tournaments yet. Run the orchestrator to kick off Season 1!
                    </div>
                )}
            </div>

            {/* Load more */}
            {tournaments.length > 5 && (
                <div className="flex items-center justify-center pt-8">
                    <button className="group flex items-center gap-2 px-8 py-3 bg-[#e8f3ec] hover:bg-[#0e1b13] text-[#0e1b13] hover:text-white rounded-none border-2 border-[#0e1b13] shadow-[2px_2px_0px_0px_#0e1b13] transition-all duration-300 cursor-pointer">
                        <span className="font-pixel text-xs">LOAD OLDER SEASONS</span>
                        <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">expand_more</span>
                    </button>
                </div>
            )}
        </div>
    );
}
