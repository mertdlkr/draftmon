"use client";

import type { Bet } from "@/lib/contracts/types";
import { formatEther } from "viem";

interface Props {
  bets: Bet[];
  winnerWallet: string | null;
  entryPoolWei: string;
}

export function PayoutSummary({ bets, winnerWallet, entryPoolWei }: Props) {
  const winningBets = bets.filter((b) => b.won === true);
  const totalBetPool = bets.reduce((acc, b) => acc + BigInt(b.amount_wei), BigInt(0));

  return (
    <div className="bg-white border-4 border-slate-900 p-6 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] w-full max-w-xl mx-auto font-pixel text-[10px]">
      <div className="border-b-4 border-slate-900 pb-2 mb-4">
        <h3 className="text-[12px] text-slate-900">REWARD PAYOUT SUMMARY</h3>
        <p className="text-[8px] text-slate-400 mt-1 block uppercase">
          On-chain reward settlement details
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Tournament Winner Payout */}
        <div className="border-2 border-slate-900 p-3 bg-emerald-50">
          <span className="text-slate-500 uppercase block mb-1">Champion Payout</span>
          <span className="text-[16px] text-emerald-600 font-bold block">
            {formatEther(BigInt(entryPoolWei))} MON
          </span>
          <span className="text-[8px] text-slate-400 block mt-1 truncate">
            To: {winnerWallet}
          </span>
        </div>

        {/* Bettor Pool Payout */}
        <div className="border-2 border-slate-900 p-3 bg-amber-50">
          <span className="text-slate-500 uppercase block mb-1">Betting Pool Payout</span>
          <span className="text-[16px] text-amber-600 font-bold block">
            {formatEther(totalBetPool)} MON
          </span>
          <span className="text-[8px] text-slate-400 block mt-1">
            Split between {winningBets.length} winning bettors
          </span>
        </div>
      </div>

      {/* Winning Bettors List */}
      <div>
        <h4 className="text-slate-900 border-b border-dashed border-slate-200 pb-1 mb-2">
          WINNING BETTORS
        </h4>
        {winningBets.length > 0 ? (
          <div className="space-y-1">
            {winningBets.map((b) => {
              const shortBettor = `${b.bettor_wallet.slice(0, 6)}...${b.bettor_wallet.slice(-4)}`;
              const payout = b.payout_wei ? formatEther(BigInt(b.payout_wei)) : "0.00";
              return (
                <div
                  key={b.id}
                  className="flex justify-between items-center bg-slate-50 p-2 border border-slate-200"
                >
                  <span className="font-bold">{shortBettor}</span>
                  <span className="text-emerald-500 font-bold">+{payout} MON</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-slate-300 italic text-center py-4 bg-slate-50 border border-slate-200">
            No correct predictions placed
          </div>
        )}
      </div>
    </div>
  );
}
