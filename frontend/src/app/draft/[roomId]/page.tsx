"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useRoom } from "@/hooks/useRoom";
import { useDraftStore, getSlotLimits } from "@/hooks/useDraft";
import { DraftPhase } from "@/components/draft/DraftPhase";
import { DraftTimer } from "@/components/draft/DraftTimer";
import { PositionProgress } from "@/components/draft/PositionProgress";
import { SquadSummary } from "@/components/draft/SquadSummary";
import { FOOTBALL_PLAYERS } from "@/lib/constants/players";
import { DRAFT_DURATION_MS } from "@/constants";
import type { FootballPlayer } from "@/lib/contracts/types";

interface Props {
  params: Promise<{ roomId: string }>;
}

export default function DraftPage({ params }: Props) {
  const { roomId } = use(params);
  const router = useRouter();
  const { address } = useAccount();

  const { roomDetail, isLoading } = useRoom(roomId);

  const {
    phase,
    picks,
    pool,
    isSubmitting,
    setPool,
    togglePick,
    confirmPhase,
    autoFillRemaining,
    resetDraft,
  } = useDraftStore();

  // Redirect if status is not drafting
  useEffect(() => {
    if (roomDetail && roomDetail.room.status !== "drafting") {
      router.push(`/watch/${roomId}`);
    }
  }, [roomDetail, roomId, router]);

  // Set up pools on mount
  useEffect(() => {
    resetDraft();

    // Helper to get random sub-array
    const getRandom = (arr: FootballPlayer[], n: number) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    const atts = FOOTBALL_PLAYERS.filter((p) => ["ST", "LW", "RW"].includes(p.position));
    const mids = FOOTBALL_PLAYERS.filter((p) => ["CM", "CDM", "CAM"].includes(p.position));
    const defs = FOOTBALL_PLAYERS.filter((p) => ["CB", "LB", "RB"].includes(p.position));
    const gks = FOOTBALL_PLAYERS.filter((p) => p.position === "GK");

    setPool("ATT", getRandom(atts, 10));
    setPool("MID", getRandom(mids, 10));
    setPool("DEF", getRandom(defs, 10));
    setPool("GK", getRandom(gks, 3));
  }, [setPool, resetDraft]);

  if (isLoading || !roomDetail) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f6f8f6]">
        <span className="font-pixel text-[12px] text-slate-400">CONNECTING DRAFT ENGINE...</span>
      </div>
    );
  }

  const { room } = roomDetail;
  const walletStr = address || "";

  const handlePhaseConfirm = () => {
    confirmPhase(roomId, walletStr, () => {
      router.push(`/watch/${roomId}`);
    });
  };

  const handleTimerExpire = () => {
    autoFillRemaining(roomId, walletStr, () => {
      router.push(`/watch/${roomId}`);
    });
  };

  const currentConstraints = getSlotLimits(phase, picks);
  const currentPool = pool[phase] || [];
  const currentSelected = picks[phase] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-80px)] flex flex-col">
      {/* Draft top bar */}
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <h1 className="font-pixel text-[18px] text-slate-900 tracking-wider">
            {room.name.toUpperCase()} DRAFT
          </h1>
          <PositionProgress currentPhase={phase} />
        </div>
        <div>
          <DraftTimer
            startedAt={room.draft_started_at}
            durationMs={DRAFT_DURATION_MS}
            onExpire={handleTimerExpire}
          />
        </div>
      </div>

      {/* Main Draft Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Selection Area */}
        <div className="lg:col-span-3 flex flex-col h-full bg-white border-4 border-slate-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-0">
          <DraftPhase
            group={phase}
            pool={currentPool}
            selected={currentSelected}
            constraints={currentConstraints}
            onToggle={togglePick}
            onConfirm={handlePhaseConfirm}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Squad Summary Sidebar */}
        <div className="h-full min-h-0">
          <SquadSummary picks={picks} />
        </div>
      </div>
    </div>
  );
}
