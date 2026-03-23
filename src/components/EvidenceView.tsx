"use client";

import { ClaimEvidenceGroup } from "@/lib/api";

interface EvidenceViewProps {
  groups: ClaimEvidenceGroup[];
}

export function EvidenceView({ groups }: EvidenceViewProps) {
  if (groups.length === 0) {
    return <p>No evidence available.</p>;
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.claim_id} className="border rounded p-4">
          <div className="flex justify-between items-start gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-500 uppercase">{group.claim_type}</p>
              <p className="font-medium">{group.claim_text}</p>
            </div>
            <span className="text-sm border px-2 py-1 rounded whitespace-nowrap">
              {group.confidence_label.replace("_", " ")}
            </span>
          </div>

          <div className="space-y-3 border-t pt-3">
            {group.evidence.map((ev) => (
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
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
