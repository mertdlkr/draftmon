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
        <div style={{ width: "100%", overflow: "hidden", border: "2px solid var(--color-dark-green)" }}>
            {/* Score Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1.5rem",
                    padding: "0.6rem 1rem",
                    background: "var(--color-dark-green)",
                    borderBottom: "1px solid var(--color-dark-green)",
                    fontFamily: "var(--font-display)",
                }}
            >
                <span style={{ fontWeight: winner === "A" ? 800 : 500, color: winner === "A" ? "#eab308" : "#ffffff", fontSize: "0.95rem" }}>
                    {winner === "A" && <span className="material-symbols-outlined text-[14px] align-middle mr-1 text-[#eab308]">emoji_events</span>}{teamAName}
                </span>
                {scoreA != null && scoreB != null && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem" }}>
                        <span
                            style={{
                                fontFamily: "var(--font-pixel)",
                                fontSize: "12px",
                                fontWeight: 300,
                                color: "#ffffff",
                                padding: "0.15rem 0.75rem",
                                background: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.2)"
                            }}
                        >
                            {scoreA} - {scoreB}
                        </span>
                        {powerScoreA != null && powerScoreB != null && (
                            <span style={{
                                fontFamily: "var(--font-pixel)",
                                fontSize: "0.55rem",
                                color: "#64748b",
                                letterSpacing: "0.05em",
                            }}>
                                PWR {powerScoreA} — {powerScoreB}
                            </span>
                        )}
                    </div>
                )}
                <span style={{ fontWeight: winner === "B" ? 800 : 500, color: winner === "B" ? "#eab308" : "#ffffff", fontSize: "0.95rem" }}>
                    {teamBName}{winner === "B" && <span className="material-symbols-outlined text-[14px] align-middle ml-1 text-[#eab308]">emoji_events</span>}
                </span>
            </div>

            {/* Strategy labels above pitch */}
            {(strategyA || strategyB) && (
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.35rem 1rem",
                    background: "var(--color-bg-dark)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}>
                    {strategyA ? (
                        <span style={{
                            fontSize: "0.55rem",
                            fontFamily: "var(--font-pixel)",
                            color: "#93c5fd",
                            background: "rgba(59,130,246,0.12)",
                            padding: "0.2rem 0.5rem",
                            border: "1px solid rgba(59,130,246,0.25)",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                        }}>
                            ▶ {strategyA}
                        </span>
                    ) : <span />}
                    {strategyB ? (
                        <span style={{
                            fontSize: "0.55rem",
                            fontFamily: "var(--font-pixel)",
                            color: "#fca5a5",
                            background: "rgba(239,68,68,0.12)",
                            padding: "0.2rem 0.5rem",
                            border: "1px solid rgba(239,68,68,0.25)",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                        }}>
                            ▶ {strategyB}
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
                    {/* Vibrant grass stripes — clear contrast between light/dark */}
                    <pattern id="grass" patternUnits="userSpaceOnUse" width="50" height="400">
                        <rect width="25" height="400" fill="#23a84e" />
                        <rect x="25" width="25" height="400" fill="#1b8a3e" />
                    </pattern>
                    {/* Goal net crosshatch */}
                    <pattern id="net" patternUnits="userSpaceOnUse" width="4" height="4">
                        <path d="M0 0 L4 4 M4 0 L0 4" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
                    </pattern>
                    {/* Scanlines — CRT effect */}
                    <pattern id="scanlines" patternUnits="userSpaceOnUse" width="600" height="4">
                        <rect y="2" width="600" height="2" fill="rgba(0,0,0,0.04)" />
                    </pattern>
                    {/* Subtle glow for player tokens */}
                    <filter id="playerGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Grass */}
                <rect width="600" height="400" fill="url(#grass)" />

                {/* Pitch markings */}
                <g stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none">
                    {/* Outer boundary — no rounded corners */}
                    <rect x="10" y="10" width="580" height="380" />
                    {/* Center line */}
                    <line x1="300" y1="10" x2="300" y2="390" />
                    {/* Center circle */}
                    <circle cx="300" cy="200" r="45" />
                    {/* Center dot */}
                    <circle cx="300" cy="200" r="3" fill="rgba(255,255,255,0.8)" />

                    {/* Left penalty box */}
                    <rect x="10" y="110" width="85" height="180" />
                    {/* Left goal box */}
                    <rect x="10" y="155" width="35" height="90" />
                    {/* Left penalty arc */}
                    <path d="M 95 155 A 30 30 0 0 1 95 245" />
                    {/* Left penalty spot */}
                    <circle cx="70" cy="200" r="2" fill="rgba(255,255,255,0.8)" />

                    {/* Right penalty box */}
                    <rect x="505" y="110" width="85" height="180" />
                    {/* Right goal box */}
                    <rect x="555" y="155" width="35" height="90" />
                    {/* Right penalty arc */}
                    <path d="M 505 155 A 30 30 0 0 0 505 245" />
                    {/* Right penalty spot */}
                    <circle cx="530" cy="200" r="2" fill="rgba(255,255,255,0.8)" />

                    {/* Corner arcs — sweep-flag=0 curves INTO the pitch */}
                    <path d="M 10 20 A 10 10 0 0 0 20 10" />
                    <path d="M 580 10 A 10 10 0 0 0 590 20" />
                    <path d="M 590 380 A 10 10 0 0 0 580 390" />
                    <path d="M 20 390 A 10 10 0 0 0 10 380" />
                </g>

                {/* Goals with net texture */}
                <rect x="2" y="170" width="9" height="60" fill="url(#net)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" />
                <rect x="589" y="170" width="9" height="60" fill="url(#net)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" />

                {/* Corner flags — planted inside pitch, pole extends into SVG margin, waving pennant */}

                {/* Top-left */}
                <g>
                    <ellipse cx="13" cy="18" rx="5" ry="2" fill="rgba(0,0,0,0.3)" />
                    <line x1="12" y1="17" x2="12" y2="4" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                    <line x1="10" y1="16" x2="10" y2="3" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
                    <circle cx="10" cy="16" r="2.5" fill="rgba(255,255,255,0.7)" />
                    <polygon points="10,3 19,8 10,13" fill="#ef4444">
                        <animateTransform attributeName="transform" type="rotate"
                            values="0 10 3; 8 10 3; 0 10 3; -5 10 3; 0 10 3"
                            dur="2.5s" repeatCount="indefinite" />
                    </polygon>
                </g>

                {/* Top-right */}
                <g>
                    <ellipse cx="587" cy="18" rx="5" ry="2" fill="rgba(0,0,0,0.3)" />
                    <line x1="588" y1="17" x2="588" y2="4" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                    <line x1="590" y1="16" x2="590" y2="3" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
                    <circle cx="590" cy="16" r="2.5" fill="rgba(255,255,255,0.7)" />
                    <polygon points="590,3 581,8 590,13" fill="#ef4444">
                        <animateTransform attributeName="transform" type="rotate"
                            values="0 590 3; 8 590 3; 0 590 3; -5 590 3; 0 590 3"
                            dur="2.5s" begin="0.6s" repeatCount="indefinite" />
                    </polygon>
                </g>

                {/* Bottom-left */}
                <g>
                    <ellipse cx="13" cy="382" rx="5" ry="2" fill="rgba(0,0,0,0.3)" />
                    <line x1="12" y1="383" x2="12" y2="396" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                    <line x1="10" y1="384" x2="10" y2="397" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
                    <circle cx="10" cy="384" r="2.5" fill="rgba(255,255,255,0.7)" />
                    <polygon points="10,397 19,392 10,387" fill="#ef4444">
                        <animateTransform attributeName="transform" type="rotate"
                            values="0 10 397; 8 10 397; 0 10 397; -5 10 397; 0 10 397"
                            dur="2.5s" begin="1.2s" repeatCount="indefinite" />
                    </polygon>
                </g>

                {/* Bottom-right */}
                <g>
                    <ellipse cx="587" cy="382" rx="5" ry="2" fill="rgba(0,0,0,0.3)" />
                    <line x1="588" y1="383" x2="588" y2="396" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
                    <line x1="590" y1="384" x2="590" y2="397" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
                    <circle cx="590" cy="384" r="2.5" fill="rgba(255,255,255,0.7)" />
                    <polygon points="590,397 581,392 590,387" fill="#ef4444">
                        <animateTransform attributeName="transform" type="rotate"
                            values="0 590 397; 8 590 397; 0 590 397; -5 590 397; 0 590 397"
                            dur="2.5s" begin="1.8s" repeatCount="indefinite" />
                    </polygon>
                </g>

                {/* CRT scanlines overlay */}
                <rect width="600" height="400" fill="url(#scanlines)" style={{ pointerEvents: "none" }} />

                {/* Team A players — square pixel tokens, blue */}
                {validA.map((player, i) => {
                    const { x, y } = getPlayerPos(player, "left", countersA);
                    const name = player.name.length > 8 ? player.name.slice(0, 7) + "." : player.name;
                    return (
                        <g key={`a-${i}`}>
                            {/* Pixel drop shadow (offset 3/3) */}
                            <rect x={x - 12 + 3} y={y - 12 + 3} width="24" height="24" fill="rgba(0,0,0,0.35)" />
                            {/* Square jersey token */}
                            <rect x={x - 12} y={y - 12} width="24" height="24" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="2" filter="url(#playerGlow)" />
                            {/* Position abbreviation */}
                            <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="7.5" fontWeight="700" fontFamily="'Courier New', monospace">
                                {player.position}
                            </text>
                            {/* Name backdrop */}
                            <rect x={x - 22} y={y + 14} width="44" height="11" fill="rgba(0,0,0,0.7)" />
                            {/* Player name */}
                            <text x={x} y={y + 22} textAnchor="middle" fill="white" fontSize="6.5" fontWeight="600" fontFamily="'Courier New', monospace">
                                {name}
                            </text>
                        </g>
                    );
                })}

                {/* Team B players — square pixel tokens, red */}
                {validB.map((player, i) => {
                    const { x, y } = getPlayerPos(player, "right", countersB);
                    const name = player.name.length > 8 ? player.name.slice(0, 7) + "." : player.name;
                    return (
                        <g key={`b-${i}`}>
                            {/* Pixel drop shadow (offset 3/3) */}
                            <rect x={x - 12 + 3} y={y - 12 + 3} width="24" height="24" fill="rgba(0,0,0,0.35)" />
                            {/* Square jersey token */}
                            <rect x={x - 12} y={y - 12} width="24" height="24" fill="#ef4444" stroke="#7f1d1d" strokeWidth="2" filter="url(#playerGlow)" />
                            {/* Position abbreviation */}
                            <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="7.5" fontWeight="700" fontFamily="'Courier New', monospace">
                                {player.position}
                            </text>
                            {/* Name backdrop */}
                            <rect x={x - 22} y={y + 14} width="44" height="11" fill="rgba(0,0,0,0.7)" />
                            {/* Player name */}
                            <text x={x} y={y + 22} textAnchor="middle" fill="white" fontSize="6.5" fontWeight="600" fontFamily="'Courier New', monospace">
                                {name}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
