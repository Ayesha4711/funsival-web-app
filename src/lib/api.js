export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://funsival-backend-twvuq.ondigitalocean.app";

/**
 * Thin fetch wrapper that prepends the base URL and always
 * sends/expects JSON.
 *
 * @param {string} path  - e.g. "/api/v1/auth/login"
 * @param {RequestInit} options
 * @returns {Promise<{ data: any, status: number }>}
 */
export async function apiFetch(path, options = {}) {
  let token = null;
  if (typeof window !== "undefined") {
    // Client-side: try localStorage or document.cookie
    token = localStorage.getItem("auth-token");
    if (!token) {
      const match = document.cookie.match(/(^|;)\s*auth-token\s*=\s*([^;]+)/);
      token = match ? match[2] : null;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  });

  let data = null;
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  }

  return { data, status: res.status, ok: res.ok };
}

/**
 * POST /api/v1/auth/login
 *
 * @param {{ email: string, password: string }} credentials
 */
export async function loginApi(credentials) {
  return apiFetch("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });
}

/**
 * POST /api/v1/users/preferences
 *
 * @param {{ amenities: string[], equipment: string[], services: string[] }} preferences
 */
export async function savePreferences(preferences) {
  return apiFetch("/api/v1/users/preferences", {
    method: "POST",
    body: JSON.stringify(preferences)
  });
}

/**
 * POST /api/v1/listings
 * Creates a new listing for the authenticated provider.
 *
 * @param {object} payload - Listing payload matching API contract
 */
export async function createListing(payload) {
  return apiFetch("/api/v1/listings", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * GET /api/v1/listings
 * Fetches all listings for the authenticated provider.
 */
export async function getListings() {
  return apiFetch("/api/v1/listings");
}

// ─── Draft listing APIs ───────────────────────────────────────────────────────

/**
 * POST /api/v1/listings/draft
 * Saves or updates the in-progress listing draft.
 *
 * @param {{ currentStep: number, [key: string]: any }} payload
 */
export async function saveDraft(payload) {
  return apiFetch("/api/v1/listings/draft", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * GET /api/v1/listings/draft
 * Retrieves the current draft for the authenticated provider.
 */
export async function getDraft() {
  return apiFetch("/api/v1/listings/draft");
}

/**
 * DELETE /api/v1/listings/draft
 * Discards the current draft (called after publish or explicit discard).
 */
export async function deleteDraft() {
  return apiFetch("/api/v1/listings/draft", { method: "DELETE" });
}

/**
 * POST /api/v1/auth/google
 *
 * @param {{ idToken: string, role: string, city: string, agencyName: string }} payload
 */
export async function loginWithGoogle(payload) {
  return apiFetch("/api/v1/auth/google", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
