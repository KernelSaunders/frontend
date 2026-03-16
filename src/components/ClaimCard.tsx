"use client";

import { useState } from "react";
import { Claim, ClaimEvidenceGroup, getClaimEvidence } from "@/lib/api";

interface ClaimCardProps {
  claim: Claim;
  productId: string;
}

const confidenceStyles: Record<string, string> = {
  verified: "bg-green-100 text-green-800 border-green-300",
  partially_verified: "bg-yellow-100 text-yellow-800 border-yellow-300",
  unverified: "bg-red-100 text-red-800 border-red-300",
};

export function ClaimCard({ claim, productId }: ClaimCardProps) {
  const [evidenceGroup, setEvidenceGroup] = useState<ClaimEvidenceGroup | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleViewEvidence() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (evidenceGroup !== null) return;
    setLoading(true);
    try {
      const data = await getClaimEvidence(productId, claim.claim_id);
      setEvidenceGroup(data);
    } finally {
      setLoading(false);
    }
  }

  const confidenceLabel = claim.confidence_label ?? "unknown";
  const confidenceClass = confidenceStyles[claim.confidence_label] ?? "bg-gray-100 text-gray-700 border-gray-300";

  return (
    <div className="border rounded p-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase">{claim.claim_type}</p>
          <p className="font-medium">{claim.claim_text}</p>
        </div>
        <span className={`text-xs font-semibold border px-2 py-1 rounded whitespace-nowrap ${confidenceClass}`}>
          {confidenceLabel.replace("_", " ")}
        </span>
      </div>

      {claim.rationale && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-1">{claim.rationale}</p>
      )}

      <div className="mt-3 border-t pt-3">
        <button
          onClick={handleViewEvidence}
          className="text-sm underline"
        >
          {expanded ? "Hide evidence" : "View evidence"}
        </button>

        {expanded && (
          <div className="mt-2 space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500">Loading evidence...</p>
            ) : !evidenceGroup || evidenceGroup.evidence.length === 0 ? (
              <p className="text-sm text-gray-500">No evidence available.</p>
            ) : (
              evidenceGroup.evidence.map((ev) => (
                <div key={ev.evidence_id} className="border-l-2 pl-3">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{ev.issuer}</span>
                    {ev.evidence_date && (
                      <span className="text-xs text-gray-500">{ev.evidence_date}</span>
                    )}
                  </div>
                  {ev.summary && (
                    <p className="text-sm text-gray-600 mt-1">{ev.summary}</p>
                  )}
                  {ev.file_reference && (
                    <a
                      href={ev.file_reference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline mt-1 inline-block"
                    >
                      View document
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
