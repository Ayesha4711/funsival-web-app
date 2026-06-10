"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { loginUser, selectAuthStatus } from "@/store/slices/authSlice";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import AuthLayout from "@/components/layout/AuthLayout";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, ArrowRightIcon } from "@/icons";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);
  const isPending = authStatus === "loading";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!form.email.includes("@")) newErrors.email = "Invalid email address";
    if (!form.password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const result = await dispatch(loginUser({ email: form.email, password: form.password }));
    if (loginUser.rejected.match(result)) {
      toast.error("Login failed", { description: result.payload || "Invalid email or password." });
      return;
    }

    const data = result.payload?.data;
    const innerData = data?.data;

    if (innerData?.twoFactorRequired === true) {
      const emailForOtp = innerData?.email || form.email;
      router.push(`/login/2fa?email=${encodeURIComponent(emailForOtp)}`);
      return;
    }

    const role = data?.role ?? data?.data?.role ?? data?.data?.user?.role ?? "";
    if (role !== "admin") {
      toast.error("Access denied", { description: "This portal is for admin accounts only." });
      return;
    }

    toast.success("Signed in successfully", { description: "Welcome to the admin panel." });
    router.push("/admin/refund-requests");
  };

  return (
    <AuthLayout showHero={false}>
      {/* Badge */}
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 bg-[#EBF6F6] text-[#228E8A] text-xs font-bold px-3 py-1 rounded-full">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Admin Portal
        </span>
      </div>

      <h1 className="text-4xl font-extrabold text-text mb-3">Admin Sign In</h1>
      <p className="text-[#A1A1A1] text-[16px] mb-10">
        Sign in with your admin credentials to access the management panel.
      </p>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <Input
          id="email" name="email" type="email" placeholder="Admin email"
          icon={<MailIcon />} value={form.email} onChange={handleChange} error={errors.email}
        />
        <Input
          id="password" name="password" type={showPassword ? "text" : "password"}
          placeholder="Password" icon={<LockIcon />}
          autoComplete="current-password"
          suffix={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-subtle hover:text-text transition-colors">
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          }
          value={form.password} onChange={handleChange} error={errors.password}
        />

        <Button type="submit" variant="accent" size="lg" className="w-full min-h-[4rem] h-auto text-lg" iconRight={<ArrowRightIcon />} disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in to Admin Panel"}
        </Button>
      </form>

      <p className="text-center text-sm text-[#909090] mt-6">
        Not an admin?{" "}
        <Link href="/login" className="text-primary font-bold hover:underline">Go to regular login</Link>
      </p>
    </AuthLayout>
  );
}
