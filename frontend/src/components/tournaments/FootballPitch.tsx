"use client";

import type { Player } from "@/lib/contracts";

// ─── Position Coordinates (% of pitch) ─────────────────────────────────────────
// Pitch is 600×400 SVG units. Team A attacks right, Team B attacks left.
// Y is inverted (0 = top, 400 = bottom).

type Pos = { x: number; y: number };

// Left side (Team A, attacking right)
const LEFT_POSITIONS: Record<string, Pos[]> = {
    GK: [{ x: 6, y: 50 }],
    CB: [{ x: 20, y: 35 }, { x: 20, y: 65 }, { x: 20, y: 50 }],
    LB: [{ x: 17, y: 85 }],
    RB: [{ x: 17, y: 15 }],
    CDM: [{ x: 30, y: 40 }, { x: 30, y: 60 }],
    CM: [{ x: 33, y: 35 }, { x: 33, y: 65 }, { x: 33, y: 50 }],
    CAM: [{ x: 38, y: 50 }, { x: 38, y: 35 }, { x: 38, y: 65 }],
    LW: [{ x: 42, y: 18 }],
    RW: [{ x: 42, y: 82 }],
    ST: [{ x: 44, y: 50 }, { x: 44, y: 38 }, { x: 44, y: 62 }],
};

// Right side (Team B, attacking left) — mirror of left
function mirrorPositions(): Record<string, Pos[]> {
    const mirrored: Record<string, Pos[]> = {};
    for (const [pos, coords] of Object.entries(LEFT_POSITIONS)) {
        // Mirror the position names for sides
        let mirroredPos = pos;
        if (pos === "LB") mirroredPos = "RB";
        else if (pos === "RB") mirroredPos = "LB";
        else if (pos === "LW") mirroredPos = "RW";
        else if (pos === "RW") mirroredPos = "LW";

        if (!mirrored[mirroredPos]) mirrored[mirroredPos] = [];
        mirrored[mirroredPos].push(
            ...coords.map((c) => ({ x: 100 - c.x, y: c.y }))
        );
    }
    return mirrored;
}

const RIGHT_POSITIONS = mirrorPositions();

/** Get pixel position for a player on their side of the pitch */
function getPlayerPos(
    player: Player,
    side: "left" | "right",
    positionCounters: Map<string, number>
): { x: number; y: number } {
    const positions = side === "left" ? LEFT_POSITIONS : RIGHT_POSITIONS;
    const pos = player.position || "CM";
    const slots = positions[pos] || positions["CM"];
    const idx = positionCounters.get(pos) ?? 0;
    positionCounters.set(pos, idx + 1);
    const slot = slots[idx % slots.length];
    return { x: (slot.x / 100) * 600, y: (slot.y / 100) * 400 };
}

// ─── Component ──────────────────────────────────────────────────────────────────

interface Props {
    teamA: Player[];
    teamB: Player[];
    teamAName: string;
    teamBName: string;
    scoreA?: number;
    scoreB?: number;
    powerScoreA?: number;
    powerScoreB?: number;
    strategyA?: string;
    strategyB?: string;
    winner?: "A" | "B" | null;
}

export function FootballPitch({
    teamA,
    teamB,
    teamAName,
    teamBName,
    scoreA,
    scoreB,
    powerScoreA,
    powerScoreB,
    strategyA,
    strategyB,
    winner,
}: Props) {
    const validA = teamA.filter((p) => p.name);
    const validB = teamB.filter((p) => p.name);
    const countersA = new Map<string, number>();
    const countersB = new Map<string, number>();

    return (
        <div style={{ width: "100%", borderRadius: "12px", overflow: "hidden", border: "2px solid #e2e8f0" }}>
            {/* Score Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "1.5rem",
                    padding: "0.6rem 1rem",
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    fontFamily: "var(--font-display)",
                }}
            >
                <span style={{ fontWeight: winner === "A" ? 800 : 500, color: winner === "A" ? "#16a34a" : "#0f172a", fontSize: "0.95rem" }}>
                    {winner === "A" && "👑 "}{teamAName}
                </span>
                {scoreA != null && scoreB != null && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem" }}>
                        <span
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                color: "#0f172a",
                                padding: "0.15rem 0.75rem",
                                background: "#e2e8f0",
                                borderRadius: "6px",
                            }}
                        >
                            {scoreA} – {scoreB}
                        </span>
                        {powerScoreA != null && powerScoreB != null && (
                            <span style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.65rem",
                                color: "#64748b",
                                letterSpacing: "0.03em",
                            }}>
                                ⚡ {powerScoreA} – {powerScoreB}
                            </span>
                        )}
                    </div>
                )}
                <span style={{ fontWeight: winner === "B" ? 800 : 500, color: winner === "B" ? "#16a34a" : "#0f172a", fontSize: "0.95rem" }}>
                    {teamBName}{winner === "B" && " 👑"}
                </span>
            </div>

            {/* Strategy labels above pitch */}
            {(strategyA || strategyB) && (
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.4rem 1rem",
                    background: "rgba(0,0,0,0.25)",
                }}>
                    {strategyA ? (
                        <span style={{
                            fontSize: "0.7rem",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 600,
                            color: "#3b82f6",
                            background: "rgba(59,130,246,0.12)",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "4px",
                            letterSpacing: "0.04em",
                        }}>
                            🎯 {strategyA}
                        </span>
                    ) : <span />}
                    {strategyB ? (
                        <span style={{
                            fontSize: "0.7rem",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 600,
                            color: "#ef4444",
                            background: "rgba(239,68,68,0.12)",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "4px",
                            letterSpacing: "0.04em",
                        }}>
                            🎯 {strategyB}
                        </span>
                    ) : <span />}
                </div>
            )}

            {/* Pitch SVG */}
            <svg
                viewBox="0 0 600 400"
                style={{ width: "100%", height: "auto", display: "block" }}
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    {/* Grass stripe pattern */}
                    <pattern id="grass" patternUnits="userSpaceOnUse" width="50" height="400">
                        <rect width="25" height="400" fill="#2d8a4e" />
                        <rect x="25" width="25" height="400" fill="#2a7d47" />
                    </pattern>
                    {/* Glow filter for players */}
                    <filter id="playerGlow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Grass background */}
                <rect width="600" height="400" fill="url(#grass)" />

                {/* Pitch markings — white lines */}
                <g stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" fill="none">
                    {/* Outer boundary */}
                    <rect x="10" y="10" width="580" height="380" rx="2" />
                    {/* Center line */}
                    <line x1="300" y1="10" x2="300" y2="390" />
                    {/* Center circle */}
                    <circle cx="300" cy="200" r="45" />
                    {/* Center dot */}
                    <circle cx="300" cy="200" r="3" fill="rgba(255,255,255,0.55)" />

                    {/* Left penalty box */}
                    <rect x="10" y="110" width="85" height="180" />
                    {/* Left goal box */}
                    <rect x="10" y="155" width="35" height="90" />
                    {/* Left penalty arc */}
                    <path d="M 95 155 A 30 30 0 0 1 95 245" />
                    {/* Left penalty spot */}
                    <circle cx="70" cy="200" r="2" fill="rgba(255,255,255,0.55)" />

                    {/* Right penalty box */}
                    <rect x="505" y="110" width="85" height="180" />
                    {/* Right goal box */}
                    <rect x="555" y="155" width="35" height="90" />
                    {/* Right penalty arc */}
                    <path d="M 505 155 A 30 30 0 0 0 505 245" />
                    {/* Right penalty spot */}
                    <circle cx="530" cy="200" r="2" fill="rgba(255,255,255,0.55)" />

                    {/* Corner arcs */}
                    <path d="M 10 20 A 10 10 0 0 1 20 10" />
                    <path d="M 580 10 A 10 10 0 0 1 590 20" />
                    <path d="M 590 380 A 10 10 0 0 1 580 390" />
                    <path d="M 20 390 A 10 10 0 0 1 10 380" />

                    {/* Goals */}
                    <rect x="2" y="170" width="8" height="60" strokeWidth="2" stroke="rgba(255,255,255,0.7)" />
                    <rect x="590" y="170" width="8" height="60" strokeWidth="2" stroke="rgba(255,255,255,0.7)" />
                </g>

                {/* Team A players (left side, blue jerseys) */}
                {validA.map((player, i) => {
                    const { x, y } = getPlayerPos(player, "left", countersA);
                    return (
                        <g key={`a-${i}`}>
                            {/* Shadow */}
                            <ellipse cx={x} cy={y + 12} rx="8" ry="3" fill="rgba(0,0,0,0.3)" />
                            {/* Jersey circle */}
                            <circle cx={x} cy={y} r="10" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" filter="url(#playerGlow)" />
                            {/* Position badge */}
                            <text
                                x={x}
                                y={y + 3.5}
                                textAnchor="middle"
                                fill="white"
                                fontSize="7"
                                fontWeight="700"
                                fontFamily="monospace"
                            >
                                {player.position}
                            </text>
                            {/* Player name */}
                            <text
                                x={x}
                                y={y + 22}
                                textAnchor="middle"
                                fill="white"
                                fontSize="6.5"
                                fontWeight="600"
                                fontFamily="sans-serif"
                                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" } as React.CSSProperties}
                            >
                                {player.name.length > 8 ? player.name.slice(0, 7) + "." : player.name}
                            </text>
                        </g>
                    );
                })}

                {/* Team B players (right side, red jerseys) */}
                {validB.map((player, i) => {
                    const { x, y } = getPlayerPos(player, "right", countersB);
                    return (
                        <g key={`b-${i}`}>
                            {/* Shadow */}
                            <ellipse cx={x} cy={y + 12} rx="8" ry="3" fill="rgba(0,0,0,0.3)" />
                            {/* Jersey circle */}
                            <circle cx={x} cy={y} r="10" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" filter="url(#playerGlow)" />
                            {/* Position badge */}
                            <text
                                x={x}
                                y={y + 3.5}
                                textAnchor="middle"
                                fill="white"
                                fontSize="7"
                                fontWeight="700"
                                fontFamily="monospace"
                            >
                                {player.position}
                            </text>
                            {/* Player name */}
                            <text
                                x={x}
                                y={y + 22}
                                textAnchor="middle"
                                fill="white"
                                fontSize="6.5"
                                fontWeight="600"
                                fontFamily="sans-serif"
                                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" } as React.CSSProperties}
                            >
                                {player.name.length > 8 ? player.name.slice(0, 7) + "." : player.name}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
