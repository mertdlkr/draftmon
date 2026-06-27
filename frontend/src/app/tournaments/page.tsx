import Link from "next/link";
import { fetchAllTournaments, TournamentState } from "@/lib/contracts";
import { PageHeader } from "@/components/layout/PageHeader";
import { shortenAddress } from "@/lib/utils/format";

export default async function TournamentsPage() {
    const tournaments = await fetchAllTournaments().catch(() => []);
    const sorted = [...tournaments].reverse();

    return (
        <div className="flex-grow">
            <PageHeader
                title="Tournaments"
                subtitle="Season history. Click any card to view full results and bracket."
                icon="emoji_events"
                count={`${tournaments.length} TOTAL`}
            />

            <div className="w-full max-w-[960px] mx-auto px-4 py-8 md:py-12 flex flex-col">
            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap mb-8">
                {["ALL", "LIVE", "COMPLETED"].map((tab, i) => (
                    <button
                        key={tab}
                        className={`h-8 px-4 text-xs font-pixel border-2 border-dark-green shadow-[2px_2px_0px_0px_var(--color-dark-green)] transition-all cursor-pointer flex items-center gap-1 ${
                            i === 0
                                ? "bg-primary text-dark-green border-primary"
                                : "bg-white text-dark-green hover:bg-gray-50 hover:-translate-y-0.5"
                        }`}
                    >
                        {i === 0 && <span className="text-[8px]">▶</span>}
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tournament List Stack */}
            <div className="flex flex-col gap-6">
                {sorted.map((t) => {
                    const isLive = t.state !== TournamentState.COMPLETED;
                    const isCompleted = t.state === TournamentState.COMPLETED;

                    return (
                        <Link
                            key={t.id}
                            href={`/tournaments/${t.id}`}
                            className={`group relative flex flex-col md:flex-row items-stretch bg-white border-l-[6px] border-r-2 border-y-2 border-dark-green shadow-[3px_3px_0px_0px_var(--color-dark-green)] transition-all duration-200 cursor-pointer overflow-hidden no-underline text-slate-900 ${isLive ? 'border-l-[#eab308] hover:shadow-[5px_5px_0px_0px_var(--color-primary-dark)] hover:-translate-y-[2px] hover:border-primary-dark' : 'border-l-primary-dark hover:shadow-[5px_5px_0px_0px_var(--color-primary-dark)] hover:-translate-y-[2px] opacity-90 hover:opacity-100'}`}
                        >
                            {isLive && (
                                <div className="absolute -right-8 top-4 bg-orange-500 text-white text-[9px] font-pixel px-8 py-1 rotate-45 border-y-2 border-dark-green shadow-sm z-10">LATEST</div>
                            )}

                            {/* Season number box */}
                            <div className="w-full md:w-32 bg-gray-50 border-b-2 md:border-b-0 md:border-r-2 border-dark-green flex flex-col items-center justify-center p-4 group-hover:bg-[#f0fdf4] transition-colors">
                                <span className="font-pixel text-4xl text-dark-green">S{String(t.id).padStart(2, "0")}</span>
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
                                                <span className="text-primary-dark font-pixel text-xs tracking-wide">COMPLETED</span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-xl text-dark-green font-display">Season {String(t.id).padStart(2, "0")}</h3>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm font-medium text-slate-600 bg-[#faf7f2] px-3 py-1 border border-dark-green border-dashed">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-lg">groups</span>
                                            <span className="font-display font-medium">{t.participants.length}/8 Agents</span>
                                        </div>
                                        <div className="w-px h-4 bg-slate-300"></div>
                                        <div className="flex items-center gap-1 text-primary-deep font-bold">
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
                                                    <span className="text-sm font-bold text-dark-green font-pixel">{shortenAddress(t.champion)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <button className={`w-full md:w-auto px-6 py-2 font-pixel text-[10px] transition-colors border-2 cursor-pointer ${isLive ? 'bg-dark-green text-white border-transparent hover:border-dark-green hover:bg-primary-dark hover:text-dark-green' : 'bg-gray-100 text-dark-green border-dark-green hover:bg-dark-green hover:text-white'}`}>
                                        {isLive ? 'WATCH LIVE' : 'VIEW RESULTS'}
                                    </button>
                                </div>
                            </div>
                        </Link>
                    );
                })}
                {tournaments.length === 0 && (
                    <div className="text-center py-24 border-2 border-dashed border-primary/30">
                        <div className="font-pixel text-primary text-5xl mb-6 pixel-glow">???</div>
                        <div className="font-pixel text-xs text-slate-700 mb-4">NO TOURNAMENTS FOUND</div>
                        <div className="font-pixel text-[8px] text-slate-400 text-blink">▶ INSERT COIN TO CONTINUE ◀</div>
                    </div>
                )}
            </div>

            {/* Load more */}
            {tournaments.length > 5 && (
                <div className="flex items-center justify-center pt-8">
                    <button className="retro-btn group flex items-center gap-2 px-8 py-3 bg-[#e8f3ec] hover:bg-dark-green text-dark-green hover:text-white rounded-none border-2 border-dark-green shadow-[2px_2px_0px_0px_var(--color-dark-green)] transition-all duration-300 cursor-pointer">
                        <span className="font-pixel text-xs">LOAD OLDER SEASONS</span>
                        <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">expand_more</span>
                    </button>
                </div>
            )}
            </div>
        </div>
    );
}
