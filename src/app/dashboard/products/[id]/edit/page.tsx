"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  getEvidenceFileUrl,
  getProductEvidence,
  getProductStageEvidence,
  getUserRole,
  getProductTraceability,
  updateProduct,
  createStage,
  updateStage,
  createClaim,
  uploadEvidence,
  type Stage,
  type ClaimWithEvidence,
  type Evidence,
} from "@/lib/api";
import { Button } from "@/components/Button";
import { hasVerifierAccess } from "@/lib/roles";

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
  const [stageEvidence, setStageEvidence] = useState<Record<string, Evidence[]>>({});

  // Form toggles
  const [showAddStage, setShowAddStage] = useState(false);
  const [showAddClaim, setShowAddClaim] = useState(false);
  const [addEvidenceForClaim, setAddEvidenceForClaim] = useState<string | null>(null);
  const [addEvidenceForStage, setAddEvidenceForStage] = useState<string | null>(null);
  const [editingStage, setEditingStage] = useState<string | null>(null);

  const loadProduct = useCallback(async (pid: string) => {
    const [data, claimEvidence, stageEvidenceData] = await Promise.all([
      getProductTraceability(pid),
      getProductEvidence(pid),
      getProductStageEvidence(pid),
    ]);
    const claimEvidenceMap = new Map(
      claimEvidence.groups.map((group) => [group.claim_id, group.evidence])
    );
    const stageEvidenceMap = Object.fromEntries(
      stageEvidenceData.groups.map((group) => [group.stage_id, group.evidence])
    );
    setName(data.product.name);
    setCategory(data.product.category);
    setBrand(data.product.brand ?? "");
    setDescription(data.product.description ?? "");
    setImage(data.product.image ?? "");
    setStages(data.stages);
    setClaims(data.claims.map((c) => ({ claim: c, evidence: claimEvidenceMap.get(c.claim_id) ?? [] })));
    setStageEvidence(stageEvidenceMap);
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
        if (!hasVerifierAccess(role)) { router.replace("/"); return; }
      } catch {
        router.replace("/");
        return;
      }
      setToken(t);

      try {
        await loadProduct(id);
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
      await loadProduct(productId);
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
      await loadProduct(productId);
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
      await loadProduct(productId);
      setShowAddClaim(false);
      form.reset();
      flash("Claim added", "success");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to add claim", "error");
    }
    setSaving(false);
  }

  async function handleUploadEvidence(
    e: React.FormEvent,
    target: { claim_id: string } | { stage_id: string },
  ) {
    e.preventDefault();
    if (!token || !productId) return;
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);

    setSaving(true);
    try {
      const file = fd.get("file");
      if (!(file instanceof File) || file.size === 0) {
        throw new Error("Please choose a file to upload");
      }
      await uploadEvidence(token, productId, {
        file,
        type: fd.get("type") as string,
        issuer: fd.get("issuer") as string,
        date: (fd.get("date") as string) || undefined,
        summary: (fd.get("summary") as string) || undefined,
        ...target,
      });
      await loadProduct(productId);
      setAddEvidenceForClaim(null);
      setAddEvidenceForStage(null);
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
      <Link href="/dashboard" className="text-sm text-emerald-600 hover:underline">
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
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      {/* Stages section */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Stages</h2>
            <button
            onClick={() => setShowAddStage(!showAddStage)}
            className="text-sm text-emerald-600 hover:underline"
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
            <Button type="submit" disabled={saving} className="h-10 text-sm">
              {saving ? "Adding..." : "Add Stage"}
            </Button>
          </form>
        )}

        {stages.length === 0 ? (
          <p className="text-gray-400 text-sm">No stages yet.</p>
        ) : (
          <div className="space-y-2">
            {stages.map((s) => {
              const evidenceItems = stageEvidence[s.stage_id] ?? [];
              return (
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
                      <Button type="submit" disabled={saving} className="h-10 text-sm">Save</Button>
                      <button type="button" onClick={() => setEditingStage(null)} className="text-sm text-gray-400 hover:text-gray-200">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-medium">{s.stage_type}</p>
                      <p className="text-sm text-gray-400">
                        {[s.location_region, s.location_country].filter(Boolean).join(", ") || "No location"}
                        {s.sequence_order != null && ` (order: ${s.sequence_order})`}
                      </p>
                      {s.description && <p className="text-sm text-gray-500 mt-1">{s.description}</p>}

                      {evidenceItems.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-gray-700 pt-3">
                          <p className="text-xs text-gray-500">
                            {evidenceItems.length} evidence item
                            {evidenceItems.length !== 1 ? "s" : ""}
                          </p>
                          {evidenceItems.map((ev) => {
                            const fileUrl = getEvidenceFileUrl(ev.file_reference);
                            return (
                              <div key={ev.evidence_id} className="border border-gray-700 rounded p-2 text-sm">
                                <div className="flex justify-between gap-2">
                                  <span className="font-medium">{ev.type}</span>
                                  {ev.evidence_date && <span className="text-gray-500">{ev.evidence_date}</span>}
                                </div>
                                <p className="text-gray-400">Issuer: {ev.issuer}</p>
                                {ev.summary && <p className="text-gray-500">{ev.summary}</p>}
                                {fileUrl && (
                                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline text-xs">
                                    View document
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => setEditingStage(s.stage_id)} className="text-sm text-emerald-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => setAddEvidenceForStage(addEvidenceForStage === s.stage_id ? null : s.stage_id)} className="text-sm text-emerald-600 hover:underline">
                        {addEvidenceForStage === s.stage_id ? "Cancel upload" : "+ Add Evidence"}
                      </button>
                    </div>
                  </div>
                )}

                {editingStage !== s.stage_id && addEvidenceForStage === s.stage_id && (
                  <form onSubmit={(e) => handleUploadEvidence(e, { stage_id: s.stage_id })} className="mt-3 border-t border-gray-700 pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs mb-1">Type *</label>
                        <input name="type" required placeholder="e.g. audit_report" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Issuer *</label>
                        <input name="issuer" required placeholder="e.g. Supplier" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Date</label>
                        <input name="date" type="date" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">File *</label>
                        <input name="file" type="file" accept=".pdf,.txt,text/plain,application/pdf" required className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Summary</label>
                      <textarea name="summary" rows={2} className={inputClass} />
                    </div>
                    <p className="text-xs text-gray-500">PDF or text file only, maximum size 1MB.</p>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving} className="h-10 text-sm">
                        Upload Evidence
                      </Button>
                      <button type="button" onClick={() => setAddEvidenceForStage(null)} className="text-sm text-gray-400 hover:text-white">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Claims section */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Claims</h2>
          <button
            onClick={() => setShowAddClaim(!showAddClaim)}
            className="text-sm text-emerald-600 hover:underline"
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
            <Button type="submit" disabled={saving} className="h-10 text-sm">
              {saving ? "Adding..." : "Add Claim"}
            </Button>
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
                    {evidence.map((ev) => {
                      const fileUrl = getEvidenceFileUrl(ev.file_reference);
                      return (
                      <div key={ev.evidence_id} className="border border-gray-700 rounded p-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{ev.type}</span>
                          {ev.evidence_date && <span className="text-gray-500">{ev.evidence_date}</span>}
                        </div>
                        <p className="text-gray-400">Issuer: {ev.issuer}</p>
                        {ev.summary && <p className="text-gray-500">{ev.summary}</p>}
                        {fileUrl && (
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline text-xs">
                            View document
                          </a>
                        )}
                      </div>
                      );
                    })}
                  </div>
                )}

                {/* Add evidence form */}
                {addEvidenceForClaim === claim.claim_id ? (
                  <form onSubmit={(e) => handleUploadEvidence(e, { claim_id: claim.claim_id })} className="mt-3 border-t border-gray-700 pt-3 space-y-3">
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
                        <input name="date" type="date" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">File *</label>
                        <input name="file" type="file" accept=".pdf,.txt,text/plain,application/pdf" required className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Summary</label>
                      <textarea name="summary" rows={2} className={inputClass} />
                    </div>
                    <p className="text-xs text-gray-500">PDF or text file only, maximum size 1MB.</p>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving} className="h-10 text-sm">
                        Add Evidence
                      </Button>
                      <button type="button" onClick={() => setAddEvidenceForClaim(null)} className="text-sm text-gray-400 hover:text-white">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setAddEvidenceForClaim(claim.claim_id)}
                    className="mt-3 text-sm text-emerald-600 hover:underline"
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
