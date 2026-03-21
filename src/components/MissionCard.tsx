"use client";

import { useState } from "react";
import { attemptMission, type QuestMission } from "@/lib/api";

type AttemptState =
  | { status: "idle" }
  | { status: "submitting"; selectedIndex: number }
  | {
      status: "checked";
      selectedIndex: number;
      correct: boolean;
      pointsAwarded: number;
      attempts: number | null;
    }
  | { status: "error"; message: string };

interface MissionCardProps {
  mission: QuestMission;
}

export function MissionCard({ mission }: MissionCardProps) {
  const [state, setState] = useState<AttemptState>({ status: "idle" });

  const isLocked = state.status === "checked" || state.status === "submitting";

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-semibold">{mission.question}</h3>
        <span className="text-xs">{mission.tier}</span>
      </div>

      <div className="mt-3 space-y-2">
        {mission.options.map((opt, idx) => {
          const isSelected =
            (state.status === "submitting" || state.status === "checked") &&
            state.selectedIndex === idx;
          const selectedCorrect = state.status === "checked" && state.correct && isSelected;
          const selectedWrong = state.status === "checked" && !state.correct && isSelected;

          const base = "w-full text-left border rounded-md px-3 py-2 text-sm";
          const idleCls = "bg-white hover:bg-emerald-50 text-gray-800 border-gray-700";
          const correctCls = "border-green-800 bg-green-100 text-green-900";
          const wrongCls = "border-red-800 bg-red-100 text-red-900";
          const lockedCls = "opacity-80 cursor-not-allowed";

          const className = [
            base,
            selectedCorrect ? correctCls : selectedWrong ? wrongCls : idleCls,
            isLocked ? lockedCls : "",
          ].join(" ");

          return (
            <button
              key={`${mission.mission_id}-${idx}`}
              type="button"
              className={className}
              disabled={isLocked}
              onClick={async () => {
                setState({ status: "submitting", selectedIndex: idx });
                try {
                  const result = await attemptMission(mission.mission_id, idx);
                  setState({
                    status: "checked",
                    selectedIndex: idx,
                    correct: result.correct,
                    pointsAwarded: result.points_awarded,
                    attempts: result.attempts,
                  });
                } catch (e) {
                  const message = e instanceof Error ? e.message : "Failed to submit attempt.";
                  setState({ status: "error", message });
                }
              }}
            >
              {opt}
            </button>
          );
        })}

        {state.status === "checked" && (
          <div className={`text-sm ${state.correct ? "text-green-700" : "text-red-700"}`}>
            <p>{state.correct ? "Correct" : "Incorrect"}</p>
            {state.correct && state.pointsAwarded > 0 && (
              <p className="text-gray-800">You earned {state.pointsAwarded} points.</p>
            )}
            {state.correct && state.pointsAwarded === 0 && (
              <p className="text-gray-800">Already completed - no new points earned.</p>
            )}
            {state.attempts !== null && (
              <p className="text-gray-800">Attempts: {state.attempts}</p>
            )}
          </div>
        )}
        {state.status === "error" && <p className="text-sm text-red-700">{state.message}</p>}
        {state.status === "submitting" && <p className="text-sm text-gray-500">Checking...</p>}
      </div>


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
  );
}
