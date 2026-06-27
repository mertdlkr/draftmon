"use client";

import { useState, useMemo, useCallback } from "react";
import type { MatchResult, TournamentAgent } from "@/lib/contracts/types";
import { MatchReplay } from "./MatchReplay";
import { ManagerAvatar } from "@/components/ui/ManagerAvatar";

interface Props {
    matches: MatchResult[];
    agents: TournamentAgent[];
}

/** Ordered match labels for spectator progression */
const MATCH_LABELS = [
    "QF 1", "QF 2", "QF 3", "QF 4",
    "SF 1", "SF 2",
    "GRAND FINAL",
];

export function TournamentSpectator({ matches, agents }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    // Build name lookup
    const nameMap = useMemo(
        () => Object.fromEntries(agents.map((a) => [a.profile.address.toLowerCase(), a])),
        [agents],
    );

    const getAgent = useCallback(
        (addr: string) => nameMap[addr.toLowerCase()] ?? null,
        [nameMap],
    );

    const currentMatch = matches[activeIndex];
    const teamA = currentMatch ? getAgent(currentMatch.teamA) : null;
    const teamB = currentMatch ? getAgent(currentMatch.teamB) : null;
    const label = MATCH_LABELS[activeIndex] ?? `Match ${activeIndex + 1}`;

    const canPrev = activeIndex > 0;
    const canNext = activeIndex < matches.length - 1;

    const handleOpen = () => { setActiveIndex(0); setIsOpen(true); };
    const handleClose = () => setIsOpen(false);
    const handlePrev = () => canPrev && setActiveIndex((i) => i - 1);
    const handleNext = () => canNext && setActiveIndex((i) => i + 1);

    /* ── Collapsed: just the CTA button ──────────────────────────── */
    if (!isOpen) {
        return (
            <button
                onClick={handleOpen}
                className="px-5 py-2 bg-primary text-dark-green font-pixel text-[9px] uppercase border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] hover:bg-primary-dim hover:shadow-[3px_3px_0px_0px_rgba(19,236,91,0.25)] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
                <span className="material-symbols-outlined text-base">play_circle</span>
                Watch Tournament
            </button>
        );
    }

    /* ── Expanded: full spectator overlay ─────────────────────────── */
    if (!teamA || !teamB || !currentMatch) return null;

    const aWon = currentMatch.winner.toLowerCase() === currentMatch.teamA.toLowerCase();

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: "var(--color-dark-green)" }}
        >
            {/* ── Top bar ─────────────────────────────────────────── */}
            <div
                className="flex items-center justify-between px-4 md:px-8 py-3 border-b-2 border-primary/20"
                style={{ background: "var(--color-bg-darkest)" }}
            >
                {/* Left: round badge */}
                <div className="flex items-center gap-3">
                    <span className="font-pixel text-[8px] text-primary tracking-widest uppercase bg-primary/10 border border-primary/40 px-3 py-1">
                        {label}
                    </span>
                    <span className="font-pixel text-[8px] text-slate-500 tracking-widest uppercase hidden md:inline">
                        SPECTATOR MODE
                    </span>
                </div>

                {/* Right: close button */}
                <button
                    onClick={handleClose}
                    className="flex items-center gap-1.5 px-4 py-1.5 font-pixel text-[9px] uppercase text-slate-400 border border-slate-700 hover:text-white hover:border-white transition-colors cursor-pointer"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                    Close
                </button>
            </div>

            {/* ── Match header with team names & avatars ──────────── */}
            <div className="flex items-center justify-center gap-4 md:gap-8 py-4 px-4 border-b border-primary/10">
                {/* Team A */}
                <div className="flex items-center gap-2">
                    <ManagerAvatar name={teamA.profile.name} size={36} className="border-2 border-blue-400" />
                    <div className="flex flex-col">
                        <span className="font-pixel text-[9px] text-white leading-tight truncate max-w-[120px] md:max-w-[180px]">
                            {teamA.profile.name}
                        </span>
                        <span className="font-pixel text-[7px] text-slate-500 uppercase tracking-widest">
                            {teamA.entry.strategyName || "Unknown"}
                        </span>
                    </div>
                </div>

                {/* VS */}
                <span className="font-pixel text-xs text-primary px-3 py-1 border border-primary/30 bg-primary/10">
                    VS
                </span>

                {/* Team B */}
                <div className="flex items-center gap-2">
                    <ManagerAvatar name={teamB.profile.name} size={36} className="border-2 border-red-400" />
                    <div className="flex flex-col">
                        <span className="font-pixel text-[9px] text-white leading-tight truncate max-w-[120px] md:max-w-[180px]">
                            {teamB.profile.name}
                        </span>
                        <span className="font-pixel text-[7px] text-slate-500 uppercase tracking-widest">
                            {teamB.entry.strategyName || "Unknown"}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Match Replay (main area) ────────────────────────── */}
            <div className="flex-1 overflow-auto flex items-start justify-center px-2 md:px-8 py-4">
                <div className="w-full max-w-[1100px]">
                    <MatchReplay
                        key={activeIndex}
                        powerScoreA={currentMatch.scoreA}
                        powerScoreB={currentMatch.scoreB}
                        teamA={teamA}
                        teamB={teamB}
                    />
                </div>
            </div>

            {/* ── Bottom navigation bar ───────────────────────────── */}
            <div
                className="flex items-center justify-between px-4 md:px-8 py-3 border-t-2 border-primary/20"
                style={{ background: "var(--color-bg-darkest)" }}
            >
                {/* Prev button */}
                <button
                    onClick={handlePrev}
                    disabled={!canPrev}
                    className={`flex items-center gap-1.5 px-5 py-2 font-pixel text-[9px] uppercase border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] transition-colors cursor-pointer ${canPrev
                        ? "bg-white text-dark-green hover:bg-primary hover:text-dark-green"
                        : "opacity-30 cursor-not-allowed bg-slate-800 text-slate-600"
                        }`}
                >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                    Prev
                </button>

                {/* Match progress dots */}
                <div className="flex items-center gap-2">
                    {matches.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            title={MATCH_LABELS[i] ?? `Match ${i + 1}`}
                            className="cursor-pointer transition-all"
                            style={{
                                width: i === activeIndex ? 24 : 10,
                                height: 10,
                                background:
                                    i === activeIndex
                                        ? "var(--color-primary)"
                                        : i < activeIndex
                                            ? "rgba(19,236,91,0.4)"
                                            : "rgba(255,255,255,0.15)",
                                border: i === activeIndex ? "2px solid var(--color-primary)" : "1px solid rgba(255,255,255,0.1)",
                                transition: "all 0.2s",
                            }}
                        />
                    ))}
                </div>

                {/* Next button */}
                <button
                    onClick={handleNext}
                    disabled={!canNext}
                    className={`flex items-center gap-1.5 px-5 py-2 font-pixel text-[9px] uppercase border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] transition-colors cursor-pointer ${canNext
                        ? "bg-primary text-dark-green hover:bg-primary-dim"
                        : "opacity-30 cursor-not-allowed bg-slate-800 text-slate-600"
                        }`}
                >
                    Next
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
            </div>
        </div>
    );
}
