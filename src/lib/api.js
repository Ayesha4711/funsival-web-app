export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthToken() {
  if (typeof window === "undefined") return null;

  let token = localStorage.getItem("auth-token");
  if (!token) {
    const match = document.cookie.match(/(^|;)\s*auth-token\s*=\s*([^;]+)/);
    token = match ? match[2] : null;
  }
  return token;
}

/**
 * Thin fetch wrapper that prepends the base URL and always
 * sends/expects JSON.
 *
 * @param {string} path  - e.g. "/auth/login"
 * @param {RequestInit} options
 * @returns {Promise<{ data: any, status: number }>}
 */
export async function apiFetch(path, options = {}) {
  const token = getAuthToken();
  const body = options.body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
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
  return apiFetch("/auth/login", {
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
  return apiFetch("/users/preferences", {
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
  return apiFetch("/listings", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * GET /api/v1/listings
 * Fetches all listings for the authenticated provider with pagination.
 *
 * @param {number} page
 * @param {number} limit
 */
export async function getListings(page = 1, limit = 10) {
  return apiFetch(`/listings?page=${page}&limit=${limit}`);
}

// ─── Draft listing APIs ───────────────────────────────────────────────────────

/**
 * POST /api/v1/listings/draft
 * Saves or updates the in-progress listing draft.
 *
 * @param {{ currentStep: number, [key: string]: any }} payload
 */
export async function saveDraft(payload) {
  return apiFetch("/listings/draft", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * GET /api/v1/listings/draft
 * Retrieves the current draft for the authenticated provider.
 */
export async function getDraft() {
  return apiFetch("/listings/draft");
}

/**
 * DELETE /api/v1/listings/draft
 * Discards the current draft (called after publish or explicit discard).
 */
export async function deleteDraft() {
  return apiFetch("/listings/draft", { method: "DELETE" });
}

/**
 * GET /api/v1/listings/:listingId
 * Fetches a single listing by ID.
 *
 * @param {string} listingId
 */
export async function getListing(listingId) {
  return apiFetch(`/listings/${listingId}`);
}

/**
 * PATCH /api/v1/listings/:listingId
 * Updates an existing listing.
 *
 * @param {string} listingId
 * @param {object} payload
 */
export async function updateListing(listingId, payload) {
  return apiFetch(`/listings/${listingId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

/**
 * DELETE /api/v1/listings/:listingId
 * Deletes a listing.
 *
 * @param {string} listingId
 */
export async function deleteListing(listingId) {
  return apiFetch(`/listings/${listingId}`, { method: "DELETE" });
}

/**
 * POST /api/v1/auth/google
 *
 * @param {{ idToken: string, role: string, city: string, agencyName: string }} payload
 */
export async function loginWithGoogle(payload) {
  return apiFetch("/auth/google", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * GET /api/v1/auth/profile
 * Returns the authenticated user's profile.
 */
export async function getProfile() {
  return apiFetch("/auth/profile");
}
