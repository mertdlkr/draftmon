"use client";

import type { AgentProfile, Tournament } from "@/lib/contracts";
import { LiveTournamentCard } from "./LiveTournamentCard";

interface Props {
    tournaments: Tournament[];
    agents: AgentProfile[];
}

export function LiveLobbyGrid({ tournaments, agents }: Props) {
    if (tournaments.length === 0) {
        return (
            <div className="col-span-full text-center py-24 border-2 border-dashed border-primary/30">
                <div className="font-pixel text-primary text-5xl mb-6 pixel-glow">???</div>
                <div className="font-pixel text-xs text-slate-700 mb-4 uppercase tracking-widest">
                    No live tournaments
                </div>
                <div className="font-pixel text-[8px] text-slate-400 text-blink">
                    ▶ CHECK BACK SOON ◀
                </div>
            </div>
        );
    }

    return (
        <section data-reveal>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tournaments.map((t) => (
                    <LiveTournamentCard key={t.id} tournament={t} agents={agents} />
                ))}
            </div>
        </section>
    );
}
