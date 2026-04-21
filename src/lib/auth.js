"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "auth-token";

/** Persist the token returned by the API in an httpOnly cookie. */
export async function setAuthToken(token) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // 7 days
    maxAge: 60 * 60 * 24 * 7,
  });
}

/** Read the stored token (server-side only). */
export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

/** Remove the token cookie and redirect to login. */
export async function clearAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Remove the token cookie and redirect to login. */
export async function logout() {
  await clearAuthToken();
  redirect("/login");
}
