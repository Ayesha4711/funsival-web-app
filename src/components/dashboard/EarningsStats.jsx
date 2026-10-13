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
  selectLoginLinkLoading,
  selectConnectBalances,
  selectConnectBalanceLoading,
  selectConnectBalanceError,
  selectPayoutDelayDays,
  selectExpectedBankDeposits,
  selectDepositDateUnavailable,
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
  const loginLinkLoading = useSelector(selectLoginLinkLoading);
  const balances = useSelector(selectConnectBalances);
  const balanceLoading = useSelector(selectConnectBalanceLoading);
  const balanceError = useSelector(selectConnectBalanceError);
  const payoutDelayDays = useSelector(selectPayoutDelayDays);
  const expectedBankDeposits = useSelector(selectExpectedBankDeposits);
  const depositDateUnavailable = useSelector(selectDepositDateUnavailable);

  useEffect(() => {
    dispatch(fetchConnectStatus());
  }, [dispatch]);

  useEffect(() => {
    const refresh = () => { if (document.visibilityState !== "hidden") dispatch(fetchConnectBalance()); };
    refresh();
    const timer = setInterval(refresh, 60 * 1000);
    window.addEventListener("focus", refresh);
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh); };
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
      {connectStatus && !isOnboarded && (
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
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
          <p className="text-[10px] sm:text-xs lg:text-sm text-[#666666] leading-tight">{payoutDelayDays === null ? "Awaiting payout information" : `Released ${payoutDelayDays * 24} hours after the reservation ends. Stripe processing may take longer.`}</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-[var(--color-border)] col-span-2 lg:col-span-1 flex flex-col justify-between gap-2 sm:gap-3">
          <div>
            <p className="text-[10px] sm:text-xs lg:text-sm text-[#666666] font-medium mb-1 leading-tight">Stripe Account</p>
            <p className="text-[10px] sm:text-xs lg:text-sm text-[#666666] leading-tight">
              {isOnboarded ? "Manage your payouts and bank details" : "Connect Stripe to receive payouts"}
            </p>
            <div className="mt-2 text-[10px] sm:text-xs lg:text-sm text-[#666666]">
              <p className="font-medium">Expected bank deposit</p>
              {depositDateUnavailable ? <p>Unable to retrieve the date from Stripe.</p> : expectedBankDeposits.length ? expectedBankDeposits.map(payout => (
                <p key={payout.id}>
                  {new Date(`${payout.expectedDate}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                  {` · ${formatWalletMoney(payout.amount, payout.currency)}`}
                  {payout.testMode ? " · Test mode (no bank transfer)" : " · Estimated by Stripe"}
                </p>
              )) : <p>{balanceLoading ? "Loading…" : "Not scheduled yet. Withdraw available funds to request a bank payout."}</p>}
            </div>
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
