import { Stage } from "@/lib/api";

interface TimelineProps {
  stages: Stage[];
}

export function Timeline({ stages }: TimelineProps) {
  if (stages.length === 0) {
    return <p>No traceability stages available.</p>;
  }

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => (
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
            <p className="text-sm text-gray-600">{stage.description}</p>
          )}
          {(stage.start_date || stage.end_date) && (
            <p className="text-xs text-gray-500">
              {stage.start_date && `From: ${stage.start_date}`}
              {stage.start_date && stage.end_date && " - "}
              {stage.end_date && `To: ${stage.end_date}`}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
