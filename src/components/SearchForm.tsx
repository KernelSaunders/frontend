"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QrScannerOverlay } from "@/components/QrScannerOverlay";

export function SearchForm() {
  const [productId, setProductId] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (productId.trim()) {
      router.push(`/products/${productId.trim()}`);
    }
  }

  const handleScan = useCallback((id: string) => {
    setScannerOpen(false);
    router.push(`/products/${id}`);
  }, [router]);

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Enter product ID"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          type="button"
          onClick={() => setScannerOpen(true)}
          aria-label="Scan QR code"
          className="rounded px-3 py-2 bg-[#767DCC] hover:bg-[#676EBB] text-white text-lg leading-none"
        >
          📷
        </button>
        <button
          type="submit"
          className="rounded px-4 py-2 bg-[#767DCC] hover:bg-[#676EBB] text-white"
        >
          Search
        </button>
      </form>

      {scannerOpen && (
        <QrScannerOverlay
          onScan={handleScan}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </>
  );
}