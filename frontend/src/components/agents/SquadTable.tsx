"use client";

import type { Player } from "@/lib/contracts";

interface Props {
    players: Player[];
}

const POS_ORDER: Record<string, number> = {
    GK: 0, CB: 1, LB: 2, RB: 3,
    CDM: 4, CM: 5, CAM: 6,
    LW: 7, RW: 8, ST: 9,
};

const POS_COLOR: Record<string, string> = {
    GK: "#f59e0b",
    CB: "#13ec5b", LB: "#13ec5b", RB: "#13ec5b",
    CDM: "#3b82f6", CM: "#3b82f6", CAM: "#3b82f6",
    LW: "#8b5cf6", RW: "#8b5cf6",
    ST: "#ef4444",
};

const POS_GROUP: Record<string, string> = {
    GK: "GK",
    CB: "DEF", LB: "DEF", RB: "DEF",
    CDM: "MID", CM: "MID", CAM: "MID",
    LW: "ATT", RW: "ATT", ST: "ATT",
};

const GROUP_LABEL: Record<string, string> = {
    GK: "Goalkeeper",
    DEF: "Defenders",
    MID: "Midfielders",
    ATT: "Attackers",
};

const GROUP_COLOR: Record<string, string> = {
    GK: "#f59e0b",
    DEF: "#13ec5b",
    MID: "#3b82f6",
    ATT: "#ef4444",
};

function statDots(val: number): number {
    if (val >= 85) return 5;
    if (val >= 70) return 4;
    if (val >= 55) return 3;
    if (val >= 40) return 2;
    return 1;
}

function statColor(val: number): string {
    if (val >= 85) return "#13ec5b";
    if (val >= 70) return "#3b82f6";
    if (val >= 55) return "#f59e0b";
    return "#94a3b8";
}

function StatDots({ val }: { val: number }) {
    const filled = statDots(val);
    const color = statColor(val);
    return (
        <div className="flex items-center gap-[3px] justify-end">
            <span className="font-pixel text-[9px] mr-1.5" style={{ color }}>{val}</span>
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="w-[6px] h-[6px] border border-slate-400"
                    style={i < filled ? { background: color, borderColor: color } : { background: "transparent" }}
                />
            ))}
        </div>
    );
}

export function SquadTable({ players }: Props) {
    const sorted = [...players]
        .filter((p) => p.name && p.name !== "")
        .sort((a, b) => (POS_ORDER[a.position] ?? 99) - (POS_ORDER[b.position] ?? 99));

    if (sorted.length === 0) return null;

    // Group players by position category
    const groups: Record<string, Player[]> = {};
    for (const p of sorted) {
        const g = POS_GROUP[p.position] ?? "ATT";
        if (!groups[g]) groups[g] = [];
        groups[g].push(p);
    }
    const groupOrder = ["GK", "DEF", "MID", "ATT"];

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b-2 border-slate-900 text-slate-500 text-[9px] font-pixel uppercase tracking-wider">
                        <th className="py-2 px-2 text-left">POS</th>
                        <th className="py-2 px-2 text-left">PLAYER</th>
                        <th className="py-2 px-2 text-right">PAC</th>
                        <th className="py-2 px-2 text-right">SHO</th>
                        <th className="py-2 px-2 text-right">PAS</th>
                        <th className="py-2 px-2 text-right">TAC</th>
                    </tr>
                </thead>
                <tbody>
                    {groupOrder.map((group) => {
                        const groupPlayers = groups[group];
                        if (!groupPlayers || groupPlayers.length === 0) return null;
                        const color = GROUP_COLOR[group];
                        return (
                            <>
                                {/* Group header row */}
                                <tr key={`header-${group}`}>
                                    <td
                                        colSpan={6}
                                        className="pt-3 pb-1 px-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-3" style={{ background: color }} />
                                            <span className="font-pixel text-[8px] uppercase tracking-widest" style={{ color }}>
                                                {GROUP_LABEL[group]}
                                            </span>
                                            <div className="flex-1 border-t border-dashed" style={{ borderColor: `${color}40` }} />
                                        </div>
                                    </td>
                                </tr>
                                {/* Player rows */}
                                {groupPlayers.map((p, i) => (
                                    <tr
                                        key={`${p.name}-${i}`}
                                        className="group border-b border-slate-100 hover:border-[#13ec5b]/30 transition-colors cursor-default"
                                        style={{ background: "transparent" }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLTableRowElement).style.background = "rgba(19,236,91,0.05)";
                                            (e.currentTarget as HTMLTableRowElement).style.outline = "1px solid rgba(19,236,91,0.25)";
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                                            (e.currentTarget as HTMLTableRowElement).style.outline = "none";
                                        }}
                                    >
                                        <td className="py-1.5 px-2">
                                            <span
                                                className="inline-block px-1.5 py-0.5 text-[9px] font-pixel font-bold"
                                                style={{
                                                    color: POS_COLOR[p.position] ?? "#94a3b8",
                                                    background: `${POS_COLOR[p.position] ?? "#94a3b8"}18`,
                                                    border: `1px solid ${POS_COLOR[p.position] ?? "#94a3b8"}40`,
                                                }}
                                            >
                                                {p.position}
                                            </span>
                                        </td>
                                        <td className="py-1.5 px-2 font-code text-sm text-slate-900">
                                            {p.name}
                                        </td>
                                        <td className="py-1.5 px-2"><StatDots val={p.pace} /></td>
                                        <td className="py-1.5 px-2"><StatDots val={p.shooting} /></td>
                                        <td className="py-1.5 px-2"><StatDots val={p.passing} /></td>
                                        <td className="py-1.5 px-2"><StatDots val={p.tackling} /></td>
                                    </tr>
                                ))}
                            </>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
