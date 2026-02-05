import { type QuestMission } from "@/lib/api";

interface MissionsListProps {
  missions: QuestMission[];
  error?: string | null;
}

export function MissionsList({ missions, error }: MissionsListProps) {
  if (error) {
    return <p className="text-sm text-gray-600">{error}</p>;
  }

  if (missions.length === 0) {
    return <p className="text-sm text-gray-600">No missions available.</p>;
  }

  return (
    <div className="space-y-6">
      {missions.map((m) => (
        <div key={m.mission_id} className="border rounded-lg p-4">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-semibold">{m.question}</h3>
            <span className="text-xs text-gray-500 uppercase tracking-wide">{m.tier}</span>
          </div>

          {m.type === "multiple_choice" && (
            <ol className="mt-3 list-decimal pl-5 space-y-1">
              {m.options.map((opt, idx) => (
                <li key={`${m.mission_id}-${idx}`} className="text-sm text-gray-800">
                  {opt}
                </li>
              ))}
            </ol>
          )}

          {m.explanation_link && (
            <div className="mt-3">
              <a
                className="text-sm underline"
                href={m.explanation_link}
                target="_blank"
                rel="noreferrer"
              >
                Explanation
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

