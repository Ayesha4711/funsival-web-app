"use client";

import React from "react";
import { useRouter } from "next/navigation";

const WalletIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

export default function EarningsStats() {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Available Funds */}
      <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex flex-col gap-3">
        <div>
          <p className="text-sm text-[var(--color-text-muted)] font-medium mb-1">Available Funds</p>
          <p className="text-3xl font-extrabold text-[var(--color-text)]">$50,000</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/earnings/withdraw")}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white text-sm font-semibold rounded-full transition-colors"
        >
          <WalletIcon />
          <span>Withdraw Balance</span>
        </button>
      </div>

      {/* Platform Fees */}
      <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex flex-col">
        <p className="text-sm text-[var(--color-text-muted)] font-medium flex items-center gap-1.5 mb-1">
          Platform Fees <span className="text-[var(--color-primary)] font-bold">(3%)</span>
        </p>
        <p className="text-3xl font-extrabold text-[var(--color-text)] mb-2">$1331</p>
        <p className="text-xs text-[var(--color-text-subtle)]">Current month period</p>
      </div>

      {/* Payments Being Cleared */}
      <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex flex-col">
        <p className="text-sm text-[var(--color-text-muted)] font-medium mb-1">Payments Being Cleared</p>
        <p className="text-3xl font-extrabold text-[var(--color-secondary)] mb-2">$18,750</p>
        <p className="text-xs text-[var(--color-text-subtle)]">Clearing in 3-5 business days</p>
      </div>

      {/* Next Payout */}
      <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex flex-col">
        <p className="text-sm text-[var(--color-text-muted)] font-medium mb-1">Next Payout</p>
        <p className="text-3xl font-extrabold text-[var(--color-primary)] mb-2">Feb 15, 2024</p>
        <p className="text-xs text-[var(--color-text-subtle)]">Scheduled payout date</p>
      </div>
    </div>
  );
}
