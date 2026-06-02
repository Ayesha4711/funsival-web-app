"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import AuthLayout from "@/components/layout/AuthLayout";
import { forgotPassword, selectAuthStatus } from "@/store/slices/authSlice";
import { MailIcon, ArrowRightIcon } from "@/icons";

export default function ForgotPasswordForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const authStatus = useSelector(selectAuthStatus);
  const isPending = authStatus === "loading";
  const [email, setEmail] = useState("");
  const [clientError, setClientError] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email.trim()) { setClientError("Email is required"); return; }
    if (!email.includes("@")) { setClientError("Please enter a valid email address."); return; }

    const result = await dispatch(forgotPassword(email));
    if (forgotPassword.rejected.match(result)) {
      toast.error("Request failed", { description: result.payload });
      return;
    }
    const { message, email: confirmedEmail } = result.payload;
    router.push(`/forgot-password/check-email?email=${encodeURIComponent(confirmedEmail)}&msg=${encodeURIComponent(message)}`);
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

      <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
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
          className="w-full min-h-16 h-auto text-lg"
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
