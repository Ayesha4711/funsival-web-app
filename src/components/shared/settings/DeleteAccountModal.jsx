"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteAccount, clearAuth } from "@/store/slices/authSlice";
import { clearProfile, selectUser } from "@/store/slices/profileSlice";
import { TrashIcon, EyeIcon, EyeOffIcon, SpinnerIcon } from "@/icons";
import { ModalOverlay } from "./SettingsPrimitives";

export default function DeleteAccountModal({ onClose }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const profile = useSelector(selectUser);
  const hasLocalAuth = !Array.isArray(profile?.authProviders) || profile.authProviders.includes("local");
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isConfirmed = confirmText.trim().toUpperCase() === "DELETE";

  const handleDelete = async () => {
    if (hasLocalAuth && !password) { setError("Please enter your password to confirm."); return; }
    if (confirmText.trim().toUpperCase() !== "DELETE") { setError('Please type "DELETE" to confirm.'); return; }
    setLoading(true);
    setError("");
    const result = await dispatch(deleteAccount({ ...(hasLocalAuth ? { password } : {}), confirm: "DELETE" }));
    setLoading(false);

    if (deleteAccount.fulfilled.match(result)) {
      dispatch(clearAuth());
      dispatch(clearProfile());
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-token");
        document.cookie = "auth-token=; Max-Age=0; path=/";
      }
      toast.success("Your account has been deleted.");
      router.push("/");
    } else {
      setError(result.payload || (hasLocalAuth ? "Failed to delete account. Please check your password." : "Failed to delete account."));
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm px-6 py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <TrashIcon />
        </div>
        <h3 className="text-xl font-bold text-text mb-2">Are You Sure?</h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-6">
          This action is permanent and cannot be undone. All your data, bookings, listings, and
          account information will be permanently deleted.
        </p>

        {hasLocalAuth && (
          <div className="mb-5 text-left">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Enter your password to confirm
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Your current password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className={`w-full border rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 transition-colors placeholder-gray-400 ${
                  error
                    ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                    : "border-gray-200 focus:ring-red-200 focus:border-red-400"
                }`}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>
          </div>
        )}

        <div className="mb-5 text-left">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Type <span className="font-bold text-text">DELETE</span> to confirm
          </label>
          <input
            type="text"
            placeholder="DELETE"
            value={confirmText}
            onChange={(e) => { setConfirmText(e.target.value); setError(""); }}
            className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors placeholder-gray-400 ${
              error
                ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                : "border-gray-200 focus:ring-red-200 focus:border-red-400"
            }`}
          />
          {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 border-2 border-primary text-primary font-semibold text-sm py-3 rounded-full hover:bg-primary/5 transition-colors disabled:opacity-50">
            Return
          </button>
          <button onClick={handleDelete} disabled={loading || !isConfirmed}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm py-3 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading && <SpinnerIcon size={14} />}
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
