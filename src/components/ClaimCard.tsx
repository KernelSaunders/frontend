"use client";

import { useState } from "react";
import { ClaimWithEvidence } from "@/lib/api";

interface ClaimCardProps {
  claimData: ClaimWithEvidence;
}

export function ClaimCard({ claimData }: ClaimCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { claim, evidence } = claimData;

  return (
    <div className="border rounded p-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase">{claim.claim_type}</p>
          <p className="font-medium">{claim.claim_text}</p>
        </div>
        <span className="text-sm border px-2 py-1 rounded whitespace-nowrap">
          {claim.confidence_label.replace("_", " ")}
        </span>
      </div>
      {claim.rationale && (
        <p className="text-sm text-gray-600 mt-2">{claim.rationale}</p>
      )}

      {evidence.length > 0 && (
        <div className="mt-3 border-t pt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm underline"
          >
            {expanded ? "Hide" : "Show"} {evidence.length} evidence item{evidence.length !== 1 ? "s" : ""}
          </button>
          {expanded && (
            <div className="mt-2 space-y-2">
              {evidence.map((ev) => (
                <div key={ev.evidence_id} className="border p-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{ev.type}</span>
                    {ev.evidence_date && <span className="text-gray-500">{ev.evidence_date}</span>}
                  </div>
                  <p>Issuer: {ev.issuer}</p>
                  {ev.summary && <p className="text-gray-600">{ev.summary}</p>}
                  {ev.file_reference && (
                    <a
                      href={ev.file_reference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      View document
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
