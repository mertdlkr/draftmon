import Link from "next/link";
import type { Tournament } from "@/lib/contracts";
import { TournamentState } from "@/lib/contracts";

interface Props { tournament: Tournament }

const STATE_BADGE: Record<TournamentState, { label: string; cls: string }> = {
    [TournamentState.OPEN]: { label: "Open", cls: "badge-green" },
    [TournamentState.DRAFTING]: { label: "Drafting", cls: "badge-amber" },
    [TournamentState.STRATEGY]: { label: "Strategy Phase", cls: "badge-amber" },
    [TournamentState.COMPLETED]: { label: "Completed", cls: "badge-muted" },
};

export function TournamentCard({ tournament: t }: Props) {
    const badge = STATE_BADGE[t.state] ?? { label: t.stateLabel, cls: "badge-muted" };
    const isActive = t.state !== TournamentState.COMPLETED;
    const isCompleted = t.state === TournamentState.COMPLETED;

    return (
        <div className={`card card-hover`} style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            {/* ID */}
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.1rem", color: "var(--color-monad)", minWidth: 48 }}>
                S{t.id.toString().padStart(2, "0")}
            </div>

            {/* State badge */}
            <span className={`badge ${badge.cls}`}>
                {isActive && t.state !== TournamentState.COMPLETED && <span className="pulse-dot" />}
                {badge.label}
            </span>

            {/* Participants */}
            <span style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
                {t.participants.length}/8 agents
            </span>

            {/* Prize pool */}
            <span style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
                🏆 {t.prizePool} MON
            </span>

            {/* Champion */}
            {isCompleted && t.champion && t.champion !== "0x0000000000000000000000000000000000000000" && (
                <span style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "var(--color-pitch)" }}>
                    👑 {t.champion.slice(0, 6)}…{t.champion.slice(-4)}
                </span>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
                {isActive && (
                    <Link href="/live" className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>
                        Watch Live
                    </Link>
                )}
                {isCompleted && (
                    <Link href={`/tournaments/${t.id}`} className="btn btn-ghost" style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>
                        View Results
                    </Link>
                )}
            </div>
        </div>
    );
}
