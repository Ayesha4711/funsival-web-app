"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { signupHost, loginWithGoogle, selectAuthStatus } from "@/store/slices/authSlice";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import AuthLayout from "@/components/layout/AuthLayout";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import Divider from "@/components/common/Divider";
import SocialButton from "@/components/common/SocialButton";
import { MailIcon, CityIcon, LockIcon, EyeIcon, EyeOffIcon, BuildingIcon } from "@/icons";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

const getErrorMessages = (payload) => {
  if (!payload) return ["Please try again."];
  if (typeof payload === "string") return [payload];
  if (payload.errors && typeof payload.errors === "object") {
    return Object.values(payload.errors).flat().filter(Boolean).map(String);
  }
  return [payload.message || payload.error || "Please try again."];
};

const AgencyIcon = () => <BuildingIcon size={20} className="text-gray-500" />;

/* ─── Component ─────────────────────────────────────────────────────────────── */
function HostSignupForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);
  const isPending = authStatus === "loading";

  const [form, setForm] = useState({ agencyName: "", email: "", city: "", password: "", confirmPassword: "" });
  const [clientErrors, setClientErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const googleButtonRef = useRef(null);

  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (/\s/.test(password)) return "Spaces are not allowed in password";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) return "Password must contain uppercase and lowercase letters";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === "agencyName" || name === "city") && /\d/.test(value)) return;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "email") { setClientErrors((prev) => ({ ...prev, email: validateEmail(value) })); return; }
    if (name === "password") {
      const confirmError = form.confirmPassword && form.confirmPassword !== value ? "Passwords do not match" : "";
      setClientErrors((prev) => ({ ...prev, password: validatePassword(value), confirmPassword: confirmError }));
      return;
    }
    if (name === "confirmPassword") {
      setClientErrors((prev) => ({ ...prev, confirmPassword: !value ? "Confirm password is required" : value !== form.password ? "Passwords do not match" : "" }));
      return;
    }
    if (clientErrors[name]) setClientErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.agencyName.trim()) errs.agencyName = "Business name is required";
    else if (!/^[a-zA-Z\s]+$/.test(form.agencyName)) errs.agencyName = "Only alphabets are allowed";
    const emailError = validateEmail(form.email);
    if (emailError) errs.email = emailError;
    if (!form.city.trim()) errs.city = "City is required";
    else if (!/^[a-zA-Z\s]+$/.test(form.city)) errs.city = "Only alphabets are allowed";
    const passwordError = validatePassword(form.password);
    if (passwordError) errs.password = passwordError;
    if (!form.confirmPassword) errs.confirmPassword = "Confirm password is required";
    else if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const validateGoogleSignup = () => {
    const errs = {};
    if (!form.agencyName.trim()) errs.agencyName = "Business name is required";
    else if (!/^[a-zA-Z\s]+$/.test(form.agencyName)) errs.agencyName = "Only alphabets are allowed";
    if (!form.city.trim()) errs.city = "City is required";
    else if (!/^[a-zA-Z\s]+$/.test(form.city)) errs.city = "Only alphabets are allowed";
    return errs;
  };

  const handleGoogleButtonClick = () => {
    const errs = validateGoogleSignup();
    if (Object.keys(errs).length > 0) {
      setClientErrors((prev) => ({ ...prev, ...errs }));
      toast.error(errs.agencyName || errs.city || "Please review the form.");
      return;
    }
    googleButtonRef.current?.querySelector("div[role=button]")?.click();
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const errs = validateGoogleSignup();
    if (Object.keys(errs).length > 0) {
      setClientErrors((prev) => ({ ...prev, ...errs }));
      toast.error(errs.agencyName || errs.city || "Please review the form.");
      return;
    }

    const result = await dispatch(loginWithGoogle({
      idToken: credentialResponse.credential,
      role: "host",
      city: form.city,
      businessName: form.agencyName.trim(),
    }));
    if (loginWithGoogle.rejected.match(result)) {
      toast.error("Google login failed", { description: result.payload || "Failed to authenticate with Google." });
      return;
    }
    toast.success("Login successful!", { description: "Welcome to Funsival." });
    const data = result.payload?.data;
    const role = data?.role ?? data?.data?.role ?? data?.data?.user?.role ?? "host";
    router.push(role === "host" ? "/dashboard" : "/user-dashboard/explore");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      const messages = Object.values(errs).filter(Boolean);
      setClientErrors(errs);
      toast.error(messages[0] || "Please review the form.", {
        description: messages.slice(1).join("\n") || undefined,
      });
      return;
    }

    const result = await dispatch(signupHost({
      businessName: form.agencyName.trim(),
      email: form.email,
      city: form.city,
      password: form.password,
      confirmPassword: form.confirmPassword,
    }));

    if (signupHost.rejected.match(result)) {
      const messages = getErrorMessages(result.payload);
      const description = messages.slice(messages[0] === "Validation failed" ? 1 : 0).join("\n");
      if (result.payload?.errors && typeof result.payload.errors === "object") {
        setClientErrors(
          Object.fromEntries(
            Object.entries(result.payload.errors).map(([key, value]) => [
              key,
              Array.isArray(value) ? value.join(", ") : String(value),
            ])
          )
        );
      }
      toast.error(messages[0] === "Validation failed" ? "Signup failed" : messages[0], {
        description: description || undefined,
      });
      return;
    }

    const data = result.payload?.data;
    if (data?.data?.verificationRequired) {
      toast.success("OTP sent!", { description: data.message ?? "Check your email for the verification code." });
      router.push(`/verify?email=${encodeURIComponent(data.data.email)}&role=host`);
      return;
    }

    toast.success("Account created!", { description: data?.message ?? "Welcome to Funsival." });
    router.push("/signup/success?role=host");
  };

  return (
    <>
      <h1 className="text-2xl xs:text-3xl md:text-4xl font-extrabold text-[#4A4A4A] mb-3 text-center lg:text-left">Signup</h1>
      <p className="text-[#A1A1A1] text-sm md:text-base mb-10 leading-[160%] text-center lg:text-left">
        Lorem ipsum dolor sit amet consectetur. Sit libero ut adipiscing condimentum ullamcorper massa
      </p>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <Input id="agencyName" name="agencyName" type="text" placeholder="Business Name" icon={<AgencyIcon />} value={form.agencyName} onChange={handleChange} error={clientErrors.agencyName} />
        <Input id="email" name="email" type="email" placeholder="Email" icon={<MailIcon />} value={form.email} onChange={handleChange} error={clientErrors.email} />
        <Input id="city" name="city" type="text" placeholder="City" icon={<CityIcon />} value={form.city} onChange={handleChange} error={clientErrors.city} />
        <Input
          id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Password" icon={<LockIcon />}
          suffix={<button type="button" onClick={() => setShowPassword((v) => !v)} className="text-text-subtle hover:text-text transition-colors">{showPassword ? <EyeIcon /> : <EyeOffIcon />}</button>}
          value={form.password} onChange={handleChange} error={clientErrors.password}
        />
        {form.password && (
          <div className="bg-gray-50 rounded-xl px-4 py-3 -mt-2">
            <p className="text-xs font-semibold text-gray-600 mb-2">Password requirements:</p>
            <ul className="space-y-1">
              {[
                { text: "At least 8 characters long", met: form.password.length >= 8 },
                { text: "Contains uppercase and lowercase letters", met: /[A-Z]/.test(form.password) && /[a-z]/.test(form.password) },
                { text: "Contains at least one number", met: /[0-9]/.test(form.password) },
                { text: "Contains at least one special character", met: /[^A-Za-z0-9]/.test(form.password) },
              ].map(({ text, met }) => (
                <li key={text} className="flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${met ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className={met ? "text-green-600" : "text-gray-400"}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Input
          id="confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Re-Enter Password" icon={<LockIcon />}
          suffix={<button type="button" onClick={() => setShowConfirm((v) => !v)} className="text-text-subtle hover:text-text transition-colors">{showConfirm ? <EyeIcon /> : <EyeOffIcon />}</button>}
          value={form.confirmPassword} onChange={handleChange} error={clientErrors.confirmPassword}
        />

        <Button type="submit" variant="accent" size="lg" className="w-full min-h-[4rem] h-auto text-lg mt-1" showArrow={true} disabled={isPending}>
          {isPending ? "Please wait…" : "Continue"}
        </Button>

        <p className="text-center text-sm text-text">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold underline">Sign in</Link>
        </p>

        <div className="my-5"><Divider label="OR" /></div>

        <div className="flex flex-col gap-4">
          <div ref={googleButtonRef} className="hidden">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google login failed", { description: "Could not initialize Google login." })} />
          </div>
          <SocialButton type="google" label="Continue with Google" onClick={handleGoogleButtonClick} />
          {/* <SocialButton type="facebook" label="Continue with Facebook" /> */}
          <SocialButton type="apple" label="Continue with Apple" />
          {/* <SocialButton type="email" label="Continue with Email" /> */}
        </div>
      </form>
    </>
  );
}

export default function HostSignupPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthLayout>
        <HostSignupForm />
      </AuthLayout>
    </GoogleOAuthProvider>
  );
}
