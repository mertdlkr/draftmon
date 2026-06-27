"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLiveTournament } from "@/hooks/useLiveTournament";
import { TournamentState } from "@/lib/contracts";
import { STRATEGIES } from "@/lib/contracts";
import { SquadTable } from "@/components/agents/SquadTable";

interface Props { tId: number }

const PHASE_LABELS: Record<TournamentState, string> = {
    [TournamentState.OPEN]: "Waiting for agents to join...",
    [TournamentState.DRAFTING]: "Draft phase - assigning squads...",
    [TournamentState.STRATEGY]: "Strategy phase - AI managers thinking...",
    [TournamentState.COMPLETED]: "Tournament complete!",
};

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
            const timer = setTimeout(() => {
                router.push(`/tournaments/${tId}`);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [state, tId, router]);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = 0;
        }
    }, [recentEvents]);

    if (!isConnected && !state) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 text-center p-12">
                <div className="skeleton w-48 h-5 mx-auto mb-3" />
                <div className="skeleton w-32 h-4 mx-auto" />
            </div>
        );
    }

    if (error && !state) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 text-center p-8 text-amber-600 font-bold">
                {error}
            </div>
        );
    }

    if (!state) return null;

    return (
        <div className="flex flex-col gap-6">
            {/* Status bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <>
                            <span className="w-2 h-2 bg-[#16a34a] rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-[#16a34a]">CONNECTED</span>
                        </>
                    ) : (
                        <span className="text-sm text-amber-600 font-bold">Reconnecting...</span>
                    )}
                </div>
                <span className="badge badge-primary font-pixel text-[10px]">Season {tId}</span>
                <span className="text-slate-500 text-sm">{PHASE_LABELS[state.state]}</span>
                <div className="flex-1" />
                <span className="text-sm text-slate-500 font-medium">
                    {state.participants.length}/8 joined - {state.spotsLeft} spots left - {state.prizePool} MON pot
                </span>
            </div>

            {state.state === 3 /* COMPLETED */ ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-[#16a34a]/30 text-center py-16 px-8">
                    <span className="material-symbols-outlined text-[#16a34a] mb-4" style={{ fontSize: 64 }}>emoji_events</span>
                    <h2 className="text-2xl font-black mb-2">Season {tId} is Completed!</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                        The matches have been played and the champion has been crowned.
                    </p>
                    <a href={`/tournaments/${tId}`} className="bg-[#16a34a] text-white px-8 py-3 rounded-xl font-bold no-underline hover:bg-[#15803d] transition-colors inline-block">
                        View Tournament Results →
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
                    {/* LEFT — Participants */}
                    <div>
                        <div className="font-pixel text-[10px] text-slate-500 uppercase tracking-widest mb-4">Participants</div>
                        <div className="flex flex-col gap-4">
                            {state.participants.map((p) => (
                                <ParticipantCard key={p.profile.address} p={p} />
                            ))}
                            {Array.from({ length: state.spotsLeft }).map((_, i) => (
                                <div key={`empty-${i}`} className="bg-white rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center min-h-[64px] opacity-40">
                                    <span className="text-sm text-slate-400">Waiting for agent...</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT — Event Feed */}
                    <div className="sticky top-20">
                        <div className="font-pixel text-[10px] text-slate-500 uppercase tracking-widest mb-4">Event Feed</div>
                        <div
                            ref={feedRef}
                            className="bg-slate-900 rounded-xl p-4 flex flex-col gap-3 overflow-y-auto"
                            style={{ maxHeight: "calc(100vh - 220px)" }}
                        >
                            {recentEvents.length === 0 && (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    Listening for events...
                                </div>
                            )}
                            {recentEvents.map((ev) => (
                                <div key={ev.timestamp} className="flex flex-col gap-1 text-sm border-b border-slate-800 pb-3">
                                    <span className="text-slate-500 font-mono text-xs">
                                        {new Date(ev.timestamp).toLocaleTimeString()}
                                    </span>
                                    {ev.type === "participant_joined" && (
                                        <span className="text-slate-200"><span className="text-[#16a34a]">→</span> <strong>{ev.payload?.agent?.name}</strong> joined</span>
                                    )}
                                    {ev.type === "strategy_revealed" && (
                                        <span className="text-slate-200"><span className="text-amber-400">★</span> <strong>{ev.payload?.agent?.name}</strong> chose <strong>{ev.payload?.strategyName}</strong></span>
                                    )}
                                    {ev.type === "tournament_ended" && (
                                        <span className="text-slate-200"><span className="text-amber-400">🏆</span> Champion: {ev.payload?.champion?.slice(0, 10)}...</span>
                                    )}
                                    {ev.type === "error" && (
                                        <span className="text-amber-400">{ev.payload?.message}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Participant Card sub-component ──────────────────────────────────────────

import type { LiveParticipant } from "@/lib/contracts";

function ParticipantCard({ p }: { p: LiveParticipant }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-100 rounded border-2 border-black flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#16a34a]">smart_toy</span>
                </div>
                <div className="font-bold text-base">{p.profile.name}</div>
                {p.strategyCommitted ? (
                    <span className="badge badge-green">Ready</span>
                ) : p.hasTeam ? (
                    <span className="badge badge-amber flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                        Thinking...
                    </span>
                ) : (
                    <span className="badge badge-muted">Drafting</span>
                )}
                <div className="flex-1" />
                <div className="flex gap-1">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold">ATK {p.profile.attack}</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold">DEF {p.profile.defense}</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold">DIS {p.profile.discipline}</span>
                </div>
            </div>

            {p.strategyCommitted && p.strategyId ? (
                <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{STRATEGIES[p.strategyId]?.emoji}</span>
                        <span className="text-sm font-bold text-[#16a34a]">{p.strategyName}</span>
                    </div>
                    {p.reasoning && (
                        <p className="text-sm text-slate-500 leading-relaxed italic">
                            &ldquo;{p.reasoning.slice(0, 250)}{p.reasoning.length > 250 ? "..." : ""}&rdquo;
                        </p>
                    )}
                </div>
            ) : (
                <div className="h-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center">
                    <span className="text-sm text-slate-400">Awaiting strategy...</span>
                </div>
            )}

            {p.hasTeam && p.team.length > 0 && (
                <div className="border-t border-slate-100 mt-3 pt-3">
                    <div className="font-pixel text-[8px] text-slate-400 uppercase tracking-widest mb-2">
                        Squad ({p.team.filter(pl => pl.name).length} players)
                    </div>
                    <SquadTable players={p.team} />
                </div>
            )}
        </div>
    );
}
