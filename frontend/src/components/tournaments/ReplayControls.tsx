"use client";

import { PixelSlider } from "@/components/ui/PixelSlider";

type Speed = 1 | 2 | 4 | 8;
type ReplayStatus = "idle" | "loading" | "playing" | "paused" | "ended";

interface Props {
    status: ReplayStatus;
    tick: number;
    totalTicks: number;
    speed: Speed;
    onPlay: () => void;
    onPause: () => void;
    onRestart: () => void;
    onSeek: (tick: number) => void;
    onSpeedChange: (speed: Speed) => void;
}

function formatMinute(tick: number, totalTicks: number): string {
    const minute = Math.floor((tick / totalTicks) * 90);
    return `${String(minute).padStart(2, "0")}:00`;
}

export function ReplayControls({
    status,
    tick,
    totalTicks,
    speed,
    onPlay,
    onPause,
    onRestart,
    onSeek,
    onSpeedChange,
}: Props) {
    const SPEEDS: Speed[] = [1, 2, 4, 8];

    const btnStyle = (active: boolean) => ({
        padding: "0.25rem 0.6rem",
        fontFamily: "var(--font-pixel)",
        fontSize: "0.5rem",
        letterSpacing: "0.06em",
        border: `1px solid ${active ? "#22c55e" : "rgba(255,255,255,0.15)"}`,
        background: active ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
        color: active ? "#86efac" : "#94a3b8",
        cursor: "pointer",
        transition: "all 0.1s",
    } as const);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            padding: "0.75rem 1rem",
            background: "#0f172a",
            border: "2px solid var(--color-dark-green)",
            borderTop: "none",
        }}>
            {/* Controls row */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                {/* Play / Pause / Restart */}
                {status === "ended" ? (
                    <button onClick={onRestart} style={btnStyle(false)}>↺ REPLAY</button>
                ) : status === "playing" ? (
                    <button onClick={onPause} style={btnStyle(true)}>⏸ PAUSE</button>
                ) : (
                    <button onClick={onPlay} style={btnStyle(false)}>▶ {status === "idle" ? "PLAY" : "RESUME"}</button>
                )}

                {/* Speed buttons */}
                <div style={{ display: "flex", gap: "0.25rem" }}>
                    {SPEEDS.map((s) => (
                        <button key={s} onClick={() => onSpeedChange(s)} style={btnStyle(speed === s)}>
                            {s}×
                        </button>
                    ))}
                </div>

                {/* Time display */}
                <span style={{
                    marginLeft: "auto",
                    fontFamily: "var(--font-pixel)",
                    fontSize: "0.55rem",
                    color: "#64748b",
                    letterSpacing: "0.05em",
                }}>
                    {formatMinute(tick, totalTicks)} / 90:00
                </span>
            </div>

            {/* Scrub bar */}
            <PixelSlider
                value={tick}
                max={totalTicks}
                onChange={onSeek}
                variant="dark"
                trackHeight={6}
                thumbSize={14}
                height={16}
            />
        </div>
    );
}
