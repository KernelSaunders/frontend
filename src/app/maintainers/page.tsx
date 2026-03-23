"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getAuditLogs, getUserRole, type ChangeLogEntry } from "@/lib/api";

function getAction(entry: ChangeLogEntry) {
  if (entry.change_summary && typeof entry.change_summary === "object" && "action" in entry.change_summary) {
    const action = entry.change_summary.action;
    if (typeof action === "string") {
      return action;
    }
  }
  return "-";
}

export default function MaintainersPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ChangeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPage() {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const { role } = await getUserRole(token);
        if (role !== "maintainer") {
          router.replace("/");
          return;
        }

        const auditLogs = await getAuditLogs(token);
        setLogs(auditLogs);
      } catch {
        setError("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [router]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-6">
        <p>Loading maintainer dashboard...</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-900">Maintainer Dashboard</h1>
      <p className="mt-2 text-slate-600">View audit log activity across the system.</p>

      <section className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : logs.length === 0 ? (
          <p className="text-slate-600">No audit log entries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-slate-600">
                  <th className="pb-3 pr-4 font-medium">Time</th>
                  <th className="pb-3 pr-4 font-medium">Entity</th>
                  <th className="pb-3 pr-4 font-medium">Action</th>
                  <th className="pb-3 pr-4 font-medium">Product</th>
                  <th className="pb-3 pr-4 font-medium">Changed by</th>
                  <th className="pb-3 font-medium">Summary</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((entry) => (
                  <tr key={entry.log_id} className="border-b border-gray-100 align-top text-slate-900">
                    <td className="py-3 pr-4 whitespace-nowrap text-slate-600">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">{entry.entity_type}</td>
                    <td className="py-3 pr-4">{getAction(entry)}</td>
                    <td className="py-3 pr-4">
                      {entry.product ? (
                        <a href={entry.product.product_link} className="text-emerald-600 hover:underline">
                          {entry.product.product_name}
                        </a>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{entry.changed_by ?? "-"}</td>
                    <td className="py-3 text-slate-600">
                      <pre className="whitespace-pre-wrap break-words font-sans text-xs">
                        {entry.change_summary ? JSON.stringify(entry.change_summary, null, 2) : "-"}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
