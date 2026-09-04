"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { becomeUser } from "@/store/slices/authSlice";
import { fetchProfile, selectUser } from "@/store/slices/profileSlice";
import { CloseIcon } from "@/icons";

const FONT = "var(--font-sofia-pro), Sofia Pro, sans-serif";

export default function BecomeUserModal({ onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const profile = useSelector(selectUser);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    const result = await dispatch(becomeUser());
    setSubmitting(false);

    if (becomeUser.rejected.match(result)) {
      toast.error("Couldn't switch to a user account", { description: result.payload || "Please try again." });
      return;
    }

    dispatch(fetchProfile());
    toast.success("You're now a user!", { description: "Welcome back to exploring Funsival." });
    onClose();
    router.push(
      profile?.hasCompletedUserOnboarding
        ? "/user-dashboard/explore"
        : "/user-dashboard/explore?onboarding=true"
    );
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl w-full shadow-2xl"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 pt-7 pb-6">
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: "#111827" }}>
            Become a User
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-8 pb-8">
          <p
            style={{ fontFamily: FONT, fontWeight: 400, fontSize: 14, color: "#6B7280" }}
            className="mb-6 leading-relaxed"
          >
            Switch back to exploring places, equipment, and services using your existing
            account. Your listings stay saved — you can become a provider again anytime.
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 16,
                backgroundColor: submitting ? "#D1D5DB" : "#1d8c82",
                minWidth: 220,
              }}
              className="py-4 px-10 rounded-full text-white transition-all hover:opacity-90 disabled:cursor-not-allowed"
            >
              {submitting ? "Setting up…" : "Become a User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
