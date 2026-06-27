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
    CB: "#16a34a", LB: "#16a34a", RB: "#16a34a",
    CDM: "#3b82f6", CM: "#3b82f6", CAM: "#3b82f6",
    LW: "#8b5cf6", RW: "#8b5cf6",
    ST: "#ef4444",
};

function statColor(val: number): string {
    if (val >= 90) return "#16a34a";
    if (val >= 70) return "#3b82f6";
    if (val >= 50) return "#f59e0b";
    return "#94a3b8";
}

export function SquadTable({ players }: Props) {
    const sorted = [...players]
        .filter((p) => p.name && p.name !== "")
        .sort((a, b) => (POS_ORDER[a.position] ?? 99) - (POS_ORDER[b.position] ?? 99));

    if (sorted.length === 0) return null;

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-xs">
                        <th className="py-2 px-3 text-left">Pos</th>
                        <th className="py-2 px-3 text-left">Player</th>
                        <th className="py-2 px-3 text-right">PAC</th>
                        <th className="py-2 px-3 text-right">SHO</th>
                        <th className="py-2 px-3 text-right">PAS</th>
                        <th className="py-2 px-3 text-right">TAC</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((p, i) => (
                        <tr
                            key={`${p.name}-${i}`}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                            <td className="py-1.5 px-3">
                                <span
                                    className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                                    style={{
                                        color: POS_COLOR[p.position] ?? "#94a3b8",
                                        background: `${POS_COLOR[p.position] ?? "#94a3b8"}15`,
                                        border: `1px solid ${POS_COLOR[p.position] ?? "#94a3b8"}30`,
                                    }}
                                >
                                    {p.position}
                                </span>
                            </td>
                            <td className="py-1.5 px-3 font-semibold text-slate-900">
                                {p.name}
                            </td>
                            <td className="py-1.5 px-3 text-right font-semibold" style={{ color: statColor(p.pace) }}>
                                {p.pace}
                            </td>
                            <td className="py-1.5 px-3 text-right font-semibold" style={{ color: statColor(p.shooting) }}>
                                {p.shooting}
                            </td>
                            <td className="py-1.5 px-3 text-right font-semibold" style={{ color: statColor(p.passing) }}>
                                {p.passing}
                            </td>
                            <td className="py-1.5 px-3 text-right font-semibold" style={{ color: statColor(p.tackling) }}>
                                {p.tackling}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
