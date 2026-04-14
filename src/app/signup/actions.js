"use server";

import { apiFetch } from "@/lib/api";
import { setAuthToken } from "@/lib/auth";

export async function signupHostAction(prevState, formData) {
  const agencyName = formData.get("agencyName");
  const email = formData.get("email");
  const city = formData.get("city");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const { data, ok } = await apiFetch("/api/v1/auth/signup/host", {
    method: "POST",
    body: JSON.stringify({ agencyName, email, city, password, confirmPassword })
  });

  if (!ok) {
    return {
      error: data?.message ?? data?.error ?? "Signup failed. Please try again."
    };
  }

  // Check if verification is required
  if (data?.data?.verificationRequired) {
    return {
      success: true,
      verificationRequired: true,
      email: data.data.email,
      message: data.message ?? "Verification OTP sent to your email."
    };
  }

  const token =
    data?.token ??
    data?.accessToken ??
    data?.access_token ??
    data?.data?.token ??
    data?.data?.accessToken;

  if (token) await setAuthToken(token);

  const message = data?.message ?? "Account created! Welcome to Funsival.";
  return { success: true, token: token ?? null, message };
}

export async function signupUserAction(prevState, formData) {
  const email = formData.get("email");
  const city = formData.get("city");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const { data, ok } = await apiFetch("/api/v1/auth/signup/user", {
    method: "POST",
    body: JSON.stringify({ email, city, password, confirmPassword })
  });

  if (!ok) {
    return {
      error: data?.message ?? data?.error ?? "Signup failed. Please try again."
    };
  }

  // Check if verification is required
  if (data?.data?.verificationRequired) {
    return {
      success: true,
      verificationRequired: true,
      email: data.data.email,
      message: data.message ?? "Verification OTP sent to your email."
    };
  }

  const token =
    data?.token ??
    data?.accessToken ??
    data?.access_token ??
    data?.data?.token ??
    data?.data?.accessToken;

  if (token) await setAuthToken(token);

  const message = data?.message ?? "Account created! Welcome to Funsival.";
  return { success: true, token: token ?? null, message };
}

export async function verifyEmailAction(prevState, formData) {
  const email = formData.get("email");
  const code = formData.get("otp");

  const { data, ok } = await apiFetch("/api/v1/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code })
  });

  if (!ok) {
    return {
      error:
        data?.message ?? data?.error ?? "Verification failed. Please try again."
    };
  }

  const token =
    data?.token ??
    data?.accessToken ??
    data?.access_token ??
    data?.data?.token ??
    data?.data?.accessToken;

  if (token) await setAuthToken(token);

  const message = data?.message ?? "Email verified successfully.";
  return { success: true, token: token ?? null, message };
}
