"use client";

import React from "react";
import { useRouter } from "next/navigation";

const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
    <path d="M16 12h5" />
    <circle cx="18" cy="12" r="1" />
  </svg>
);

export default function EarningsStats() {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Available Funds */}
      <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex flex-col gap-3">
        <div>
           <p className="text-xs text-[var(--color-text-muted)] font-medium mb-1">Available Funds</p>
           <p className="text-2xl lg:text-3xl font-extrabold text-[var(--color-text)]">$50,000</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/earnings/withdraw")}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white text-xs font-bold rounded-xl transition-colors"
        >
          <WalletIcon />
          <span>Withdraw Balance</span>
        </button>
      </div>

      {/* Platform Fees */}
      <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex flex-col justify-between">
        <div>
          <p className="text-xs text-[var(--color-text-muted)] font-medium flex items-center gap-1.5 mb-1">
            Platform Fees <span className="text-[var(--color-primary)] font-bold">(3%)</span>
          </p>
          <p className="text-2xl lg:text-3xl font-extrabold text-[var(--color-text)]">$1331</p>
        </div>
        <p className="text-[10px] text-[var(--color-text-subtle)] mt-4">Current month period</p>
      </div>

      {/* Payments Being Cleared */}
      <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex flex-col justify-between">
        <div>
          <p className="text-xs text-[var(--color-text-muted)] font-medium mb-1">Payments Being Cleared</p>
          <p className="text-2xl lg:text-3xl font-extrabold text-[var(--color-secondary)]">$18,750</p>
        </div>
        <p className="text-[10px] text-[var(--color-text-subtle)] mt-4">Clearing in 3-5 business days</p>
      </div>

      {/* Next Payout */}
      <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex flex-col justify-between">
        <div>
          <p className="text-xs text-[var(--color-text-muted)] font-medium mb-1">Next Payout</p>
          <p className="text-2xl lg:text-3xl font-extrabold text-[var(--color-primary)]">Feb 15, 2024</p>
        </div>
        <p className="text-[10px] text-[var(--color-text-subtle)] mt-4">Scheduled payout date</p>
      </div>
    </div>
  );
}
