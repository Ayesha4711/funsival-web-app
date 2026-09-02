"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { verify2FALogin, selectAuthStatus } from "@/store/slices/authSlice";
import Button from "@/components/common/Button";
import AuthLayout from "@/components/layout/AuthLayout";
import { ShieldIcon } from "@/icons";

export default function TwoFAVerifyPage() {
  const params   = useSearchParams();
  const router   = useRouter();
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);

  const email = params.get("email") ?? "";
  const role  = params.get("role")  ?? "user";
  const returnTo = params.get("returnTo");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const isVerifying = authStatus === "loading";

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
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
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    const focus = pasted.length < 6 ? pasted.length : 5;
    inputRefs.current[focus]?.focus();
  };

  const verify = async (code) => {
    if (isVerifying) return;
    const result = await dispatch(verify2FALogin({ email, code }));
    if (verify2FALogin.rejected.match(result)) {
      toast.error("Verification failed", { description: result.payload || "Invalid code. Please try again." });
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      return;
    }
    const data = result.payload?.data;
    toast.success("Signed in successfully", { description: data?.message ?? "Welcome back!" });
    const resolvedRole = data?.role ?? data?.data?.role ?? data?.data?.user?.role ?? role;
    if (returnTo) router.push(returnTo);
    else router.push(resolvedRole === "host" ? "/dashboard" : "/user-dashboard/explore");
  };

  useEffect(() => {
    const code = otp.join("");
    if (code.length === 6) verify(code);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleContinue = () => {
    const code = otp.join("");
    if (code.length === 6) verify(code);
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.max(0, b.length)) + c)
    : "";

  return (
    <AuthLayout>
      {/* Icon */}
      <div className="flex justify-center lg:justify-start mb-6">
        <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
          <ShieldIcon />
        </div>
      </div>

      <h1 className="text-2xl xs:text-3xl md:text-4xl font-extrabold text-text mb-3 text-center lg:text-left">
        Two-Factor Authentication
      </h1>
      <p className="text-[#A1A1A1] text-sm md:text-base mb-10 leading-relaxed text-center lg:text-left">
        Enter the 6-digit verification code sent to<br />
        <span className="font-semibold text-[var(--color-text)]">{maskedEmail || "your registered email"}</span>
      </p>

      {/* OTP inputs */}
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
            className={[
              "w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 rounded-full text-center text-base xs:text-lg sm:text-xl font-bold transition-all duration-200 border-2 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary",
              digit
                ? "bg-primary text-white border-primary"
                : "bg-primary-light text-primary border-transparent",
            ].join(" ")}
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
          showArrow
          disabled={isVerifying || otp.join("").length < 6}
          onClick={handleContinue}
        >
          {isVerifying ? "Verifying…" : "Verify & Sign In"}
        </Button>

        <p className="text-center text-sm text-[#909090]">
          Wrong account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-primary font-bold hover:underline"
          >
            Back to login
          </button>
        </p>
      </div>

      {/* Info note */}
      <p className="mt-8 text-xs text-center text-gray-400 leading-relaxed">
        Check your email inbox or spam folder for the code.<br />
        The code expires in 10 minutes.
      </p>
    </AuthLayout>
  );
}
