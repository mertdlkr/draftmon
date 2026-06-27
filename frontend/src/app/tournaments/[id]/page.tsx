import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchTournamentDetail } from "@/lib/contracts";
import { MatchBracket } from "@/components/tournaments/MatchBracket";
import { AgentCard } from "@/components/agents/AgentCard";

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
        <div className="flex-grow w-full max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col gap-10 py-10">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-end gap-6 border-b-2 border-slate-200 pb-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-slate-900 text-2xl md:text-3xl font-pixel leading-tight">Season {tId} Tournament</h1>
                    <p className="text-[#16a249] text-xl md:text-2xl font-code font-bold uppercase tracking-wider">{tournament.stateLabel}</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center justify-center rounded border-2 border-slate-900 bg-white text-slate-900 h-10 px-4 font-code text-xl font-bold hover:bg-slate-50 transition-colors">
                        {tournament.prizePool} MON Prize Pool
                    </button>
                    {isCompleted && (
                        <button className="flex items-center justify-center rounded border-2 border-[#16a249] bg-white text-[#16a249] h-10 px-4 font-code text-xl font-bold hover:bg-green-50 transition-colors">
                            <span className="material-symbols-outlined mr-2 text-base">check_circle</span> Completed
                        </button>
                    )}
                </div>
            </div>

            {/* Champion Banner */}
            {isCompleted && tournament.champion && tournament.champion !== "0x0000000000000000000000000000000000000000" && (() => {
                const champion = agentByAddr(tournament.champion);
                return (
                    <section className="w-full relative">
                        <div className="bg-[#f0fdf4] border-4 border-[#16a249] rounded-lg p-6 flex flex-col md:flex-row items-center justify-center gap-8 shadow-sm">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#16a249] text-white px-6 py-2 rounded font-pixel text-xs md:text-sm shadow-md whitespace-nowrap z-10">
                                SEASON CHAMPION
                            </div>
                            <div className="relative mt-4 md:mt-0">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#16a249] bg-white overflow-hidden relative z-0 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#16a249] text-6xl">emoji_events</span>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-yellow-400 border-2 border-black p-1.5 rounded-full z-10">
                                    <span className="material-symbols-outlined text-black text-xl">star</span>
                                </div>
                            </div>
                            <div className="text-center md:text-left flex flex-col gap-2">
                                <h2 className="text-3xl md:text-4xl font-pixel text-slate-900">
                                    {champion?.profile.name ?? `${tournament.champion.slice(0, 6)}…${tournament.champion.slice(-4)}`}
                                </h2>
                                <div className="font-code text-xl md:text-2xl text-slate-600">
                                    Strategy: <span className="text-[#16a249] font-bold">{champion?.entry?.strategyName ?? "Unknown"}</span>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                                    <div className="bg-white border-2 border-green-200 px-3 py-1 rounded">
                                        <span className="font-code text-lg text-slate-500">Prize</span>
                                        <span className="font-pixel text-sm ml-2 text-[#16a249]">{tournament.prizePool} MON</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })()}

            {/* Knockout Bracket */}
            {isCompleted && tournament.matches.length > 0 && (
                <section className="flex flex-col gap-6 mb-10 w-full overflow-hidden">
                    <h3 className="text-xl font-pixel text-slate-900 border-l-8 border-[#16a249] pl-4">Knockout Stage</h3>
                    <div className="overflow-x-auto pb-6 w-full">
                        <MatchBracket matches={tournament.matches} agents={tournament.agents} />
                    </div>
                </section>
            )}

            {/* Match Replays */}
            {isCompleted && tournament.matches.length > 0 && (
                <section className="flex flex-col gap-6 mb-10 w-full">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-pixel text-slate-900 border-l-8 border-[#16a249] pl-4">Match Replays</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4 w-full">
                        {tournament.matches.map((match, i) => {
                            const teamAAgent = agentByAddr(match.teamA);
                            const teamBAgent = agentByAddr(match.teamB);
                            if (!teamAAgent || !teamBAgent) return null;

                            const aWon = match.winner.toLowerCase() === match.teamA.toLowerCase();
                            const winnerName = aWon ? teamAAgent.profile.name : teamBAgent.profile.name;
                            const round = i < 4 ? "QF" : i < 6 ? "SF" : "Final";
                            const matchNum = i < 4 ? i + 1 : i < 6 ? i - 3 : 1;
                            const title = round === "Final" ? `Final: ${teamAAgent.profile.name} vs ${teamBAgent.profile.name}` : `${round}${matchNum}: ${teamAAgent.profile.name} vs ${teamBAgent.profile.name}`;
                            const subtitle = `${teamAAgent.entry.strategyName || "Unknown"} vs ${teamBAgent.entry.strategyName || "Unknown"}`;

                            return (
                                <Link key={`pitch-${i}`} href={`/tournaments/${tId}/match/${i}`} className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group">
                                    {/* Mini Pitch with Winner Overlay */}
                                    <div
                                        className="bg-[#22c55e] aspect-[3/4] rounded border-2 border-[#15803d] relative overflow-hidden flex flex-col shadow-inner"
                                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 40px)' }}
                                    >
                                        {/* Field Markings */}
                                        <div className="absolute top-0 left-[25%] w-[50%] h-[15%] border-2 border-white/80 border-t-0" />
                                        <div className="absolute bottom-0 left-[25%] w-[50%] h-[15%] border-2 border-white/80 border-b-0" />
                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/60 -translate-y-1/2" />
                                        <div className="absolute top-1/2 left-1/2 w-[30%] aspect-square border-2 border-white/60 rounded-full -translate-x-1/2 -translate-y-1/2" />
                                        {/* Winner Display */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
                                            <span className="material-symbols-outlined text-4xl text-yellow-400 drop-shadow-md">emoji_events</span>
                                            <span className="font-pixel text-[10px] text-white bg-black/60 px-2 py-1 rounded border border-white/20 uppercase tracking-tighter">{winnerName}</span>
                                        </div>
                                        {/* Score Overlay */}
                                        <div className="absolute top-2 right-2 bg-black/80 text-white font-pixel text-[10px] px-2 py-1 rounded border border-white/20">
                                            {match.goalsA} - {match.goalsB}
                                        </div>
                                    </div>
                                    <div className="mt-3 px-1">
                                        <h4 className="font-pixel text-xs text-slate-800 truncate">{title}</h4>
                                        <p className="font-code text-sm text-slate-500 mt-1 truncate">{subtitle}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Roster & Strategies */}
            <section className="flex flex-col gap-6">
                <h3 className="text-xl font-pixel text-slate-900 border-l-8 border-[#16a249] pl-4">Top Managers</h3>
                <div className="flex flex-col gap-6">
                    {tournament.agents.map(({ profile, entry }) => (
                        <div key={profile.address} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-start">
                                <div className="w-full max-w-[320px]">
                                    <AgentCard agent={profile} />
                                </div>
                                <div className="flex flex-col h-full w-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            {/* We rely on the AgentCard for the main name/address, but we can put the strategy title here */}
                                            <h4 className="font-pixel text-xs text-slate-900 mb-1">{profile.name}</h4>
                                            {entry.strategyId ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-green-50 text-[#16a249] text-[10px] font-bold rounded uppercase font-code border border-green-200">
                                                        {entry.strategyName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="text-slate-500 font-code text-sm">No strategy committed.</p>
                                            )}
                                        </div>
                                        {/* Example status badge */}
                                        {tournament.champion === profile.address && (
                                            <div className="bg-green-50 text-[#16a249] px-2 py-0.5 rounded font-code text-xs font-bold border border-green-200">
                                                WINNER
                                            </div>
                                        )}
                                    </div>

                                    {entry.reasoning && (
                                        <div className="bg-slate-50 p-4 rounded relative border border-slate-200 mt-2 mb-6 flex-grow">
                                            <span className="absolute top-2 left-2 font-pixel text-2xl text-slate-300 leading-[0] select-none">“</span>
                                            <p className="font-code text-sm text-slate-700 italic px-4 relative z-10 leading-snug">
                                                {entry.reasoning}
                                            </p>
                                            <span className="absolute bottom-[-10px] right-2 font-pixel text-2xl text-slate-300 leading-[0] rotate-180 select-none">“</span>
                                        </div>
                                    )}

                                    {entry.team.length > 0 && (
                                        <div className="w-full overflow-x-auto mt-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b-2 border-slate-200">
                                                        <th className="py-2 font-pixel text-[10px] text-slate-400 uppercase">Pos</th>
                                                        <th className="py-2 font-pixel text-[10px] text-slate-400 uppercase">Player</th>
                                                        <th className="py-2 font-pixel text-[10px] text-slate-400 uppercase text-center">PAC</th>
                                                        <th className="py-2 font-pixel text-[10px] text-slate-400 uppercase text-center">SHO</th>
                                                        <th className="py-2 font-pixel text-[10px] text-slate-400 uppercase text-center">PAS</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="font-code text-sm">
                                                    {entry.team.filter(p => p.name).map((player, idx) => (
                                                        <tr key={idx} className="border-b border-slate-100">
                                                            <td className="py-1 text-slate-500">{player.position}</td>
                                                            <td className="py-1 font-bold text-slate-800">{player.name}</td>
                                                            <td className={`py-1 text-center font-bold ${player.pace >= 85 ? 'text-green-600' : player.pace >= 70 ? 'text-yellow-600' : 'text-red-500'}`}>{player.pace}</td>
                                                            <td className={`py-1 text-center font-bold ${player.shooting >= 85 ? 'text-green-600' : player.shooting >= 70 ? 'text-yellow-600' : 'text-red-500'}`}>{player.shooting}</td>
                                                            <td className={`py-1 text-center font-bold ${player.passing >= 85 ? 'text-green-600' : player.passing >= 70 ? 'text-yellow-600' : 'text-red-500'}`}>{player.passing}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
