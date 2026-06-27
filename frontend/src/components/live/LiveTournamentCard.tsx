import Link from "next/link";
import type { AgentProfile, Tournament } from "@/lib/contracts";
import { TournamentState } from "@/lib/contracts";
import { ManagerAvatar } from "@/components/ui/ManagerAvatar";

const MAX_CAPACITY = 8;

const PHASE_CONFIG: Record<TournamentState, {
    label: string;
    description: string;
    chipClass: string;
    accentClass: string;
}> = {
    [TournamentState.OPEN]: {
        label: "OPEN",
        description: "Waiting for agents to enter the arena.",
        chipClass: "bg-slate-100 text-slate-600 border-slate-300",
        accentClass: "bg-slate-400",
    },
    [TournamentState.DRAFTING]: {
        label: "DRAFTING",
        description: "Admin assigning squads to all managers.",
        chipClass: "bg-amber-50 text-amber-700 border-amber-300",
        accentClass: "bg-amber-400",
    },
    [TournamentState.STRATEGY]: {
        label: "STRATEGY",
        description: "AI managers are analysing and committing tactics.",
        chipClass: "bg-primary/10 text-primary-dark border-primary/40",
        accentClass: "bg-primary",
    },
    [TournamentState.COMPLETED]: {
        label: "COMPLETED",
        description: "Tournament finished.",
        chipClass: "bg-slate-100 text-slate-400 border-slate-200",
        accentClass: "bg-slate-300",
    },
};

interface Props {
    tournament: Tournament;
    agents: AgentProfile[];
}

export function LiveTournamentCard({ tournament, agents }: Props) {
    const { id, state, participants, prizePool } = tournament;
    const phase = PHASE_CONFIG[state] ?? PHASE_CONFIG[TournamentState.OPEN];
    const capacity = participants.length;
    const capacityPct = Math.round((capacity / MAX_CAPACITY) * 100);

    // Cross-reference participant addresses with agent profiles for named avatars
    const agentMap = Object.fromEntries(agents.map((a) => [a.address.toLowerCase(), a]));
    const participantAgents = participants.map((addr) => agentMap[addr.toLowerCase()] ?? null);

    return (
        <Link
            href={`/live/${id}`}
            className="group block bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] hover:border-primary transition-all overflow-hidden"
        >
            {/* Top accent bar */}
            <div className="h-[5px] w-full bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />

            <div className="p-5 flex flex-col gap-4">
                {/* Header row: season + live badge */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-pixel text-xs text-slate-900 uppercase">
                            Season {id}
                        </span>
                        {/* Phase chip */}
                        <span className={`font-pixel text-[8px] px-2 py-0.5 border uppercase tracking-widest ${phase.chipClass}`}>
                            {phase.label}
                        </span>
                    </div>
                    {/* Pulsing LIVE badge */}
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 border border-primary/40 bg-primary/10 text-primary font-pixel text-[8px] uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        LIVE
                    </div>
                </div>

                {/* Phase description */}
                <p className="font-body text-lg text-slate-500 leading-snug -mt-1">
                    {phase.description}
                </p>

                {/* Capacity bar */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                        <span className="font-pixel text-[8px] text-slate-500 uppercase tracking-widest">
                            Agents
                        </span>
                        <span className="font-pixel text-[8px] text-slate-700">
                            {capacity} / {MAX_CAPACITY}
                        </span>
                    </div>
                    {/* Pixel progress bar */}
                    <div className="h-2 w-full bg-slate-100 border border-slate-200 overflow-hidden">
                        <div
                            className={`h-full transition-all ${phase.accentClass}`}
                            style={{ width: `${capacityPct}%` }}
                        />
                    </div>
                </div>

                {/* Agent avatar strip */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {Array.from({ length: MAX_CAPACITY }).map((_, i) => {
                        const agent = participantAgents[i];
                        if (agent) {
                            return (
                                <div
                                    key={agent.address}
                                    className="border-2 border-slate-200 group-hover:border-primary/30 transition-colors overflow-hidden"
                                    title={agent.name}
                                >
                                    <ManagerAvatar name={agent.name} size={28} />
                                </div>
                            );
                        }
                        return (
                            <div
                                key={`empty-${i}`}
                                className="w-7 h-7 border-2 border-dashed border-slate-200 flex items-center justify-center opacity-40"
                            >
                                <span className="font-pixel text-[6px] text-slate-300">?</span>
                            </div>
                        );
                    })}
                </div>

                {/* Dashed divider */}
                <hr style={{ height: "2px", backgroundImage: "linear-gradient(90deg, #cbd5e1 50%, transparent 50%)", backgroundSize: "8px 100%", border: "none" }} />

                {/* Footer: prize pool + CTA */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-primary">emoji_events</span>
                        <span className="font-pixel text-[8px] text-slate-600 uppercase tracking-widest">
                            {prizePool} MON
                        </span>
                    </div>
                    <span className="font-pixel text-[8px] text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        ▶ WATCH LIVE
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                </div>
            </div>
        </Link>
    );
}
