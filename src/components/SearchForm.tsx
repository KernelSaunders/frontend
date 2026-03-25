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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row md:items-center">
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter product ID"
            className="w-full min-w-0 flex-1 h-12 rounded-2xl border border-gray-200 px-4 text-base text-emerald-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:flex md:shrink-0">
            <Button type="submit" className="w-full justify-center md:w-auto">
              Search
            </Button>
            <Button type="button" variant="secondary" className="w-full justify-center md:w-auto" onClick={() => setScannerOpen(true)}>
              Scan Code
            </Button>
          </div>
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
