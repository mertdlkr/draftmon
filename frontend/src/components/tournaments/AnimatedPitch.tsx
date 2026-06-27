"use client";

import { useRef } from "react";
import type { MatchTick, MatchEvent } from "@/lib/simulation/types";
import type { FootballPlayer } from "@/lib/contracts/types";

interface Props {
    tick: MatchTick;
    teamAPlayers: FootballPlayer[];
    teamBPlayers: FootballPlayer[];
    teamAName: string;
    teamBName: string;
    goalsA: number;
    goalsB: number;
    powerScoreA: number;
    powerScoreB: number;
    strategyA?: string;
    strategyB?: string;
    winner?: "A" | "B" | null;
    goalFlash?: boolean; // true for ~0.5s after a goal
    activeEvent?: MatchEvent;
}

export function AnimatedPitch({
    tick,
    teamAName,
    teamBName,
    goalsA,
    goalsB,
    powerScoreA,
    powerScoreB,
    strategyA,
    strategyB,
    winner,
    goalFlash,
    activeEvent,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Convert % positions to SVG units (600×400)
    const toSvgX = (pct: number) => (pct / 100) * 600;
    const toSvgY = (pct: number) => (pct / 100) * 400;

    const ball = tick.ballPosition;
    const ballX = toSvgX(ball.x);
    const ballY = toSvgY(ball.y);

    const eventLabel = activeEvent && !["KICKOFF", "HALF_TIME", "FULL_TIME", "PASS"].includes(activeEvent.type)
        ? activeEvent.type.replace("_", " ")
        : null;

    return (
        <div ref={containerRef} style={{ width: "100%", overflow: "hidden", border: "2px solid var(--color-dark-green)", position: "relative" }}>
            {/* Score Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1.5rem",
                padding: "0.6rem 1rem",
                background: "var(--color-dark-green)",
                borderBottom: "1px solid var(--color-dark-green)",
                fontFamily: "var(--font-display)",
            }}>
                <span style={{ fontWeight: winner === "A" ? 800 : 500, color: winner === "A" ? "#eab308" : "#ffffff", fontSize: "0.95rem" }}>
                    {winner === "A" && <span className="material-symbols-outlined text-[14px] align-middle mr-1 text-[#eab308]">emoji_events</span>}
                    {teamAName}
                </span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem" }}>
                    <span style={{
                        fontFamily: "var(--font-pixel)",
                        fontSize: "12px",
                        fontWeight: 300,
                        color: "#ffffff",
                        padding: "0.15rem 0.75rem",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                    }}>
                        {goalsA} - {goalsB}
                    </span>
                    <span style={{
                        fontFamily: "var(--font-pixel)",
                        fontSize: "0.55rem",
                        color: "#64748b",
                        letterSpacing: "0.05em",
                    }}>
                        PWR {powerScoreA} — {powerScoreB}
                    </span>
                </div>
                <span style={{ fontWeight: winner === "B" ? 800 : 500, color: winner === "B" ? "#eab308" : "#ffffff", fontSize: "0.95rem" }}>
                    {teamBName}
                    {winner === "B" && <span className="material-symbols-outlined text-[14px] align-middle ml-1 text-[#eab308]">emoji_events</span>}
                </span>
            </div>

            {/* Strategy labels */}
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
                        }}>▶ {strategyA}</span>
                    ) : <span />}
                    <span style={{
                        fontFamily: "var(--font-pixel)",
                        fontSize: "0.55rem",
                        color: "#94a3b8",
                        letterSpacing: "0.05em",
                    }}>
                        {String(tick.minute).padStart(2, "0")}:00
                    </span>
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
                        }}>▶ {strategyB}</span>
                    ) : <span />}
                </div>
            )}

            {/* Pitch SVG */}
            <svg viewBox="0 0 600 400" style={{ width: "100%", height: "auto", display: "block" }} xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="ap-grass" patternUnits="userSpaceOnUse" width="50" height="400">
                        <rect width="25" height="400" fill="#23a84e" />
                        <rect x="25" width="25" height="400" fill="#1b8a3e" />
                    </pattern>
                    <pattern id="ap-net" patternUnits="userSpaceOnUse" width="4" height="4">
                        <path d="M0 0 L4 4 M4 0 L0 4" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
                    </pattern>
                    <pattern id="ap-scanlines" patternUnits="userSpaceOnUse" width="600" height="4">
                        <rect y="2" width="600" height="2" fill="rgba(0,0,0,0.04)" />
                    </pattern>
                    <filter id="ap-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="ap-ball-glow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <radialGradient id="ap-ball-grad" cx="40%" cy="35%" r="55%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="70%" stopColor="#e2e8f0" />
                        <stop offset="100%" stopColor="#94a3b8" />
                    </radialGradient>
                </defs>

                {/* Grass */}
                <rect width="600" height="400" fill="url(#ap-grass)" />

                {/* Pitch markings */}
                <g stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none">
                    <rect x="10" y="10" width="580" height="380" />
                    <line x1="300" y1="10" x2="300" y2="390" />
                    <circle cx="300" cy="200" r="45" />
                    <circle cx="300" cy="200" r="3" fill="rgba(255,255,255,0.8)" />
                    <rect x="10" y="110" width="85" height="180" />
                    <rect x="10" y="155" width="35" height="90" />
                    <path d="M 95 155 A 30 30 0 0 1 95 245" />
                    <circle cx="70" cy="200" r="2" fill="rgba(255,255,255,0.8)" />
                    <rect x="505" y="110" width="85" height="180" />
                    <rect x="555" y="155" width="35" height="90" />
                    <path d="M 505 155 A 30 30 0 0 0 505 245" />
                    <circle cx="530" cy="200" r="2" fill="rgba(255,255,255,0.8)" />
                    <path d="M 10 20 A 10 10 0 0 0 20 10" />
                    <path d="M 580 10 A 10 10 0 0 0 590 20" />
                    <path d="M 590 380 A 10 10 0 0 0 580 390" />
                    <path d="M 20 390 A 10 10 0 0 0 10 380" />
                </g>

                {/* Goals */}
                <rect x="2" y="170" width="9" height="60" fill="url(#ap-net)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" />
                <rect x="589" y="170" width="9" height="60" fill="url(#ap-net)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" />

                {/* Corner flags */}
                {[
                    { cx: 13, cy: 18, x1: 10, y1: 16, x2: 10, y2: 3, pts: "10,3 19,8 10,13", rx: 10, ry: 3 },
                    { cx: 587, cy: 18, x1: 590, y1: 16, x2: 590, y2: 3, pts: "590,3 581,8 590,13", rx: 590, ry: 3 },
                    { cx: 13, cy: 382, x1: 10, y1: 384, x2: 10, y2: 397, pts: "10,397 19,392 10,387", rx: 10, ry: 397 },
                    { cx: 587, cy: 382, x1: 590, y1: 384, x2: 590, y2: 397, pts: "590,397 581,392 590,387", rx: 590, ry: 397 },
                ].map((f, i) => (
                    <g key={i}>
                        <ellipse cx={f.cx} cy={f.cy} rx="5" ry="2" fill="rgba(0,0,0,0.3)" />
                        <line x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
                        <polygon points={f.pts} fill="#ef4444" />
                    </g>
                ))}

                {/* CRT scanlines */}
                <rect width="600" height="400" fill="url(#ap-scanlines)" style={{ pointerEvents: "none" }} />

                {/* Team A players — blue */}
                {tick.playersA.map((p, i) => {
                    const px = toSvgX(p.position.x);
                    const py = toSvgY(p.position.y);
                    const name = p.name.length > 8 ? p.name.slice(0, 7) + "." : p.name;
                    return (
                        <g key={`a-${i}`} style={{ transition: "transform 0.1s linear" }}>
                            <rect x={px - 12 + 3} y={py - 12 + 3} width="24" height="24" fill="rgba(0,0,0,0.35)" />
                            <rect x={px - 12} y={py - 12} width="24" height="24" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="2" filter="url(#ap-glow)" />
                            <text x={px} y={py + 22} textAnchor="middle" fill="white" fontSize="6.5" fontWeight="600" fontFamily="'Courier New', monospace">{name}</text>
                        </g>
                    );
                })}

                {/* Team B players — red */}
                {tick.playersB.map((p, i) => {
                    const px = toSvgX(p.position.x);
                    const py = toSvgY(p.position.y);
                    const name = p.name.length > 8 ? p.name.slice(0, 7) + "." : p.name;
                    return (
                        <g key={`b-${i}`} style={{ transition: "transform 0.1s linear" }}>
                            <rect x={px - 12 + 3} y={py - 12 + 3} width="24" height="24" fill="rgba(0,0,0,0.35)" />
                            <rect x={px - 12} y={py - 12} width="24" height="24" fill="#ef4444" stroke="#7f1d1d" strokeWidth="2" filter="url(#ap-glow)" />
                            <text x={px} y={py + 22} textAnchor="middle" fill="white" fontSize="6.5" fontWeight="600" fontFamily="'Courier New', monospace">{name}</text>
                        </g>
                    );
                })}

                {/* Ball */}
                <circle cx={ballX} cy={ballY} r="7" fill="url(#ap-ball-grad)" stroke="rgba(0,0,0,0.4)" strokeWidth="1" filter="url(#ap-ball-glow)" />

                {/* Event label near ball */}
                {eventLabel && (
                    <g>
                        <rect
                            x={Math.min(Math.max(ballX - 30, 5), 545)}
                            y={Math.max(ballY - 28, 5)}
                            width="60" height="16"
                            fill="rgba(0,0,0,0.75)"
                            rx="2"
                        />
                        <text
                            x={Math.min(Math.max(ballX, 35), 575)}
                            y={Math.max(ballY - 16, 17)}
                            textAnchor="middle"
                            fill={activeEvent?.type === "GOAL" ? "#fbbf24" : "#ffffff"}
                            fontSize="8"
                            fontWeight="700"
                            fontFamily="'Courier New', monospace"
                        >
                            {activeEvent?.type === "GOAL" ? `⚽ GOAL!` : eventLabel}
                        </text>
                    </g>
                )}

                {/* Goal flash overlay */}
                {goalFlash && (
                    <rect width="600" height="400" fill="rgba(34,197,94,0.35)" style={{ pointerEvents: "none" }} />
                )}
            </svg>
        </div>
    );
}
