"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QrScannerOverlay } from "@/components/QrScannerOverlay";
import { Button } from "./Button";

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
      <div className="bg-white border border-emerald-50 rounded-xl shadow-sm p-5">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter product ID"
            className="flex-1 h-12 rounded-2xl border border-gray-200 px-4 text-base text-emerald-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
          />
          <Button type="submit">Search</Button>
          <Button type="button" variant="secondary" onClick={() => setScannerOpen(true)}>
            Scan Code
          </Button>
        </form>
      </div>

      {scannerOpen && (
        <QrScannerOverlay
          onScan={handleScan}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </>
  );
}
