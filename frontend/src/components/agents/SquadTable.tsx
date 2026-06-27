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
    GK: "var(--color-amber)",
    CB: "var(--color-pitch)",
    LB: "var(--color-pitch)",
    RB: "var(--color-pitch)",
    CDM: "#4FC3F7",
    CM: "#4FC3F7",
    CAM: "#4FC3F7",
    LW: "var(--color-monad)",
    RW: "var(--color-monad)",
    ST: "#FF5252",
};

function statColor(val: number): string {
    if (val >= 90) return "var(--color-pitch)";
    if (val >= 70) return "var(--color-monad)";
    if (val >= 50) return "var(--color-amber)";
    return "var(--color-muted)";
}

export function SquadTable({ players }: Props) {
    const sorted = [...players]
        .filter((p) => p.name && p.name !== "")
        .sort((a, b) => (POS_ORDER[a.position] ?? 99) - (POS_ORDER[b.position] ?? 99));

    if (sorted.length === 0) return null;

    return (
        <div style={{ overflowX: "auto" }}>
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.78rem",
                    fontFamily: "var(--font-mono)",
                }}
            >
                <thead>
                    <tr
                        style={{
                            borderBottom: "1px solid var(--color-border)",
                            color: "var(--color-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            fontSize: "0.68rem",
                        }}
                    >
                        <th style={{ padding: "0.4rem 0.6rem", textAlign: "left" }}>Pos</th>
                        <th style={{ padding: "0.4rem 0.6rem", textAlign: "left" }}>Player</th>
                        <th style={{ padding: "0.4rem 0.6rem", textAlign: "right" }}>PAC</th>
                        <th style={{ padding: "0.4rem 0.6rem", textAlign: "right" }}>SHO</th>
                        <th style={{ padding: "0.4rem 0.6rem", textAlign: "right" }}>PAS</th>
                        <th style={{ padding: "0.4rem 0.6rem", textAlign: "right" }}>TAC</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((p, i) => (
                        <tr
                            key={`${p.name}-${i}`}
                            style={{
                                borderBottom: "1px solid var(--color-border)",
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-2)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            <td style={{ padding: "0.35rem 0.6rem" }}>
                                <span
                                    style={{
                                        display: "inline-block",
                                        padding: "0.1rem 0.4rem",
                                        borderRadius: "4px",
                                        fontSize: "0.68rem",
                                        fontWeight: 700,
                                        color: POS_COLOR[p.position] ?? "var(--color-muted)",
                                        background: `${POS_COLOR[p.position] ?? "var(--color-muted)"}15`,
                                        border: `1px solid ${POS_COLOR[p.position] ?? "var(--color-muted)"}30`,
                                    }}
                                >
                                    {p.position}
                                </span>
                            </td>
                            <td
                                style={{
                                    padding: "0.35rem 0.6rem",
                                    fontWeight: 600,
                                    color: "var(--color-text)",
                                    fontFamily: "var(--font-display)",
                                    fontSize: "0.82rem",
                                }}
                            >
                                {p.name}
                            </td>
                            <td style={{ padding: "0.35rem 0.6rem", textAlign: "right", color: statColor(p.pace), fontWeight: 600 }}>
                                {p.pace}
                            </td>
                            <td style={{ padding: "0.35rem 0.6rem", textAlign: "right", color: statColor(p.shooting), fontWeight: 600 }}>
                                {p.shooting}
                            </td>
                            <td style={{ padding: "0.35rem 0.6rem", textAlign: "right", color: statColor(p.passing), fontWeight: 600 }}>
                                {p.passing}
                            </td>
                            <td style={{ padding: "0.35rem 0.6rem", textAlign: "right", color: statColor(p.tackling), fontWeight: 600 }}>
                                {p.tackling}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
