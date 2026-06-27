"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface Props {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export function QRScanner({ onScanSuccess, onScanError }: Props) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Unique ID for scanner container
    const scannerId = "qr-reader-container";

    // Setup the scanner configuration
    scannerRef.current = new Html5QrcodeScanner(
      scannerId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch((err) => console.error("Error clearing scanner", err));
        }
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        if (onScanError) {
          onScanError(errorMessage);
        }
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error("Error clearing scanner on unmount", err));
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="flex flex-col items-center bg-white p-4 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full mx-auto">
      <div className="mb-4 text-center">
        <h4 className="font-pixel text-[12px] text-slate-900">ALIGN QR CODE</h4>
        <p className="font-pixel text-[8px] text-slate-400 mt-1">
          Make sure QR code is visible in your camera frame
        </p>
      </div>

      {/* HTML5 QR Code Container */}
      <div id="qr-reader-container" className="w-full overflow-hidden border-4 border-slate-900 bg-slate-50" />
    </div>
  );
}
