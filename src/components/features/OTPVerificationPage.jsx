"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import AuthLayout from "@/components/layout/AuthLayout";
import { resendVerificationAction } from "@/app/forgot-password/actions";
import { verifyEmailAction } from "@/app/signup/actions";

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function OTPVerificationPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  // Resend state
  const COOLDOWN = 30;
  const [seconds, setSeconds] = useState(0);
  const [resendState, resendAction, isResending] = useActionState(resendVerificationAction, null);
  const [verifyState, verifyAction, isVerifying] = useActionState(verifyEmailAction, null);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  // Countdown tick
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  // Toast on resend result
  useEffect(() => {
    if (!resendState) return;
    if (resendState.success) {
      toast.success("Code resent", { description: resendState.message });
      setSeconds(COOLDOWN);
    } else if (resendState.error) {
      toast.error("Resend failed", { description: resendState.error });
    }
  }, [resendState]);

  // Toast on verify result
  useEffect(() => {
    if (!verifyState) return;
    if (verifyState.success) {
      toast.success("Email verified!", { description: verifyState.message });
      router.push("/dashboard");
    } else if (verifyState.error) {
      toast.error("Verification failed", { description: verifyState.error });
    }
  }, [verifyState, router]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Auto-submit when OTP is complete
  useEffect(() => {
    const otpString = otp.join("");
    if (otpString.length === 6 && !isVerifying) {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("otp", otpString);
      verifyAction(formData);
    }
  }, [otp, email, verifyAction, isVerifying]);

  const resendDisabled = isResending || seconds > 0;

  return (
    <AuthLayout>
      <h1 className="text-4xl font-extrabold text-text mb-3">
        OTP Verification
      </h1>
      <p className="text-[#A1A1A1] text-base mb-10 leading-relaxed mx-auto">
        Please enter the 6-digit code we sent to your email/phone
      </p>

      {/* OTP Inputs */}
      <div className="flex justify-center gap-3 mb-6">
        {otp.map((digit, index) =>
          <input
            key={index}
            ref={el => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full text-center text-xl font-bold transition-all duration-200 border-2
              ${digit
                ? "bg-primary text-white border-primary"
                : "bg-primary-light text-primary border-transparent"} focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary`}
            placeholder="-"
          />
        )}
      </div>

      <p className="text-sm font-medium text-text-muted mb-10 text-center">
        {seconds > 0 ? `Wait ${seconds}s before resending` : "Didn't receive the code?"}
      </p>

      <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-6">
        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="w-full h-16 text-lg"
          showArrow={true}
          disabled={isVerifying || otp.join("").length < 6}
        >
          {isVerifying ? "Verifying…" : "Continue"}
        </Button>

        <p className="text-center text-sm text-text font-medium">
          Didn't receive the code?{" "}
          <form action={resendAction} className="inline">
            <input type="hidden" name="email" value={email} />
            <button
              type="submit"
              disabled={resendDisabled}
              className="text-primary font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? "Sending…" : seconds > 0 ? `Resend in ${seconds}s` : "Resend"}
            </button>
          </form>
        </p>
      </form>
    </AuthLayout>
  );
}
