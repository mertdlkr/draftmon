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

    const agentByAddr = (addr: string) =>
        tournament.agents.find(a => a.profile.address.toLowerCase() === addr.toLowerCase());

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase">Season {tId}</h1>
                    <p className="text-slate-500 mt-1">{tournament.stateLabel}</p>
                </div>
                <div className="flex gap-3 items-center">
                    <span className="px-4 py-2 bg-[#16a34a] text-white font-bold text-sm rounded tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">emoji_events</span>
                        {tournament.prizePool} MON
                    </span>
                    {isCompleted && (
                        <span className="px-3 py-1 bg-[#16a34a]/10 text-[#16a34a] rounded-full text-xs font-bold uppercase">
                            Completed
                        </span>
                    )}
                </div>
            </div>

            {/* Champion Banner */}
            {isCompleted && tournament.champion && tournament.champion !== "0x0000000000000000000000000000000000000000" && (() => {
                const champion = agentByAddr(tournament.champion);
                return (
                    <div className="mb-8 p-6 md:p-8 rounded-xl border-4 border-[#fbbf24] bg-gradient-to-r from-[#fbbf24]/10 to-[#fbbf24]/5 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-20 h-20 bg-[#fbbf24]/20 rounded-xl border-2 border-[#fbbf24] flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[#ca8a04]" style={{ fontSize: 40 }}>military_tech</span>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <p className="font-pixel text-[10px] text-[#ca8a04] uppercase tracking-widest mb-1">
                                Season {tId} Champion
                            </p>
                            <h2 className="text-3xl font-black">
                                {champion?.profile.name ?? `${tournament.champion.slice(0, 6)}…${tournament.champion.slice(-4)}`}
                            </h2>
                        </div>
                        <span className="font-pixel text-[#fbbf24] text-6xl opacity-30">#1</span>
                    </div>
                );
            })()}

            {/* Knockout Bracket */}
            {isCompleted && tournament.matches.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#16a34a]">emoji_events</span>
                        Knockout Bracket
                    </h2>
                    <MatchBracket matches={tournament.matches} agents={tournament.agents} />
                </section>
            )}

            {/* Match Pitches */}
            {isCompleted && tournament.matches.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#16a34a]">sports</span>
                        Match Pitches
                    </h2>
                    <div className="flex flex-col gap-8">
                        {tournament.matches.map((match, i) => {
                            const teamAAgent = agentByAddr(match.teamA);
                            const teamBAgent = agentByAddr(match.teamB);
                            if (!teamAAgent || !teamBAgent) return null;

                            const round = i < 4 ? "Quarter Final" : i < 6 ? "Semi Final" : "Grand Final";
                            const matchNum = i < 4 ? i + 1 : i < 6 ? i - 3 : 1;

                            return (
                                <div key={`pitch-${i}`}>
                                    <div className="font-pixel text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                                        {round} {i < 6 ? `#${matchNum}` : ""}
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

            {/* Roster & Strategies */}
            <section>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#16a34a]">groups</span>
                    Roster & Strategies
                </h2>
                <div className="flex flex-col gap-6">
                    {tournament.agents.map(({ profile, entry }) => (
                        <div key={profile.address} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
                                <AgentCard agent={profile} />
                                <div>
                                    {entry.strategyId ? (
                                        <>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-3 py-1 bg-[#16a34a] text-white text-xs font-bold rounded uppercase">{entry.strategyName}</span>
                                                <span className="badge badge-muted">Tactics #{entry.strategyId}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 leading-relaxed italic">
                                                &ldquo;{entry.reasoning}&rdquo;
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-slate-500 text-sm">No strategy committed.</p>
                                    )}
                                </div>
                            </div>

                            {entry.team.length > 0 && (
                                <div className="border-t border-slate-200 pt-4">
                                    <div className="font-pixel text-[10px] text-slate-500 uppercase tracking-widest mb-3">
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
