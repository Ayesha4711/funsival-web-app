"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/common/Button";
import AuthLayout from "@/components/layout/AuthLayout";

/* ─── Icons ────────────────────────────────────────────────────────────────── */
const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function ForgotPasswordEmailPage() {
  return (
    <AuthLayout showHero={false}>
      <h1 className="text-3xl font-extrabold text-text mb-3 text-center">
        Check Your Email
      </h1>

      <p className="text-[#909090] mb-8 leading-relaxed text-center">
        We sent a password reset link to <br />
        <span className="text-[#909090]">olivia@untitledui.com</span>
      </p>

      <p className="text-sm text-text-muted mb-7 text-center">
        Didn't receive code yet?{" "}
        <button className="text-primary font-bold underline hover:underline">
          Resend
        </button>
      </p>

      <Button
        variant="accent"
        size="lg"
        className="w-full min-h-[4rem] h-auto text-lg"
        iconRight={<ArrowRightIcon />}
        onClick={() => window.location.href = "mailto:"}
      >
        Open Email App
      </Button>

      <Link
        href="/login"
        className="mt-4 block text-center text-sm font-bold text-primary hover:underline"
      >
        Back To Sign in
      </Link>
    </AuthLayout>
  );
}
