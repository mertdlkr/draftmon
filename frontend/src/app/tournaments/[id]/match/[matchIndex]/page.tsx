import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchTournamentDetail } from "@/lib/contracts";
import { FootballPitch } from "@/components/tournaments/FootballPitch";
import { SquadTable } from "@/components/agents/SquadTable";

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
                <div className="bg-white border-2 border-black overflow-hidden" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.15)' }}>
                    <div className="px-4 py-3 border-b-2 border-black flex justify-between items-center bg-slate-50">
                        <div>
                            <p className="font-pixel text-[8px] text-slate-400 uppercase tracking-widest mb-0.5">Manager</p>
                            <p className="font-pixel text-xs text-slate-900">{teamAAgent.profile.name}</p>
                        </div>
                        <span className={`px-2 py-1 text-[9px] font-pixel font-bold border-2 ${aWon ? 'bg-[#13ec5b]/10 text-[#16a249] border-[#13ec5b]' : 'bg-slate-100 text-slate-500 border-slate-300'}`}>
                            {aWon ? 'WINNER' : 'HOME'}
                        </span>
                    </div>
                    <div className="p-3">
                        <SquadTable players={teamAAgent.entry.team} />
                    </div>
                </div>

                {/* Away Squad */}
                <div className="bg-white border-2 border-black overflow-hidden" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.15)' }}>
                    <div className="px-4 py-3 border-b-2 border-black flex justify-between items-center bg-slate-50">
                        <div>
                            <p className="font-pixel text-[8px] text-slate-400 uppercase tracking-widest mb-0.5">Manager</p>
                            <p className="font-pixel text-xs text-slate-900">{teamBAgent.profile.name}</p>
                        </div>
                        <span className={`px-2 py-1 text-[9px] font-pixel font-bold border-2 ${!aWon ? 'bg-[#13ec5b]/10 text-[#16a249] border-[#13ec5b]' : 'bg-slate-100 text-slate-500 border-slate-300'}`}>
                            {!aWon ? 'WINNER' : 'AWAY'}
                        </span>
                    </div>
                    <div className="p-3">
                        <SquadTable players={teamBAgent.entry.team} />
                    </div>
                </div>
            </section>
        </div>
    );
}
