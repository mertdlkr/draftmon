import type { MatchResult, TournamentAgent } from "@/lib/contracts";

interface Props {
    matches: MatchResult[];
    agents: TournamentAgent[];
}

function MatchCard({
    label,
    nameA,
    nameB,
    goalsA,
    goalsB,
    aWon,
    isFinal,
    isSemi,
}: {
    label: string;
    nameA: string;
    nameB: string;
    goalsA: number;
    goalsB: number;
    aWon: boolean;
    isFinal?: boolean;
    isSemi?: boolean;
}) {
    if (isFinal) {
        return (
            <div className="bg-white border-4 border-yellow-400 p-3 rounded-lg relative shadow-lg z-20">
                <div className="flex justify-between items-center border-b-2 border-slate-100 pb-2 mb-2">
                    <span className="font-code text-xs text-slate-500 font-bold">GRAND FINAL</span>
                    <span className="text-[10px] font-pixel text-[#16a249]">FT</span>
                </div>
                <div className="flex justify-between items-center mb-1 p-1 bg-green-50 rounded">
                    <div className="flex items-center gap-1">
                        {aWon && <span className="material-symbols-outlined text-yellow-500 text-xs">star</span>}
                        {!aWon && <span className="w-3"></span>}
                        <span className={`font-code text-sm ${aWon ? "font-bold text-slate-900" : "text-slate-500"}`}>{nameA}</span>
                    </div>
                    <span className={`font-pixel text-[10px] ${aWon ? "bg-[#16a249] text-white px-1.5 py-0.5 rounded" : "text-slate-400 px-1.5 py-0.5"}`}>{goalsA}</span>
                </div>
                <div className="flex justify-between items-center p-1">
                    <div className="flex items-center gap-1">
                        {!aWon && <span className="material-symbols-outlined text-yellow-500 text-xs">star</span>}
                        {aWon && <span className="w-3"></span>}
                        <span className={`font-code text-sm ${!aWon ? "font-bold text-slate-900" : "text-slate-500"}`}>{nameB}</span>
                    </div>
                    <span className={`font-pixel text-[10px] ${!aWon ? "bg-[#16a249] text-white px-1.5 py-0.5 rounded" : "text-slate-400 px-1.5 py-0.5"}`}>{goalsB}</span>
                </div>
                {/* Connector lines */}
                <div className="absolute -left-8 top-1/2 w-8 h-0.5 bg-[#16a249]"></div>
                <div className="absolute -right-8 top-1/2 w-8 h-0.5 bg-slate-300"></div>
            </div>
        );
    }

    const borderClass = isSemi
        ? "border-2 border-[#16a249] shadow-md z-10"
        : "border-2 border-slate-200 group hover:border-[#16a249] transition-colors";

    return (
        <div className={`bg-white p-2 rounded relative ${borderClass}`}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-1 mb-1">
                <span className="font-code text-xs text-slate-500">{label}</span>
                <span className="text-[10px] font-pixel text-green-600">FT</span>
            </div>
            <div className={`flex justify-between items-center mb-0.5 ${!aWon ? "opacity-60" : ""}`}>
                <span className={`font-code text-sm ${aWon ? "font-bold text-[#16a249]" : ""}`}>{nameA}</span>
                <span className="font-pixel text-[10px]">{goalsA}</span>
            </div>
            <div className={`flex justify-between items-center ${aWon ? "opacity-60" : ""}`}>
                <span className={`font-code text-sm ${!aWon ? "font-bold text-[#16a249]" : ""}`}>{nameB}</span>
                <span className="font-pixel text-[10px]">{goalsB}</span>
            </div>
        </div>
    );
}

export function MatchBracket({ matches, agents }: Props) {
    const nameMap = Object.fromEntries(
        agents.map((a) => [a.profile.address.toLowerCase(), a.profile.name])
    );

    const qf = matches.filter((m) => m.round === "Quarter Final");
    const sf = matches.filter((m) => m.round === "Semi Final");
    const final = matches.filter((m) => m.round === "Final");

    const getName = (addr: string) =>
        nameMap[addr.toLowerCase()] ?? addr.slice(0, 8);

    // If we don't have enough matches for a full bracket, fall back to a simpler layout
    if (qf.length < 4 || sf.length < 2 || final.length < 1) {
        // Simple fallback: just list all matches
        return (
            <div className="flex flex-wrap gap-4">
                {matches.map((m, i) => {
                    const aWon = m.winner.toLowerCase() === m.teamA.toLowerCase();
                    return (
                        <MatchCard
                            key={i}
                            label={`${m.round} ${i + 1}`}
                            nameA={getName(m.teamA)}
                            nameB={getName(m.teamB)}
                            goalsA={m.goalsA}
                            goalsB={m.goalsB}
                            aWon={aWon}
                        />
                    );
                })}
            </div>
        );
    }

    // Full bracket layout: QF Left | SF Left | Final | SF Right | QF Right
    const qfLeft = [qf[0], qf[1]];
    const qfRight = [qf[2], qf[3]];
    const sfLeft = sf[0];
    const sfRight = sf[1];
    const finalMatch = final[0];

    return (
        <div className="min-w-[900px] flex justify-between items-center gap-4 px-2">
            {/* Quarter Finals Left */}
            <div className="flex flex-col justify-around h-[400px] gap-8 w-48">
                {qfLeft.map((m, i) => {
                    const aWon = m.winner.toLowerCase() === m.teamA.toLowerCase();
                    return (
                        <div key={i} className="relative">
                            <MatchCard
                                label={`QF ${i + 1}`}
                                nameA={getName(m.teamA)}
                                nameB={getName(m.teamB)}
                                goalsA={m.goalsA}
                                goalsB={m.goalsB}
                                aWon={aWon}
                            />
                            {/* Horizontal connector to the right */}
                            <div className="absolute -right-8 top-1/2 w-8 h-0.5 bg-[#16a249]"></div>
                            {/* Vertical connector */}
                            {i === 0 && (
                                <div className="absolute -right-8 top-1/2 h-[100px] w-0.5 bg-[#16a249]"></div>
                            )}
                            {i === 1 && (
                                <div className="absolute -right-8 bottom-1/2 h-[100px] w-0.5 bg-slate-300"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Semi Finals Left */}
            <div className="flex flex-col justify-around h-[400px] gap-8 w-48 relative">
                {(() => {
                    const aWon = sfLeft.winner.toLowerCase() === sfLeft.teamA.toLowerCase();
                    return (
                        <>
                            <MatchCard
                                label="SF 1"
                                nameA={getName(sfLeft.teamA)}
                                nameB={getName(sfLeft.teamB)}
                                goalsA={sfLeft.goalsA}
                                goalsB={sfLeft.goalsB}
                                aWon={aWon}
                                isSemi
                            />
                            {/* Connector from QF */}
                            <div className="absolute -left-[40px] top-1/2 w-10 h-0.5 bg-[#16a249]"></div>
                            {/* Connector to Final */}
                            <div className="absolute -right-12 top-1/2 w-12 h-0.5 bg-[#16a249]"></div>
                        </>
                    );
                })()}
            </div>

            {/* Final */}
            <div className="flex flex-col justify-center h-[400px] w-64 relative">
                {/* Trophy icon */}
                <div className="absolute top-[80px] left-1/2 -translate-x-1/2 text-[#16a249]">
                    <span className="material-symbols-outlined text-2xl animate-bounce">emoji_events</span>
                </div>
                {(() => {
                    const aWon = finalMatch.winner.toLowerCase() === finalMatch.teamA.toLowerCase();
                    return (
                        <MatchCard
                            label="GRAND FINAL"
                            nameA={getName(finalMatch.teamA)}
                            nameB={getName(finalMatch.teamB)}
                            goalsA={finalMatch.goalsA}
                            goalsB={finalMatch.goalsB}
                            aWon={aWon}
                            isFinal
                        />
                    );
                })()}
            </div>

            {/* Semi Finals Right */}
            <div className="flex flex-col justify-around h-[400px] gap-8 w-48 relative">
                {(() => {
                    const aWon = sfRight.winner.toLowerCase() === sfRight.teamA.toLowerCase();
                    return (
                        <>
                            <MatchCard
                                label="SF 2"
                                nameA={getName(sfRight.teamA)}
                                nameB={getName(sfRight.teamB)}
                                goalsA={sfRight.goalsA}
                                goalsB={sfRight.goalsB}
                                aWon={aWon}
                                isSemi
                            />
                            {/* Connector to Final */}
                            <div className="absolute -left-12 top-1/2 w-12 h-0.5 bg-slate-300"></div>
                            {/* Connector from QF */}
                            <div className="absolute -right-[40px] top-1/2 w-10 h-0.5 bg-slate-300"></div>
                        </>
                    );
                })()}
            </div>

            {/* Quarter Finals Right */}
            <div className="flex flex-col justify-around h-[400px] gap-8 w-48">
                {qfRight.map((m, i) => {
                    const aWon = m.winner.toLowerCase() === m.teamA.toLowerCase();
                    return (
                        <div key={i} className="relative">
                            <MatchCard
                                label={`QF ${i + 3}`}
                                nameA={getName(m.teamA)}
                                nameB={getName(m.teamB)}
                                goalsA={m.goalsA}
                                goalsB={m.goalsB}
                                aWon={aWon}
                            />
                            {/* Horizontal connector to the left */}
                            <div className="absolute -left-8 top-1/2 w-8 h-0.5 bg-slate-300"></div>
                            {/* Vertical connector */}
                            {i === 0 && (
                                <div className="absolute -left-8 top-1/2 h-[100px] w-0.5 bg-slate-300"></div>
                            )}
                            {i === 1 && (
                                <div className="absolute -left-8 bottom-1/2 h-[100px] w-0.5 bg-slate-300"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
