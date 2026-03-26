"use client";

import { useEffect } from "react";

// Props the inter to define the callback functions passed in from the parent component
interface Props {
  onScan: (productId: string) => void;
  onClose: () => void;
}

// Is a modal overlay comoent that uses the current divces camerato scan the QR coes using the html 5 qr code library.
// passes the decoded product UUID back into the parent using the oncScan callback 
export function QrScannerOverlay({ onScan, onClose }: Props) {
  useEffect(() => {
    let scanner: import("html5-qrcode").Html5Qrcode | null = null;

    // flag to stop the scanner the scanner from starting if the component unmounts before the async startScanner function runs
    let stopped = false;

    async function startScanner() {
      const { Html5Qrcode } = await import("html5-qrcode");

      // if component unmounted while waiting for the library to load, don't start the scanner
      if (stopped) return;

      // Clean the scanner to prevent duplicate renders
      const el = document.getElementById("qr-reader");
      if (el) el.innerHTML = "";

      // inistalise the scanner and start scanning for QR codes
      scanner = new Html5Qrcode("qr-reader");


      // Start the camera feed 
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // stop the scanner and pass the decoded text to the parent
          const s = scanner;
          scanner = null;
          s?.stop().then(() => onScan(decodedText.trim()));
        },
        () => {}// to stop partial scan failures
      );
    }

    startScanner().catch(console.error);

    return () => {
      stopped = true;
      scanner?.stop().catch(() => {});
    };
  }, [onScan]);


  // compent unmount to stop the camera and release resoiurces
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