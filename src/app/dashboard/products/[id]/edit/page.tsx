"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  getUserRole,
  getProductTraceability,
  updateProduct,
  createStage,
  updateStage,
  createClaim,
  createEvidence,
  type Product,
  type Stage,
  type ClaimWithEvidence,
} from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Product fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("food");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  // Related data
  const [stages, setStages] = useState<Stage[]>([]);
  const [claims, setClaims] = useState<ClaimWithEvidence[]>([]);

  // Form toggles
  const [showAddStage, setShowAddStage] = useState(false);
  const [showAddClaim, setShowAddClaim] = useState(false);
  const [addEvidenceForClaim, setAddEvidenceForClaim] = useState<string | null>(null);
  const [editingStage, setEditingStage] = useState<string | null>(null);

  const loadProduct = useCallback(async (t: string, pid: string) => {
    const data = await getProductTraceability(pid);
    setName(data.product.name);
    setCategory(data.product.category);
    setBrand(data.product.brand ?? "");
    setDescription(data.product.description ?? "");
    setImage(data.product.image ?? "");
    setStages(data.stages);
    setClaims(data.claims);
  }, []);

  useEffect(() => {
    async function init() {
      const { id } = await params;
      setProductId(id);

      const { data } = await supabase.auth.getSession();
      const t = data.session?.access_token;
      if (!t) { router.replace("/login"); return; }
      try {
        const { role } = await getUserRole(t);
        if (role !== "verifier") { router.replace("/"); return; }
      } catch {
        router.replace("/");
        return;
      }
      setToken(t);

      try {
        await loadProduct(t, id);
      } catch {
        setMessage({ text: "Failed to load product", type: "error" });
      }
      setLoading(false);
    }
    init();
  }, [params, router, loadProduct]);

  function flash(text: string, type: "success" | "error") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !productId) return;
    setSaving(true);
    try {
      await updateProduct(token, productId, {
        name: name.trim(),
        category,
        brand: brand.trim() || undefined,
        description: description.trim() || undefined,
        image: image.trim() || undefined,
      });
      flash("Product updated", "success");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to update", "error");
    }
    setSaving(false);
  }

  async function handleAddStage(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !productId) return;
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    setSaving(true);
    try {
      await createStage(token, productId, {
        stage_type: fd.get("stage_type") as string,
        location_country: (fd.get("location_country") as string) || undefined,
        location_region: (fd.get("location_region") as string) || undefined,
        description: (fd.get("description") as string) || undefined,
        start_date: (fd.get("start_date") as string) || undefined,
        end_date: (fd.get("end_date") as string) || undefined,
        sequence_order: fd.get("sequence_order") ? Number(fd.get("sequence_order")) : undefined,
      });
      await loadProduct(token, productId);
      setShowAddStage(false);
      form.reset();
      flash("Stage added", "success");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to add stage", "error");
    }
    setSaving(false);
  }

  async function handleUpdateStage(e: React.FormEvent, stageId: string) {
    e.preventDefault();
    if (!token || !productId) return;
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    setSaving(true);
    try {
      await updateStage(token, productId, stageId, {
        stage_type: (fd.get("stage_type") as string) || undefined,
        location_country: (fd.get("location_country") as string) || undefined,
        location_region: (fd.get("location_region") as string) || undefined,
        description: (fd.get("description") as string) || undefined,
        start_date: (fd.get("start_date") as string) || undefined,
        end_date: (fd.get("end_date") as string) || undefined,
        sequence_order: fd.get("sequence_order") ? Number(fd.get("sequence_order")) : undefined,
      });
      await loadProduct(token, productId);
      setEditingStage(null);
      flash("Stage updated", "success");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to update stage", "error");
    }
    setSaving(false);
  }

  async function handleAddClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !productId) return;
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    setSaving(true);
    try {
      await createClaim(token, productId, {
        claim_type: fd.get("claim_type") as string,
        claim_text: fd.get("claim_text") as string,
        rationale: fd.get("rationale") as string,
      });
      await loadProduct(token, productId);
      setShowAddClaim(false);
      form.reset();
      flash("Claim added", "success");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to add claim", "error");
    }
    setSaving(false);
  }

  async function handleAddEvidence(e: React.FormEvent, claimId: string) {
    e.preventDefault();
    if (!token || !productId) return;
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    setSaving(true);
    try {
      await createEvidence(token, productId, claimId, {
        type: fd.get("type") as string,
        issuer: fd.get("issuer") as string,
        evidence_date: (fd.get("evidence_date") as string) || undefined,
        summary: (fd.get("summary") as string) || undefined,
        file_reference: (fd.get("file_reference") as string) || undefined,
      });
      await loadProduct(token, productId);
      setAddEvidenceForClaim(null);
      form.reset();
      flash("Evidence added", "success");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to add evidence", "error");
    }
    setSaving(false);
  }

  if (loading) {
    return <main className="max-w-3xl mx-auto p-6"><p>Loading...</p></main>;
  }

  const inputClass = "w-full border border-gray-600 rounded px-3 py-2 bg-transparent";

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Link href="/dashboard" className="text-sm text-[#676EBB] hover:underline">
        &larr; Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-2">Edit Product</h1>

      {message && (
        <p className={`mb-4 text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </p>
      )}

      {/* Product details form */}
      <form onSubmit={handleUpdateProduct} className="space-y-4 mb-10">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputClass} bg-[#1F1E28]`}>
            <option value="food">Food</option>
            <option value="luxury">Luxury</option>
            <option value="supplements">Supplements</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Brand</label>
          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm mb-1">Image URL</label>
          <input type="text" value={image} onChange={(e) => setImage(e.target.value)} className={inputClass} />
        </div>
        <button type="submit" disabled={saving} className="bg-[#676EBB] hover:bg-[#4A4680] disabled:opacity-50 text-white px-6 py-2 rounded transition-colors">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Stages section */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Stages</h2>
          <button
            onClick={() => setShowAddStage(!showAddStage)}
            className="text-sm text-[#676EBB] hover:underline"
          >
            {showAddStage ? "Cancel" : "+ Add Stage"}
          </button>
        </div>

        {showAddStage && (
          <form onSubmit={handleAddStage} className="border border-gray-700 rounded p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1">Stage Type *</label>
                <input name="stage_type" required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs mb-1">Sequence Order</label>
                <input name="sequence_order" type="number" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs mb-1">Country</label>
                <input name="location_country" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs mb-1">Region</label>
                <input name="location_region" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs mb-1">Start Date</label>
                <input name="start_date" type="date" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs mb-1">End Date</label>
                <input name="end_date" type="date" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1">Description</label>
              <textarea name="description" rows={2} className={inputClass} />
            </div>
            <button type="submit" disabled={saving} className="bg-[#676EBB] hover:bg-[#4A4680] disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm transition-colors">
              {saving ? "Adding..." : "Add Stage"}
            </button>
          </form>
        )}

        {stages.length === 0 ? (
          <p className="text-gray-400 text-sm">No stages yet.</p>
        ) : (
          <div className="space-y-2">
            {stages.map((s) => (
              <div key={s.stage_id} className="border border-gray-700 rounded p-3">
                {editingStage === s.stage_id ? (
                  <form onSubmit={(e) => handleUpdateStage(e, s.stage_id)} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs mb-1">Stage Type</label>
                        <input name="stage_type" defaultValue={s.stage_type} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Sequence Order</label>
                        <input name="sequence_order" type="number" defaultValue={s.sequence_order ?? ""} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Country</label>
                        <input name="location_country" defaultValue={s.location_country ?? ""} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Region</label>
                        <input name="location_region" defaultValue={s.location_region ?? ""} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Start Date</label>
                        <input name="start_date" type="date" defaultValue={s.start_date ?? ""} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">End Date</label>
                        <input name="end_date" type="date" defaultValue={s.end_date ?? ""} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Description</label>
                      <textarea name="description" rows={2} defaultValue={s.description ?? ""} className={inputClass} />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={saving} className="bg-[#676EBB] hover:bg-[#4A4680] disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm transition-colors">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingStage(null)} className="text-sm text-gray-400 hover:text-white">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{s.stage_type}</p>
                      <p className="text-sm text-gray-400">
                        {[s.location_region, s.location_country].filter(Boolean).join(", ") || "No location"}
                        {s.sequence_order != null && ` (order: ${s.sequence_order})`}
                      </p>
                      {s.description && <p className="text-sm text-gray-500 mt-1">{s.description}</p>}
                    </div>
                    <button onClick={() => setEditingStage(s.stage_id)} className="text-sm text-[#676EBB] hover:underline">
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Claims section */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Claims</h2>
          <button
            onClick={() => setShowAddClaim(!showAddClaim)}
            className="text-sm text-[#676EBB] hover:underline"
          >
            {showAddClaim ? "Cancel" : "+ Add Claim"}
          </button>
        </div>

        {showAddClaim && (
          <form onSubmit={handleAddClaim} className="border border-gray-700 rounded p-4 mb-4 space-y-3">
            <p className="text-xs text-gray-400">New claims start as unverified. Add evidence, then verify from the claims review page.</p>
            <div>
              <label className="block text-xs mb-1">Claim Type *</label>
              <input name="claim_type" required placeholder="e.g. organic, fair_trade" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs mb-1">Claim Text *</label>
              <textarea name="claim_text" required rows={2} placeholder="Describe the claim" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs mb-1">Rationale *</label>
              <textarea name="rationale" required rows={2} placeholder="Why is this claim being made?" className={inputClass} />
            </div>
            <button type="submit" disabled={saving} className="bg-[#676EBB] hover:bg-[#4A4680] disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm transition-colors">
              {saving ? "Adding..." : "Add Claim"}
            </button>
          </form>
        )}

        {claims.length === 0 ? (
          <p className="text-gray-400 text-sm">No claims yet.</p>
        ) : (
          <div className="space-y-3">
            {claims.map(({ claim, evidence }) => (
              <div key={claim.claim_id} className="border border-gray-700 rounded p-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">{claim.claim_type}</p>
                    <p className="font-medium">{claim.claim_text}</p>
                    {claim.rationale && <p className="text-sm text-gray-400 mt-1">{claim.rationale}</p>}
                  </div>
                  <span className="text-xs border px-2 py-1 rounded whitespace-nowrap">
                    {claim.confidence_label.replace("_", " ")}
                  </span>
                </div>

                {/* Evidence list */}
                {evidence.length > 0 && (
                  <div className="mt-3 border-t border-gray-700 pt-3 space-y-2">
                    <p className="text-xs text-gray-500">{evidence.length} evidence item{evidence.length !== 1 ? "s" : ""}</p>
                    {evidence.map((ev) => (
                      <div key={ev.evidence_id} className="border border-gray-700 rounded p-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{ev.type}</span>
                          {ev.evidence_date && <span className="text-gray-500">{ev.evidence_date}</span>}
                        </div>
                        <p className="text-gray-400">Issuer: {ev.issuer}</p>
                        {ev.summary && <p className="text-gray-500">{ev.summary}</p>}
                        {ev.file_reference && (
                          <a href={ev.file_reference} target="_blank" rel="noopener noreferrer" className="text-[#676EBB] underline text-xs">
                            View document
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add evidence form */}
                {addEvidenceForClaim === claim.claim_id ? (
                  <form onSubmit={(e) => handleAddEvidence(e, claim.claim_id)} className="mt-3 border-t border-gray-700 pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs mb-1">Type *</label>
                        <input name="type" required placeholder="e.g. certificate, audit_report" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Issuer *</label>
                        <input name="issuer" required placeholder="e.g. Fair Trade USA" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Date</label>
                        <input name="evidence_date" type="date" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">File/URL</label>
                        <input name="file_reference" placeholder="Link to document" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Summary</label>
                      <textarea name="summary" rows={2} className={inputClass} />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={saving} className="bg-[#676EBB] hover:bg-[#4A4680] disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm transition-colors">
                        Add Evidence
                      </button>
                      <button type="button" onClick={() => setAddEvidenceForClaim(null)} className="text-sm text-gray-400 hover:text-white">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setAddEvidenceForClaim(claim.claim_id)}
                    className="mt-3 text-sm text-[#676EBB] hover:underline"
                  >
                    + Add Evidence
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
