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

// --- Verifier API functions ---

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getUserRole(token: string): Promise<{ user_id: string; role: string }> {
  const res = await fetch(`${API_BASE}/users/me/role`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch role");
  return res.json();
}

export async function createProduct(
  token: string,
  data: { name: string; category: string; brand?: string; description?: string; image?: string }
): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function updateProduct(
  token: string,
  productId: string,
  data: { name?: string; category?: string; brand?: string; description?: string; image?: string }
): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${productId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function createStage(
  token: string,
  productId: string,
  data: {
    stage_type: string;
    location_country?: string;
    location_region?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    sequence_order?: number;
  }
): Promise<Stage> {
  const res = await fetch(`${API_BASE}/products/${productId}/stages`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create stage");
  return res.json();
}

export async function updateStage(
  token: string,
  productId: string,
  stageId: string,
  data: {
    stage_type?: string;
    location_country?: string;
    location_region?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    sequence_order?: number;
  }
): Promise<Stage> {
  const res = await fetch(`${API_BASE}/products/${productId}/stages/${stageId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update stage");
  return res.json();
}

export async function createClaim(
  token: string,
  productId: string,
  data: { claim_type: string; claim_text: string; rationale: string }
): Promise<Claim> {
  const res = await fetch(`${API_BASE}/products/${productId}/claims`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ ...data, confidence_label: "unverified" }),
  });
  if (!res.ok) throw new Error("Failed to create claim");
  return res.json();
}

export async function createEvidence(
  token: string,
  productId: string,
  claimId: string,
  data: {
    type: string;
    issuer: string;
    evidence_date?: string;
    summary?: string;
    file_reference?: string;
    stage_id?: string;
  }
): Promise<Evidence> {
  const res = await fetch(`${API_BASE}/products/${productId}/claims/${claimId}/evidence`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create evidence");
  return res.json();
}

export async function getPendingClaims(token: string): Promise<Claim[]> {
  const res = await fetch(`${API_BASE}/products/claims/pending`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch pending claims");
  return res.json();
}

export async function verifyClaim(
  token: string,
  productId: string,
  claimId: string,
  notes?: string
): Promise<{ status: string }> {
  const url = new URL(`${API_BASE}/products/${productId}/claims/${claimId}/verify`);
  if (notes) url.searchParams.set("notes", notes);
  const res = await fetch(url.toString(), {
    method: "PUT",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to verify claim" }));
    throw new Error(err.detail || "Failed to verify claim");
  }
  return res.json();
}

export interface IssueReport {
  issue_id: string;
  product_id: string;
  type: string;
  description: string;
  status: string;
  resolution_note: string | null;
  reported_by: string | null;
  created_at: string;
  updated_at: string;
}

export async function submitIssue(
  data: { product_id: string; type: string; description: string },
  token?: string
): Promise<IssueReport> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/issues`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit issue");
  return res.json();
}

export async function getIssues(
  token: string,
  filters?: { status?: string; product_id?: string }
): Promise<IssueReport[]> {
  const url = new URL(`${API_BASE}/issues`);
  if (filters?.status) url.searchParams.set("status", filters.status);
  if (filters?.product_id) url.searchParams.set("product_id", filters.product_id);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch issues");
  return res.json();
}

export async function updateIssue(
  token: string,
  issueId: string,
  data: { status: string; resolution_note?: string }
): Promise<IssueReport> {
  const res = await fetch(`${API_BASE}/issues/${issueId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update issue");
  return res.json();
}
