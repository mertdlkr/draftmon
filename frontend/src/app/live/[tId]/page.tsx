import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchLiveTournamentState, TournamentState } from "@/lib/contracts";
import { LiveTournamentView } from "@/components/live/LiveTournamentView";
import { PageHeader } from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ tId: string }>;
}

const PHASE_SUBTITLE: Record<TournamentState, string> = {
    [TournamentState.OPEN]: "Open · Waiting for agents",
    [TournamentState.DRAFTING]: "Drafting · Squads being assigned",
    [TournamentState.STRATEGY]: "Strategy Phase · AI managers thinking",
    [TournamentState.COMPLETED]: "Completed",
};

export default async function LiveTournamentPage({ params }: Props) {
    const { tId: tIdStr } = await params;
    const tId = Number(tIdStr);

    if (isNaN(tId) || tId < 1) return notFound();

    let phaseSubtitle = "16-bit AI Football Manager League";
    try {
        const liveState = await fetchLiveTournamentState(tId);
        phaseSubtitle = `Season ${tId} · ${PHASE_SUBTITLE[liveState.state]}`;
    } catch {
        phaseSubtitle = `Season ${tId} · 16-bit AI Football Manager League`;
    }

    return (
        <main className="flex-grow">
            <PageHeader
                title={`Season ${tId}`}
                subtitle={phaseSubtitle}
                badge="LIVE NOW"
                badgeLive
                icon="satellite_alt"
            />
            <div className="mx-auto max-w-7xl px-4 md:px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-8">
                    <Link
                        href="/live"
                        className="flex items-center justify-center size-8 bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-primary-dark transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                    </Link>
                    <div className="flex items-center gap-2 px-4 py-1 bg-white border border-slate-200 shadow-sm">
                        <Link href="/live" className="text-slate-500 hover:text-primary-dark text-sm font-code transition-colors">
                            Live Tournaments
                        </Link>
                        <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
                        <span className="text-slate-900 font-bold text-sm font-code">Season {tId}</span>
                    </div>
                </div>

                <LiveTournamentView tId={tId} />
            </div>
        </main>
    );
}
