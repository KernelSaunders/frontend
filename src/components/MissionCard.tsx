"use client";

import { useState } from "react";
import { attemptMission, type QuestMission } from "@/lib/api";

type MissionSubmission =
  | { kind: "multiple_choice"; selectedIndex: number }
  | { kind: "numeric"; submittedAnswer: string };

type AttemptState =
  | { status: "idle" }
  | { status: "submitting"; submission: MissionSubmission }
  | {
      status: "checked";
      submission: MissionSubmission;
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
  const [numericAnswer, setNumericAnswer] = useState("");

  const isLocked = state.status === "checked" || state.status === "submitting";
  const trimmedNumericAnswer = numericAnswer.trim();

  async function submitMultipleChoice(selectedIndex: number) {
    const submission: MissionSubmission = { kind: "multiple_choice", selectedIndex };
    setState({ status: "submitting", submission });
    try {
      const result = await attemptMission(mission.mission_id, { option_index: selectedIndex });
      setState({
        status: "checked",
        submission,
        correct: result.correct,
        pointsAwarded: result.points_awarded,
        attempts: result.attempts,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to submit attempt.";
      setState({ status: "error", message });
    }
  }

  async function submitNumeric() {
    if (trimmedNumericAnswer === "") {
      setState({ status: "error", message: "Enter a number before submitting." });
      return;
    }

    const parsedAnswer = Number(trimmedNumericAnswer);
    if (Number.isNaN(parsedAnswer)) {
      setState({ status: "error", message: "Enter a valid number." });
      return;
    }

    const submission: MissionSubmission = {
      kind: "numeric",
      submittedAnswer: trimmedNumericAnswer,
    };
    setState({ status: "submitting", submission });
    try {
      const result = await attemptMission(mission.mission_id, {
        numeric_answer: parsedAnswer,
      });
      setState({
        status: "checked",
        submission,
        correct: result.correct,
        pointsAwarded: result.points_awarded,
        attempts: result.attempts,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to submit attempt.";
      setState({ status: "error", message });
    }
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-semibold">{mission.question}</h3>
        <span className="text-xs">{mission.tier}</span>
      </div>

      <div className="mt-3 space-y-2">
        {mission.type === "multiple_choice" ? (
          mission.options.map((opt, idx) => {
            const isSelected =
              (state.status === "submitting" || state.status === "checked") &&
              state.submission.kind === "multiple_choice" &&
              state.submission.selectedIndex === idx;
            const selectedCorrect =
              state.status === "checked" && state.correct && isSelected;
            const selectedWrong =
              state.status === "checked" && !state.correct && isSelected;

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
                onClick={() => submitMultipleChoice(idx)}
              >
                {opt}
              </button>
            );
          })
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="number"
              inputMode="numeric"
              className="w-full rounded-md border border-gray-700 px-3 py-2 text-sm"
              value={numericAnswer}
              onChange={(e) => setNumericAnswer(e.target.value)}
              disabled={isLocked}
              placeholder="Type a number"
            />
            <button
              type="button"
              className="rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLocked}
              onClick={submitNumeric}
            >
              Submit
            </button>
          </div>
        )}

        {state.status === "checked" && (
          <div className={`text-sm ${state.correct ? "text-green-700" : "text-red-700"}`}>
            <p>{state.correct ? "Correct" : "Incorrect"}</p>
            {state.submission.kind === "numeric" && (
              <p className="text-gray-800">Your answer: {state.submission.submittedAnswer}</p>
            )}
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
