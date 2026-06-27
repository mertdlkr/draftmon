"use client";

import { QRCodeSVG } from "qrcode.react";

interface Props {
  url: string;
  roomName: string;
  playerCount: number;
  capacity: number;
  bettorCount: number;
}

export function QRDisplay({ url, roomName, playerCount, capacity, bettorCount }: Props) {
  return (
    <div className="flex flex-col items-center p-6 bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full mx-auto">
      {/* Title */}
      <div className="mb-4 text-center">
        <h4 className="font-pixel text-[14px] text-slate-900 truncate max-w-[280px]">
          {roomName}
        </h4>
        <span className="font-pixel text-[8px] text-slate-400 mt-1 block">
          SCAN TO JOIN THE DRAFT
        </span>
      </div>

      {/* QR Code Frame */}
      <div className="bg-slate-50 p-4 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] mb-4">
        <QRCodeSVG value={url} size={200} level="H" includeMargin={true} />
      </div>

      {/* URL Link */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-pixel text-[8px] text-indigo-600 break-all text-center hover:underline max-w-xs mb-4"
      >
        {url}
      </a>

      {/* Counts Indicator */}
      <div className="w-full flex justify-between font-pixel text-[10px] bg-slate-900 text-white p-2 border-2 border-slate-900">
        <div>
          PLAYERS: <span className="text-emerald-400">{playerCount}/{capacity}</span>
        </div>
        <div>
          BETTORS: <span className="text-amber-400">{bettorCount}</span>
        </div>
      </div>
    </div>
  );
}
