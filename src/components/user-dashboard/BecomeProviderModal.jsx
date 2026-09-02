"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { becomeProvider } from "@/store/slices/authSlice";
import { fetchProfile } from "@/store/slices/profileSlice";
import { CloseIcon } from "@/icons";

const FONT = "var(--font-sofia-pro), Sofia Pro, sans-serif";

export default function BecomeProviderModal({ onClose }) {
  const [agencyName, setAgencyName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

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
    const result = await dispatch(
      becomeProvider(agencyName.trim() ? { agencyName: agencyName.trim() } : {})
    );
    setSubmitting(false);

    if (becomeProvider.rejected.match(result)) {
      toast.error("Couldn't become a provider", { description: result.payload || "Please try again." });
      return;
    }

    dispatch(fetchProfile());
    toast.success("You're now a provider!", { description: "Welcome to Funsival hosting." });
    onClose();
    router.push("/dashboard");
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
            Become a Provider
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
            List places, equipment, or activities on Funsival using your existing account.
            Your bookings, reviews, and wishlist stay exactly as they are.
          </p>

          <label
            style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: "#374151" }}
            className="block mb-2"
          >
            Business name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            placeholder="e.g. Skyline Adventures"
            style={{ fontFamily: FONT, fontSize: 14 }}
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1d8c82] transition-colors mb-7"
          />

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
              {submitting ? "Setting up…" : "Become a Provider"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
