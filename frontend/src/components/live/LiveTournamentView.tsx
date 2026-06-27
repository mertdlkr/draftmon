"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLiveTournament } from "@/hooks/useLiveTournament";
import { TournamentState } from "@/lib/contracts";
import { STRATEGIES } from "@/lib/contracts";
import { SquadTable } from "@/components/agents/SquadTable";

interface Props { tId: number }

const PHASE_LABELS: Record<TournamentState, string> = {
    [TournamentState.OPEN]: "Waiting for agents to join…",
    [TournamentState.DRAFTING]: "Draft phase — assigning squads…",
    [TournamentState.STRATEGY]: "Strategy phase — AI managers thinking…",
    [TournamentState.COMPLETED]: "Tournament complete!",
};

export function LiveTournamentView({ tId }: Props) {
    const router = useRouter();
    const { state, isConnected, error, recentEvents } = useLiveTournament(tId);
    const prevStateRef = useRef<TournamentState | null>(null);
    const feedRef = useRef<HTMLDivElement>(null);

    // Auto-redirect to results page when tournament transitions to COMPLETED
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

    // Auto-scroll feed to bottom on new events
    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = 0;
        }
    }, [recentEvents]);

    if (!isConnected && !state) {
        return (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                <div className="skeleton" style={{ width: 200, height: 20, margin: "0 auto 0.75rem" }} />
                <div className="skeleton" style={{ width: 140, height: 14, margin: "0 auto" }} />
            </div>
        );
    }

    if (error && !state) {
        return (
            <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--color-amber)" }}>
                ⚠️ {error}
            </div>
        );
    }

    if (!state) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Status bar */}
            <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {isConnected ? (
                        <><span className="pulse-dot" /><span style={{ fontSize: "0.8rem", color: "var(--color-pitch)" }}>Live</span></>
                    ) : (
                        <span style={{ fontSize: "0.8rem", color: "var(--color-amber)" }}>Reconnecting…</span>
                    )}
                </div>
                <span className="badge badge-monad">Season {tId}</span>

                <span style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
                    {PHASE_LABELS[state.state]}
                </span>

                <div style={{ flex: 1 }} />

                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--color-muted)" }}>
                    {state.participants.length}/8 joined · {state.spotsLeft} spots left · 🏆 {state.prizePool} MON pot
                </span>
            </div>

            {state.state === 3 /* COMPLETED */ ? (
                /* Completed State View */
                <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(131,110,249,0.03)", border: "1px dashed rgba(131,110,249,0.3)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏆</div>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Season {tId} is Completed!</h2>
                    <p style={{ color: "var(--color-muted)", marginBottom: "2rem", maxWidth: 400, margin: "0 auto 2rem" }}>
                        The matches have been played and the champion has been crowned.
                        Waiting for the admin to start the next season...
                    </p>
                    <a href={`/tournaments/${tId}`} className="btn btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
                        View Tournament Results & Pitches →
                    </a>
                </div>
            ) : (
                /* Active Tournament — two-column: participants left, feed right */
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 320px",
                    gap: "1.25rem",
                    alignItems: "start",
                }}>
                    {/* LEFT — Participants */}
                    <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Participants
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {state.participants.map((p) => (
                                <ParticipantCard key={p.profile.address} p={p} />
                            ))}

                            {/* Empty slots */}
                            {Array.from({ length: state.spotsLeft }).map((_, i) => (
                                <div key={`empty-${i}`} className="card" style={{
                                    opacity: 0.4, border: "1px dashed var(--color-border)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    minHeight: 64,
                                }}>
                                    <span style={{ fontSize: "0.78rem", color: "var(--color-muted)" }}>Waiting for agent…</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT — Event Feed */}
                    <div style={{ position: "sticky", top: "1rem" }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Event Feed
                        </div>
                        <div
                            ref={feedRef}
                            className="card"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                                maxHeight: "calc(100vh - 220px)",
                                overflowY: "auto",
                                padding: "0.75rem",
                            }}
                        >
                            {recentEvents.length === 0 && (
                                <div style={{ textAlign: "center", padding: "2rem 0.5rem", color: "var(--color-muted)", fontSize: "0.78rem" }}>
                                    Listening for events…
                                </div>
                            )}
                            {recentEvents.map((ev) => (
                                <div key={ev.timestamp} style={{
                                    display: "flex", flexDirection: "column", gap: "0.2rem",
                                    fontSize: "0.78rem", borderBottom: "1px solid var(--color-border)",
                                    paddingBottom: "0.5rem",
                                }}>
                                    <span style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}>
                                        {new Date(ev.timestamp).toLocaleTimeString()}
                                    </span>
                                    {ev.type === "participant_joined" && (
                                        <span><span className="text-pitch">→</span> <strong>{ev.payload?.agent?.name}</strong> joined</span>
                                    )}
                                    {ev.type === "strategy_revealed" && (
                                        <span><span className="text-monad">★</span> <strong>{ev.payload?.agent?.name}</strong> chose <strong>{ev.payload?.strategyName}</strong></span>
                                    )}
                                    {ev.type === "tournament_ended" && (
                                        <span><span className="text-amber">🏆</span> Champion: {ev.payload?.champion?.slice(0, 10)}…</span>
                                    )}
                                    {ev.type === "error" && (
                                        <span style={{ color: "var(--color-amber)" }}>⚠️ {ev.payload?.message}</span>
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
        <div className="card">
            {/* Agent name + status badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{p.profile.name}</div>
                {p.strategyCommitted ? (
                    <span className="badge badge-green">✓ Ready</span>
                ) : p.hasTeam ? (
                    <span className="badge badge-amber" style={{ display: "flex", gap: "0.35rem" }}>
                        <span className="pulse-dot" style={{ background: "var(--color-amber)", width: 6, height: 6 }} />
                        Thinking…
                    </span>
                ) : (
                    <span className="badge badge-muted">Drafting</span>
                )}
                <div style={{ flex: 1 }} />
                {/* Agent stats badges */}
                <div style={{ display: "flex", gap: "0.35rem" }}>
                    <span className="badge badge-muted" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>
                        ATK {p.profile.attack}
                    </span>
                    <span className="badge badge-muted" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>
                        DEF {p.profile.defense}
                    </span>
                    <span className="badge badge-muted" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>
                        DIS {p.profile.discipline}
                    </span>
                </div>
            </div>

            {/* Strategy + Reasoning */}
            {p.strategyCommitted && p.strategyId ? (
                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "1.1rem" }}>{STRATEGIES[p.strategyId]?.emoji}</span>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-monad)" }}>
                            {p.strategyName}
                        </span>
                    </div>
                    {p.reasoning && (
                        <p style={{ fontSize: "0.78rem", color: "var(--color-muted)", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                            &ldquo;{p.reasoning.slice(0, 250)}{p.reasoning.length > 250 ? "…" : ""}&rdquo;
                        </p>
                    )}
                </div>
            ) : (
                <div style={{
                    height: 48, background: "var(--color-surface-2)", borderRadius: 8,
                    border: "1px dashed var(--color-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--color-muted)" }}>Awaiting strategy…</span>
                </div>
            )}

            {/* Squad section — always visible when team is assigned */}
            {p.hasTeam && p.team.length > 0 && (
                <div style={{ borderTop: "1px solid var(--color-border)", marginTop: "0.75rem", paddingTop: "0.75rem" }}>
                    <div style={{
                        fontSize: "0.7rem", fontWeight: 600, color: "var(--color-muted)",
                        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem",
                        fontFamily: "var(--font-mono)",
                    }}>
                        Squad ({p.team.filter(pl => pl.name).length} players)
                    </div>
                    <SquadTable players={p.team} />
                </div>
            )}
        </div>
    );
}
