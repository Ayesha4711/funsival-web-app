const BASE_URL = "https://q11glw60-3000.inc1.devtunnels.ms";

/**
 * Thin fetch wrapper that prepends the base URL and always
 * sends/expects JSON.
 *
 * @param {string} path  - e.g. "/api/v1/auth/login"
 * @param {RequestInit} options
 * @returns {Promise<{ data: any, status: number }>}
 */
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
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
    body: JSON.stringify(credentials),
  });
}
