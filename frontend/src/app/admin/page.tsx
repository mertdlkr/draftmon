"use client";

import { useEffect, useState } from "react";
import { parseEther, formatEther } from "viem";
import type { Room, ApiResponse, RoomPlayer } from "@/lib/contracts/types";
import { QRDisplay } from "@/components/room/QRDisplay";
import { RoomStatusBadge } from "@/components/room/RoomStatusBadge";
import { QRCodeSVG } from "qrcode.react";

export default function AdminPanelPage() {
  const [adminSecret, setAdminSecret] = useState("");
  const [roomName, setRoomName] = useState("");
  const [capacity, setCapacity] = useState<number>(4);
  const [entryFeeMon, setEntryFeeMon] = useState("0.01");

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [createdRoomUrl, setCreatedRoomUrl] = useState<string | null>(null);
  const [createdRoomDetail, setCreatedRoomDetail] = useState<{ room: Room; bettorsCount: number } | null>(null);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomPlayers, setRoomPlayers] = useState<Record<string, RoomPlayer[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [expandedRoomQrId, setExpandedRoomQrId] = useState<string | null>(null);

  // Load secret from localStorage if exists
  useEffect(() => {
    const saved = localStorage.getItem("draftmon_admin_secret");
    if (saved) setAdminSecret(saved);
  }, []);

  const handleSaveSecret = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("draftmon_admin_secret", adminSecret);
    setStatusMsg({ type: "success", text: "Admin secret saved locally" });
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName || submitting) return;

    setSubmitting(true);
    setStatusMsg(null);
    setCreatedRoomUrl(null);

    try {
      const entryFeeWei = parseEther(entryFeeMon).toString();
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminSecret, name: roomName, capacity, entryFeeWei }),
      });
      const json: ApiResponse<{ room: Room; qrUrl: string }> = await res.json();
      if (json.success) {
        setCreatedRoomUrl(json.data.qrUrl);
        setCreatedRoomDetail({ room: json.data.room, bettorsCount: 0 });
        setActiveRoomId(json.data.room.id);
        setStatusMsg({ type: "success", text: "Room created and initialized on-chain successfully!" });
        setRoomName("");
        fetchRoomsList();
      } else {
        setStatusMsg({ type: "error", text: json.error.message || "Failed to create room" });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Network error occurred" });
    } finally {
      setSubmitting(false);
    }
  };

  async function fetchRoomsList() {
    try {
      const res = await fetch("/api/rooms");
      const json: ApiResponse<Room[]> = await res.json();
      if (json.success) {
        setRooms(json.data);
        
        // Fetch players for each room
        for (const room of json.data) {
          const detailRes = await fetch(`/api/rooms/${room.id}`);
          const detailJson = await detailRes.json();
          if (detailJson.success) {
            setRoomPlayers((prev) => ({
              ...prev,
              [room.id]: detailJson.data.players,
            }));
          }
        }
      }
    } catch (err) {
      console.error("Failed to load rooms list", err);
    }
  }

  useEffect(() => {
    fetchRoomsList();
    const interval = setInterval(fetchRoomsList, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartDraft = async (roomId: string) => {
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/rooms/${roomId}/start-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminSecret }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMsg({ type: "success", text: "Draft session started!" });
        fetchRoomsList();
      } else {
        setStatusMsg({ type: "error", text: json.error.message });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Draft request failed" });
    }
  };

  const handleSimulate = async (roomId: string) => {
    setStatusMsg(null);
    try {
      const res = await fetch("/api/sim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, adminSecret }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMsg({ type: "success", text: `Simulation finished. Winner: ${json.data.winner}` });
        fetchRoomsList();
      } else {
        setStatusMsg({ type: "error", text: json.error.message });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Simulation trigger failed" });
    }
  };

  const handlePayout = async (roomId: string) => {
    setStatusMsg(null);
    try {
      const res = await fetch("/api/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, adminSecret }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMsg({ type: "success", text: "On-chain payouts distributed successfully!" });
        fetchRoomsList();
      } else {
        setStatusMsg({ type: "error", text: json.error.message });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Payout triggers failed" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Admin Panel Header */}
      <div className="border-b-4 border-slate-900 pb-4 mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-pixel text-[20px] text-slate-900">LEAGUE ADMIN CONTROLS</h1>
          <p className="font-pixel text-[10px] text-slate-400 mt-1">
            INITIALIZE ROOMS, START SIMULATIONS, AND TRIGGER ON-CHAIN PAYOUTS
          </p>
        </div>
      </div>

      {/* Secret setup */}
      <div className="bg-white border-4 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
        <form onSubmit={handleSaveSecret} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="font-pixel text-[10px] text-slate-700 block mb-1">
              ADMIN PASSWORD
            </label>
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              className="w-full font-pixel text-[12px] p-2 border-2 border-slate-900 bg-slate-50 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="font-pixel text-[10px] px-6 py-2.5 bg-slate-900 text-white border-2 border-slate-900 hover:bg-slate-800"
          >
            SAVE PASSWORD
          </button>
        </form>
      </div>

      {statusMsg && (
        <div
          className={`mb-8 p-3 border-4 font-pixel text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] ${
            statusMsg.type === "success"
              ? "bg-emerald-50 border-emerald-500 text-emerald-700"
              : "bg-rose-50 border-rose-500 text-rose-700"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Create room + QR Code display */}
        <div className="space-y-8 lg:col-span-1">
          <form
            onSubmit={handleCreateRoom}
            className="bg-white border-4 border-slate-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4"
          >
            <h3 className="font-pixel text-[12px] text-slate-900 border-b-2 border-slate-900 pb-2">
              CREATE DRAFT ROOM
            </h3>

            <div>
              <label className="font-pixel text-[10px] text-slate-700 block mb-1">
                ROOM NAME
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Genesis League"
                className="w-full font-pixel text-[12px] p-2 border-2 border-slate-900 bg-slate-50 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-pixel text-[10px] text-slate-700 block mb-1">
                CAPACITY
              </label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full font-pixel text-[12px] p-2 border-2 border-slate-900 bg-slate-50 focus:outline-none"
              >
                <option value={2}>2 Managers (Test)</option>
                <option value={4}>4 Managers</option>
                <option value={8}>8 Managers</option>
                <option value={16}>16 Managers</option>
              </select>
            </div>

            <div>
              <label className="font-pixel text-[10px] text-slate-700 block mb-1">
                ENTRY FEE (MON)
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={entryFeeMon}
                onChange={(e) => setEntryFeeMon(e.target.value)}
                className="w-full font-pixel text-[12px] p-2 border-2 border-slate-900 bg-slate-50 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 font-pixel text-[10px] py-3 bg-emerald-400 text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-300 font-bold active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              {submitting ? "INITIALIZING..." : "INITIALIZE ROOM"}
            </button>
          </form>

          {createdRoomUrl && createdRoomDetail && (
            <QRDisplay
              url={createdRoomUrl}
              roomName={createdRoomDetail.room.name}
              playerCount={0}
              capacity={createdRoomDetail.room.capacity}
              bettorCount={createdRoomDetail.bettorsCount}
            />
          )}
        </div>

        {/* RIGHT COLUMN: Active rooms manager */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-pixel text-[12px] text-slate-900 border-b-2 border-slate-900 pb-1">
            ROOMS MANAGEMENT
          </h3>

          <div className="space-y-4">
            {rooms.length === 0 ? (
              <div className="border-4 border-dashed border-slate-300 bg-white p-12 text-center">
                <span className="font-pixel text-[12px] text-slate-400">NO ROOMS DETECTED</span>
              </div>
            ) : (
              rooms.map((room) => {
                const players = roomPlayers[room.id] || [];
                const readyPlayers = players.filter((p) => p.draft_done);
                const isFull = players.length >= room.capacity;

                return (
                  <div
                    key={room.id}
                    className="bg-white border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-pixel text-[12px] text-slate-900 font-bold">
                            {room.name}
                          </h4>
                          <RoomStatusBadge status={room.status} />
                        </div>
                        <span className="font-pixel text-[8px] text-slate-400 block mb-2">
                          ID: {room.id} · Entry: {formatEther(BigInt(room.entry_fee_wei))} MON
                        </span>
                        <div className="font-pixel text-[10px] text-slate-600">
                          MANAGERS: <span className="font-bold">{players.length}/{room.capacity}</span> ({readyPlayers.length} ready)
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap items-center">
                        {room.status === "open" && (
                          <button
                            onClick={() => setExpandedRoomQrId(expandedRoomQrId === room.id ? null : room.id)}
                            className="font-pixel text-[10px] px-3 py-2 bg-indigo-400 text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-indigo-300 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                          >
                            {expandedRoomQrId === room.id ? "HIDE QR" : "SHOW QR"}
                          </button>
                        )}

                        {room.status === "open" && (
                          <button
                            onClick={() => handleStartDraft(room.id)}
                            disabled={!isFull}
                            className={`font-pixel text-[10px] px-3 py-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${
                              isFull
                                ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            START DRAFT
                          </button>
                        )}

                        {room.status === "betting" && (
                          <button
                            onClick={() => handleSimulate(room.id)}
                            className="font-pixel text-[10px] px-3 py-2 bg-rose-400 text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-300 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                          >
                            RUN SIMULATION
                          </button>
                        )}

                        {room.status === "simulating" && (
                          <button
                            onClick={() => handlePayout(room.id)}
                            className="font-pixel text-[10px] px-3 py-2 bg-emerald-400 text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(25,23,42,1)] hover:bg-emerald-300 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                          >
                            DISTRIBUTE REWARDS
                          </button>
                        )}

                        <a
                          href={`/watch/${room.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-pixel text-[10px] px-3 py-2 bg-slate-100 border-2 border-slate-900 hover:bg-slate-50 text-center"
                        >
                          VIEW ROOM
                        </a>
                      </div>
                    </div>

                    {expandedRoomQrId === room.id && (() => {
                      const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join/${room.id}` : "";
                      return (
                        <div className="bg-slate-50 border-t-2 border-slate-200 p-5 flex flex-col items-center">
                          <span className="font-pixel text-[8px] text-slate-400 mb-2 block">
                            SCAN TO JOIN DRAFT
                          </span>
                          <div className="bg-white p-3 border-2 border-slate-900 mb-2 shadow-[2px_2px_0px_0px_rgba(19,236,91,1)]">
                            <QRCodeSVG value={joinUrl} size={150} level="H" includeMargin={true} />
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
                      );
                    })()}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
