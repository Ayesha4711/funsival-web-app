"use client";

import React, { useState } from "react";
import Link from "next/link";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Divider from "@/components/common/Divider";
import SocialButton from "@/components/common/SocialButton";
import AuthLayout from "@/components/layout/AuthLayout";
import { MailIcon } from "@/icons";

export default function SignupPage() {
  const [form, setForm] = useState({ email: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = (e) => {
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
      <p className="text-[#A1A1A1] text-[16px] mb-10 leading-[160%]">
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
          icon={<MailIcon size={20} />}
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
          <Link href="/login" className="text-primary font-bold underline hover:underline">
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
        <SocialButton type="google"    label="Continue with Google" />
        <SocialButton type="facebook"  label="Continue with Facebook" />
        <SocialButton type="apple"     label="Continue with Apple" />
        <SocialButton type="email"     label="Continue with Email" />
      </div>
    </AuthLayout>
  );
}
