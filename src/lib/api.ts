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
  change_summary?: Record<string, unknown> | null;
  created_at: string;
  product?: {
    product_id: string;
    product_name: string;
    product_link: string;
  } | null;
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

export interface StageEvidenceGroup {
  stage_id: string;
  stage_type: string;
  description: string | null;
  evidence: Evidence[];
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

export interface ProductStageEvidenceView {
  product_id: string;
  groups: StageEvidenceGroup[];
}

export interface ProductTraceability {
  product: Product;
  stages: Stage[];
  input_shares: InputShare[];
  claims: Claim[];
}

export interface UserRoleResponse {
  user_id: string;
  role: "consumer" | "verifier" | "maintainer"
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

interface QuestMissionBase {
  mission_id: string;
  product_id: string;
  tier: "basic" | "intermediate" | "advanced";
  question: string;
  explanation_link: string | null;
  created_at: string;
}

export interface MultipleChoiceQuestMission extends QuestMissionBase {
  type: "multiple_choice";
  options: string[];
}

export interface NumericQuestMission extends QuestMissionBase {
  type: "numeric";
}

export type QuestMission = MultipleChoiceQuestMission | NumericQuestMission;

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

export async function getProductStageEvidence(productId: string): Promise<ProductStageEvidenceView> {
  const res = await fetch(`${API_BASE}/products/${productId}/stage-evidence`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch stage evidence");
  return res.json();
}

// just getting evidence from public bucket
// files are stored in db as ref not url,
// so this herlper turns it into a full url
export function getEvidenceFileUrl(fileReference: string | null): string | null {
  if (!fileReference) return null;
  if (fileReference.startsWith("http://") || fileReference.startsWith("https://")) {
    return fileReference;
  }
  const { data } = supabase.storage.from("documents").getPublicUrl(fileReference);
  return data.publicUrl;
}

export async function getMissionsForProduct(productId: string): Promise<QuestMission[]> {
  const res = await fetch(`${API_BASE}/products/${productId}/missions`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch missions");
  return res.json();
}

export interface MissionAttemptResult {
  correct: boolean;
  points_awarded: number;
  completed: boolean;
  attempts: number | null;
}

export interface UserMissionProgress {
  mission_id: string;
  tier: "basic" | "intermediate" | "advanced";
  completed: boolean;
  score: number;
  attempts: number | null;
  completed_at: string | null;
}

export interface RecentMissionCompletion {
  mission_id: string;
  question: string;
  tier: "basic" | "intermediate" | "advanced";
  score: number;
  completed_at: string;
}

export interface MissionBadge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  progress_current: number;
  progress_target: number;
  icon: string;
}

export interface UserProgressSummary {
  user_id: string;
  total_completed: number;
  total_points: number;
  missions_completed_by_tier: {
    basic: number;
    intermediate: number;
    advanced: number;
  };
  missions: UserMissionProgress[];
  recent_completions: RecentMissionCompletion[];
  badges: MissionBadge[];
}

export async function attemptMission(
  missionId: string,
  attempt: { option_index: number } | { numeric_answer: number }
): Promise<MissionAttemptResult> {
  const res = await apiFetch(`/missions/${missionId}/attempts`, {
    method: "POST",
    body: JSON.stringify(attempt),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Sign in to save mission progress");
    throw new Error("Failed to submit attempt");
  }
  return res.json();
}

export async function getMyProgress(): Promise<UserProgressSummary> {
  const res = await apiFetch("/users/me/progress");
  if (!res.ok) {
    if (res.status === 401) throw new Error("Sign in to view progress");
    throw new Error("Failed to fetch progress");
  }
  return res.json();
}

// --- Dashboard CRUD functions (token-based auth) ---

function tokenAuthHeaders(token: string) {
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

export async function getAuditLogs(token: string, limit = 50): Promise<ChangeLogEntry[]> {
  const res = await fetch(`${API_BASE}/maintainers/audit-logs?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return res.json();
}

export async function createProduct(
  token: string,
  data: { name: string; category: string; brand?: string; description?: string; image?: string }
): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: tokenAuthHeaders(token),
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
    headers: tokenAuthHeaders(token),
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
    headers: tokenAuthHeaders(token),
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
    headers: tokenAuthHeaders(token),
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
    headers: tokenAuthHeaders(token),
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
    date?: string;
    summary?: string;
    file_reference?: string;
    stage_id?: string;
  }
): Promise<Evidence> {
  const res = await fetch(`${API_BASE}/products/${productId}/claims/${claimId}/evidence`, {
    method: "POST",
    headers: tokenAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create evidence");
  return res.json();
}

export async function uploadEvidence(
  token: string,
  productId: string,
  data: {
    file: File;
    type: string;
    issuer: string;
    date?: string;
    summary?: string;
    claim_id?: string;
    stage_id?: string;
  }
): Promise<Evidence> {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("type", data.type);
  formData.append("issuer", data.issuer);
  if (data.date) formData.append("date", data.date);
  if (data.summary) formData.append("summary", data.summary);
  if (data.claim_id) formData.append("claim_id", data.claim_id);
  if (data.stage_id) formData.append("stage_id", data.stage_id);

  const res = await fetch(`${API_BASE}/products/${productId}/evidence/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    let message = "Failed to upload evidence";
    try {
      const body = await res.json();
      message = body.detail || message;
    } catch {
      message = "Failed to upload evidence";
    }
    throw new Error(message);
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
    headers: tokenAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update issue");
  return res.json();
}
