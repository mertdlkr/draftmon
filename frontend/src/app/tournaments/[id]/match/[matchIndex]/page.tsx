import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchTournamentDetail } from "@/lib/contracts";
import { FootballPitch } from "@/components/tournaments/FootballPitch";

interface Props {
    params: Promise<{ id: string; matchIndex: string }>;
}

export default async function MatchDetailPage({ params }: Props) {
    const { id, matchIndex } = await params;
    const tId = Number(id);
    const mIdx = Number(matchIndex);

    const tournament = await fetchTournamentDetail(tId);
    if (!tournament || mIdx < 0 || mIdx >= tournament.matches.length) return notFound();

    const match = tournament.matches[mIdx];
    const agentByAddr = (addr: string) =>
        tournament.agents.find((a) => a.profile.address.toLowerCase() === addr.toLowerCase());

    const teamAAgent = agentByAddr(match.teamA);
    const teamBAgent = agentByAddr(match.teamB);
    if (!teamAAgent || !teamBAgent) return notFound();

    const aWon = match.winner.toLowerCase() === match.teamA.toLowerCase();
    const round = mIdx < 4 ? "Quarter Final" : mIdx < 6 ? "Semi Final" : "Final";
    const matchNum = mIdx < 4 ? mIdx + 1 : mIdx < 6 ? mIdx - 3 : 1;
    const matchLabel = round === "Final" ? "Grand Final" : `${round} #${matchNum}`;

    return (
        <div className="flex flex-col gap-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2">
                <Link
                    href={`/tournaments/${tId}`}
                    className="flex items-center justify-center size-8 bg-white border border-slate-200 rounded shadow-sm text-slate-500 hover:text-[#16a249] transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                </Link>
                <div className="flex items-center gap-2 px-4 py-1 bg-white border border-slate-200 rounded shadow-sm">
                    <Link href="/tournaments" className="text-slate-500 hover:text-[#16a249] text-sm font-code">Tournaments</Link>
                    <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
                    <Link href={`/tournaments/${tId}`} className="text-slate-500 hover:text-[#16a249] text-sm font-code">Season {tId}</Link>
                    <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
                    <span className="text-slate-900 font-bold text-sm font-code">{matchLabel}</span>
                </div>
            </div>

            {/* Scoreboard Jumbotron */}
            <section className="w-full relative retro-card bg-white mt-4 shadow-sm">
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative">
                    {/* Home Team */}
                    <div className="flex flex-col items-center gap-3 z-20 w-1/3">
                        <div className={`size-24 md:size-32 bg-white rounded border-4 ${aWon ? 'border-[#13ec5b] shadow-[0_0_15px_rgba(19,236,91,0.4)]' : 'border-slate-300'} overflow-hidden flex items-center justify-center p-2`}>
                            <img src="/logo.png" alt="MonaDraft Logo" className="opacity-20 max-w-full" />
                        </div>
                        <h3 className="text-slate-900 text-sm md:text-base font-pixel text-center leading-relaxed mt-2">{teamAAgent.profile.name}</h3>
                        <span className="text-xs font-code text-[#13ec5b] font-bold px-2 py-0.5 bg-green-50 border border-green-200 rounded uppercase">{teamAAgent.entry.strategyName || "Unknown"}</span>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center z-20 w-1/3 my-6 md:my-0">
                        <div className="bg-[#13ec5b]/10 px-6 py-2 rounded border border-[#13ec5b]/30 mb-4 shadow-inner">
                            <span className="text-[#13ec5b] text-xs font-pixel animate-pulse">FT</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-6xl md:text-8xl font-pixel text-slate-900 leading-none">{match.goalsA}</span>
                            <span className="text-4xl font-pixel text-slate-300">-</span>
                            <span className="text-6xl md:text-8xl font-pixel text-slate-900 leading-none">{match.goalsB}</span>
                        </div>
                        <div className="mt-6 text-slate-500 text-xs md:text-sm font-code flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                            <span className="font-bold text-slate-400">PWR</span>
                            <span className="text-slate-800 font-bold">{match.scoreA}</span>
                            <span className="text-slate-300">-</span>
                            <span className="text-slate-800 font-bold">{match.scoreB}</span>
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center gap-3 z-20 w-1/3">
                        <div className={`size-24 md:size-32 bg-white rounded border-4 ${!aWon ? 'border-[#13ec5b] shadow-[0_0_15px_rgba(19,236,91,0.4)]' : 'border-slate-300'} overflow-hidden flex items-center justify-center p-2`}>
                            <img src="/logo.png" alt="MonaDraft Logo" className="opacity-20 max-w-full" />
                        </div>
                        <h3 className="text-slate-900 text-sm md:text-base font-pixel text-center leading-relaxed mt-2">{teamBAgent.profile.name}</h3>
                        <span className="text-xs font-code text-[#13ec5b] font-bold px-2 py-0.5 bg-green-50 border border-green-200 rounded uppercase">{teamBAgent.entry.strategyName || "Unknown"}</span>
                    </div>
                </div>
            </section>

            {/* Formations */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-pixel text-slate-900 border-l-8 border-[#16a249] pl-4">Formations</h2>
                    <div className="flex gap-4 text-sm font-code">
                        <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-red-500 border border-black" /> {teamAAgent.profile.name}</span>
                        <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-blue-500 border border-black" /> {teamBAgent.profile.name}</span>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
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
                        winner={aWon ? "A" : "B"}
                    />
                </div>
            </section>

            {/* Squad Tables */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Home Squad */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
                    <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-white rounded border border-slate-300 overflow-hidden flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl text-slate-400">smart_toy</span>
                            </div>
                            <div>
                                <h3 className="font-pixel text-[10px] text-slate-500 uppercase">Manager</h3>
                                <p className="font-pixel text-xs text-slate-900">{teamAAgent.profile.name}</p>
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-code font-bold border ${aWon ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                            {aWon ? 'WINNER' : 'Home'}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-pixel text-slate-500 border-b border-slate-200">
                                    <th className="p-3 w-12 text-center">POS</th>
                                    <th className="p-3">PLAYER</th>
                                    <th className="p-3 text-center hidden sm:table-cell">PAC</th>
                                    <th className="p-3 text-center hidden sm:table-cell">SHO</th>
                                    <th className="p-3 text-center hidden sm:table-cell">PAS</th>
                                    <th className="p-3 text-center">OVR</th>
                                </tr>
                            </thead>
                            <tbody className="font-code text-sm">
                                {teamAAgent.entry.team.filter(p => p.name).map((player, idx) => {
                                    const ovr = Math.round((player.pace + player.shooting + player.passing + player.tackling) / 4);
                                    const posColor = player.position === 'GK' ? 'bg-yellow-100 text-yellow-700' :
                                        ['CB', 'LB', 'RB'].includes(player.position) ? 'bg-blue-100 text-blue-700' :
                                            ['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(player.position) ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700';
                                    return (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="p-3 text-center"><span className={`${posColor} px-1.5 py-0.5 rounded text-[10px] font-bold`}>{player.position}</span></td>
                                            <td className="p-3 font-medium text-slate-800">{player.name}</td>
                                            <td className={`p-3 text-center hidden sm:table-cell ${player.pace >= 85 ? 'text-green-600 font-bold' : 'text-slate-600'}`}>{player.pace}</td>
                                            <td className={`p-3 text-center hidden sm:table-cell ${player.shooting >= 85 ? 'text-green-600 font-bold' : 'text-slate-600'}`}>{player.shooting}</td>
                                            <td className={`p-3 text-center hidden sm:table-cell ${player.passing >= 85 ? 'text-green-600 font-bold' : 'text-slate-600'}`}>{player.passing}</td>
                                            <td className="p-3 text-center font-bold text-slate-900 bg-slate-50">{ovr}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Away Squad */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
                    <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-white rounded border border-slate-300 overflow-hidden flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl text-slate-400">smart_toy</span>
                            </div>
                            <div>
                                <h3 className="font-pixel text-[10px] text-slate-500 uppercase">Manager</h3>
                                <p className="font-pixel text-xs text-slate-900">{teamBAgent.profile.name}</p>
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-code font-bold border ${!aWon ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                            {!aWon ? 'WINNER' : 'Away'}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-pixel text-slate-500 border-b border-slate-200">
                                    <th className="p-3 w-12 text-center">POS</th>
                                    <th className="p-3">PLAYER</th>
                                    <th className="p-3 text-center hidden sm:table-cell">PAC</th>
                                    <th className="p-3 text-center hidden sm:table-cell">SHO</th>
                                    <th className="p-3 text-center hidden sm:table-cell">PAS</th>
                                    <th className="p-3 text-center">OVR</th>
                                </tr>
                            </thead>
                            <tbody className="font-code text-sm">
                                {teamBAgent.entry.team.filter(p => p.name).map((player, idx) => {
                                    const ovr = Math.round((player.pace + player.shooting + player.passing + player.tackling) / 4);
                                    const posColor = player.position === 'GK' ? 'bg-yellow-100 text-yellow-700' :
                                        ['CB', 'LB', 'RB'].includes(player.position) ? 'bg-blue-100 text-blue-700' :
                                            ['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(player.position) ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700';
                                    return (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="p-3 text-center"><span className={`${posColor} px-1.5 py-0.5 rounded text-[10px] font-bold`}>{player.position}</span></td>
                                            <td className="p-3 font-medium text-slate-800">{player.name}</td>
                                            <td className={`p-3 text-center hidden sm:table-cell ${player.pace >= 85 ? 'text-green-600 font-bold' : 'text-slate-600'}`}>{player.pace}</td>
                                            <td className={`p-3 text-center hidden sm:table-cell ${player.shooting >= 85 ? 'text-green-600 font-bold' : 'text-slate-600'}`}>{player.shooting}</td>
                                            <td className={`p-3 text-center hidden sm:table-cell ${player.passing >= 85 ? 'text-green-600 font-bold' : 'text-slate-600'}`}>{player.passing}</td>
                                            <td className="p-3 text-center font-bold text-slate-900 bg-slate-50">{ovr}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}
