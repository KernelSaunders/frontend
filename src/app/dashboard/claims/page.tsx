"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { getUserRole, getPendingClaims, verifyClaim, type Claim } from "@/lib/api";
import { Button } from "@/components/Button";

export default function ClaimsReviewPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      const t = data.session?.access_token;
      if (!t) { router.replace("/login"); return; }
      try {
        const { role } = await getUserRole(t);
        if (role !== "verifier" && role !== "maintainer") { router.replace("/"); return; }
      } catch {
        router.replace("/");
        return;
      }
      setToken(t);

      try {
        const pending = await getPendingClaims();
        setClaims(pending);
      } catch {
        setMessage({ text: "Failed to load claims", type: "error" });
      }
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleVerify(claim: Claim) {
    if (!token || !claim.product_id) return;
    setVerifying(claim.claim_id);
    try {
      await verifyClaim(claim.product_id, claim.claim_id);
      setClaims((prev) => prev.filter((c) => c.claim_id !== claim.claim_id));
      setMessage({ text: `Claim verified: "${claim.claim_text}"`, type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Failed to verify",
        type: "error",
      });
    }
    setVerifying(null);
  }

  if (loading) {
    return <main className="max-w-3xl mx-auto p-6"><p>Loading...</p></main>;
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Link href="/dashboard" className="text-sm text-emerald-600 hover:underline">
        &larr; Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">Pending Claims Review</h1>

      {message && (
        <p className={`mb-4 text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </p>
      )}

      {claims.length === 0 ? (
        <p className="text-gray-400">All claims have been reviewed.</p>
      ) : (
        <div className="space-y-3">
          {claims.map((c) => (
            <div key={c.claim_id} className="border border-gray-700 rounded p-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">{c.claim_type}</p>
                  <p className="font-medium">{c.claim_text}</p>
                  {c.rationale && (
                    <p className="text-sm text-gray-400 mt-1">{c.rationale}</p>
                  )}
                  {c.product_id && (
                    <p className="text-xs text-gray-500 mt-1">Product: {c.product_id}</p>
                  )}
                </div>
                <span className="text-xs border px-2 py-1 rounded whitespace-nowrap">
                  {c.confidence_label.replace("_", " ")}
                </span>
              </div>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => handleVerify(c)}
                  disabled={verifying === c.claim_id}
                  className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm transition-colors"
                >
                  {verifying === c.claim_id ? "Verifying..." : "Verify"}
                </button>
                {c.product_id && (
                  <Link
                    href={`/dashboard/products/${c.product_id}/edit`}
                    className="text-sm text-emerald-600 hover:underline flex items-center"
                  >
                    View Product
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
