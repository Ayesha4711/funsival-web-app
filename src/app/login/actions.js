"use server";

import { loginApi } from "@/lib/api";
import { setAuthToken } from "@/lib/auth";

export async function loginAction(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const { data, ok } = await loginApi({ email, password });

  if (!ok) {
    const message = data?.message ?? data?.error ?? "Invalid email or password.";
    return { error: message };
  }

  const token =
    data?.token ?? data?.accessToken ?? data?.access_token ??
    data?.data?.token ?? data?.data?.accessToken;

  if (!token) {
    return { error: "Login succeeded but no token was returned." };
  }

  // Set httpOnly cookie (server-side session)
  await setAuthToken(token);

  // Return token + success message so the client can store it in localStorage
  // and show a toast before redirecting
  const message = data?.message ?? "Welcome back! You're signed in.";
  return { success: true, token, message };
}
