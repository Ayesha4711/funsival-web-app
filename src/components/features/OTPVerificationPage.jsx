"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { verifyEmail, resendVerificationCode, selectAuthStatus } from "@/store/slices/authSlice";
import Button from "@/components/common/Button";
import AuthLayout from "@/components/layout/AuthLayout";

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function OTPVerificationPage() {
  const params = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);

  const email = params.get("email") ?? "";
  const role = params.get("role") ?? "user";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const COOLDOWN = 60;
  const [seconds, setSeconds] = useState(COOLDOWN);
  const [isResending, setIsResending] = useState(false);
  const isVerifying = authStatus === "loading";

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

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
    const result = await dispatch(verifyEmail({ email, code: otpString }));
    if (verifyEmail.rejected.match(result)) {
      toast.error("Verification failed", { description: result.payload || "Invalid code. Please try again." });
      return;
    }
    const data = result.payload?.data;
    toast.success("Email verified!", { description: data?.message ?? "Your account is ready." });
    router.push(`/signup/success?role=${role}`);
  };

  useEffect(() => {
    const otpString = otp.join("");
    if (otpString.length === 6) verifyOtp(otpString);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleResend = async () => {
    if (isResending || seconds > 0) return;
    setIsResending(true);
    const result = await dispatch(resendVerificationCode(email));
    setIsResending(false);
    if (resendVerificationCode.rejected.match(result)) {
      toast.error("Resend failed", { description: result.payload || "Please try again." });
      return;
    }
    toast.success("Code resent", { description: result.payload?.message ?? "A new code has been sent to your email." });
    setSeconds(COOLDOWN);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
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
