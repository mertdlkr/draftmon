"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import { formatEther } from "viem";
import { useRoom } from "@/hooks/useRoom";
import { SquadRevealGrid } from "@/components/watch/SquadRevealGrid";
import { BetForm } from "@/components/watch/BetForm";
import { BettingCountdown } from "@/components/watch/BettingCountdown";
import { PayoutSummary } from "@/components/watch/PayoutSummary";
import { RoomStatusBadge } from "@/components/room/RoomStatusBadge";
import { MatchReplay } from "@/components/tournaments/MatchReplay";
import { MatchBracket } from "@/components/watch/MatchBracket";
import { BETTING_DURATION_MS } from "@/constants";

interface Props {
  params: Promise<{ roomId: string }>;
}

export default function WatchRoomPage({ params }: Props) {
  const { roomId } = use(params);
  const { address } = useAccount();
  const { roomDetail, isLoading, mutate } = useRoom(roomId);
  const [activeReplayIdx, setActiveReplayIdx] = useState<number>(0);
  const [betSuccess, setBetSuccess] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f6f8f6]">
        <span className="font-pixel text-[12px] text-slate-400">CONNECTING SPECTATOR LINK...</span>
      </div>
    );
  }

  if (!roomDetail) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
        <h2 className="font-pixel text-[14px] text-rose-500 mb-4">ROOM NOT FOUND</h2>
        <Link
          href="/rooms"
          className="font-pixel text-[10px] px-4 py-2 bg-slate-900 text-white border-2 border-slate-900"
        >
          BACK TO ROOMS
        </Link>
      </div>
    );
  }

  const { room, players, matches, bets } = roomDetail;
  const myBet = bets.find((b) => b.bettor_wallet.toLowerCase() === address?.toLowerCase());

  // Adapter for old MatchReplay props using the new squad structures
  const renderActiveReplay = () => {
    if (!matches || matches.length === 0) return null;
    const activeMatch = matches[activeReplayIdx] || matches[0];

    const homePlayer = players.find((p) => p.wallet.toLowerCase() === activeMatch.home_wallet.toLowerCase());
    const awayPlayer = players.find((p) => p.wallet.toLowerCase() === activeMatch.away_wallet.toLowerCase());

    if (!homePlayer?.squad_json || !awayPlayer?.squad_json) {
      return (
        <div className="flex items-center justify-center h-48 border-4 border-slate-900 bg-slate-900 text-white font-pixel text-[10px]">
          WAITING FOR TEAM DATA...
        </div>
      );
    }

    const teamAAdapter = {
      entry: {
        team: homePlayer.squad_json,
        strategyId: 1,
        strategyName: "High Press",
      },
      profile: {
        address: homePlayer.wallet,
        name: `${homePlayer.wallet.slice(0, 6)}...${homePlayer.wallet.slice(-4)}`,
        attack: 15,
        defense: 15,
        discipline: 15,
      },
    };

    const teamBAdapter = {
      entry: {
        team: awayPlayer.squad_json,
        strategyId: 1,
        strategyName: "High Press",
      },
      profile: {
        address: awayPlayer.wallet,
        name: `${awayPlayer.wallet.slice(0, 6)}...${awayPlayer.wallet.slice(-4)}`,
        attack: 15,
        defense: 15,
        discipline: 15,
      },
    };

    return (
      <div className="bg-slate-900 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4">
        <div className="flex justify-between items-center text-white border-b-2 border-slate-800 pb-2 mb-4 font-pixel text-[10px]">
          <span>ROUND: {activeMatch.round} (Match {activeReplayIdx + 1} of {matches.length})</span>
          <div className="flex gap-2">
            {activeReplayIdx > 0 && (
              <button
                onClick={() => setActiveReplayIdx((prev) => prev - 1)}
                className="bg-slate-800 hover:bg-slate-700 px-2 py-1 border border-slate-700"
              >
                ◀ PREV
              </button>
            )}
            {activeReplayIdx < matches.length - 1 && (
              <button
                onClick={() => setActiveReplayIdx((prev) => prev + 1)}
                className="bg-slate-800 hover:bg-slate-700 px-2 py-1 border border-slate-700"
              >
                NEXT ▶
              </button>
            )}
          </div>
        </div>

        {/* Existing MatchReplay component */}
        <MatchReplay
          powerScoreA={100}
          powerScoreB={100}
          teamA={teamAAdapter}
          teamB={teamBAdapter}
        />
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Header info */}
      <div className="border-b-4 border-slate-900 pb-4 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-pixel text-[20px] text-slate-900">
              {room.name.toUpperCase()} WATCH HUB
            </h1>
            <RoomStatusBadge status={room.status} />
          </div>
          <span className="font-pixel text-[8px] text-slate-400 mt-1 block">
            ROOM ID: {room.id} · CAPACITY: {room.capacity} PLAYERS
          </span>
        </div>
        <Link
          href="/rooms"
          className="font-pixel text-[10px] px-4 py-2 border-2 border-slate-900 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 text-center"
        >
          LEAGUE LIST
        </Link>
      </div>

      {/* RENDER DYNAMIC ROOM SCENARIOS */}
      {room.status === "open" && (() => {
        const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join/${room.id}` : "";
        return (
          <div className="max-w-md mx-auto bg-white border-4 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
            <h3 className="font-pixel text-[14px] text-slate-900 mb-2">WAITING FOR MATCHMAKING</h3>
            <p className="font-pixel text-[10px] text-slate-400 mb-6">
              Managers are currently entering the league.
            </p>
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-4 font-pixel text-[12px] text-slate-700 mb-6">
              {players.length} / {room.capacity} managers registered
            </div>

            {/* QR Code display */}
            <div className="border-t-2 border-dashed border-slate-200 pt-6 flex flex-col items-center">
              <span className="font-pixel text-[8px] text-slate-400 mb-4 block">
                SCAN TO JOIN THE DRAFT AS MANAGER
              </span>
              <div className="bg-slate-50 p-4 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(19,236,91,1)] mb-4">
                <QRCodeSVG value={joinUrl} size={180} level="H" includeMargin={true} />
              </div>
              <a
                href={joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-pixel text-[8px] text-indigo-600 break-all text-center hover:underline"
              >
                {joinUrl}
              </a>
            </div>
          </div>
        );
      })()}

      {room.status === "drafting" && (
        <div className="space-y-6">
          <div className="bg-amber-50 border-4 border-slate-900 p-4 font-pixel text-[10px] text-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-bold">DRAFTING PHASE ACTIVE:</span> Managers are forming their team rosters. Follow the live card reveal below.
          </div>
          <SquadRevealGrid players={players} showSquads={false} />
        </div>
      )}

      {room.status === "betting" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-pixel text-[12px] text-slate-900 border-b-2 border-slate-900 pb-1">
              REVEALED ROSTERS
            </h3>
            <SquadRevealGrid players={players} showSquads={true} />
          </div>

          <div className="space-y-6">
            <BettingCountdown
              startedAt={room.betting_started_at}
              durationMs={BETTING_DURATION_MS}
              onExpire={mutate}
            />

            {myBet ? (
              <div className="bg-emerald-50 border-4 border-slate-900 p-6 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] text-center">
                <span className="material-symbols-outlined text-[36px] text-emerald-500">task_alt</span>
                <h4 className="font-pixel text-[12px] text-slate-900 mt-2">PREDICTION SECURED</h4>
                <p className="font-pixel text-[8px] text-slate-500 mt-2">
                  Amount: {formatEther(BigInt(myBet.amount_wei))} MON
                </p>
                <p className="font-pixel text-[8px] text-slate-400 mt-1 truncate">
                  Target: {myBet.target_wallet}
                </p>
              </div>
            ) : (
              <BetForm
                players={players}
                roomId={room.id}
                contractRoomId={room.contract_room_id}
                onSuccess={() => {
                  setBetSuccess(true);
                  mutate();
                }}
              />
            )}
          </div>
        </div>
      )}

      {room.status === "simulating" && (
        <div className="space-y-6">
          <MatchBracket
            matches={matches}
            players={players}
            activeIdx={activeReplayIdx}
            onSelect={setActiveReplayIdx}
          />
          {renderActiveReplay()}
        </div>
      )}

      {room.status === "finished" && (
        <div className="space-y-8">
          {/* Winner Banner */}
          <div className="bg-amber-400 border-4 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden">
            <span className="text-[40px] block animate-bounce">🏆</span>
            <h2 className="font-pixel text-[18px] text-slate-900 tracking-widest mt-2">
              TOURNAMENT CONCLUDED
            </h2>
            <div className="font-pixel text-[10px] text-slate-800 mt-2 bg-white/40 max-w-md mx-auto py-2 border-2 border-slate-900/10 truncate px-4">
              Champion: <span className="font-bold">{room.winner_wallet}</span>
            </div>
          </div>

          <MatchBracket
            matches={matches}
            players={players}
            activeIdx={activeReplayIdx}
            onSelect={setActiveReplayIdx}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {renderActiveReplay()}
            </div>
            <div>
              <PayoutSummary
                bets={bets}
                winnerWallet={room.winner_wallet}
                entryPoolWei={(BigInt(room.entry_fee_wei) * BigInt(players.length)).toString()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
