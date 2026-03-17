"use client";

import { useEffect } from "react";

interface Props {
  onScan: (productId: string) => void;
  onClose: () => void;
}

export function QrScannerOverlay({ onScan, onClose }: Props) {
  useEffect(() => {
    let scanner: import("html5-qrcode").Html5Qrcode | null = null;

    let stopped = false;

    async function startScanner() {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (stopped) return;

      const el = document.getElementById("qr-reader");
      if (el) el.innerHTML = "";

      scanner = new Html5Qrcode("qr-reader");

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const s = scanner;
          scanner = null;
          s?.stop().then(() => onScan(decodedText.trim()));
        },
        () => {}
      );
    }

    startScanner().catch(console.error);

    return () => {
      stopped = true;
      scanner?.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-white rounded-2xl p-5 w-[320px] shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-lg leading-none"
          aria-label="Close scanner"
        >
          ✕
        </button>
        <p className="text-center text-sm text-gray-500 mb-4">
          Point your camera at a product QR code
        </p>
        <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
      </div>
    </div>
  );
}