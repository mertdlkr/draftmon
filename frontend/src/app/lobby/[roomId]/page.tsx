"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { PlayerList } from "@/components/room/PlayerList";
import { RoomStatusBadge } from "@/components/room/RoomStatusBadge";

export default function LobbyRoomPage() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const router = useRouter();
  const { roomDetail, isLoading, isError } = useRoom(roomId);

  useEffect(() => {
    if (roomDetail?.room?.status === "drafting") {
      router.push(`/draft/${roomId}`);
    } else if (roomDetail?.room?.status === "betting" || roomDetail?.room?.status === "simulating" || roomDetail?.room?.status === "finished") {
      router.push(`/watch/${roomId}`);
    }
  }, [roomDetail, roomId, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f6f8f6]">
        <span className="font-pixel text-[12px] text-slate-400">CONNECTING TO LOBBY...</span>
      </div>
    );
  }

  if (isError || !roomDetail) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
        <h2 className="font-pixel text-[14px] text-rose-500 mb-4">LOBBY ERROR</h2>
        <p className="font-pixel text-[10px] text-slate-400 mb-4">
          Unable to connect to this lobby room.
        </p>
        <button
          onClick={() => router.push("/rooms")}
          className="font-pixel text-[10px] px-4 py-2 bg-slate-900 text-white border-2 border-slate-900"
        >
          BACK TO ROOMS
        </button>
      </div>
    );
  }

  const { room, players } = roomDetail;

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <div className="text-center mb-6">
        <h2 className="font-pixel text-[18px] text-slate-900 tracking-wider">
          {room.name.toUpperCase()} LOBBY
        </h2>
        <div className="mt-2">
          <RoomStatusBadge status={room.status} />
        </div>
      </div>

      <div className="mb-6">
        <PlayerList players={players} capacity={room.capacity} />
      </div>

      <div className="bg-white border-4 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center font-pixel text-[10px] text-slate-500">
        <span className="block mb-1 animate-pulse">WAITING FOR DRAFT TO BEGIN...</span>
        <span className="text-[8px] text-slate-400 block">
          Admin will trigger the draft phase once all manager slots are filled.
        </span>
      </div>
    </div>
  );
}
