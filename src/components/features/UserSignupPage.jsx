"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import AuthLayout from "@/components/layout/AuthLayout";
import { BASE_URL, loginWithGoogle } from "@/lib/api";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import Divider from "@/components/common/Divider";
import SocialButton from "@/components/common/SocialButton";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";


/* ─── Icons ─────────────────────────────────────────────────────────────────── */
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.167 17.0827H5.83366C3.33366 17.0827 1.66699 15.8327 1.66699 12.916V7.08268C1.66699 4.16602 3.33366 2.91602 5.83366 2.91602H14.167C16.667 2.91602 18.3337 4.16602 18.3337 7.08268V12.916C18.3337 15.8327 16.667 17.0827 14.167 17.0827Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.1663 7.5L11.558 9.58333C10.6997 10.2667 9.29134 10.2667 8.433 9.58333L5.83301 7.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 8.33268V6.66602C5 3.90768 5.83333 1.66602 10 1.66602C14.1667 1.66602 15 3.90768 15 6.66602V8.33268" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.0003 15.4167C11.1509 15.4167 12.0837 14.4839 12.0837 13.3333C12.0837 12.1827 11.1509 11.25 10.0003 11.25C8.84973 11.25 7.91699 12.1827 7.91699 13.3333C7.91699 14.4839 8.84973 15.4167 10.0003 15.4167Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.167 18.334H5.83366C2.50033 18.334 1.66699 17.5007 1.66699 14.1673V12.5007C1.66699 9.16732 2.50033 8.33398 5.83366 8.33398H14.167C17.5003 8.33398 18.3337 9.16732 18.3337 12.5007V14.1673C18.3337 17.5007 17.5003 18.334 14.167 18.334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.1083 7.89258L7.8916 12.1092C7.34994 11.5676 7.0166 10.8259 7.0166 10.0009C7.0166 8.35091 8.34993 7.01758 9.99993 7.01758C10.8249 7.01758 11.5666 7.35091 12.1083 7.89258Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.8499 4.80742C13.3915 3.70742 11.7249 3.10742 9.99987 3.10742C7.0582 3.10742 4.31654 4.84076 2.4082 7.84075C1.6582 9.01575 1.6582 10.9908 2.4082 12.1658C3.06654 13.1991 3.8332 14.0908 4.66654 14.8074" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.0166 16.2741C7.9666 16.6741 8.97493 16.8908 9.99993 16.8908C12.9416 16.8908 15.6833 15.1574 17.5916 12.1574C18.3416 10.9824 18.3416 9.00742 17.5916 7.83242C17.3166 7.39909 17.0166 6.99076 16.7083 6.60742" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.9252 10.584C12.7085 11.759 11.7502 12.7173 10.5752 12.934" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.89199 12.1074L1.66699 18.3324" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.3334 1.66602L12.1084 7.89102" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─── Component ─────────────────────────────────────────────────────────────── */
function UserSignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", city: "", password: "", confirmPassword: "" });
  const [clientErrors, setClientErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const googleButtonRef = useRef(null);

  const handleGoogleButtonClick = () => {
    const errs = {};
    if (!form.city.trim()) errs.city = "City is required";
    if (Object.keys(errs).length > 0) {
      setClientErrors(errs);
      toast.error("Required info missing", { description: "Please fill City before continuing with Google." });
      return;
    }
    googleButtonRef.current?.querySelector("div[role=button]")?.click();
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsPending(true);
    try {
      const { ok, data } = await loginWithGoogle({
        idToken: credentialResponse.credential,
        role: "user",
        city: form.city,
      });

      if (!ok) {
        toast.error("Google signup failed", { description: data?.message || "Failed to authenticate with Google." });
        return;
      }

      const token = data?.token ?? data?.accessToken ?? data?.data?.token;
      if (token) {
        document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        localStorage.setItem("auth-token", token);
      }

      toast.success("Account created!", { description: "Welcome to Funsival." });
      router.push("/signup/success?role=user");
    } catch {
      toast.error("Network error", { description: "Could not complete Google signup." });
    } finally {
      setIsPending(false);
    }
  };

  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (/\s/.test(password)) return "Spaces are not allowed in password";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/^[A-Z]/.test(password)) return "Password must start with an uppercase letter";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent digits in city
    if (name === "city" && /\d/.test(value)) {
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setClientErrors((prev) => ({ ...prev, email: validateEmail(value) }));
      return;
    }

    if (name === "password") {
      const passwordError = validatePassword(value);
      const confirmError = form.confirmPassword && form.confirmPassword !== value ? "Passwords do not match" : "";
      setClientErrors((prev) => ({ ...prev, password: passwordError, confirmPassword: confirmError }));
      return;
    }

    if (name === "confirmPassword") {
      const confirmError = !value
        ? "Confirm password is required"
        : value !== form.password
        ? "Passwords do not match"
        : "";
      setClientErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
      return;
    }

    if (clientErrors[name]) setClientErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    const emailError = validateEmail(form.email);
    if (emailError) errs.email = emailError;

    if (!form.city.trim()) errs.city = "City is required";
    else if (!/^[a-zA-Z\s]+$/.test(form.city)) errs.city = "Only alphabets are allowed";

    const passwordError = validatePassword(form.password);
    if (passwordError) errs.password = passwordError;

    if (!form.confirmPassword) errs.confirmPassword = "Confirm password is required";
    else if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setClientErrors(errs); return; }

    setIsPending(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/signup/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          city: form.city,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errMsg =
          (data?.errors && Object.values(data.errors)[0]) ??
          data?.message ??
          data?.error ??
          "Please try again.";
        toast.error("Signup failed", { description: errMsg });
        return;
      }

      if (data?.data?.verificationRequired) {
        toast.success("OTP sent!", { description: data.message ?? "Check your email for the verification code." });
        router.push(`/verify?email=${encodeURIComponent(data.data.email)}&role=user`);
        return;
      }

      const token = data?.token ?? data?.accessToken ?? data?.access_token ?? data?.data?.token ?? data?.data?.accessToken;
      if (token) {
        document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        localStorage.setItem("auth-token", token);
      }
      toast.success("Account created!", { description: data.message ?? "Welcome to Funsival." });
      router.push("/signup/success?role=user");
    } catch {
      toast.error("Network error", { description: "Could not reach the server. Please try again." });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl xs:text-3xl md:text-4xl font-extrabold text-[#4A4A4A] mb-3 text-center lg:text-left">Signup</h1>
      <p className="text-[#A1A1A1] text-sm md:text-base mb-10 leading-[160%] text-center lg:text-left">
        Lorem ipsum dolor sit amet consectetur. Sit libero ut adipiscing condimentum ullamcorper massa
      </p>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <Input id="email" name="email" type="email" placeholder="Email" icon={<MailIcon />} value={form.email} onChange={handleChange} error={clientErrors.email} />
        <Input id="city" name="city" type="text" placeholder="City" icon={<CityIcon />} value={form.city} onChange={handleChange} error={clientErrors.city} />
        <Input
          id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Password" icon={<LockIcon />}
          autoComplete="new-password"
          suffix={<button type="button" onClick={() => setShowPassword((v) => !v)} className="text-text-subtle hover:text-text transition-colors">{showPassword ? <EyeIcon /> : <EyeOffIcon />}</button>}
          value={form.password} onChange={handleChange} error={clientErrors.password}
        />
        <Input
          id="confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Re-Enter Password" icon={<LockIcon />}
          autoComplete="new-password"
          suffix={<button type="button" onClick={() => setShowConfirm((v) => !v)} className="text-text-subtle hover:text-text transition-colors">{showConfirm ? <EyeIcon /> : <EyeOffIcon />}</button>}
          value={form.confirmPassword} onChange={handleChange} error={clientErrors.confirmPassword}
        />

        <Button type="submit" variant="accent" size="lg" className="w-full min-h-[4rem] h-auto text-lg mt-1" showArrow={true} disabled={isPending}>
          {isPending ? "Please wait…" : "Continue"}
        </Button>

        <p className="text-center text-sm text-text">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
        </p>

        <div className="my-5">
          <Divider label="OR" />
        </div>

        <div className="flex flex-col gap-4">
          <div ref={googleButtonRef} className="hidden">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google signup failed", { description: "Could not initialize Google login." })}
            />
          </div>
          <SocialButton type="google" label="Continue with Google" onClick={handleGoogleButtonClick} />
          <SocialButton type="facebook" label="Continue with Facebook" />
          <SocialButton type="apple" label="Continue with Apple" />
          <SocialButton type="email" label="Continue with Email" />
        </div>
      </form>
    </AuthLayout>
  );
}

export default function UserSignupPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <UserSignupForm />
    </GoogleOAuthProvider>
  );
}
