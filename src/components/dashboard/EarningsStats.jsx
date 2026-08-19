"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { SpinnerIcon, ArrowUpRightIcon, CreditCardIcon as WalletIcon } from "@/icons";
import {
  fetchConnectStatus,
  fetchConnectLoginLink,
  fetchConnectBalance,
  selectConnectStatus,
  selectConnectStatusLoading,
  selectLoginLinkLoading,
  selectConnectBalances,
  selectConnectBalanceLoading,
  selectConnectBalanceError,
} from "@/store/slices/paymentsSlice";
import StripeOnboarding from "./StripeOnboarding";

function formatWalletMoney(value, currency) {
  const amount = Number(value ?? 0);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
  } catch {
    return `${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"} ${currency || ""}`.trim();
  }
}

export default function EarningsStats() {
  const router = useRouter();
  const dispatch = useDispatch();
  const connectStatus = useSelector(selectConnectStatus);
  const connectLoading = useSelector(selectConnectStatusLoading);
  const loginLinkLoading = useSelector(selectLoginLinkLoading);
  const balances = useSelector(selectConnectBalances);
  const balanceLoading = useSelector(selectConnectBalanceLoading);
  const balanceError = useSelector(selectConnectBalanceError);

  useEffect(() => {
    dispatch(fetchConnectStatus());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchConnectBalance());
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

  const transfersEnabled = connectStatus?.transfersEnabled;
  const payoutsEnabled = connectStatus?.payoutsEnabled;
  const needsPaymentOnboarding = connectStatus && transfersEnabled === false;

  const balanceRows = useMemo(() => balances ?? [], [balances]);
  const primaryBalance = balanceRows[0] ?? null;
  const currentBalance = primaryBalance?.current ?? 0;
  const pendingBalance = primaryBalance?.pending ?? 0;
  const currency = primaryBalance?.currency ?? "USD";

  const canWithdraw = Number(currentBalance) > 0 && payoutsEnabled !== false;

  return (
    <div className="flex flex-col gap-3">
      {/* Stripe onboarding banner — only shown when not fully onboarded */}
      {!connectLoading && !isOnboarded && (
        <StripeOnboarding />
      )}

      {needsPaymentOnboarding && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800 font-medium">
          Complete payment onboarding.
        </div>
      )}

      {balanceError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          {balanceError}
        </div>
      )}

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-[var(--color-border)] flex flex-col gap-2 sm:gap-3">
          <div>
            <p className="text-[10px] sm:text-xs lg:text-sm text-[var(--color-text-muted)] font-medium mb-1 leading-tight">Available Funds</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[var(--color-text)] leading-tight">
              {balanceLoading && !primaryBalance ? "—" : formatWalletMoney(currentBalance, currency)}
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/earnings/withdraw")}
            disabled={!canWithdraw}
            className="flex items-center justify-center gap-1 sm:gap-1.5 w-full py-1.5 sm:py-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] sm:text-xs lg:text-sm font-semibold rounded-full transition-colors"
          >
            <WalletIcon />
            <span>Withdraw Balance</span>
          </button>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-[var(--color-border)] flex flex-col">
          <p className="text-[10px] sm:text-xs lg:text-sm text-[#666666] font-medium mb-1 leading-tight">Pending Balance</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#FF7201] mb-1 leading-tight">
            {balanceLoading && !primaryBalance ? "—" : formatWalletMoney(pendingBalance, currency)}
          </p>
          <p className="text-[10px] sm:text-xs lg:text-sm text-[#666666] leading-tight">Held for 7 days — cannot be withdrawn</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-[var(--color-border)] flex flex-col">
          <p className="text-[10px] sm:text-xs lg:text-sm text-[#666666] font-medium flex flex-wrap items-center gap-1 mb-1 leading-tight">
            Platform Fees <span className="text-[var(--color-primary)] font-bold">(3%)</span>
          </p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[var(--color-text)] mb-1 leading-tight">$1331</p>
          <p className="text-[10px] sm:text-xs lg:text-sm text-[#666666] leading-tight">Current month period</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-[var(--color-border)] flex flex-col justify-between gap-2 sm:gap-3">
          <div>
            <p className="text-[10px] sm:text-xs lg:text-sm text-[#666666] font-medium mb-1 leading-tight">Stripe Account</p>
            <p className="text-[10px] sm:text-xs lg:text-sm text-[#666666] leading-tight">
              {isOnboarded ? "Manage your payouts and bank details" : "Connect Stripe to receive payouts"}
            </p>
          </div>
          <button
            onClick={handleOpenStripeDashboard}
            disabled={loginLinkLoading || !isOnboarded}
            className="flex items-center justify-center gap-1 sm:gap-1.5 w-full py-1.5 sm:py-2 bg-primary/10 hover:bg-primary/15 disabled:opacity-40 disabled:cursor-not-allowed text-primary text-[10px] sm:text-xs lg:text-sm font-semibold rounded-full transition-colors"
          >
            {loginLinkLoading ? <SpinnerIcon size={14} /> : <ArrowUpRightIcon size={14} />}
            <span>Stripe Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
