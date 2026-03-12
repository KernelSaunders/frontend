"use client";

import { useState } from "react";
import { ClaimWithEvidence, ClaimEvidenceGroup, getProductEvidence } from "@/lib/api";
import { ClaimCard } from "@/components/ClaimCard";
import { EvidenceView } from "@/components/EvidenceView";

interface ClaimsSectionProps {
  claims: ClaimWithEvidence[];
  productId: string;
}

export function ClaimsSection({ claims, productId }: ClaimsSectionProps) {
  const [view, setView] = useState<"simple" | "evidence">("simple");
  const [evidenceGroups, setEvidenceGroups] = useState<ClaimEvidenceGroup[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSwitchToEvidence() {
    setView("evidence");
    if (evidenceGroups !== null) return;
    setLoading(true);
    try {
      const data = await getProductEvidence(productId);
      setEvidenceGroups(data.groups);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView("simple")}
          className={`text-sm px-3 py-1 border rounded ${view === "simple" ? "bg-black text-white" : ""}`}
        >
          Simple view
        </button>
        <button
          onClick={handleSwitchToEvidence}
          className={`text-sm px-3 py-1 border rounded ${view === "evidence" ? "bg-black text-white" : ""}`}
        >
          Evidence view
        </button>
      </div>

      {view === "simple" ? (
        claims.length === 0 ? (
          <p>No claims available.</p>
        ) : (
          <div className="space-y-4">
            {claims.map((claimData) => (
              <ClaimCard key={claimData.claim.claim_id} claimData={claimData} />
            ))}
          </div>
        )
      ) : loading ? (
        <p className="text-sm text-gray-500">Loading evidence...</p>
      ) : (
        <EvidenceView groups={evidenceGroups ?? []} />
      )}
    </>
  );
}
