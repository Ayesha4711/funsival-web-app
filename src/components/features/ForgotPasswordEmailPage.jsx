"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import AuthLayout from "@/components/layout/AuthLayout";
import { forgotPasswordAction, resendVerificationAction } from "@/app/forgot-password/actions";
import { MailIcon, ArrowRightIcon } from "@/icons";

/* ─── Resend button with cooldown ─────────────────────────────────────────────── */
function ResendButton({ email }) {
  const COOLDOWN = 30;
  const [seconds, setSeconds] = useState(0);
  const [resendState, resendAction, isResending] = useActionState(resendVerificationAction, null);

  // Countdown tick
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  // Toast on result
  useEffect(() => {
    if (!resendState) return;
    if (resendState.success) {
      toast.success("Email resent", { description: resendState.message });
      const id = setTimeout(() => setSeconds(COOLDOWN), 0);
      return () => clearTimeout(id);
    } else if (resendState.error) {
      toast.error("Resend failed", { description: resendState.error });
    }
  }, [resendState]);

  const disabled = isResending || seconds > 0;

  return (
    <form action={resendAction} className="inline">
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        disabled={disabled}
        className="text-primary font-bold underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
      >
        {isResending ? "Sending…" : seconds > 0 ? `Resend in ${seconds}s` : "Resend"}
      </button>
    </form>
  );
}

/* ─── Email sent confirmation view ──────────────────────────────────────────── */
function CheckEmailConfirmation({ email }) {
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

/* ─── Forgot-password form view ──────────────────────────────────────────────── */
function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [clientError, setClientError] = useState("");
  const [serverState, submitAction, isPending] = useActionState(forgotPasswordAction, null);

  useEffect(() => {
    if (serverState?.error) {
      toast.error("Request failed", { description: serverState.error });
    }
  }, [serverState]);

  const handleSubmit = e => {
    if (!email.trim()) {
      e.preventDefault();
      setClientError("Email is required");
      return;
    }

    if (!email.includes("@")) {
      e.preventDefault();
      setClientError("Please enter a valid email address.");
    }
  };

  return (
    <AuthLayout showHero={false}>
      <h1 className="text-3xl font-extrabold text-text mb-3 text-center">
        Forgot Password?
      </h1>
      <p className="text-[#A1A1A1] mb-8 leading-relaxed text-center">
        Enter the email address associated with your account and we&apos;ll send you
        a link to reset your password.
      </p>

      <form className="flex flex-col gap-5 w-full" action={submitAction} onSubmit={handleSubmit}>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email here"
          icon={<MailIcon />}
          value={email}
          onChange={e => { setEmail(e.target.value); setClientError(""); }}
          error={clientError}
        />

        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="w-full min-h-[4rem] h-auto text-lg"
          iconRight={<ArrowRightIcon />}
          disabled={isPending}
        >
          {isPending ? "Sending…" : "Send Reset Link"}
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-4 block text-center text-sm font-bold text-primary hover:underline"
      >
        Back To Sign in
      </Link>
    </AuthLayout>
  );
}

/* ─── Main export — switches view based on ?email= param ─────────────────────── */
export default function ForgotPasswordEmailPage() {
  const params = useSearchParams();
  const email = params.get("email");

  if (email) {
    return <CheckEmailConfirmation email={decodeURIComponent(email)} />;
  }

  return <ForgotPasswordForm />;
}
