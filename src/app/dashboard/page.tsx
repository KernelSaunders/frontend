"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  getUserRole,
  getProducts,
  getPendingClaims,
  getIssues,
  type Product,
  type Claim,
  type IssueReport,
} from "@/lib/api";
import { Button } from "@/components/Button";

type Tab = "products" | "claims" | "issues";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("products");

  const [products, setProducts] = useState<Product[]>([]);
  const [pendingClaims, setPendingClaims] = useState<Claim[]>([]);
  const [issues, setIssues] = useState<IssueReport[]>([]);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const { role } = await getUserRole(token);
        if (role !== "verifier") {
          router.replace("/");
          return;
        }
      } catch {
        router.replace("/");
        return;
      }

      // Load all dashboard data in parallel
      const [prods, claims, issues] = await Promise.all([
        getProducts().catch(() => [] as Product[]),
        getPendingClaims().catch(() => [] as Claim[]),
        getIssues(token, { status: "open" }).catch(() => [] as IssueReport[]),
      ]);

      setProducts(prods);
      setPendingClaims(claims);
      setIssues(issues);
      setLoading(false);
    }

    init();
  }, [router]);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "products", label: "Products", count: products.length },
    { key: "claims", label: "Pending Claims", count: pendingClaims.length },
    { key: "issues", label: "Open Issues", count: issues.length },
  ];

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Verifier Dashboard</h1>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-gray-700">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
              tab === t.key
                ? "bg-emerald-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-emerald-600/20"
            }`}
          >
            {t.label}
            <span className="ml-2 text-xs opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Products tab */}
      {tab === "products" && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">All Products</h2>
            <Link href="/dashboard/products/new">
              <Button>+ Create New</Button>
            </Link>
          </div>
          {products.length === 0 ? (
            <p className="text-gray-400">No products yet.</p>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <div
                  key={p.product_id}
                  className="flex items-center justify-between border border-gray-700 rounded p-3"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-400">
                      {p.brand ?? "No brand"} &middot; {p.category}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/products/${p.product_id}/edit`}
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Pending Claims tab */}
      {tab === "claims" && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Claims Awaiting Review</h2>
          {pendingClaims.length === 0 ? (
            <p className="text-gray-400">No pending claims.</p>
          ) : (
            <div className="space-y-2">
              {pendingClaims.map((c) => (
                <div
                  key={c.claim_id}
                  className="border border-gray-700 rounded p-3"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">{c.claim_type}</p>
                      <p className="font-medium">{c.claim_text}</p>
                      {c.rationale && (
                        <p className="text-sm text-gray-400 mt-1">{c.rationale}</p>
                      )}
                    </div>
                    <span className="text-xs border px-2 py-1 rounded whitespace-nowrap">
                      {c.confidence_label.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Link
                      href={`/dashboard/claims`}
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Issues tab */}
      {tab === "issues" && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Open Issue Reports</h2>
          {issues.length === 0 ? (
            <p className="text-gray-400">No open issues.</p>
          ) : (
            <div className="space-y-2">
              {issues.map((issue) => (
                <div
                  key={issue.issue_id}
                  className="border border-gray-700 rounded p-3"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">{issue.type}</p>
                      <p className="font-medium">{issue.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Product: {issue.product_id}
                      </p>
                    </div>
                    <span className="text-xs border px-2 py-1 rounded whitespace-nowrap">
                      {issue.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Link
                      href="/dashboard/issues"
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
