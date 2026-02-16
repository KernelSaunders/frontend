"use client";

import { useState } from "react";
import { verifyClaim, unverifyClaim, type Claim } from "@/lib/api";

interface VerifierControlsProps {
  productId: string;
  claim: Claim;
  onUpdate?: (isVerified: boolean) => void;
}

export function VerifierControls({ productId, claim, onUpdate }: VerifierControlsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(!!claim.verified_by);

  async function handleToggle() {
    setLoading(true);
    setError(null);
    try {
      if (isVerified) {
        await unverifyClaim(productId, claim.claim_id);
        setIsVerified(false);
        onUpdate?.(false);
      } else {
        await verifyClaim(productId, claim.claim_id);
        setIsVerified(true);
        onUpdate?.(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 border-t pt-3 flex items-center gap-3">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`rounded px-3 py-1 text-sm disabled:opacity-50 ${
          isVerified
            ? "border border-red-300 text-red-700 hover:bg-red-50"
            : "border border-green-300 text-green-700 hover:bg-green-50"
        }`}
      >
        {loading ? "..." : isVerified ? "Unverify" : "Verify"}
      </button>

      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
