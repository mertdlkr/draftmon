import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchTournamentDetail, TournamentState } from "@/lib/contracts";
import { retryAsync } from "@/lib/utils/retry";
import { shortenAddress } from "@/lib/utils/format";
import { MatchBracket } from "@/components/tournaments/MatchBracket";
import { TournamentSpectator } from "@/components/tournaments/TournamentSpectator";
import { AgentCard } from "@/components/agents/AgentCard";
import { SquadTable } from "@/components/agents/SquadTable";
import { ManagerAvatar } from "@/components/ui/ManagerAvatar";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function TournamentResultsPage({ params }: Props) {
    const { id } = await params;
    const tId = Number(id);

    if (isNaN(tId) || tId < 1) return notFound();

    const tournament = await retryAsync(() => fetchTournamentDetail(tId), 4, 2000).catch(() => null);
    if (!tournament) return notFound();

    const isCompleted = tournament.state === TournamentState.COMPLETED;

    const agentByAddr = (addr: string) =>
        tournament.agents.find(a => a.profile.address.toLowerCase() === addr.toLowerCase());

    return (
        <div className="flex-grow w-full max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col gap-10 py-10">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-end gap-6 border-b-2 border-slate-200 pb-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-slate-900 text-2xl md:text-3xl font-pixel leading-tight">Season {tId} Tournament</h1>
                    <p className="text-primary-dark text-xl md:text-2xl font-code font-bold uppercase tracking-wider">{tournament.stateLabel}</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center justify-center rounded border-2 border-slate-900 bg-white text-slate-900 h-10 px-4 font-code text-xl font-bold hover:bg-slate-50 transition-colors">
                        {tournament.prizePool} MON Prize Pool
                    </button>
                    {isCompleted && (
                        <button className="flex items-center justify-center rounded border-2 border-primary-dark bg-white text-primary-dark h-10 px-4 font-code text-xl font-bold hover:bg-green-50 transition-colors">
                            <span className="material-symbols-outlined mr-2 text-base">check_circle</span> Completed
                        </button>
                    )}
                </div>
            </div>

            {/* Champion Banner */}
            {isCompleted && tournament.champion && tournament.champion !== "0x0000000000000000000000000000000000000000" && (() => {
                const champion = agentByAddr(tournament.champion);
                const championName = champion?.profile.name ?? shortenAddress(tournament.champion);
                return (
                    <section className="w-full relative">
                        {/* Retro header badge */}
                        <div className="flex justify-center mb-0">
                            <div className="bg-primary-dark text-white px-8 py-2 font-pixel text-xs tracking-widest border-2 border-dark-green shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] z-10 relative">
                                SEASON CHAMPION
                            </div>
                        </div>

                        <div
                            className="bg-[#f0fdf4] border-2 border-primary-dark p-8 flex flex-col md:flex-row items-center justify-center gap-10"
                            style={{ boxShadow: "6px 6px 0px 0px rgba(22,162,73,0.15)" }}
                        >
                            {/* Avatar with gold star badge */}
                            <div className="relative shrink-0">
                                <ManagerAvatar name={championName} size={128} />
                                {/* Gold star badge */}
                                <div className="absolute -bottom-3 -right-3 bg-yellow-400 border-2 border-black w-9 h-9 flex items-center justify-center font-pixel text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                                    ★
                                </div>
                            </div>

                            {/* Info */}
                            <div className="text-center md:text-left flex flex-col gap-3">
                                <h2 className="text-3xl md:text-4xl font-pixel text-slate-900 leading-tight">
                                    {championName}
                                </h2>
                                <div className="font-code text-xl md:text-2xl text-slate-600">
                                    Strategy: <span className="text-primary-dark font-bold">{champion?.entry?.strategyName ?? "Unknown"}</span>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-1">
                                    <div className="bg-white border-2 border-primary-dark px-4 py-1.5" style={{ boxShadow: "2px 2px 0px 0px rgba(22,162,73,0.2)" }}>
                                        <span className="font-code text-base text-slate-500">Prize</span>
                                        <span className="font-pixel text-sm ml-2 text-primary-dark">{tournament.prizePool} MON</span>
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
                    <div className="flex items-center justify-between gap-4">
                        <h3 className="text-xl font-pixel text-slate-900 border-l-8 border-primary-dark pl-4">Knockout Stage</h3>
                        <TournamentSpectator matches={tournament.matches} agents={tournament.agents} />
                    </div>
                    <div className="overflow-x-auto pb-6 w-full">
                        <MatchBracket matches={tournament.matches} agents={tournament.agents} />
                    </div>
                </section>
            )}

            {/* Match Replays */}
            {isCompleted && tournament.matches.length > 0 && (
                <section className="flex flex-col gap-6 mb-10 w-full">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-pixel text-slate-900 border-l-8 border-primary-dark pl-4">Match Replays</h3>
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
                                <Link
                                    key={`pitch-${i}`}
                                    href={`/tournaments/${tId}/match/${i}`}
                                    className="relative bg-white border-2 border-slate-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] hover:border-primary transition-all overflow-hidden group"
                                >
                                    {/* Top accent bar slides in on hover */}
                                    <div className="h-[4px] w-full bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />

                                    <div className="p-2">
                                        {/* Mini Pitch with Winner Overlay */}
                                        <div
                                            className="bg-[#22c55e] aspect-[3/4] border-2 border-primary-deep relative overflow-hidden flex flex-col shadow-inner"
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
                                                <span className="font-pixel text-[10px] text-white bg-black/60 px-2 py-1 border border-white/20 uppercase tracking-tighter">{winnerName}</span>
                                            </div>
                                            {/* Score Overlay */}
                                            <div className="absolute top-2 right-2 bg-black/80 text-white font-pixel text-[10px] px-2 py-1 border border-white/20">
                                                {match.goalsA} - {match.goalsB}
                                            </div>
                                            {/* Play button overlay — appears on hover */}
                                            <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                                <div className="bg-primary text-dark-green font-pixel text-[9px] px-4 py-2 flex items-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)]">
                                                    ▶ REPLAY
                                                </div>
                                            </div>
                                        </div>

                                        {/* Text + CTA footer */}
                                        <div className="mt-3 px-1">
                                            <h4 className="font-pixel text-xs text-slate-800 truncate">{title}</h4>
                                            <p className="font-code text-sm text-slate-500 mt-1 truncate">{subtitle}</p>
                                            <div className="mt-2 pt-2 border-t-2 border-dashed border-slate-100 flex items-center justify-between">
                                                <span className="font-pixel text-[8px] text-slate-400 group-hover:text-primary transition-colors">▶ WATCH REPLAY</span>
                                                <span className="material-symbols-outlined text-base text-slate-300 group-hover:text-primary transition-colors">play_circle</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Roster & Strategies */}
            <section className="flex flex-col gap-6">
                <h3 className="text-xl font-pixel text-slate-900 border-l-8 border-primary-dark pl-4">Top Managers</h3>
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
                                                    <span className="px-2 py-0.5 bg-green-50 text-primary-dark text-[10px] font-bold rounded uppercase font-code border border-green-200">
                                                        {entry.strategyName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="text-slate-500 font-code text-sm">No strategy committed.</p>
                                            )}
                                        </div>
                                        {/* Example status badge */}
                                        {tournament.champion === profile.address && (
                                            <div className="bg-green-50 text-primary-dark px-2 py-0.5 rounded font-code text-xs font-bold border border-green-200">
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
                                        <div className="mt-auto">
                                            <SquadTable players={entry.team} />
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
