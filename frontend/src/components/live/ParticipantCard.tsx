"use client";

import type { LiveParticipant } from "@/lib/contracts";
import { STRATEGIES } from "@/lib/contracts";
import { SquadTable } from "@/components/agents/SquadTable";
import { PixelStatBar } from "@/components/ui/PixelStatBar";
import { ManagerAvatar, getManagerColor } from "@/components/ui/ManagerAvatar";
import { shortenAddress } from "@/lib/utils/format";

interface Props {
    p: LiveParticipant;
    accentColor: string;
}

export function ParticipantCard({ p, accentColor }: Props) {
    const shortAddr = shortenAddress(p.profile.address);

    let statusBadge;
    if (p.strategyCommitted) {
        statusBadge = (
            <div className="flex items-center gap-1 bg-green-50 text-green-700 text-base px-2 py-0.5 border-2 border-green-200 font-code uppercase">
                <span className="w-2 h-2 bg-green-600 animate-pulse mr-1" />
                Ready
            </div>
        );
    } else if (p.hasTeam) {
        statusBadge = (
            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 text-base px-2 py-0.5 border-2 border-yellow-200 font-code uppercase">
                <span className="material-symbols-outlined text-sm animate-spin">hourglass_top</span>
                Thinking
            </div>
        );
    } else {
        statusBadge = (
            <div className="flex items-center gap-1 bg-slate-50 text-slate-600 text-base px-2 py-0.5 border-2 border-slate-200 font-code uppercase">
                <span className="material-symbols-outlined text-sm">login</span>
                Joined
            </div>
        );
    }

    return (
        <div
            className={`group bg-white border-2 border-black border-l-[4px] ${accentColor} relative transition-transform`}
            style={{ boxShadow: '6px 6px 0px 0px rgba(214, 211, 209, 1)' }}
        >
            {/* Status badge */}
            <div className="absolute top-3 right-3">
                {statusBadge}
            </div>

            {/* Main content */}
            <div className="p-4 flex gap-4">
                <ManagerAvatar name={p.profile.name} size={80} />
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate font-pixel text-xs mt-1 leading-relaxed">{p.profile.name}</h3>
                    <p className="text-slate-500 font-code text-base mb-2">{shortAddr}</p>
                    <div className="flex flex-col gap-1 w-full">
                        <PixelStatBar label="ATT" value={p.profile.attack} color={getManagerColor(p.profile.name)} />
                        <PixelStatBar label="DEF" value={p.profile.defense} color={getManagerColor(p.profile.name)} />
                        <PixelStatBar label="DIS" value={p.profile.discipline} color={getManagerColor(p.profile.name)} />
                    </div>
                </div>
            </div>

            {/* Strategy / Waiting quote */}
            <div className="bg-slate-50 px-4 py-2 border-t-2 border-slate-100">
                {p.strategyCommitted && p.strategyId ? (
                    <p className="text-lg text-slate-600 font-code italic">
                        &quot;{p.reasoning ? p.reasoning.slice(0, 80) + (p.reasoning.length > 80 ? '...' : '') : `${STRATEGIES[p.strategyId]?.name || 'Strategy'} activated.`}&quot;
                    </p>
                ) : p.hasTeam ? (
                    <p className="text-lg text-slate-400 font-code italic"> analyzing opponent history...</p>
                ) : (
                    <p className="text-lg text-slate-400 font-code italic"> Waiting for turn...</p>
                )}
            </div>

            {/* Squad (collapsible) */}
            {p.hasTeam && p.team.length > 0 && (
                <details className="border-t-2 border-slate-100">
                    <summary className="px-4 py-2 text-xs font-pixel text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-50">
                        Squad ({p.team.filter(pl => pl.name).length} players)
                    </summary>
                    <div className="px-4 pb-3">
                        <SquadTable players={p.team} />
                    </div>
                </details>
            )}
        </div>
    );
}
