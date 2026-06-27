"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { FootballPlayer } from "@/lib/contracts/types";
import type { MatchSimulation } from "@/lib/simulation/types";
import { simulateMatch } from "@/lib/simulation/engine";
import { AnimatedPitch } from "./AnimatedPitch";
import { EventTicker } from "./EventTicker";
import { ReplayControls } from "./ReplayControls";

export interface TournamentAgent {
  entry: {
    team: FootballPlayer[];
    strategyId?: number;
    strategyName?: string;
  };
  profile: {
    address: string;
    name: string;
    attack: number;
    defense: number;
    discipline: number;
  };
}

type Speed = 1 | 2 | 4 | 8;
export type ReplayStatus = "idle" | "loading" | "playing" | "paused" | "ended";

interface Props {
    powerScoreA: number;
    powerScoreB: number;
    teamA: TournamentAgent;
    teamB: TournamentAgent;
    onTickChange?: (goalsA: number, goalsB: number, status: ReplayStatus) => void;
    autoPlay?: boolean;
}

export function MatchReplay({ powerScoreA, powerScoreB, teamA, teamB, onTickChange, autoPlay }: Props) {
    const [status, setStatus] = useState<ReplayStatus>("loading");
    const [tick, setTick] = useState(0);
    const [speed, setSpeed] = useState<Speed>(2);
    const [simulation, setSimulation] = useState<MatchSimulation | null>(null);
    const [goalFlash, setGoalFlash] = useState(false);

    const rafRef = useRef<number | null>(null);
    const lastGoalTickRef = useRef<number>(-1);
    const goalFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastTimestampRef = useRef<number | null>(null);
    const accumRef = useRef<number>(0);

    // Base rate: 3 ticks/second at 1× → full 270-tick match ≈ 90 seconds at 1×
    // At 2× ≈ 45s, 4× ≈ 22s, 8× ≈ 11s
    const TICKS_PER_SECOND = 3;

    // Build simulation on mount
    useEffect(() => {
        const sim = simulateMatch({
            teamA: {
                players: teamA.entry.team,
                strategyId: teamA.entry.strategyId || 1,
                agent: teamA.profile,
                name: teamA.profile.name,
            },
            teamB: {
                players: teamB.entry.team,
                strategyId: teamB.entry.strategyId || 1,
                agent: teamB.profile,
                name: teamB.profile.name,
            },
            power: { scoreA: powerScoreA, scoreB: powerScoreB },
        });
        setSimulation(sim);
        setTick(0);
        setStatus(autoPlay ? "playing" : "idle");
    }, [powerScoreA, powerScoreB, teamA.profile.address, teamB.profile.address, autoPlay]);

    // Notify parent of tick / goals / status changes
    useEffect(() => {
        if (!simulation) return;
        const currentTick = simulation.ticks[tick] ?? simulation.ticks[0];
        const liveA = simulation.events.filter(e => e.type === "GOAL" && e.team === "A" && e.minute <= currentTick.minute).length;
        const liveB = simulation.events.filter(e => e.type === "GOAL" && e.team === "B" && e.minute <= currentTick.minute).length;
        onTickChange?.(liveA, liveB, status);
    }, [tick, status, simulation, onTickChange]);

    // Goal flash detection — use a persistent ref for the timer so tick-changes don't cancel it
    useEffect(() => {
        if (!simulation) return;
        const currentTick = simulation.ticks[tick];
        if (currentTick?.activeEvent?.type === "GOAL" && tick !== lastGoalTickRef.current) {
            lastGoalTickRef.current = tick;
            if (goalFlashTimerRef.current) clearTimeout(goalFlashTimerRef.current);
            setGoalFlash(true);
            goalFlashTimerRef.current = setTimeout(() => {
                setGoalFlash(false);
                goalFlashTimerRef.current = null;
            }, 800);
        }
    }, [tick, simulation]);

    // Clear flash timer on unmount
    useEffect(() => () => {
        if (goalFlashTimerRef.current) clearTimeout(goalFlashTimerRef.current);
    }, []);

    // Animation loop — time-accumulator so speed is in real seconds, not frames
    const animate = useCallback((timestamp: number) => {
        if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
        const dt = Math.min(timestamp - lastTimestampRef.current, 100); // cap at 100ms to avoid jumps after tab switch
        lastTimestampRef.current = timestamp;

        accumRef.current += (dt / 1000) * TICKS_PER_SECOND * speed;
        const ticksToAdvance = Math.floor(accumRef.current);
        accumRef.current -= ticksToAdvance;

        if (ticksToAdvance > 0) {
            setTick((t) => {
                if (!simulation) return t;
                const next = t + ticksToAdvance;
                if (next >= simulation.ticks.length) {
                    setStatus("ended");
                    return simulation.ticks.length - 1;
                }
                return next;
            });
        }

        rafRef.current = requestAnimationFrame(animate);
    }, [speed, simulation, TICKS_PER_SECOND]);

    useEffect(() => {
        if (status === "playing") {
            lastTimestampRef.current = null;
            accumRef.current = 0;
            rafRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [status, animate]);

    const handlePlay = () => {
        if (status === "ended") {
            setTick(0);
            lastGoalTickRef.current = -1;
        }
        setStatus("playing");
    };
    const handlePause = () => setStatus("paused");
    const handleRestart = () => { setTick(0); lastGoalTickRef.current = -1; setStatus("playing"); };
    const handleSeek = (t: number) => { setTick(t); if (status === "ended") setStatus("paused"); };

    if (!simulation) {
        return (
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "300px", border: "2px solid var(--color-dark-green)",
                background: "#0f172a", color: "#64748b",
                fontFamily: "var(--font-pixel)", fontSize: "0.6rem",
                letterSpacing: "0.1em",
            }}>
                LOADING SIMULATION...
            </div>
        );
    }

    const currentTick = simulation.ticks[tick] ?? simulation.ticks[0];
    const liveGoalsA = simulation.events.filter(e => e.type === "GOAL" && e.team === "A" && e.minute <= currentTick.minute).length;
    const liveGoalsB = simulation.events.filter(e => e.type === "GOAL" && e.team === "B" && e.minute <= currentTick.minute).length;
    const aWon = simulation.goalsA > simulation.goalsB;

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            {/*
             * Pitch + sidebar.
             *
             * The ticker is `position: absolute` so it is excluded from flow and
             * cannot grow the container height. Height is set by the pitch alone.
             * `bottom: 0` pins the ticker to the exact same height as the pitch,
             * giving EventTicker a definite height so its internal scroll works.
             */}
            <div style={{ position: "relative" }}>
                {/* Pitch — reserves right margin so SVG doesn't slide under the ticker */}
                <div style={{ marginRight: "240px" }}>
                    <AnimatedPitch
                        tick={currentTick}
                        teamAPlayers={teamA.entry.team}
                        teamBPlayers={teamB.entry.team}
                        teamAName={teamA.profile.name}
                        teamBName={teamB.profile.name}
                        goalsA={liveGoalsA}
                        goalsB={liveGoalsB}
                        powerScoreA={powerScoreA}
                        powerScoreB={powerScoreB}
                        strategyA={teamA.entry.strategyName ?? undefined}
                        strategyB={teamB.entry.strategyName ?? undefined}
                        winner={status === "ended" ? (aWon ? "A" : "B") : null}
                        goalFlash={goalFlash}
                        activeEvent={currentTick.activeEvent}
                    />
                </div>

                {/* Ticker — absolutely pinned top/right/bottom, never grows the container */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "240px",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}>
                    <EventTicker
                        events={simulation.events}
                        currentMinute={currentTick.minute}
                        teamAName={teamA.profile.name}
                        teamBName={teamB.profile.name}
                    />
                </div>
            </div>

            {/* Controls span full width below both columns */}
            <ReplayControls
                status={status}
                tick={tick}
                totalTicks={simulation.ticks.length}
                speed={speed}
                onPlay={handlePlay}
                onPause={handlePause}
                onRestart={handleRestart}
                onSeek={handleSeek}
                onSpeedChange={setSpeed}
            />
        </div>
    );
}
