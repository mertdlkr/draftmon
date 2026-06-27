"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLiveTournament } from "@/hooks/useLiveTournament";
import { TournamentState } from "@/lib/contracts";
import { STRATEGIES } from "@/lib/contracts";
import type { LiveParticipant } from "@/lib/contracts";
import { SquadTable } from "@/components/agents/SquadTable";
import { PixelStatBar } from "@/components/ui/PixelStatBar";
import { ManagerAvatar, getManagerColor } from "@/components/ui/ManagerAvatar";

interface Props { tId: number }

const PHASE_LABELS: Record<TournamentState, string> = {
    [TournamentState.OPEN]: "Waiting for agents to join...",
    [TournamentState.DRAFTING]: "Draft phase - assigning squads...",
    [TournamentState.STRATEGY]: "Strategy phase - AI managers thinking...",
    [TournamentState.COMPLETED]: "Tournament complete!",
};

const ACCENT_COLORS = [
    "border-l-[#3b82f6]",  // blue
    "border-l-[#ef4444]",  // red
    "border-l-[#a855f7]",  // purple
    "border-l-[#06b6d4]",  // cyan
    "border-l-[#eab308]",  // yellow
    "border-l-[#475569]",  // slate
    "border-l-[#f97316]",  // orange
    "border-l-[#ec4899]",  // pink
];

export function LiveTournamentView({ tId }: Props) {
    const router = useRouter();
    const { state, isConnected, error, recentEvents } = useLiveTournament(tId);
    const prevStateRef = useRef<TournamentState | null>(null);
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!state) return;
        const prev = prevStateRef.current;
        prevStateRef.current = state.state;
        if (prev !== null && prev !== TournamentState.COMPLETED && state.state === TournamentState.COMPLETED) {
            const timer = setTimeout(() => { router.push(`/tournaments/${tId}`); }, 3000);
            return () => clearTimeout(timer);
        }
    }, [state, tId, router]);

    useEffect(() => {
        if (feedRef.current) feedRef.current.scrollTop = 0;
    }, [recentEvents]);

    if (!isConnected && !state) {
        return (
            <div className="bg-white border-2 border-black text-center p-12" style={{ boxShadow: '6px 6px 0px 0px rgba(214, 211, 209, 1)' }}>
                <div className="h-5 w-48 bg-slate-200 mx-auto mb-3 animate-pulse" />
                <div className="h-4 w-32 bg-slate-200 mx-auto animate-pulse" />
            </div>
        );
    }

    if (error && !state) {
        return (
            <div className="bg-white border-2 border-black text-center p-8 text-amber-600 font-bold" style={{ boxShadow: '6px 6px 0px 0px rgba(214, 211, 209, 1)' }}>
                {error}
            </div>
        );
    }

    if (!state) return null;

    if (state.state === 3 /* COMPLETED */) {
        return (
            <div className="bg-white border-2 border-dashed border-[#16a34a]/30 text-center py-16 px-8">
                <span className="material-symbols-outlined text-[#16a34a] mb-4" style={{ fontSize: 64 }}>emoji_events</span>
                <h2 className="text-2xl font-pixel mb-2">Season {tId} Complete!</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto font-code text-lg">
                    The matches have been played and the champion has been crowned.
                </p>
                <a href={`/tournaments/${tId}`} className="bg-[#16a34a] text-white px-8 py-3 font-pixel text-xs no-underline hover:bg-[#15803d] transition-colors inline-block border-2 border-[#15803d] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                    View Results →
                </a>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT — Participant Cards Grid */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {state.participants.map((p, i) => (
                    <ParticipantCard key={p.profile.address} p={p} accentColor={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
                ))}
                {Array.from({ length: state.spotsLeft }).map((_, i) => (
                    <div
                        key={`empty-${i}`}
                        className="bg-white border-2 border-dashed border-slate-300 flex items-center justify-center min-h-[120px] opacity-40"
                        style={{ boxShadow: '6px 6px 0px 0px rgba(214, 211, 209, 1)' }}
                    >
                        <span className="text-sm text-slate-400 font-code">Waiting for agent...</span>
                    </div>
                ))}
            </div>

            {/* RIGHT — Event Feed */}
            <div className="lg:col-span-4 relative">
                <div className="sticky top-24 border-2 border-[#13ec5b]/40 shadow-[4px_4px_0px_0px_rgba(19,236,91,0.1)]" style={{ background: "#0d1b12" }}>
                    {/* Feed Header */}
                    <div className="px-4 py-3 border-b border-[#13ec5b]/20 flex items-center justify-between" style={{ background: "#071009" }}>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#13ec5b] rounded-full animate-pulse" />
                            <h3 className="font-pixel text-[10px] text-[#13ec5b] tracking-widest">▶ LIVE FEED</h3>
                        </div>
                        <span className="font-pixel text-[8px] text-[#13ec5b]/40">SEASON {tId}</span>
                    </div>

                    {/* Feed Content */}
                    <div
                        ref={feedRef}
                        className="h-[600px] overflow-y-auto p-3 space-y-2"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none", background: "#0d1b12" }}
                    >
                        {recentEvents.length === 0 && (
                            <div className="text-center py-12 font-pixel text-[8px] text-[#13ec5b]/40 text-blink">
                                MONITORING FEED...
                            </div>
                        )}
                        {recentEvents.map((ev, i) => {
                            const time = new Date(ev.timestamp).toLocaleTimeString("en-US", { hour12: false });

                            if (ev.type === "strategy_revealed") {
                                return (
                                    <div key={ev.timestamp} className="border-l-2 border-[#13ec5b] pl-3 py-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-pixel text-[7px] text-[#13ec5b]/50">[{time}]</span>
                                            <span className="font-pixel text-[7px] text-[#13ec5b] bg-[#13ec5b]/10 px-1">STRATEGY</span>
                                        </div>
                                        <p className="font-body text-base text-[#cfe7d7]">
                                            <span className="text-[#13ec5b] font-bold">{ev.payload?.agent?.name}</span>
                                            {" → "}<span className="text-white font-bold">{ev.payload?.strategyName}</span>
                                        </p>
                                    </div>
                                );
                            }

                            if (ev.type === "tournament_ended") {
                                return (
                                    <div key={ev.timestamp} className="border-l-2 border-yellow-400 pl-3 py-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-pixel text-[7px] text-[#13ec5b]/50">[{time}]</span>
                                            <span className="font-pixel text-[7px] text-yellow-400 bg-yellow-400/10 px-1 text-blink">CHAMPION</span>
                                        </div>
                                        <p className="font-body text-base text-yellow-300 font-bold">
                                            🏆 {ev.payload?.champion?.slice(0, 10)}...
                                        </p>
                                    </div>
                                );
                            }

                            if (ev.type === "error") {
                                return (
                                    <div key={ev.timestamp} className="border-l-2 border-red-500 pl-3 py-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-pixel text-[7px] text-[#13ec5b]/50">[{time}]</span>
                                            <span className="font-pixel text-[7px] text-red-400 bg-red-400/10 px-1">ERROR</span>
                                        </div>
                                        <p className="font-body text-base text-red-300">{ev.payload?.message}</p>
                                    </div>
                                );
                            }

                            return (
                                <div key={ev.timestamp} className={`border-l-2 border-[#13ec5b]/20 pl-3 py-1 ${i > 4 ? "opacity-40" : ""}`}>
                                    <span className="font-pixel text-[7px] text-[#13ec5b]/40 block mb-0.5">[{time}] LOG</span>
                                    <p className="font-body text-base text-[#cfe7d7]/70">
                                        {ev.type === "participant_joined" ? (
                                            <><span className="text-[#13ec5b]">{ev.payload?.agent?.name}</span> has entered the arena.</>
                                        ) : (
                                            <span>{JSON.stringify(ev.payload)}</span>
                                        )}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Terminal prompt */}
                    <div className="px-4 py-2 border-t border-[#13ec5b]/20" style={{ background: "#071009" }}>
                        <div className="flex items-center gap-2 font-pixel text-[8px] text-[#13ec5b]/50">
                            <span className="text-blink">▶</span>
                            <span>MONITORING FEED...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Participant Card ────────────────────────────────────────────────────────

function ParticipantCard({ p, accentColor }: { p: LiveParticipant; accentColor: string }) {
    const addr = p.profile.address;
    const shortAddr = `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    // Determine status
    let statusBadge;
    if (p.strategyCommitted) {
        statusBadge = (
            <div className="flex items-center gap-1 bg-green-50 text-green-700 text-base px-2 py-0.5 border-2 border-green-200 font-code uppercase">
                <span className="w-2 h-2 bg-green-600 animate-pulse mr-1" />
                Ready
            </div>
        );
    } else if (p.hasTeam) {
        statusBadge = (
            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 text-base px-2 py-0.5 border-2 border-yellow-200 font-code uppercase">
                <span className="material-symbols-outlined text-sm animate-spin">hourglass_top</span>
                Thinking
            </div>
        );
    } else {
        statusBadge = (
            <div className="flex items-center gap-1 bg-slate-50 text-slate-600 text-base px-2 py-0.5 border-2 border-slate-200 font-code uppercase">
                <span className="material-symbols-outlined text-sm">login</span>
                Joined
            </div>
        );
    }

    return (
        <div
            className={`group bg-white border-2 border-black border-l-[4px] ${accentColor} relative transition-transform`}
            style={{ boxShadow: '6px 6px 0px 0px rgba(214, 211, 209, 1)' }}
        >
            {/* Status badge */}
            <div className="absolute top-3 right-3">
                {statusBadge}
            </div>

            {/* Main content */}
            <div className="p-4 flex gap-4">
                <ManagerAvatar name={p.profile.name} size={80} />
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate font-pixel text-xs mt-1 leading-relaxed">{p.profile.name}</h3>
                    <p className="text-slate-500 font-code text-base mb-2">{shortAddr}</p>
                    <div className="flex flex-col gap-1 w-full">
                        <PixelStatBar label="ATT" value={p.profile.attack} color={getManagerColor(p.profile.name)} />
                        <PixelStatBar label="DEF" value={p.profile.defense} color={getManagerColor(p.profile.name)} />
                        <PixelStatBar label="DIS" value={p.profile.discipline} color={getManagerColor(p.profile.name)} />
                    </div>
                </div>
            </div>

            {/* Strategy / Waiting quote */}
            <div className="bg-slate-50 px-4 py-2 border-t-2 border-slate-100">
                {p.strategyCommitted && p.strategyId ? (
                    <p className="text-lg text-slate-600 font-code italic">
                        &quot;{p.reasoning ? p.reasoning.slice(0, 80) + (p.reasoning.length > 80 ? '...' : '') : `${STRATEGIES[p.strategyId]?.name || 'Strategy'} activated.`}&quot;
                    </p>
                ) : p.hasTeam ? (
                    <p className="text-lg text-slate-400 font-code italic"> analyzing opponent history...</p>
                ) : (
                    <p className="text-lg text-slate-400 font-code italic"> Waiting for turn...</p>
                )}
            </div>

            {/* Squad (collapsible) */}
            {p.hasTeam && p.team.length > 0 && (
                <details className="border-t-2 border-slate-100">
                    <summary className="px-4 py-2 text-xs font-pixel text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-50">
                        Squad ({p.team.filter(pl => pl.name).length} players)
                    </summary>
                    <div className="px-4 pb-3">
                        <SquadTable players={p.team} />
                    </div>
                </details>
            )}
        </div>
    );
}
