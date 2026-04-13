"use client";

import React, { useState, useRef, useEffect } from "react";
import Button from "@/components/common/Button";
import AuthLayout from "@/components/layout/AuthLayout";

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function OTPVerificationPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

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

  return (
    <AuthLayout>
      {/* Heading */}
      <h1 className="text-4xl font-extrabold text-text mb-3">
        OTP Verification
      </h1>
      <p className="text-[#A1A1A1] text-base mb-10 leading-relaxed   mx-auto">
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
        Wait for 30s in order to send again
      </p>

      <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-6">
        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="w-full h-16 text-lg"
          showArrow={true}
        >
          Continue
        </Button>

        {/* <p className="text-center text-sm text-text font-medium">
          Didn't receive the code?{" "}
          <button type="button" className="text-primary font-bold hover:underline">
            Resend
          </button>
        </p> */}
      </form>
    </AuthLayout>
  );
}
