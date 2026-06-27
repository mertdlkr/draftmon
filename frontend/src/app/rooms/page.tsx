"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import type { Room, ApiResponse } from "@/lib/contracts/types";
import { RoomStatusBadge } from "@/components/room/RoomStatusBadge";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch("/api/rooms");
        const json: ApiResponse<Room[]> = await res.json();
        if (json.success) {
          setRooms(json.data);
        }
      } catch (err) {
        console.error("Failed to load rooms list", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
    const interval = setInterval(fetchRooms, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="border-b-4 border-slate-900 pb-4 mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-pixel text-[20px] text-slate-900">ACTIVE LEAGUE POOLS</h1>
          <p className="font-pixel text-[10px] text-slate-400 mt-1">
            BROWSE AND BACK YOUR PREFERRED MANAGERS
          </p>
        </div>
        <Link
          href="/"
          className="font-pixel text-[10px] px-4 py-2 border-2 border-slate-900 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 text-center"
        >
          BACK HOME
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 border-4 border-dashed border-slate-300">
          <span className="font-pixel text-[12px] text-slate-400">LOADING POOLS...</span>
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border-4 border-dashed border-slate-300 bg-white">
          <span className="font-pixel text-[12px] text-slate-400">NO ACTIVE POOLS AVAILABLE</span>
          <p className="font-pixel text-[8px] text-slate-300 mt-2">
            Ask an admin to create a new draft room
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => {
            const entryFee = formatEther(BigInt(room.entry_fee_wei));
            return (
              <div
                key={room.id}
                className="bg-white border-4 border-slate-900 p-6 flex flex-col justify-between h-56 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h3 className="font-pixel text-[14px] text-slate-900 truncate max-w-[200px]">
                      {room.name}
                    </h3>
                    <RoomStatusBadge status={room.status} />
                  </div>

                  <div className="space-y-1.5 font-pixel text-[10px] text-slate-600 bg-slate-50 p-3 border-2 border-dashed border-slate-200">
                    <div>
                      ENTRY FEE: <span className="font-bold text-slate-900">{entryFee} MON</span>
                    </div>
                    <div>
                      POOL CAPACITY: <span className="font-bold text-slate-900">{room.capacity} Managers</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Link
                    href={`/watch/${room.id}`}
                    className="font-pixel text-[10px] px-4 py-2 bg-indigo-500 text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-indigo-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    SPECTATE
                  </Link>
                  {room.status === "open" && (
                    <Link
                      href={`/join/${room.id}`}
                      className="font-pixel text-[10px] px-4 py-2 bg-emerald-400 text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-300 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      JOIN AS MANAGER
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
