import { type QuestMission } from "@/lib/api";

interface MissionCardProps {
  mission: QuestMission;
  error?: string | null;
}

export function MissionCard({ mission, error }: MissionCardProps) {
  if (error) {
    return <p className="text-sm text-gray-600">{error}</p>;
  }

  return (
    <div key={mission.mission_id} className="border rounded-lg p-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-semibold">{mission.question}</h3>
        <span className="text-xs text-gray-500 uppercase">{mission.tier}</span>
      </div>

      {mission.type === "multiple_choice" && (
        <ol className="mt-3 list-decimal pl-5 space-y-1">
          {mission.options.map((opt, idx) => (
            <li key={`${mission.mission_id}-${idx}`} className="text-sm text-gray-300">
              {opt}
            </li>
          ))}
        </ol>
      )}

      {mission.explanation_link && (
        <div className="mt-3">
          <a
            className="text-sm underline"
            href={mission.explanation_link}
            target="_blank"
            rel="noreferrer"
          >
            Explanation
          </a>
        </div>
      )}
    </div>
  )
}


