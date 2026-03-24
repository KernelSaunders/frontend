import { Stage, StageEvidenceGroup, getEvidenceFileUrl } from "@/lib/api";

interface TimelineProps {
  stages: Stage[];
  stageEvidenceGroups?: StageEvidenceGroup[];
}

export function Timeline({ stages, stageEvidenceGroups = [] }: TimelineProps) {
  if (stages.length === 0) {
    return <p>No traceability stages available.</p>;
  }

  const evidenceByStage = new Map(
    stageEvidenceGroups.map((group) => [group.stage_id, group.evidence])
  );

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => {
        const stageEv = evidenceByStage.get(stage.stage_id) ?? [];
        return (
        <div key={stage.stage_id} className="rounded-lg border-l-4 border-[#30C071] pl-4 p-2 shadow-[0_8px_24px_rgba(20,30,24,0.08)]">
          <div className="font-semibold">
            {index + 1}. {stage.stage_type}
          </div>
          {(stage.location_country || stage.location_region) && (
            <p className="text-sm">
              Location: {[stage.location_region, stage.location_country].filter(Boolean).join(", ")}
            </p>
          )}
          {stage.description && (
            <p className="text-sm text-gray-400">{stage.description}</p>
          )}
          {(stage.start_date || stage.end_date) && (
            <p className="text-xs text-gray-500">
              {stage.start_date && `From: ${stage.start_date}`}
              {stage.start_date && stage.end_date && " - "}
              {stage.end_date && `To: ${stage.end_date}`}
            </p>
          )}

          {stageEv.length > 0 && (
            <div className="mt-3 border-t border-[#E3E8E5] pt-3 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Stage evidence</p>
              {stageEv.map((ev) => {
                const fileUrl = getEvidenceFileUrl(ev.file_reference);
                return (
                  <div key={ev.evidence_id} className="rounded border border-[#E3E8E5] bg-[#F8FAF8] p-3">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">{ev.type}</p>
                        <p className="text-sm font-medium">{ev.issuer}</p>
                      </div>
                      {ev.evidence_date && (
                        <span className="text-xs text-gray-500">{ev.evidence_date}</span>
                      )}
                    </div>
                    {ev.summary && <p className="mt-2 text-sm text-gray-600">{ev.summary}</p>}
                    {fileUrl && (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm underline"
                      >
                        View document
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}
