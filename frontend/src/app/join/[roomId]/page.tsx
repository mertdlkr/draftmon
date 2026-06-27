"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import type { Room, ApiResponse } from "@/lib/contracts/types";
import { useEnterRoom } from "@/hooks/useEnterRoom";

interface Props {
  params: Promise<{ roomId: string }>;
}

export default function JoinRoomPage({ params }: Props) {
  const { roomId } = use(params);
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isApiVerifying, setIsApiVerifying] = useState(false);

  const { enter, hash, isPending, isConfirming, isSuccess, error } = useEnterRoom();

  useEffect(() => {
    async function loadRoom() {
      try {
        const res = await fetch(`/api/rooms/${roomId}`);
        const json = await res.json();
        if (json.success) {
          setRoom(json.data.room);
        } else {
          setErrorMsg(json.error.message || "Failed to load room info");
        }
      } catch (err) {
        setErrorMsg("Failed to retrieve room details");
      } finally {
        setLoading(false);
      }
    }

    if (roomId) loadRoom();
  }, [roomId]);

  // Hook into contract receipt and post verify to DB
  useEffect(() => {
    async function verifyTx() {
      if (!isSuccess || !hash || !room || !address || isApiVerifying) return;
      setIsApiVerifying(true);
      setErrorMsg(null);

      try {
        const res = await fetch("/api/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: room.id,
            contractRoomId: room.contract_room_id,
            wallet: address,
            txHash: hash,
          }),
        });
        const json: ApiResponse<{ joined: boolean }> = await res.json();
        if (json.success) {
          router.push(`/lobby/${room.id}`);
        } else {
          setErrorMsg(json.error.message || "On-chain record verification failed");
          setIsApiVerifying(false);
        }
      } catch (err) {
        setErrorMsg("API verification failed. Contact admin.");
        setIsApiVerifying(false);
      }
    }

    verifyTx();
  }, [isSuccess, hash, room, address, router, isApiVerifying]);

  const handleJoin = async () => {
    if (!room || !isConnected || isPending || isConfirming) return;
    setErrorMsg(null);
    try {
      enter(room.contract_room_id, BigInt(room.entry_fee_wei));
    } catch (err: any) {
      setErrorMsg(err.message || "Transaction call aborted");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f6f8f6]">
        <span className="font-pixel text-[12px] text-slate-400">RETRIEVING POOL DETAILS...</span>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
        <h2 className="font-pixel text-[14px] text-rose-500 mb-4">ROOM NOT FOUND</h2>
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <button
              onClick={() => router.push("/rooms")}
              className="font-pixel text-[10px] px-4 py-2 bg-slate-900 text-white border-2 border-slate-900"
            >
              BACK TO ROOMS
            </button>
          )}
        </ConnectButton.Custom>
      </div>
    );
  }

  const fee = formatEther(BigInt(room.entry_fee_wei));

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <div className="bg-white border-4 border-slate-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-4 border-slate-900 pb-3 mb-6 text-center">
          <h2 className="font-pixel text-[16px] text-slate-900">JOIN AS MANAGER</h2>
          <p className="font-pixel text-[8px] text-slate-400 mt-1 uppercase">
            Pool: {room.name}
          </p>
        </div>

        {/* Room specs */}
        <div className="space-y-2 bg-slate-50 p-4 border-2 border-dashed border-slate-200 font-pixel text-[10px] text-slate-700 mb-6">
          <div className="flex justify-between">
            <span>ENTRY FEE:</span>
            <span className="font-bold text-slate-900">{fee} MON</span>
          </div>
          <div className="flex justify-between">
            <span>CAPACITY:</span>
            <span className="font-bold text-slate-900">{room.capacity} Managers</span>
          </div>
        </div>

        {/* Action button / Connect Wallet */}
        <div className="flex flex-col items-center gap-4">
          {!isConnected ? (
            <div className="w-full flex justify-center">
              <ConnectButton />
            </div>
          ) : (
            <button
              onClick={handleJoin}
              disabled={isPending || isConfirming || isApiVerifying}
              className={`w-full font-pixel text-[12px] py-3.5 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${
                isPending || isConfirming || isApiVerifying
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-400 text-slate-900 hover:bg-emerald-300"
              }`}
            >
              {isConfirming
                ? "WAITING FOR BLOCK..."
                : isApiVerifying
                ? "VERIFYING ENTRY..."
                : isPending
                ? "APPROVING TX..."
                : `PAY ${fee} MON`}
            </button>
          )}
        </div>

        {/* Wallet state details */}
        {isConnected && address && (
          <div className="mt-4 text-center font-pixel text-[8px] text-slate-400 truncate">
            Connected: {address}
          </div>
        )}

        {/* Errors display */}
        {(errorMsg || error) && (
          <div className="mt-6 p-3 bg-rose-50 border-2 border-rose-500 font-pixel text-[8px] text-rose-600">
            {errorMsg || error?.message}
          </div>
        )}
      </div>
    </div>
  );
}
