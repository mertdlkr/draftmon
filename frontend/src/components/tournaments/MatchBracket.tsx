import type { MatchResult, TournamentAgent } from "@/lib/contracts";

interface Props {
    matches: MatchResult[];
    agents: TournamentAgent[];
}

const ROUNDS = [
    { key: "Quarter Final", label: "Quarter Finals" },
    { key: "Semi Final", label: "Semi Finals" },
    { key: "Final", label: "Final" },
];

export function MatchBracket({ matches, agents }: Props) {
    // Map address → name for display
    const nameMap = Object.fromEntries(agents.map(a => [a.profile.address.toLowerCase(), a.profile.name]));

    const grouped = {
        "Quarter Final": matches.filter(m => m.round === "Quarter Final"),
        "Semi Final": matches.filter(m => m.round === "Semi Final"),
        "Final": matches.filter(m => m.round === "Final"),
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {ROUNDS.map(({ key, label }) => {
                const roundMatches = grouped[key as keyof typeof grouped];
                if (!roundMatches.length) return null;

                return (
                    <div key={key}>
                        <div style={{
                            fontSize: "0.75rem", fontWeight: 700, color: "var(--color-muted)",
                            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem",
                            fontFamily: "var(--font-mono)",
                        }}>
                            {label}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                            {roundMatches.map((m, i) => {
                                const nameA = nameMap[m.teamA.toLowerCase()] ?? m.teamA.slice(0, 8);
                                const nameB = nameMap[m.teamB.toLowerCase()] ?? m.teamB.slice(0, 8);
                                const aWon = m.winner.toLowerCase() === m.teamA.toLowerCase();

                                return (
                                    <div key={i} className="card" style={{ minWidth: 240, flex: "1 1 240px" }}>
                                        {/* Team A */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 0" }}>
                                            <span style={{ fontWeight: aWon ? 700 : 400, color: aWon ? "var(--color-text)" : "var(--color-muted)", fontSize: "0.875rem" }}>
                                                {aWon && <span style={{ color: "var(--color-pitch)" }}>👑 </span>}{nameA}
                                            </span>
                                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", color: aWon ? "var(--color-pitch)" : "var(--color-muted)", fontWeight: aWon ? 700 : 400 }}>
                                                {m.goalsA}
                                            </span>
                                        </div>

                                        <div className="divider" style={{ margin: "0.25rem 0" }} />

                                        {/* Team B */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 0" }}>
                                            <span style={{ fontWeight: !aWon ? 700 : 400, color: !aWon ? "var(--color-text)" : "var(--color-muted)", fontSize: "0.875rem" }}>
                                                {!aWon && <span style={{ color: "var(--color-pitch)" }}>👑 </span>}{nameB}
                                            </span>
                                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", color: !aWon ? "var(--color-pitch)" : "var(--color-muted)", fontWeight: !aWon ? 700 : 400 }}>
                                                {m.goalsB}
                                            </span>
                                        </div>

                                        {/* Power Score */}
                                        <div style={{
                                            textAlign: "center",
                                            marginTop: "0.35rem",
                                            padding: "0.25rem 0.5rem",
                                            background: "rgba(131,110,249,0.08)",
                                            borderRadius: "4px",
                                            fontSize: "0.7rem",
                                            fontFamily: "var(--font-mono)",
                                            color: "var(--color-muted)",
                                            letterSpacing: "0.03em",
                                        }}>
                                            ⚡ Power: {m.scoreA} – {m.scoreB}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
