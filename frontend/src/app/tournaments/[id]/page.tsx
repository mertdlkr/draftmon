import { notFound } from "next/navigation";
import { fetchTournamentDetail } from "@/lib/contracts";
import { MatchBracket } from "@/components/tournaments/MatchBracket";
import { AgentCard } from "@/components/agents/AgentCard";
import { SquadTable } from "@/components/agents/SquadTable";
import { FootballPitch } from "@/components/tournaments/FootballPitch";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function TournamentResultsPage({ params }: Props) {
    const { id } = await params;
    const tId = Number(id);

    if (isNaN(tId) || tId < 1) return notFound();

    // Retry up to 5 times with 2s delays — Monad Testnet's 15 req/sec rate limit can cause transient failures
    let tournament = null;
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            tournament = await fetchTournamentDetail(tId);
            break;
        } catch {
            if (attempt < 4) await new Promise((r) => setTimeout(r, 2000));
        }
    }
    if (!tournament) return notFound();

    const isCompleted = tournament.state === 3;

    // Helper to resolve agent by address
    const agentByAddr = (addr: string) =>
        tournament.agents.find(a => a.profile.address.toLowerCase() === addr.toLowerCase());

    return (
        <div className="page-container">
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="section-title" style={{ fontSize: "1.75rem" }}>
                        Season {tId}
                    </h1>
                    <p className="section-subtitle">{tournament.stateLabel}</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span className="badge badge-monad">🏆 {tournament.prizePool} MON</span>
                    {isCompleted && (
                        <span className="badge badge-green">Completed</span>
                    )}
                </div>
            </div>

            {/* Champion banner */}
            {isCompleted && tournament.champion && tournament.champion !== "0x0000000000000000000000000000000000000000" && (() => {
                const champion = agentByAddr(tournament.champion);
                return (
                    <div className="card" style={{ marginBottom: "2rem", background: "rgba(131,110,249,0.08)", border: "1px solid rgba(131,110,249,0.3)", textAlign: "center", padding: "2rem" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👑</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--color-muted)", fontFamily: "var(--font-mono)", marginBottom: "0.25rem" }}>Season Champion</div>
                        <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-monad)" }}>
                            {champion?.profile.name ?? `${tournament.champion.slice(0, 6)}…${tournament.champion.slice(-4)}`}
                        </div>
                    </div>
                );
            })()}

            {/* Match bracket */}
            {isCompleted && tournament.matches.length > 0 && (
                <section style={{ marginBottom: "2.5rem" }}>
                    <div className="section-header">
                        <h2 className="section-title">Match Results</h2>
                    </div>
                    <MatchBracket matches={tournament.matches} agents={tournament.agents} />
                </section>
            )}

            {/* Match Pitches — full football field per match */}
            {isCompleted && tournament.matches.length > 0 && (
                <section style={{ marginBottom: "2.5rem" }}>
                    <div className="section-header">
                        <h2 className="section-title">Match Pitches</h2>
                        <span className="badge badge-muted">{tournament.matches.length} matches</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                        {tournament.matches.map((match, i) => {
                            const teamAAgent = agentByAddr(match.teamA);
                            const teamBAgent = agentByAddr(match.teamB);
                            if (!teamAAgent || !teamBAgent) return null;

                            const round = i < 4 ? "Quarter Final" : i < 6 ? "Semi Final" : "Final";
                            const matchNum = i < 4 ? i + 1 : i < 6 ? i - 3 : 1;

                            return (
                                <div key={`pitch-${i}`}>
                                    <div style={{
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.06em",
                                        color: "var(--color-muted)",
                                        fontFamily: "var(--font-mono)",
                                        marginBottom: "0.5rem",
                                    }}>
                                        {round} {i < 4 ? `#${matchNum}` : i < 6 ? `#${matchNum}` : ""}
                                    </div>
                                    <FootballPitch
                                        teamA={teamAAgent.entry.team}
                                        teamB={teamBAgent.entry.team}
                                        teamAName={teamAAgent.profile.name}
                                        teamBName={teamBAgent.profile.name}
                                        scoreA={match.goalsA}
                                        scoreB={match.goalsB}
                                        powerScoreA={match.scoreA}
                                        powerScoreB={match.scoreB}
                                        strategyA={teamAAgent.entry.strategyName}
                                        strategyB={teamBAgent.entry.strategyName}
                                        winner={match.winner.toLowerCase() === match.teamA.toLowerCase() ? "A" : "B"}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Roster */}
            <section>
                <div className="section-header">
                    <h2 className="section-title">Roster & Strategies</h2>
                    <span className="badge badge-muted">{tournament.agents.length}/8</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {tournament.agents.map(({ profile, entry }) => (
                        <div key={profile.address} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem", alignItems: "start" }}>
                                <AgentCard agent={profile} />
                                <div>
                                    {entry.strategyId ? (
                                        <>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                                <span className="badge badge-monad">{entry.strategyName}</span>
                                                <span className="badge badge-muted">Tactics #{entry.strategyId}</span>
                                            </div>
                                            <p style={{ fontSize: "0.85rem", color: "var(--color-muted)", lineHeight: 1.7, marginTop: 0, fontStyle: "italic" }}>
                                                &ldquo;{entry.reasoning}&rdquo;
                                            </p>
                                        </>
                                    ) : (
                                        <p style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>No strategy committed.</p>
                                    )}
                                </div>
                            </div>

                            {/* Squad */}
                            {entry.team.length > 0 && (
                                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "0.75rem" }}>
                                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem", fontFamily: "var(--font-mono)" }}>
                                        Squad ({entry.team.filter(p => p.name).length} players)
                                    </div>
                                    <SquadTable players={entry.team} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
