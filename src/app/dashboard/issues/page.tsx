"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  getUserRole,
  getIssues,
  updateIssue,
  type IssueReport,
} from "@/lib/api";

const STATUS_OPTIONS = [
  "open",
  "under_review",
  "resolved",
  "rejected",
] as const;

export default function IssuesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  // Tracks which issue is awaiting a resolution note, and what status was chosen
  const [notePrompt, setNotePrompt] = useState<{
    issueId: string;
    status: string;
  } | null>(null);
  const [noteText, setNoteText] = useState("");

  async function loadIssues(t: string, status?: string) {
    try {
      const data = await getIssues(t, { status: status || undefined });
      setIssues(data);
    } catch {
      setMessage({ text: "Failed to load issues", type: "error" });
    }
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      const t = data.session?.access_token;
      if (!t) {
        router.replace("/login");
        return;
      }
      try {
        const { role } = await getUserRole(t);
        if (role !== "verifier") {
          router.replace("/");
          return;
        }
      } catch {
        router.replace("/");
        return;
      }
      setToken(t);
      await loadIssues(t, "open");
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleFilterChange(status: string) {
    setStatusFilter(status);
    if (token) await loadIssues(token, status);
  }

  async function handleStatusChange(issue: IssueReport, newStatus: string) {
    if (!token) return;

    // For resolved/rejected, show the inline note input instead of acting immediately
    if (newStatus === "resolved" || newStatus === "rejected") {
      setNotePrompt({ issueId: issue.issue_id, status: newStatus });
      setNoteText("");
      return;
    }

    // For other statuses (open, under_review) just update directly
    await submitStatusUpdate(issue.issue_id, newStatus);
  }

  async function submitStatusUpdate(
    issueId: string,
    newStatus: string,
    resolution_note?: string,
  ) {
    if (!token) return;
    setUpdating(issueId);
    try {
      await updateIssue(token, issueId, { status: newStatus, resolution_note });
      await loadIssues(token, statusFilter);
      setMessage({
        text: `Issue ${newStatus.replace("_", " ")}`,
        type: "success",
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Failed to update",
        type: "error",
      });
    }
    setUpdating(null);
    setNotePrompt(null);
    setNoteText("");
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Link
        href="/dashboard"
        className="text-sm text-[#676EBB] hover:underline"
      >
        &larr; Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">Issue Reports</h1>

      {message && (
        <p
          className={`mb-4 text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}
        >
          {message.text}
        </p>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-700">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleFilterChange(s)}
            className={`px-4 py-2 text-sm rounded-t transition-colors ${
              statusFilter === s
                ? "bg-[#4A4680] text-white"
                : "text-gray-400 hover:text-white hover:bg-[#2A2935]"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {issues.length === 0 ? (
        <p className="text-gray-400">
          No {statusFilter.replace("_", " ")} issues.
        </p>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.issue_id}
              className="border border-gray-700 rounded p-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">
                    {issue.type.replace("_", " ")}
                  </p>
                  <p className="font-medium">{issue.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Product: {issue.product_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    Reported: {new Date(issue.created_at).toLocaleDateString()}
                  </p>
                  {issue.resolution_note && (
                    <p className="text-sm text-gray-400 mt-2 italic">
                      Note: {issue.resolution_note}
                    </p>
                  )}
                </div>
                <span className="text-xs border px-2 py-1 rounded whitespace-nowrap">
                  {issue.status.replace("_", " ")}
                </span>
              </div>

              {/* Status change actions */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {STATUS_OPTIONS.filter((s) => s !== issue.status).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(issue, s)}
                    disabled={updating === issue.issue_id}
                    className="border border-gray-600 hover:border-[#676EBB] text-sm px-3 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* Inline note input, appears when resolving or rejecting this issue */}
              {notePrompt?.issueId === issue.issue_id && (
                <div className="mt-3 border border-gray-600 rounded p-3">
                  <p className="text-sm text-gray-300 mb-2">
                    Add a note for &ldquo;{notePrompt.status.replace("_", " ")}
                    &rdquo;:
                  </p>
                  <textarea
                    className="w-full bg-transparent border border-gray-600 rounded p-2 text-sm text-white focus:outline-none focus:border-[#676EBB]"
                    rows={2}
                    placeholder="Optional note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() =>
                        submitStatusUpdate(
                          issue.issue_id,
                          notePrompt.status,
                          noteText || undefined,
                        )
                      }
                      disabled={updating === issue.issue_id}
                      className="bg-[#4A4680] hover:bg-[#3D396B] text-sm px-4 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      {updating === issue.issue_id ? "Updating..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => {
                        setNotePrompt(null);
                        setNoteText("");
                      }}
                      className="text-sm text-gray-400 hover:text-white px-3 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
