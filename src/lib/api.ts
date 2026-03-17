import { supabase } from "./supabaseClient";

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
  verified_by?: string | null
  verified_at?: string | null 
  verification_notes?: string | null 
  created_at: string;
  updated_at: string;
}

export interface ChangeLogEntry {
  log_id: string;
  entity_type: string;
  entity_id: string;
  changed_by?: string;
  timestamp: string;
  change_summary?: {
    action: string;
    old_confidence?: string;
    new_confidence?: string;
    verification_notes?: string;
    old_verified_status?: boolean;
    new_verified_status?: boolean;
  };
  created_at: string;
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
  rationale: string | null;
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
  claims: Claim[];
}

export interface UserRoleResponse {
  user_id: string;
  role: "consumer" | "verifier" //Will add more later
}

// Authenticate user sessions
async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}
/*
Either returns
{ "Content-Type": "application/json", "Authorization": "Bearer ..." } => Logged in
{ "Content-Type": "application/json" } => Not logged in
*/

// authenticated fetch wrapper
// Use for making authenticated API calls
// Note: ... = spread operator (copies all properties from what is after it)
async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = await authHeaders();
  
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
    cache: "no-store" 
  })
}

// Use function to get userRole
export async function getMyRole(): Promise<UserRoleResponse> {
  const res = await apiFetch("/users/me/role");
  if (!res.ok) throw new Error("Failed to fetch role");
  return res.json()

}

// Function to verify a claim
export async function verifyClaim(
  product_id: string,
  claim_id: string,
  notes?: string
): Promise<void> {
  // Tries to verify the claim - will only work if authenticated
  const res = await apiFetch(
    `/products/${product_id}/claims/${claim_id}/verify`,
    {
      method: "PUT",
      body: JSON.stringify({ notes }),
    }
  );
  // Error handling
  if (!res.ok) {
    if (res.status === 403) throw new Error("Verifier role required");
    if (res.status === 401) throw new Error("Not authenticated");
    throw new Error("Failed to verify claim");
  }
}

// Simillar function but to unverify
export async function unverifyClaim(
  product_id: string,
  claim_id: string,
  notes?: string
): Promise<void> {
  const res = await apiFetch(
    `/products/${product_id}/claims/${claim_id}/unverify`,
    {
      method: "PUT",
      body: JSON.stringify({ notes }),
    }
  );
  if (!res.ok) {
    if (res.status === 403) throw new Error("Verifier role required");
    if (res.status === 401) throw new Error("Not authenticated");
    throw new Error("Failed to unverify claim");
  }
}

// Function to change claim confidence
export async function updateClaimConfidence(
  product_id: string,
  claim_id: string,
  confidence_label: string,
  notes?: string
): Promise<void> {
  const res = await apiFetch(
    `/products/${product_id}/claims/${claim_id}/confidence`,
    {
      method: "PUT",
      body: JSON.stringify({ confidence_label: confidence_label, notes }),
    }
  );
  if (!res.ok) {
    if (res.status === 403) throw new Error("Verifier role required");
    if (res.status === 401) throw new Error("Not authenticated");
    throw new Error("Failed to update claim confidence");
  }
}

// Gets verification history for a claim
export async function getVerificationHistory(
  productId: string,
  claimId: string
): Promise<ChangeLogEntry[]> {
  const res = await apiFetch(
    `/products/${productId}/claims/${claimId}/history`
  );
  if (!res.ok) throw new Error("Failed to fetch verification history");
  return res.json();
}

// Fetch all claims that are not yet verified
export async function getPendingClaims(): Promise<Claim[]> {
  const res = await apiFetch("/products/claims/pending");
  if (!res.ok) throw new Error("Failed to fetch pending claims");
  return res.json();
}

export async function getProducts(): Promise<Product[]> {
  const maxRetries = 5;
  const baseDelay = 500;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${API_BASE}/products`, { cache: "no-store" });
      if (res.ok) return res.json();
    } catch {
      if (i === maxRetries - 1) throw new Error("Failed to fetch products");
    }
    await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, i)));
  }
  throw new Error("Failed to fetch products");
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

export async function getClaimEvidence(productId: string, claimId: string): Promise<ClaimEvidenceGroup> {
  const res = await fetch(`${API_BASE}/products/${productId}/claims/${claimId}/evidence`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch claim evidence");
  return res.json();
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

