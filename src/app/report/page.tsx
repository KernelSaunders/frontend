"use client";

import { useState, useEffect } from "react";
import { getProducts, submitIssue, Product } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/Button";

export default function Report() {
  // form field state
  const [productId, setProductId] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");

  // data & UI state
  const [products, setProducts] = useState<Product[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount: load the product list and grab the session token (if logged in)
  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => {});

    supabase.auth.getSession().then(({ data }) => {
      // data.session is null when the user isn't logged in — that's fine,
      // we just won't send an auth header and the report will be anonymous
      setToken(data.session?.access_token ?? null);
    });
  }, []);

  // Disable submit until the user has picked a product, type, and typed a description
  const canSubmit =
    productId !== "" && issueType !== "" && description.trim() !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // prevent the browser's default form navigation
    setError(null);
    setSubmitting(true);

    try {
      await submitIssue(
        { product_id: productId, type: issueType, description },
        token ?? undefined, // pass the token only if the user is logged in
      );
      setSuccess(true); // flip to the "thank you" screen
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  //  Success screen — shown after a successful submission
  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-5">
        <div className="w-full max-w-xl">
          <h1 className="text-2xl font-bold text-center mb-4">Thank you!</h1>
          <p className="text-center text-gray-600 mb-6">
            Your report has been submitted. A verifier will review it soon.
          </p>
          <Button onClick={() => {
              // Reset everything so the user can file another report
              setSuccess(false);
              setProductId("");
              setIssueType("");
              setDescription("");
            }} className="w-full">
            Submit another report
          </Button>
        </div>
      </main>
    );
  }

  // Main form
  return (
    <main className="min-h-screen flex mt-10 justify-center p-5">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-bold text-center mb-8">Report an issue</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product picker */}
          <div>
            <label htmlFor="product" className="block text-sm font-medium mb-1">Product:</label>
            <select
              id="product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Issue type */}
          <div>
            <label htmlFor="issueType" className="block text-sm font-medium mb-1">Type:</label>
            <select
              id="issueType"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select a type</option>
              <option value="claim_false">Wrong claim</option>
              <option value="evidence_missing">Missing evidence</option>
              <option value="data_incorrect">Incorrect data</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="desc" className="block text-sm font-medium mb-1">Details:</label>
            <textarea
              id="desc"
              rows={5}
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          {/* Error banner */}
          {error && (
            <p className="text-red-500 text-center">
              {error}
            </p>
          )}

          {/* Submit button */}
          <Button type="submit" disabled={!canSubmit || submitting} className="w-full">
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </div>
    </main>
  );
}
