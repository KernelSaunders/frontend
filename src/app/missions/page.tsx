"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyProgress, type UserProgressSummary } from "@/lib/api";

export default function Missions() {
  const [progress, setProgress] = useState<UserProgressSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      try {
        const data = await getMyProgress();
        setProgress(data);
      } catch (error) {
        if (error instanceof Error) {
          setMessage(error.message);
        } else {
          setMessage("Failed to load progress");
        }
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, []);

  if (loading) {
    return <main className="max-w-4xl mx-auto p-4"><p>Loading progress...</p></main>;
  }

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Mission Progress</h1>
      <p className="mt-2 text-slate-600">
        Complete product missions to learn about where your products are from.
      </p>

      {message ? (
        <div className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-slate-900">{message}</p>
          <Link href="/login" className="mt-4 inline-flex h-12 items-center rounded-xl bg-emerald-500 px-6 font-semibold text-white transition hover:bg-emerald-600">
            Sign in
          </Link>
        </div>
      ) : progress ? (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-600">Total points</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{progress.total_points}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-600">Missions completed</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{progress.total_completed}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-600">Recent completions</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{progress.recent_completions.length}</p>
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Badges</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {progress.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-xl border p-4 ${badge.earned ? "border-emerald-200 bg-emerald-50" : "border-gray-100 bg-slate-50"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${badge.earned ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                      {badge.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{badge.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{badge.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-slate-600">
                    {badge.earned ? (
                      <p className="font-medium text-emerald-700">Earned</p>
                    ) : (
                      <p>
                        {badge.progress_current} / {badge.progress_target}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Progress by tier</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-slate-600">Basic</p>
                <p className="mt-1 text-2xl font-semibold">{progress.missions_completed_by_tier.basic}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Intermediate</p>
                <p className="mt-1 text-2xl font-semibold">{progress.missions_completed_by_tier.intermediate}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Advanced</p>
                <p className="mt-1 text-2xl font-semibold">{progress.missions_completed_by_tier.advanced}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Recent activity</h2>
            {progress.recent_completions.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No missions completed yet. Start from any product page.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {progress.recent_completions.map((completion) => (
                  <div key={completion.mission_id} className="rounded-lg border border-gray-100 px-4 py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{completion.question}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {completion.tier} mission - {completion.score} points
                        </p>
                      </div>
                      <p className="text-sm text-slate-600">
                        {new Date(completion.completed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}
