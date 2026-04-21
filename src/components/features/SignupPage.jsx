"use client";

import React, { useState } from "react";
import Link from "next/link";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Divider from "@/components/common/Divider";
import SocialButton from "@/components/common/SocialButton";
import AuthLayout from "@/components/layout/AuthLayout";

/* ─── Icons ────────────────────────────────────────────────────────────────── */
const MailIcon = () =>
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.167 17.0827H5.83366C3.33366 17.0827 1.66699 15.8327 1.66699 12.916V7.08268C1.66699 4.16602 3.33366 2.91602 5.83366 2.91602H14.167C16.667 2.91602 18.3337 4.16602 18.3337 7.08268V12.916C18.3337 15.8327 16.667 17.0827 14.167 17.0827Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.1663 7.5L11.558 9.58333C10.6997 10.2667 9.29134 10.2667 8.433 9.58333L5.83301 7.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>;

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function SignupPage() {
  const [form, setForm] = useState({ email: "" });
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.email.trim()) {
      setError("Email is required");
    } else if (!form.email.includes("@")) {
      setError("Invalid email address");
    } else {
      console.log("Form submitted", form);
    }
  };

  return (
    <AuthLayout>
      {/* Heading */}
      <h1 className="text-4xl font-extrabold text-[#4A4A4A] mb-3">Signup</h1>
      <p className="text-[#A1A1A1] text-[16px] mb-10 leading-[160%] ">
        Join our community and unlock a world of possibilities! Sign up now to
        get started.
      </p>

      {/* Form */}
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email here"
          icon={<MailIcon />}
          value={form.email}
          onChange={handleChange}
          error={error}
        />

        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="w-full min-h-[4rem] h-auto text-lg"
          showArrow={true}
        >
          Sign Up
        </Button>

        <p className="text-center text-sm text-text">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-bold underline hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>

      {/* Divider */}
      <div className="my-5">
        <Divider label="OR" />
      </div>

      {/* Social buttons */}
      <div className="flex flex-col gap-4">
        <SocialButton type="google" label="Continue with Google" />
        <SocialButton type="facebook" label="Continue with Facebook" />
        <SocialButton type="apple" label="Continue with Apple" />
        <SocialButton type="email" label="Continue with Email" />
      </div>
    </AuthLayout>
  );
}
