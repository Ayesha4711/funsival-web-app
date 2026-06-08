"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  fetchConnectStatus,
  startConnectOnboarding,
  fetchConnectLoginLink,
  selectConnectStatus,
  selectConnectStatusLoading,
  selectOnboardLoading,
  selectLoginLinkLoading,
} from "@/store/slices/paymentsSlice";
import { SpinnerIcon } from "@/icons";

/* Stripe-supported Connect countries (ISO 3166-1 alpha-2) */
const STRIPE_COUNTRIES = [
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BR", name: "Brazil" },
  { code: "BG", name: "Bulgaria" },
  { code: "CA", name: "Canada" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "KE", name: "Kenya" },
  { code: "LV", name: "Latvia" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MY", name: "Malaysia" },
  { code: "MT", name: "Malta" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norway" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ZA", name: "South Africa" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "TH", name: "Thailand" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
];

function ReqChip({ label }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 border border-amber-200 text-amber-700">
      {label}
    </span>
  );
}

export default function StripeOnboarding({ compact = false }) {
  const dispatch = useDispatch();
  const status = useSelector(selectConnectStatus);
  const statusLoading = useSelector(selectConnectStatusLoading);
  const onboardLoading = useSelector(selectOnboardLoading);
  const loginLinkLoading = useSelector(selectLoginLinkLoading);

  const [country, setCountry] = useState("US");

  useEffect(() => {
    dispatch(fetchConnectStatus());
  }, [dispatch]);

  const isFullyOnboarded =
    status?.chargesEnabled && status?.payoutsEnabled && status?.detailsSubmitted;

  if (statusLoading && !status) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
        <SpinnerIcon size={16} className="text-[#4AA7A7]" />
        Checking Stripe status…
      </div>
    );
  }

  /* Fully onboarded — show Stripe dashboard button */
  if (isFullyOnboarded) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-green-800">Stripe Connected</p>
          <p className="text-xs text-green-600">Your payouts are enabled.</p>
        </div>
        <button
          onClick={async () => {
            try {
              const res = await dispatch(fetchConnectLoginLink()).unwrap();
              const url = res?.data?.url ?? res?.url;
              if (url) window.open(url, "_blank", "noopener");
            } catch {
              toast.error("Could not open Stripe dashboard. Please try again.");
            }
          }}
          disabled={loginLinkLoading}
          className="shrink-0 px-4 py-2 rounded-full bg-[#4AA7A7] hover:opacity-90 text-white text-xs font-bold transition-opacity disabled:opacity-50"
        >
          {loginLinkLoading ? "Opening…" : "Open Stripe Dashboard"}
        </button>
      </div>
    );
  }

  /* Not onboarded / incomplete */
  const hasAccount = status?.hasAccount;
  const pendingRequirements = status?.requirements?.currently_due ?? [];
  const disabledReason = status?.disabledReason;

  const handleStartOnboarding = async () => {
    try {
      const payload = hasAccount ? {} : { country };
      const res = await dispatch(startConnectOnboarding(payload)).unwrap();
      const url = res?.data?.url ?? res?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Could not start onboarding. Please try again.");
      }
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Onboarding failed. Please try again.");
    }
  };

  return (
    <div className="p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-amber-900">
            {hasAccount ? "Complete your Stripe onboarding" : "Connect your Stripe account"}
          </p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            {hasAccount
              ? "Your account needs additional information before you can create listings and receive payouts."
              : "Connect a Stripe account to create listings and receive payments from guests."}
          </p>
          {disabledReason && (
            <p className="text-xs text-red-600 mt-1">Reason: {disabledReason}</p>
          )}
          {pendingRequirements.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {pendingRequirements.slice(0, 6).map((r) => (
                <ReqChip key={r} label={r.replace(/_/g, " ")} />
              ))}
              {pendingRequirements.length > 6 && (
                <ReqChip label={`+${pendingRequirements.length - 6} more`} />
              )}
            </div>
          )}
        </div>
      </div>

      {!hasAccount && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">Select your country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={onboardLoading}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#4AA7A7] disabled:opacity-60"
          >
            <option value="">— Choose a country —</option>
            {STRIPE_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={handleStartOnboarding}
        disabled={onboardLoading || (!hasAccount && !country)}
        className="w-full py-3 rounded-full bg-[#4AA7A7] hover:opacity-90 text-white text-sm font-bold transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {onboardLoading && <SpinnerIcon size={14} className="text-white" />}
        {onboardLoading
          ? "Starting…"
          : hasAccount
          ? "Continue Onboarding"
          : "Connect Stripe Account"}
      </button>
    </div>
  );
}
