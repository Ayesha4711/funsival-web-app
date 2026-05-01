"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, loginWithGoogle, selectAuthStatus } from "@/store/slices/authSlice";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import AuthLayout from "@/components/layout/AuthLayout";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import Divider from "@/components/common/Divider";
import SocialButton from "@/components/common/SocialButton";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

/* ─── Icons ────────────────────────────────────────────────────────────────── */
const MailIcon = () =>
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.167 17.0827H5.83366C3.33366 17.0827 1.66699 15.8327 1.66699 12.916V7.08268C1.66699 4.16602 3.33366 2.91602 5.83366 2.91602H14.167C16.667 2.91602 18.3337 4.16602 18.3337 7.08268V12.916C18.3337 15.8327 16.667 17.0827 14.167 17.0827Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.1663 7.5L11.558 9.58333C10.6997 10.2667 9.29134 10.2667 8.433 9.58333L5.83301 7.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;

const LockIcon = () =>
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 8.33268V6.66602C5 3.90768 5.83333 1.66602 10 1.66602C14.1667 1.66602 15 3.90768 15 6.66602V8.33268" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.0003 15.4167C11.1509 15.4167 12.0837 14.4839 12.0837 13.3333C12.0837 12.1827 11.1509 11.25 10.0003 11.25C8.84973 11.25 7.91699 12.1827 7.91699 13.3333C7.91699 14.4839 8.84973 15.4167 10.0003 15.4167Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.167 18.334H5.83366C2.50033 18.334 1.66699 17.5007 1.66699 14.1673V12.5007C1.66699 9.16732 2.50033 8.33398 5.83366 8.33398H14.167C17.5003 8.33398 18.3337 9.16732 18.3337 12.5007V14.1673C18.3337 17.5007 17.5003 18.334 14.167 18.334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;

const EyeIcon = () =>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>;

const EyeOffIcon = () =>
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.1083 7.89258L7.8916 12.1092C7.34994 11.5676 7.0166 10.8259 7.0166 10.0009C7.0166 8.35091 8.34993 7.01758 9.99993 7.01758C10.8249 7.01758 11.5666 7.35091 12.1083 7.89258Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.8499 4.80742C13.3915 3.70742 11.7249 3.10742 9.99987 3.10742C7.0582 3.10742 4.31654 4.84076 2.4082 7.84075C1.6582 9.01575 1.6582 10.9908 2.4082 12.1658C3.06654 13.1991 3.8332 14.0908 4.66654 14.8074" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.0166 16.2741C7.9666 16.6741 8.97493 16.8908 9.99993 16.8908C12.9416 16.8908 15.6833 15.1574 17.5916 12.1574C18.3416 10.9824 18.3416 9.00742 17.5916 7.83242C17.3166 7.39909 17.0166 6.99076 16.7083 6.60742" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.9252 10.584C12.7085 11.759 11.7502 12.7173 10.5752 12.934" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.89199 12.1074L1.66699 18.3324" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.3334 1.66602L12.1084 7.89102" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;

const ArrowRightIcon = () =>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>;

/* ─── Component ─────────────────────────────────────────────────────────────── */
function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);
  const isPending = authStatus === "loading";

  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [clientErrors, setClientErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const googleButtonRef = useRef(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await dispatch(loginWithGoogle({ idToken: credentialResponse.credential }));
    if (loginWithGoogle.rejected.match(result)) {
      toast.error("Google login failed", { description: result.payload || "Failed to authenticate with Google." });
      return;
    }
    const data = result.payload?.data;
    toast.success("Signed in successfully", { description: "Welcome back!" });
    const role = data?.role ?? data?.data?.role ?? data?.data?.user?.role ?? "user";
    router.push(role === "host" ? "/dashboard" : "/user-dashboard/explore");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (clientErrors[name]) setClientErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!form.email.includes("@")) newErrors.email = "Invalid email address";
    if (!form.password) newErrors.password = "Password is required";
    else if (/\s/.test(form.password)) newErrors.password = "Spaces are not allowed in password";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (Object.keys(newErrors).length > 0) { setClientErrors(newErrors); return; }

    const result = await dispatch(loginUser({ email: form.email, password: form.password }));
    if (loginUser.rejected.match(result)) {
      toast.error("Login failed", { description: result.payload || "Invalid email or password." });
      return;
    }

    const data = result.payload?.data;
    // data = full API response: { success, message, data: { twoFactorRequired, email, ... } }
    const innerData = data?.data;

    if (innerData?.twoFactorRequired === true) {
      const emailForOtp = innerData?.email || form.email;
      router.push(`/login/2fa?email=${encodeURIComponent(emailForOtp)}`);
      return;
    }

    toast.success("Signed in successfully", { description: data?.message ?? "Welcome back! You're signed in." });
    const role = data?.role ?? data?.data?.role ?? data?.data?.user?.role ?? "user";
    router.push(role === "host" ? "/dashboard" : "/user-dashboard/explore");
  };

  return (
    <AuthLayout>
      <h1 className="text-4xl font-extrabold text-text mb-3 flex items-center gap-2">
        Welcome Back <span className="text-3xl">👋</span>
      </h1>
      <p className="text-[#A1A1A1] text-[16px] mb-10">
        Lorem ipsum dolor sit amet consectetur. Sit libero ut adipiscing condimentum ullamcorper massa nec
      </p>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <Input
          id="email" name="email" type="email" placeholder="Enter your email here"
          icon={<MailIcon />} value={form.email} onChange={handleChange} error={clientErrors.email}
        />
        <Input
          id="password" name="password" type={showPassword ? "text" : "password"}
          placeholder="Enter your password here" icon={<LockIcon />}
          autoComplete="current-password"
          suffix={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-subtle hover:text-text transition-colors">
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          }
          value={form.password} onChange={handleChange} error={clientErrors.password}
        />

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <label className="cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 rounded border-2 border-border group-hover:border-primary transition-colors bg-white">
                <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange} className="peer absolute opacity-0 cursor-pointer w-full h-full" />
                <svg className="w-3.5 h-3.5 text-primary hidden peer-checked:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </label>
            <span className="text-sm font-medium text-text-subtle">Remember me</span>
          </div>
          <Link href="/forgot-password/check-email" className="text-sm font-bold text-primary hover:underline">
            Forget Password?
          </Link>
        </div>

        <Button type="submit" variant="accent" size="lg" className="w-full min-h-[4rem] h-auto text-lg" iconRight={<ArrowRightIcon />} disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center text-sm text-[#909090]">
          Don&apos;t have an account?{" "}
          <Link href="/signup/role-selection" className="text-primary font-bold underline hover:underline">Sign up</Link>
        </p>

        <div className="my-1"><Divider label="OR" /></div>

        <div className="flex flex-col gap-4">
          <div ref={googleButtonRef} className="hidden">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google login failed", { description: "Could not initialize Google login." })}
            />
          </div>
          <SocialButton type="google" label="Continue with Google" onClick={() => googleButtonRef.current?.querySelector("div[role=button]")?.click()} />
          {/* <SocialButton type="facebook" label="Continue with Facebook" /> */}
          <SocialButton type="apple" label="Continue with Apple" />
        </div>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
}
