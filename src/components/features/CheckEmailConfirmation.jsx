"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import AuthLayout from "@/components/layout/AuthLayout";
import { resendVerificationCode } from "@/store/slices/authSlice";
import { ArrowRightIcon } from "@/icons";

function ResendButton({ email }) {
  const COOLDOWN = 30;
  const [seconds, setSeconds] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const handleResend = async () => {
    setIsResending(true);
    const result = await dispatch(resendVerificationCode(email));
    setIsResending(false);
    if (resendVerificationCode.rejected.match(result)) {
      toast.error("Resend failed", { description: result.payload });
    } else {
      toast.success("Email resent", { description: result.payload?.message ?? "Verification code resent successfully." });
      setSeconds(COOLDOWN);
    }
  };

  const disabled = isResending || seconds > 0;

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={disabled}
      className="text-primary font-bold underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
    >
      {isResending ? "Sending…" : seconds > 0 ? `Resend in ${seconds}s` : "Resend"}
    </button>
  );
}

export default function CheckEmailConfirmation({ email }) {
  return (
    <AuthLayout showHero={false}>
      <h1 className="text-3xl font-extrabold text-text mb-3 text-center">
        Check Your Email
      </h1>

      <p className="text-[#909090] mb-8 leading-relaxed text-center">
        We sent a password reset link to <br />
        <span className="font-semibold text-text">{email}</span>
      </p>

      <p className="text-sm text-text-muted mb-7 text-center flex items-center justify-center gap-1">
        Didn&apos;t receive the email?{" "}
        <ResendButton email={email} />
      </p>

      <Button
        variant="accent"
        size="lg"
        className="w-full min-h-16 h-auto text-lg"
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
