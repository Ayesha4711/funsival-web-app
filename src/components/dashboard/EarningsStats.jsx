"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { CreditCardIcon as WalletIcon } from "@/icons";
import {
  fetchConnectStatus,
  fetchConnectLoginLink,
  selectConnectStatus,
  selectConnectStatusLoading,
  selectLoginLinkLoading,
} from "@/store/slices/paymentsSlice";
import StripeOnboarding from "./StripeOnboarding";

export default function EarningsStats() {
  const router = useRouter();
  const dispatch = useDispatch();
  const connectStatus = useSelector(selectConnectStatus);
  const connectLoading = useSelector(selectConnectStatusLoading);
  const loginLinkLoading = useSelector(selectLoginLinkLoading);

  useEffect(() => {
    dispatch(fetchConnectStatus());
  }, [dispatch]);

  const handleOpenStripeDashboard = async () => {
    try {
      const result = await dispatch(fetchConnectLoginLink()).unwrap();
      const url = result?.data?.url ?? result?.url;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Could not open Stripe dashboard. Please try again.");
      }
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to open Stripe dashboard.");
    }
  };

  const chargesEnabled = connectStatus?.chargesEnabled;
  const isOnboarded = chargesEnabled && connectStatus?.payoutsEnabled && connectStatus?.detailsSubmitted;

  return (
    <div className="flex flex-col gap-3">
      {/* Stripe onboarding banner — only shown when not fully onboarded */}
      {!connectLoading && !isOnboarded && (
        <StripeOnboarding />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Available Funds */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-[var(--color-border)] flex flex-col gap-2 sm:gap-3">
          <div>
            <p className="text-[10px] sm:text-xs lg:text-sm text-[var(--color-text-muted)] font-medium mb-1 leading-tight">Available Funds</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[var(--color-text)] leading-tight">$50,000</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/earnings/withdraw")}
            className="flex items-center justify-center gap-1 sm:gap-1.5 w-full py-1.5 sm:py-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white text-[10px] sm:text-xs lg:text-sm font-semibold rounded-full transition-colors"
          >
            <WalletIcon />
            <span>Withdraw Balance</span>
          </button>
        </div>

        {/* Platform Fees */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-[var(--color-border)] flex flex-col">
          <p className="text-[10px] sm:text-xs lg:text-sm text-[#666666] font-medium flex flex-wrap items-center gap-1 mb-1 leading-tight">
            Platform Fees <span className="text-[var(--color-primary)] font-bold">(3%)</span>
          </p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[var(--color-text)] mb-1 leading-tight">$1331</p>
          <p className="text-[10px] sm:text-xs lg:text-sm text-[#666666] leading-tight">Current month period</p>
        </div>

        {/* Payments Being Cleared */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-[var(--color-border)] flex flex-col">
          <p className="text-[10px] sm:text-xs lg:text-sm text-[#666666] font-medium mb-1 leading-tight">Payments Being Cleared</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#FF7201] mb-1 leading-tight">$18,750</p>
          <p className="text-[10px] sm:text-xs lg:text-sm text-[#666666] leading-tight">Clearing in 3-5 business days</p>
        </div>

        {/* Next Payout + Stripe Dashboard */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-[var(--color-border)] flex flex-col gap-2">
          <div>
            <p className="text-[10px] sm:text-xs lg:text-sm text-[#666666] font-medium mb-1 leading-tight">Next Payout</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[var(--color-primary)] mb-1 leading-tight">Feb 15, 2024</p>
            <p className="text-[10px] sm:text-xs lg:text-sm text-[#666666] leading-tight">Scheduled payout date</p>
          </div>
        </div>
      </div>
    </div>
  );
}
