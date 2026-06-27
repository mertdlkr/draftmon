"use client";

import { useState } from "react";
import { parseEther } from "viem";
import type { RoomPlayer } from "@/lib/contracts/types";
import { usePlaceBet } from "@/hooks/usePlaceBet";

interface Props {
  players: RoomPlayer[];
  roomId: string;
  contractRoomId: `0x${string}`;
  onSuccess?: () => void;
}

export function BetForm({ players, roomId, contractRoomId, onSuccess }: Props) {
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [amount, setAmount] = useState<string>("0.01");
  const [isTxSubmitting, setIsTxSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { placeBet, isConfirming, isSuccess, error } = usePlaceBet();

  const handleBetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget || !amount || isTxSubmitting) return;

    setIsTxSubmitting(true);
    setErrorMsg(null);

    try {
      const amountBigInt = parseEther(amount);
      
      // 1. Call Smart Contract Function
      await placeBet(contractRoomId, selectedTarget as `0x${string}`, amountBigInt);
      
      // Note: After the contract tx succeeds, the parent component or SWR will fetch updates.
      // We will also send the receipt verified to /api/bet.
      // This flow will be handled inside a useEffect watching usePlaceBet status, or locally here.
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit transaction");
      setIsTxSubmitting(false);
    }
  };

  // Watch for transaction success and send to API
  const handleApiVerify = async (txHash: string) => {
    try {
      const res = await fetch("/api/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          contractRoomId,
          bettorWallet: window.ethereum?.selectedAddress || "", // fallback or handle via wagmi Account
          targetWallet: selectedTarget,
          amountWei: parseEther(amount).toString(),
          txHash,
        }),
      });
      if (res.ok && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to verify bet tx in DB", err);
    } finally {
      setIsTxSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleBetSubmit}
      className="bg-white border-4 border-slate-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md mx-auto"
    >
      <div className="border-b-4 border-slate-900 pb-2 mb-4">
        <h3 className="font-pixel text-[12px] text-slate-900">PLACE YOUR PREDICTION</h3>
        <p className="font-pixel text-[8px] text-slate-400 mt-1">
          BET MON ON THE WINNING MANAGER
        </p>
      </div>

      {/* Target Selector */}
      <div className="mb-4">
        <label className="font-pixel text-[10px] text-slate-700 block mb-2">
          SELECT MANAGER
        </label>
        <div className="grid grid-cols-2 gap-2">
          {players.map((p) => {
            const isSelected = selectedTarget === p.wallet;
            const shortWallet = `${p.wallet.slice(0, 6)}...${p.wallet.slice(-4)}`;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedTarget(p.wallet)}
                className={`cursor-pointer p-2 border-2 text-center select-none font-pixel text-[10px] transition-all active:scale-95 ${
                  isSelected
                    ? "border-amber-400 bg-amber-50 shadow-[2px_2px_0px_0px_rgba(245,158,11,1)]"
                    : "border-slate-900 hover:border-slate-700"
                }`}
              >
                {shortWallet}
              </div>
            );
          })}
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="font-pixel text-[10px] text-slate-700 block mb-2">
          BET AMOUNT (MON)
        </label>
        <input
          type="number"
          step="0.001"
          min="0.001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full font-pixel text-[12px] p-3 border-4 border-slate-900 focus:outline-none focus:border-amber-400 bg-slate-50"
        />
      </div>

      {/* Error display */}
      {(errorMsg || error) && (
        <div className="mb-4 p-2 bg-rose-50 border-2 border-rose-500 font-pixel text-[8px] text-rose-600">
          {errorMsg || error?.message}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!selectedTarget || isTxSubmitting || isConfirming}
        className={`w-full font-pixel text-[12px] py-3 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all ${
          selectedTarget && !isTxSubmitting && !isConfirming
            ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        {isConfirming ? "WAITING FOR BLOCK..." : isTxSubmitting ? "CONFIRMING TX..." : "PLACE BET"}
      </button>
    </form>
  );
}
