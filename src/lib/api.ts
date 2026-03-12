const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Product {
  product_id: string;
  name: string;
  category: "food" | "luxury" | "supplements" | "other";
  brand: string | null;
  description: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface Stage {
  stage_id: string;
  product_id: string | null;
  stage_type: string;
  location_country: string | null;
  location_region: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  sequence_order: number | null;
  created_at: string | null;
}

export interface InputShare {
  input_id: string;
  product_id: string | null;
  input_name: string;
  country: string;
  percentage: number | null;
  notes: string | null;
  created_at: string;
}

export interface Claim {
  claim_id: string;
  product_id: string | null;
  claim_type: string;
  claim_text: string;
  confidence_label: "verified" | "partially_verified" | "unverified";
  rationale: string | null;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  evidence_id: string;
  stage_id: string | null;
  claim_id: string | null;
  type: string;
  issuer: string;
  evidence_date: string | null;
  summary: string | null;
  file_reference: string | null;
  created_at: string;
}

export interface ClaimWithEvidence {
  claim: Claim;
  evidence: Evidence[];
}

export interface ClaimEvidenceGroup {
  claim_id: string;
  claim_type: string;
  claim_text: string;
  confidence_label: "verified" | "partially_verified" | "unverified";
  evidence: Evidence[];
}

export interface ProductEvidenceView {
  product_id: string;
  groups: ClaimEvidenceGroup[];
}

export interface ProductTraceability {
  product: Product;
  stages: Stage[];
  input_shares: InputShare[];
  claims: ClaimWithEvidence[];
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getProduct(productId: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${productId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

export async function getProductTraceability(productId: string): Promise<ProductTraceability> {
  const res = await fetch(`${API_BASE}/products/${productId}/traceability`, { cache: "no-store" });
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

export interface QuestMission {
  mission_id: string;
  product_id: string;
  tier: "basic" | "intermediate" | "advanced";
  question: string;
  type: "multiple_choice";
  options: string[];
  explanation_link: string | null;
  created_at: string;
}

export async function getProductEvidence(productId: string): Promise<ProductEvidenceView> {
  const res = await fetch(`${API_BASE}/products/${productId}/evidence`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch evidence");
  return res.json();
}

export async function getMissionsForProduct(productId: string): Promise<QuestMission[]> {
  const res = await fetch(`${API_BASE}/products/${productId}/missions`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch missions");
  return res.json();
}

export interface MissionAttemptResult {
  correct: boolean;
}

export async function attemptMission(
  missionId: string,
  option_index: number
): Promise<MissionAttemptResult> {
  const res = await fetch(`${API_BASE}/missions/${missionId}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ option_index }),
  });
  if (!res.ok) throw new Error("Failed to submit attempt");
  return res.json();
}
