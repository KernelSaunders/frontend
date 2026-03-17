"use client";

import { useState, useEffect } from "react";
import { getProducts, submitIssue, Product } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";

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
      <main className="reportpage">
        <div className="reportcontainer">
          <h1>Thank you!</h1>
          <p style={{ textAlign: "center", marginTop: 16 }}>
            Your report has been submitted. A verifier will review it soon.
          </p>
          <button
            type="button"
            className="reportsubmit"
            style={{ marginTop: 24 }}
            onClick={() => {
              // Reset everything so the user can file another report
              setSuccess(false);
              setProductId("");
              setIssueType("");
              setDescription("");
            }}
          >
            Submit another report
          </button>
        </div>
      </main>
    );
  }

  // Main form
  return (
    <main className="reportpage">
      <div className="reportcontainer">
        <h1>Report an issue</h1>

        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          {/* Product picker */}
          <div className="formrow" style={{ marginBottom: 16 }}>
            <label htmlFor="product">Product:</label>
            <select
              id="product"
              className="reportinput"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
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
          <div className="formrow" style={{ marginBottom: 16 }}>
            <label htmlFor="issueType">Type:</label>
            <select
              id="issueType"
              className="reportinput"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
            >
              <option value="">Select a type</option>
              <option value="claim_false">Wrong claim</option>
              <option value="evidence_missing">Missing evidence</option>
              <option value="data_incorrect">Incorrect data</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div className="formrow" style={{ marginBottom: 24 }}>
            <label htmlFor="desc">Details:</label>
            <textarea
              id="desc"
              className="reportinput"
              rows={5}
              placeholder="Describe the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Error banner */}
          {error && (
            <p
              style={{
                color: "#f87171",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="reportsubmit"
            disabled={!canSubmit || submitting}
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </main>
  );
}
