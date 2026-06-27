"use client";

import { Fragment } from "react";
import type { Player } from "@/lib/contracts";
import {
    POS_ORDER, POS_COLOR, POS_GROUP,
    GROUP_LABEL, GROUP_COLOR, GROUP_ORDER,
    statDots, statColor,
} from "@/lib/constants/squad";

interface Props {
    players: Player[];
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
                    {GROUP_ORDER.map((group) => {
                        const groupPlayers = groups[group];
                        if (!groupPlayers || groupPlayers.length === 0) return null;
                        const color = GROUP_COLOR[group];
                        return (
                            <Fragment key={group}>
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
                                        className="group border-b border-slate-100 hover:border-primary/30 transition-colors cursor-default"
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
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
