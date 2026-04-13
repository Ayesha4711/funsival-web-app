"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import AuthLayout from "@/components/layout/AuthLayout";

/* ─── Icons ────────────────────────────────────────────────────────────────── */
const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleReset = e => { e.preventDefault(); router.push("/forgot-password/success"); };

  return (
    <AuthLayout showHero={false}>
      <h1 className="text-3xl font-extrabold text-text mb-3 text-center">
        Enter New Password
      </h1>

      <p className="text-[#A1A1A1] mb-10 leading-relaxed  text-center">
        Lorem ipsum dolor sit amet consectetur. Sit libero ut adipiscing
        condimentum ullamcorper massa nec
      </p>

      <form className="flex flex-col gap-6 w-full" onSubmit={handleReset}>
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password here"
          icon={<LockIcon />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-text-subtle hover:text-text transition-colors"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
          value={form.password}
          onChange={handleChange}
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Re-enter your password here"
          icon={<LockIcon />}
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-text-subtle hover:text-text transition-colors"
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <Button
          variant="accent"
          size="lg"
          className="w-full h-16 text-lg mt-2"
          iconRight={<ArrowRightIcon />}
        >
          Reset Password
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-3 block text-center text-sm font-bold text-primary hover:underline"
      >
        Back To Sign in
      </Link>
    </AuthLayout>
  );
}
