import Link from "next/link";
import { fetchAllTournaments } from "@/lib/contracts";

export default async function TournamentsPage() {
    const tournaments = await fetchAllTournaments().catch(() => []);
    const sorted = [...tournaments].reverse();

    return (
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 md:px-10 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black leading-tight tracking-tight uppercase">
                        Tournaments
                    </h1>
                    <p className="text-slate-600 text-base font-normal">All seasons played on Monad Testnet</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-[#16a34a] text-white rounded font-bold text-sm tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">database</span>
                        {tournaments.length} TOTAL
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#16a34a]/10 mb-8 overflow-x-auto">
                <span className="px-6 py-3 border-b-2 border-[#16a34a] text-[#16a34a] font-bold text-sm whitespace-nowrap">All Seasons</span>
            </div>

            {/* Tournament List */}
            <div className="flex flex-col gap-4">
                {sorted.map((t) => {
                    const isLive = t.state !== 3;
                    const isCompleted = t.state === 3;

                    return (
                        <Link
                            key={t.id}
                            href={`/tournaments/${t.id}`}
                            className="flex flex-col md:flex-row items-center gap-6 bg-white p-6 rounded-xl border shadow-sm no-underline text-slate-900 hover:-translate-y-0.5 transition-transform"
                            style={{ borderColor: isLive ? "rgba(22,163,74,0.2)" : "#e2e8f0" }}
                        >
                            {/* Season number box */}
                            <div
                                className="flex-shrink-0 p-4 rounded-xl border-2 w-24 h-24 flex flex-col items-center justify-center"
                                style={{
                                    background: isLive ? "rgba(22,163,74,0.1)" : "#f1f5f9",
                                    borderColor: isLive ? "#16a34a" : "#cbd5e1",
                                }}
                            >
                                <span className="text-xs font-bold uppercase" style={{ color: isLive ? "#16a34a" : "#64748b" }}>Season</span>
                                <span className="text-3xl font-black" style={{ color: isLive ? "#16a34a" : "#475569" }}>
                                    {String(t.id).padStart(2, "0")}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-2 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <h3 className="text-xl font-bold">Season {String(t.id).padStart(2, "0")}</h3>
                                    {isLive ? (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold animate-pulse">
                                            <span className="w-2 h-2 bg-amber-500 rounded-full" /> LIVE
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-[#16a34a]/10 text-[#16a34a] rounded-full text-xs font-bold uppercase">
                                            Completed
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-500 text-sm">
                                    {t.participantCount}/8 agents • {t.prizePool} MON {isCompleted ? "distributed" : "prize pool"}
                                </p>
                                {isCompleted && t.champion && t.champion !== "0x0000000000000000000000000000000000000000" && (
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-amber-500 font-medium">
                                        <span className="material-symbols-outlined text-lg">emoji_events</span>
                                        <span>Champion: {t.champion.slice(0, 6)}…{t.champion.slice(-4)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action */}
                            <div className="flex-shrink-0">
                                {isLive ? (
                                    <span className="flex items-center gap-2 bg-[#16a34a] text-white px-6 py-3 rounded-xl font-bold">
                                        View Results <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold">
                                        View History <span className="material-symbols-outlined text-sm">history</span>
                                    </span>
                                )}
                            </div>
                        </Link>
                    );
                })}
                {tournaments.length === 0 && (
                    <div className="text-center p-12 text-slate-500 font-body text-2xl border-2 border-dashed border-slate-300 rounded-xl">
                        No tournaments yet. Run the orchestrator to kick off Season 1!
                    </div>
                )}
            </div>
        </div>
    );
}
