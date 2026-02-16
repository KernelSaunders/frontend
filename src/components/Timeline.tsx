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
        <div key={stage.stage_id} className="border-l-2 border-gray-300 pl-4">
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
        </div>
      ))}
    </div>
  );
}
