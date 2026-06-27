"use client";

import { useRouter } from "next/navigation";
import { QRScanner } from "@/components/room/QRScanner";

export default function ScanPage() {
  const router = useRouter();

  const handleScan = (decodedText: string) => {
    try {
      const url = new URL(decodedText);
      // Redirect to the path of the scanned URL (same origin)
      router.push(url.pathname + url.search);
    } catch {
      // Not a URL — ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8f6] flex flex-col items-center justify-center px-4">
      <div className="mb-6 text-center">
        <h1 className="font-pixel text-[18px] text-slate-900">SCAN QR CODE</h1>
        <p className="font-pixel text-[9px] text-slate-400 mt-2">
          Point your camera at the room QR code to join
        </p>
      </div>
      <QRScanner onScanSuccess={handleScan} />
    </div>
  );
}
