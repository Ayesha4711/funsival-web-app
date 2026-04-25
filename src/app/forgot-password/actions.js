"use server";

import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";

export async function resendVerificationAction(prevState, formData) {
  const email = formData.get("email");

  const { data, ok } = await apiFetch("/auth/resend-verification-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  if (!ok) {
    return { error: data?.message ?? data?.error ?? "Failed to resend. Please try again." };
  }

  return { success: true, message: data?.message ?? "Verification code resent successfully." };
}

export async function forgotPasswordAction(prevState, formData) {
  const email = formData.get("email");

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  const { data, ok } = await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  if (!ok) {
    return { error: data?.message ?? data?.error ?? "Something went wrong. Please try again." };
  }

  const message = data?.message ?? "Password reset link sent.";
  // Pass email + api message via search params so check-email page can display them
  redirect(`/forgot-password/check-email?email=${encodeURIComponent(email)}&msg=${encodeURIComponent(message)}`);
}

export async function resetPasswordAction(prevState, formData) {
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const token = formData.get("token");

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const { data, ok } = await apiFetch(`/auth/reset-password/${token}`, {
    method: "POST",
    body: JSON.stringify({ password, confirmPassword }),
  });

  if (!ok) {
    return { error: data?.message ?? data?.error ?? "Failed to reset password. The link may have expired." };
  }

  const message = data?.message ?? "Password reset successfully.";
  return { success: true, message };
}
