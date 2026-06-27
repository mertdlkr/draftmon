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
    const nameMap = Object.fromEntries(agents.map(a => [a.profile.address.toLowerCase(), a.profile.name]));

    const grouped = {
        "Quarter Final": matches.filter(m => m.round === "Quarter Final"),
        "Semi Final": matches.filter(m => m.round === "Semi Final"),
        "Final": matches.filter(m => m.round === "Final"),
    };

    return (
        <div className="flex flex-col gap-6">
            {ROUNDS.map(({ key, label }) => {
                const roundMatches = grouped[key as keyof typeof grouped];
                if (!roundMatches.length) return null;

                return (
                    <div key={key}>
                        <div className="font-pixel text-[10px] text-slate-500 uppercase tracking-widest mb-3">
                            {label}
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {roundMatches.map((m, i) => {
                                const nameA = nameMap[m.teamA.toLowerCase()] ?? m.teamA.slice(0, 8);
                                const nameB = nameMap[m.teamB.toLowerCase()] ?? m.teamB.slice(0, 8);
                                const aWon = m.winner.toLowerCase() === m.teamA.toLowerCase();

                                return (
                                    <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 min-w-[240px] flex-1">
                                        {/* Team A */}
                                        <div className="flex justify-between items-center py-1">
                                            <span className={`text-sm ${aWon ? "font-bold text-slate-900" : "text-slate-400"}`}>
                                                {aWon && <span className="text-[#16a34a] mr-1">
                                                    <span className="material-symbols-outlined text-base align-middle">military_tech</span>
                                                </span>}{nameA}
                                            </span>
                                            <span className={`font-mono text-base ${aWon ? "font-bold text-[#16a34a]" : "text-slate-400"}`}>
                                                {m.goalsA}
                                            </span>
                                        </div>

                                        <div className="border-t border-slate-100 my-1" />

                                        {/* Team B */}
                                        <div className="flex justify-between items-center py-1">
                                            <span className={`text-sm ${!aWon ? "font-bold text-slate-900" : "text-slate-400"}`}>
                                                {!aWon && <span className="text-[#16a34a] mr-1">
                                                    <span className="material-symbols-outlined text-base align-middle">military_tech</span>
                                                </span>}{nameB}
                                            </span>
                                            <span className={`font-mono text-base ${!aWon ? "font-bold text-[#16a34a]" : "text-slate-400"}`}>
                                                {m.goalsB}
                                            </span>
                                        </div>

                                        {/* Power Score */}
                                        <div className="text-center mt-2 py-1 px-2 bg-slate-50 rounded text-xs font-mono text-slate-400 tracking-wide">
                                            Power: {m.scoreA} - {m.scoreB}
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
