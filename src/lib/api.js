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
