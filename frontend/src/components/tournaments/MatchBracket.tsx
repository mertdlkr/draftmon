import type { MatchResult, TournamentAgent } from "@/lib/contracts";

interface Props {
    matches: MatchResult[];
    agents: TournamentAgent[];
}

// Fixed layout constants (px)
const W = 1000;       // container width
const H = 440;        // container height
const LABEL_H = 32;   // top label row height
const BRACKET_H = H - LABEL_H;

const COL = {
    qfL:   { x: 8,   w: 158 },
    sfL:   { x: 210, w: 158 },
    final: { x: 400, w: 200 },
    sfR:   { x: 642, w: 158 },
    qfR:   { x: 834, w: 158 },
};

// Card heights (estimated, keep in sync with card JSX)
const CARD_H  = 84;
const FINAL_H = 92;

// Vertical centers within bracket area
const C = {
    qf1:   BRACKET_H * 0.25,   // 102.5 → ~103
    qf2:   BRACKET_H * 0.75,   // 307.5 → ~308
    sf:    BRACKET_H * 0.50,   // 205
    final: BRACKET_H * 0.50,
};

// Card tops = center - halfHeight, offset by LABEL_H
const TOP = {
    qf1:   Math.round(LABEL_H + C.qf1   - CARD_H  / 2),
    qf2:   Math.round(LABEL_H + C.qf2   - CARD_H  / 2),
    sf:    Math.round(LABEL_H + C.sf    - CARD_H  / 2),
    final: Math.round(LABEL_H + C.final - FINAL_H / 2),
};

// SVG connector y (absolute to container)
const SY = {
    qf1:   Math.round(LABEL_H + C.qf1),
    qf2:   Math.round(LABEL_H + C.qf2),
    mid:   Math.round(LABEL_H + C.sf),
};

// SVG connector x
const SX = {
    qfLr:  COL.qfL.x + COL.qfL.w,                       // QF-Left right edge
    jL:    COL.sfL.x - 20,                                // left junction x
    sfLl:  COL.sfL.x,                                     // SF-Left left edge
    sfLr:  COL.sfL.x + COL.sfL.w,                        // SF-Left right edge
    finL:  COL.final.x,                                   // Final left edge
    finR:  COL.final.x + COL.final.w,                    // Final right edge
    sfRl:  COL.sfR.x,                                     // SF-Right left edge
    sfRr:  COL.sfR.x + COL.sfR.w,                        // SF-Right right edge
    jR:    COL.qfR.x - 20,                                // right junction x
    qfRl:  COL.qfR.x,                                     // QF-Right left edge
};

const CONNECTOR = "var(--color-primary-dark)";
const CONNECTOR_W = 2;

function MatchCard({
    label, nameA, nameB, goalsA, goalsB, aWon, isFinal, isSemi,
}: {
    label: string; nameA: string; nameB: string;
    goalsA: number; goalsB: number; aWon: boolean;
    isFinal?: boolean; isSemi?: boolean;
}) {
    const borderStyle = isFinal
        ? { border: "3px solid #eab308", boxShadow: "0 0 12px rgba(234,179,8,0.2), 4px 4px 0px 0px rgba(0,0,0,0.15)" }
        : isSemi
        ? { border: "2px solid var(--color-primary-dark)", boxShadow: "3px 3px 0px 0px rgba(22,162,73,0.3)" }
        : { border: "2px solid var(--color-dark-green)", boxShadow: "3px 3px 0px 0px rgba(0,0,0,0.12)" };

    const headerBg = isFinal ? "#eab308" : isSemi ? "var(--color-dark-green)" : "#1e293b";
    const headerText = isFinal ? "#1e293b" : "var(--color-primary)";

    return (
        <div className="bg-white" style={borderStyle}>
            {/* Header */}
            <div className="flex justify-between items-center px-2 py-1" style={{ background: headerBg }}>
                <span className="font-pixel text-[8px] tracking-widest" style={{ color: headerText }}>{label}</span>
                <span className="font-pixel text-[8px] opacity-70" style={{ color: headerText }}>FT</span>
            </div>
            {/* Team A */}
            <div className={`flex items-center justify-between px-2 py-1.5 border-b border-slate-100 ${aWon ? "bg-green-50" : "opacity-40"}`}>
                <div className="flex items-center gap-1 min-w-0">
                    {isFinal && aWon && <span className="text-yellow-500 text-[10px] shrink-0">★</span>}
                    <span className="font-pixel text-[8px] truncate" style={{ maxWidth: isFinal ? 130 : 110 }} title={nameA}>
                        {nameA}
                    </span>
                </div>
                <span className={`font-pixel text-[9px] ml-1 shrink-0 ${aWon ? "bg-primary-dark text-white px-1 py-0.5" : "text-slate-400"}`}>
                    {goalsA}
                </span>
            </div>
            {/* Team B */}
            <div className={`flex items-center justify-between px-2 py-1.5 ${!aWon ? "bg-green-50" : "opacity-40"}`}>
                <div className="flex items-center gap-1 min-w-0">
                    {isFinal && !aWon && <span className="text-yellow-500 text-[10px] shrink-0">★</span>}
                    <span className="font-pixel text-[8px] truncate" style={{ maxWidth: isFinal ? 130 : 110 }} title={nameB}>
                        {nameB}
                    </span>
                </div>
                <span className={`font-pixel text-[9px] ml-1 shrink-0 ${!aWon ? "bg-primary-dark text-white px-1 py-0.5" : "text-slate-400"}`}>
                    {goalsB}
                </span>
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
    const getName = (addr: string) => nameMap[addr.toLowerCase()] ?? addr.slice(0, 8);

    // Fallback: flat list
    if (qf.length < 4 || sf.length < 2 || final.length < 1) {
        return (
            <div className="flex flex-wrap gap-4">
                {matches.map((m, i) => {
                    const aWon = m.winner.toLowerCase() === m.teamA.toLowerCase();
                    return (
                        <MatchCard key={i} label={`${m.round} ${i + 1}`}
                            nameA={getName(m.teamA)} nameB={getName(m.teamB)}
                            goalsA={m.goalsA} goalsB={m.goalsB} aWon={aWon} />
                    );
                })}
            </div>
        );
    }

    const [qf0, qf1, qf2, qf3] = qf;
    const sfLeft = sf[0], sfRight = sf[1], finalMatch = final[0];

    const cards = [
        { m: qf0, col: COL.qfL, top: TOP.qf1, label: "QF 1" },
        { m: qf1, col: COL.qfL, top: TOP.qf2, label: "QF 2" },
        { m: qf2, col: COL.qfR, top: TOP.qf1, label: "QF 3" },
        { m: qf3, col: COL.qfR, top: TOP.qf2, label: "QF 4" },
        { m: sfLeft,  col: COL.sfL,   top: TOP.sf,    label: "SF 1", isSemi: true },
        { m: sfRight, col: COL.sfR,   top: TOP.sf,    label: "SF 2", isSemi: true },
        { m: finalMatch, col: COL.final, top: TOP.final, label: "GRAND FINAL", isFinal: true },
    ];

    return (
        <div
            className="relative border-2 border-black"
            style={{
                width: W,
                height: H,
                background: "#fff",
                backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0,0,0,0.025) 10px, rgba(0,0,0,0.025) 12px)",
                boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.12)",
            }}
        >
            {/* Column labels */}
            {[
                { label: "QUARTER-FINALS", x: COL.qfL.x + COL.qfL.w / 2 },
                { label: "SEMI-FINALS",    x: COL.sfL.x + COL.sfL.w / 2 },
                { label: "FINAL",          x: COL.final.x + COL.final.w / 2 },
                { label: "SEMI-FINALS",    x: COL.sfR.x + COL.sfR.w / 2 },
                { label: "QUARTER-FINALS", x: COL.qfR.x + COL.qfR.w / 2 },
            ].map(({ label, x }) => (
                <div
                    key={label + x}
                    className="absolute font-pixel text-[7px] text-slate-400 tracking-widest -translate-x-1/2"
                    style={{ top: 10, left: x }}
                >
                    {label}
                </div>
            ))}

            {/* SVG connector lines */}
            <svg
                className="absolute inset-0 pointer-events-none"
                width={W} height={H}
                style={{ overflow: "visible" }}
            >
                <g stroke={CONNECTOR} strokeWidth={CONNECTOR_W} fill="none" strokeLinecap="square">
                    {/* Left bracket: QF1 + QF2 → vertical → SF */}
                    <line x1={SX.qfLr} y1={SY.qf1} x2={SX.jL} y2={SY.qf1} />
                    <line x1={SX.qfLr} y1={SY.qf2} x2={SX.jL} y2={SY.qf2} />
                    <line x1={SX.jL}   y1={SY.qf1} x2={SX.jL} y2={SY.qf2} />
                    <line x1={SX.jL}   y1={SY.mid} x2={SX.sfLl} y2={SY.mid} />
                    {/* SF Left → Final */}
                    <line x1={SX.sfLr} y1={SY.mid} x2={SX.finL} y2={SY.mid} />
                    {/* Final → SF Right */}
                    <line x1={SX.finR} y1={SY.mid} x2={SX.sfRl} y2={SY.mid} />
                    {/* Right bracket: SF → vertical → QF3 + QF4 */}
                    <line x1={SX.sfRr} y1={SY.mid} x2={SX.jR}   y2={SY.mid} />
                    <line x1={SX.jR}   y1={SY.qf1} x2={SX.jR}   y2={SY.qf2} />
                    <line x1={SX.jR}   y1={SY.qf1} x2={SX.qfRl} y2={SY.qf1} />
                    <line x1={SX.jR}   y1={SY.qf2} x2={SX.qfRl} y2={SY.qf2} />
                </g>
                {/* Junction dots */}
                {[
                    [SX.jL, SY.qf1], [SX.jL, SY.qf2],
                    [SX.jR, SY.qf1], [SX.jR, SY.qf2],
                ].map(([x, y], i) => (
                    <rect key={i} x={x - 3} y={y - 3} width={6} height={6} fill={CONNECTOR} stroke="none" />
                ))}
            </svg>

            {/* Cards */}
            {cards.map(({ m, col, top, label, isFinal, isSemi }) => {
                const aWon = m.winner.toLowerCase() === m.teamA.toLowerCase();
                return (
                    <div
                        key={label}
                        className="absolute"
                        style={{ left: col.x, top, width: col.w }}
                    >
                        <MatchCard
                            label={label}
                            nameA={getName(m.teamA)}
                            nameB={getName(m.teamB)}
                            goalsA={m.goalsA}
                            goalsB={m.goalsB}
                            aWon={aWon}
                            isFinal={isFinal}
                            isSemi={isSemi}
                        />
                    </div>
                );
            })}

            {/* Trophy above Final */}
            <div
                className="absolute -translate-x-1/2 font-pixel text-[8px] text-yellow-500 tracking-widest"
                style={{ left: COL.final.x + COL.final.w / 2, top: TOP.final - 22 }}
            >
                ★ CHAMPION ★
            </div>
        </div>
    );
}
