"use client";

import React, { useState, useRef, useEffect } from "react";
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
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, ArrowRightIcon, CheckIcon } from "@/icons";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

/* ─── Component ─────────────────────────────────────────────────────────────── */
function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);
  const isPending = authStatus === "loading";

  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [clientErrors, setClientErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [navigatingBack, setNavigatingBack] = useState(false);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Rewrite history so back always goes to / (landing page), never a protected route.
    // replaceState rewrites the current entry to /, then pushState puts /login on top.
    window.history.replaceState(null, "", "/");
    window.history.pushState(null, "", "/login");

    const handlePopState = () => setNavigatingBack(true);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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

  if (navigatingBack) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

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
                <CheckIcon size={14} className="hidden peer-checked:block text-primary" />
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
