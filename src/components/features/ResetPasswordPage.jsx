"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import AuthLayout from "@/components/layout/AuthLayout";
import { resetPassword, selectAuthStatus } from "@/store/slices/authSlice";
import { LockIcon, EyeIcon, EyeOffIcon, ArrowRightIcon } from "@/icons";


/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function ResetPasswordPage({ initialToken = "" } = {}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? initialToken;
  const authStatus = useSelector(selectAuthStatus);
  const isPending = authStatus === "loading";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [clientErrors, setClientErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validatePassword = (password) => {
    if (!password) return "Password is required.";
    if (/\s/.test(password)) return "Spaces are not allowed in password.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) return "Password must contain uppercase and lowercase letters.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character.";
    return "";
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "password") {
      const confirmError = form.confirmPassword && form.confirmPassword !== value ? "Passwords do not match." : "";
      setClientErrors(prev => ({ ...prev, password: validatePassword(value), confirmPassword: confirmError }));
      return;
    }
    if (name === "confirmPassword") {
      setClientErrors(prev => ({ ...prev, confirmPassword: !value ? "Confirm password is required." : value !== form.password ? "Passwords do not match." : "" }));
      return;
    }
    if (clientErrors[name]) setClientErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = {};
    const passwordError = validatePassword(form.password);
    if (passwordError) errs.password = passwordError;
    if (!form.confirmPassword) errs.confirmPassword = "Confirm password is required.";
    else if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match.";
    if (Object.keys(errs).length > 0) { setClientErrors(errs); return; }

    const result = await dispatch(resetPassword({ token, password: form.password, confirmPassword: form.confirmPassword }));
    if (resetPassword.rejected.match(result)) {
      toast.error("Reset failed", { description: result.payload });
      return;
    }
    toast.success("Password reset!", { description: result.payload?.message ?? "You can now sign in with your new password." });
    router.push("/login");
  };

  return (
    <AuthLayout showHero={false}>
      <h1 className="text-3xl font-extrabold text-text mb-3 text-center">
        Enter New Password
      </h1>
      <p className="text-[#A1A1A1] mb-10 leading-relaxed text-center">
        Lorem ipsum dolor sit amet consectetur. Sit libero ut adipiscing
        condimentum ullamcorper massa nec
      </p>

      <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>

        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password here"
          icon={<LockIcon />}
          suffix={
            <button type="button" onClick={() => setShowPassword(v => !v)} className="text-text-subtle hover:text-text transition-colors">
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          }
          value={form.password}
          onChange={handleChange}
          error={clientErrors.password}
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
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirm ? "text" : "password"}
          placeholder="Re-enter your password here"
          icon={<LockIcon />}
          suffix={
            <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-text-subtle hover:text-text transition-colors">
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
          value={form.confirmPassword}
          onChange={handleChange}
          error={clientErrors.confirmPassword}
        />

        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="w-full h-16 text-lg mt-2"
          iconRight={<ArrowRightIcon />}
          disabled={isPending}
        >
          {isPending ? "Resetting…" : "Reset Password"}
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-3 block text-center text-sm font-bold text-primary underline hover:underline"
      >
        Back To Sign in
      </Link>
    </AuthLayout>
  );
}
