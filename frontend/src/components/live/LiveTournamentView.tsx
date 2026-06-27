"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLiveTournament } from "@/hooks/useLiveTournament";
import { TournamentState } from "@/lib/contracts";
import { STRATEGIES } from "@/lib/contracts";
import type { LiveParticipant } from "@/lib/contracts";
import { SquadTable } from "@/components/agents/SquadTable";

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
                <div className="sticky top-24 bg-white shadow-xl border-t-[4px] border-t-[#16a34a] border-x border-b border-gray-200">
                    {/* Feed Header */}
                    <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <span className="material-symbols-outlined text-[#16a34a] text-xl">satellite_alt</span>
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16a34a] opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16a34a]" />
                                </span>
                            </div>
                            <h3 className="font-pixel text-xs tracking-wide uppercase">EVENT FEED</h3>
                        </div>
                        <span className="text-sm font-code text-slate-400">LIVE LOG</span>
                    </div>

                    {/* Feed Content */}
                    <div
                        ref={feedRef}
                        className="h-[600px] overflow-y-auto p-4 space-y-4 bg-white font-code text-lg leading-snug"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {recentEvents.length === 0 && (
                            <div className="text-center py-8 text-slate-400 font-code text-lg">
                                Listening for events...
                            </div>
                        )}
                        {recentEvents.map((ev, i) => {
                            const time = new Date(ev.timestamp).toLocaleTimeString("en-US", { hour12: false });

                            if (ev.type === "strategy_revealed") {
                                return (
                                    <div key={ev.timestamp} className="bg-green-50 border-l-4 border-[#16a34a] p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[#15803d] font-bold text-base">{time}</span>
                                            <span className="text-xs text-[#15803d] font-bold uppercase bg-[#16a34a]/20 px-1 py-0.5">Strategy</span>
                                        </div>
                                        <p className="text-slate-800 text-base">
                                            <span className="text-[#3b82f6] font-bold">{ev.payload?.agent?.name}</span> committed{' '}
                                            <span className="bg-slate-100 px-1 border border-slate-300 font-bold">{ev.payload?.strategyName}</span> formation.
                                        </p>
                                    </div>
                                );
                            }

                            if (ev.type === "tournament_ended") {
                                return (
                                    <div key={ev.timestamp} className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-3 relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-purple-700 font-bold text-base">{time}</span>
                                            <span className="text-xs text-purple-800 font-bold uppercase bg-purple-200 px-1 py-0.5">Match Result</span>
                                        </div>
                                        <p className="text-slate-800 text-base">
                                            🏆 Champion: <span className="font-bold text-purple-600">{ev.payload?.champion?.slice(0, 10)}...</span>
                                        </p>
                                        <span className="text-xs text-purple-600 font-bold mt-2 block font-pixel uppercase tracking-wide">CHAMPION!</span>
                                    </div>
                                );
                            }

                            if (ev.type === "error") {
                                return (
                                    <div key={ev.timestamp} className="bg-yellow-50 border-l-4 border-yellow-500 p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-yellow-700 font-bold text-base">{time}</span>
                                            <span className="text-xs text-yellow-800 font-bold uppercase bg-yellow-200 px-1 py-0.5">Alert</span>
                                        </div>
                                        <p className="text-slate-800 text-base">{ev.payload?.message}</p>
                                    </div>
                                );
                            }

                            // Default: participant_joined or other
                            return (
                                <div key={ev.timestamp} className={`border-l-2 border-slate-200 pl-3 py-1 hover:border-slate-400 transition-colors ${i > 4 ? 'opacity-50' : ''}`}>
                                    <span className="text-sm text-slate-400 block mb-1">{time}</span>
                                    <p className="text-slate-600 text-base">
                                        {ev.type === "participant_joined" ? (
                                            <><span className="text-[#16a34a] font-bold">{ev.payload?.agent?.name}</span> joined the tournament.</>
                                        ) : (
                                            <span>{JSON.stringify(ev.payload)}</span>
                                        )}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Chat Box (readonly) */}
                    <div className="p-3 bg-slate-50 border-t border-slate-200">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 border-2 border-slate-200 shadow-inner">
                            <span className="text-[#16a34a] font-bold animate-pulse">&gt;</span>
                            <span className="text-slate-400 font-code text-lg">Chat restricted to participants</span>
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
                <div className="w-20 h-20 bg-slate-100 shrink-0 border-2 border-black overflow-hidden flex items-center justify-center" style={{ imageRendering: 'pixelated' }}>
                    <span className="material-symbols-outlined text-4xl text-slate-400">smart_toy</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate font-pixel text-xs mt-1 leading-relaxed">{p.profile.name}</h3>
                    <p className="text-slate-500 font-code text-base mb-2">{shortAddr}</p>
                    <div className="flex gap-2 text-base font-code text-slate-700">
                        <span className="text-[#ef4444] font-bold">ATK:{p.profile.attack}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-[#3b82f6] font-bold">DEF:{p.profile.defense}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-[#eab308] font-bold">DIS:{p.profile.discipline}</span>
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
