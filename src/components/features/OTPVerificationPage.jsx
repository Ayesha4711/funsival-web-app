"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import AuthLayout from "@/components/layout/AuthLayout";
import { BASE_URL } from "@/lib/api";



/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function OTPVerificationPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") ?? "";
  const role = params.get("role") ?? "user";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const COOLDOWN = 30;
  const [seconds, setSeconds] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  // Countdown tick
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const newOtp = [...otp];
    pasted.split("").forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    const nextEmpty = pasted.length < 6 ? pasted.length : 5;
    inputRefs.current[nextEmpty]?.focus();
  };

  const verifyOtp = async (otpString) => {
    if (isVerifying) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpString }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error("Verification failed", { description: data?.message ?? data?.error ?? "Invalid code. Please try again." });
        return;
      }

      const token = data?.token ?? data?.accessToken ?? data?.access_token ?? data?.data?.token ?? data?.data?.accessToken;
      if (token) {
        document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        localStorage.setItem("auth-token", token);
      }
      toast.success("Email verified!", { description: data.message ?? "Your account is ready." });
      router.push(`/signup/success?role=${role}`);
    } catch {
      toast.error("Network error", { description: "Could not reach the server. Please try again." });
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    const otpString = otp.join("");
    if (otpString.length === 6) {
      verifyOtp(otpString);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleResend = async () => {
    if (isResending || seconds > 0) return;
    setIsResending(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/resend-verification-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error("Resend failed", { description: data?.message ?? data?.error ?? "Please try again." });
        return;
      }
      toast.success("Code resent", { description: data.message ?? "A new code has been sent to your email." });
      setSeconds(COOLDOWN);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      toast.error("Network error", { description: "Could not reach the server. Please try again." });
    } finally {
      setIsResending(false);
    }
  };

  const handleContinue = () => {
    const otpString = otp.join("");
    if (otpString.length === 6) verifyOtp(otpString);
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl xs:text-3xl md:text-4xl font-extrabold text-text mb-3 text-center lg:text-left">OTP Verification</h1>
      <p className="text-[#A1A1A1] text-sm md:text-base mb-10 leading-relaxed mx-auto text-center lg:text-left">
        Please enter the 6-digit code we sent to<br />
        <span className="font-medium text-[var(--color-text)]">{email}</span>
      </p>

      {/* OTP Inputs */}
      <div className="flex justify-center gap-1.5 xs:gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 rounded-full text-center text-base xs:text-lg sm:text-xl font-bold transition-all duration-200 border-2
              ${digit
                ? "bg-primary text-white border-primary"
                : "bg-primary-light text-primary border-transparent"
              } focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary`}
            placeholder="-"
          />
        ))}
      </div>

      <div className="flex flex-col gap-6 mt-4">
        <Button
          type="button"
          variant="accent"
          size="lg"
          className="w-full h-16 text-lg"
          showArrow={true}
          disabled={isVerifying || otp.join("").length < 6}
          onClick={handleContinue}
        >
          {isVerifying ? "Verifying…" : "Continue"}
        </Button>

        <p className="text-center text-sm text-text font-medium">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || seconds > 0}
            className="text-primary font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? "Sending…" : seconds > 0 ? `Resend in ${seconds}s` : "Resend"}
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
