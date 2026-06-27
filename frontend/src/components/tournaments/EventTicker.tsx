"use client";

import { useEffect, useRef } from "react";
import type { MatchEvent, MatchEventType } from "@/lib/simulation/types";

const EVENT_ICONS: Record<MatchEventType, string> = {
    KICKOFF:     "sports_soccer",
    HALF_TIME:   "pause_circle",
    FULL_TIME:   "flag",
    GOAL:        "sports_soccer",
    SHOT_SAVED:  "block",
    SHOT_MISS:   "close",
    PASS:        "arrow_forward",
    TACKLE:      "shield",
    DRIBBLE:     "directions_run",
    CORNER:      "flag_circle",
    FREE_KICK:   "gps_fixed",
    OFFSIDE:     "front_hand",
    YELLOW_CARD: "style",
};

const EVENT_ACCENT: Partial<Record<MatchEventType, string>> = {
    GOAL:        "#fbbf24",
    SHOT_SAVED:  "#60a5fa",
    YELLOW_CARD: "#fde047",
    TACKLE:      "#f87171",
    HALF_TIME:   "#475569",
    FULL_TIME:   "#475569",
    KICKOFF:     "#22c55e",
};

interface Props {
    events: MatchEvent[];
    currentMinute: number;
    teamAName: string;
    teamBName: string;
}

export function EventTicker({ events, currentMinute, teamAName, teamBName }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const visible = events.filter(
        (e) => e.minute <= currentMinute && e.type !== "PASS" && e.type !== "DRIBBLE"
    );

    // Auto-scroll to latest event
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [visible.length]);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            background: "#0a0f1a",
            borderLeft: "2px solid var(--color-dark-green)",
            overflow: "hidden",
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 0.6rem",
                background: "var(--color-dark-green)",
                flexShrink: 0,
            }}>
                <span className="material-symbols-outlined" style={{ fontSize: "12px", color: "#86efac" }}>
                    receipt_long
                </span>
                <span style={{
                    fontFamily: "var(--font-pixel)",
                    fontSize: "0.5rem",
                    color: "#86efac",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                }}>
                    Live Feed
                </span>
                <span style={{
                    marginLeft: "auto",
                    fontFamily: "var(--font-pixel)",
                    fontSize: "0.45rem",
                    color: "rgba(134,239,172,0.5)",
                }}>
                    {visible.length}
                </span>
            </div>

            {/* Scrollable event list — minHeight: 0 lets it shrink inside the flex column */}
            <div
                ref={scrollRef}
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overflowX: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    scrollBehavior: "smooth",
                }}
            >
                {visible.length === 0 && (
                    <div style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-pixel)",
                        fontSize: "0.45rem",
                        color: "#1e293b",
                        letterSpacing: "0.1em",
                        textAlign: "center",
                        padding: "1rem",
                    }}>
                        WAITING FOR<br />KICK OFF...
                    </div>
                )}

                {visible.map((event, idx) => {
                    const isGoal = event.type === "GOAL";
                    const isDivider = event.type === "HALF_TIME" || event.type === "FULL_TIME" || event.type === "KICKOFF";
                    const isLatest = idx === visible.length - 1;
                    const teamColor = event.team === "A" ? "#3b82f6" : "#ef4444";
                    const accent = EVENT_ACCENT[event.type] ?? teamColor;
                    const teamName = event.team === "A" ? teamAName : teamBName;

                    if (isDivider) {
                        return (
                            <div key={event.id} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                padding: "0.4rem 0.6rem",
                                borderTop: "1px solid rgba(255,255,255,0.06)",
                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                                background: "rgba(255,255,255,0.02)",
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: "10px", color: "#334155", flexShrink: 0 }}>
                                    {EVENT_ICONS[event.type]}
                                </span>
                                <span style={{
                                    fontFamily: "var(--font-pixel)",
                                    fontSize: "0.45rem",
                                    color: "#334155",
                                    letterSpacing: "0.06em",
                                }}>
                                    {event.description}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={event.id} style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.2rem",
                            padding: "0.45rem 0.6rem",
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            borderLeft: `3px solid ${isLatest ? accent : "transparent"}`,
                            background: isGoal
                                ? "rgba(251,191,36,0.06)"
                                : isLatest
                                ? "rgba(255,255,255,0.03)"
                                : "transparent",
                            transition: "background 0.2s",
                        }}>
                            {/* Row 1: minute + icon + team */}
                            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                <span style={{
                                    fontFamily: "var(--font-pixel)",
                                    fontSize: "0.45rem",
                                    color: isGoal ? "#fbbf24" : "#475569",
                                    background: "rgba(255,255,255,0.05)",
                                    padding: "0.1rem 0.25rem",
                                    flexShrink: 0,
                                    minWidth: "22px",
                                    textAlign: "center",
                                }}>
                                    {event.minute}&apos;
                                </span>
                                <span className="material-symbols-outlined" style={{ fontSize: "11px", color: accent, flexShrink: 0 }}>
                                    {EVENT_ICONS[event.type]}
                                </span>
                                <span style={{
                                    fontFamily: "var(--font-pixel)",
                                    fontSize: "0.42rem",
                                    color: teamColor === "#3b82f6" ? "#93c5fd" : "#fca5a5",
                                    letterSpacing: "0.03em",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    flex: 1,
                                    minWidth: 0,
                                }}>
                                    {teamName}
                                </span>
                            </div>

                            {/* Row 2: description */}
                            <div style={{
                                fontFamily: "var(--font-pixel)",
                                fontSize: "0.48rem",
                                color: isGoal ? "#fbbf24" : "#94a3b8",
                                lineHeight: 1.45,
                                paddingLeft: "0.1rem",
                            }}>
                                {event.description}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
