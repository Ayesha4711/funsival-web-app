"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  fetchConnectBalance,
  createWithdrawal,
  selectConnectBalances,
  selectConnectBalanceLoading,
  selectConnectBalanceError,
  selectWithdrawalActionStatus,
} from "@/store/slices/paymentsSlice";
import {
  ArrowLeftIcon,
  HomeIcon,
  ChevronRightIcon,
  DollarIcon,
  ShieldIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SpinnerIcon,
} from "@/icons";

function formatMoney(value, currency) {
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

/* ─── Success Modal ──────────────────────────────────────────────────────────── */
function SuccessModal({ withdrawalData, onClose }) {
  const [txId] = useState(() => "WD-" + Math.floor(Math.random() * 9000000000 + 1000000000));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-3 pb-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto flex flex-col shadow-2xl">
        <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-secondary"><DollarIcon /></span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Withdraw Funds</h2>
              <p className="text-xs text-gray-400 mt-0.5">Transfer your available funds to your connected account</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0 ml-2">
            <span className="text-lg leading-none">✕</span>
          </button>
        </div>
        <div className="px-4 sm:px-6 pb-5 sm:pb-6 flex flex-col items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500">
            <CheckCircleIcon size={56} />
          </div>
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Withdrawal Initiated!</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Your withdrawal of {formatMoney(withdrawalData.amount, withdrawalData.currency)} has been processed and will arrive in 3-5 business days.
            </p>
          </div>
          <div className="w-full border border-gray-100 rounded-xl p-3 sm:p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center gap-2 text-xs sm:text-sm">
              <span className="text-gray-500 shrink-0">Transaction ID:</span>
              <span className="font-bold text-gray-900 text-[10px] sm:text-xs truncate">{txId}</span>
            </div>
            <div className="flex justify-between items-center gap-2 text-xs sm:text-sm">
              <span className="text-gray-500 shrink-0">Status:</span>
              <span className="px-3 py-1 bg-orange-50 text-orange-500 border border-orange-100 rounded-full text-xs font-bold">Processing</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-8 sm:px-10 py-3 bg-secondary hover:bg-secondary-dark text-white font-bold rounded-full transition-colors text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Withdraw Page ─────────────────────────────────────────────────────── */
export default function WithdrawPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const balances = useSelector(selectConnectBalances);
  const balanceLoading = useSelector(selectConnectBalanceLoading);
  const balanceError = useSelector(selectConnectBalanceError);
  const actionStatus = useSelector(selectWithdrawalActionStatus);

  const [showAmountForm, setShowAmountForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [withdrawalResult, setWithdrawalResult] = useState(null);

  useEffect(() => {
    dispatch(fetchConnectBalance());
  }, [dispatch]);

  const balanceRows = useMemo(() => balances ?? [], [balances]);
  const primaryBalance = balanceRows[0] ?? null;
  const availableBalance = Number(primaryBalance?.current ?? 0);
  const currency = primaryBalance?.currency ?? "USD";

  const parsedAmount = Number(amount);
  const isValid = Number.isFinite(parsedAmount) && parsedAmount > 0 && parsedAmount <= availableBalance;

  const setPercent = (pct) => {
    setAmount((availableBalance * pct).toFixed(2));
  };

  const handleConfirm = async () => {
    if (!isValid) return;
    try {
      await dispatch(createWithdrawal({
        amount: parsedAmount,
        currency,
        idempotencyKey,
      })).unwrap();
      setWithdrawalResult({ amount: parsedAmount, currency });
      setIdempotencyKey(crypto.randomUUID());
      setShowAmountForm(false);
      setAmount("");
    } catch (err) {
      // Same idempotencyKey is intentionally reused so a retry of this same
      // request cannot double-withdraw on the backend.
      toast.error(typeof err === "string" ? err : "Could not submit withdrawal. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F3F4F6]">

      <div className="bg-white border-b border-gray-100 px-4 sm:px-8 lg:px-10 py-4 sm:py-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-900 hover:text-gray-600 transition-colors shrink-0">
          <ArrowLeftIcon size={20} />
        </button>
        <h1 className="text-base sm:text-xl font-bold text-gray-900">Get Paid</h1>
        <span className="text-sm text-gray-400 font-normal hidden sm:inline">Manage your Finance. Your Account Review</span>
      </div>

      <div className="flex-1 px-3 sm:px-8 lg:px-10 py-4 sm:py-6 flex flex-col gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-4 sm:mb-6">
            <button onClick={() => router.push("/dashboard/earnings")} className="text-[#228E8A] hover:opacity-80 transition-opacity">
              <HomeIcon />
            </button>
            <ChevronRightIcon size={14} />
            <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600 font-medium">Withdraw Funds</span>
          </div>

          {/* Available Balance */}
          <div className="mb-4 sm:mb-6 p-4 sm:p-7 border-2 border-gray-200 rounded-xl">
            <p className="text-sm font-semibold text-gray-500 mb-2 sm:mb-3">Available Balance</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-green-500 mb-1">
              {balanceLoading && !primaryBalance ? "—" : formatMoney(availableBalance, currency)}
            </p>
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 mt-4 sm:mt-8">
              <p className="text-sm text-gray-400">Ready for withdrawal</p>
              {!showAmountForm && (
                <button
                  onClick={() => setShowAmountForm(true)}
                  disabled={availableBalance <= 0}
                  className="flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 bg-secondary hover:bg-secondary-dark text-white text-sm font-bold rounded-full transition-colors w-full xs:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Get Paid <ArrowRightIcon />
                </button>
              )}
            </div>
          </div>

          {balanceError && (
            <div className="mb-4 sm:mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              {balanceError}
            </div>
          )}

          {/* Amount entry — shown once the provider starts a withdrawal */}
          {showAmountForm && (
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 border-2 border-gray-200 rounded-xl flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Add Amount:</label>
                <div className="flex items-center border-2 border-primary rounded-xl px-3 py-2.5 gap-2 bg-white">
                  <span className="text-sm font-bold text-gray-500">$</span>
                  <input
                    type="number"
                    min="0.01"
                    max={availableBalance}
                    step="0.01"
                    autoFocus
                    className="flex-1 text-sm font-bold text-gray-900 focus:outline-none min-w-0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[["25%", 0.25], ["50%", 0.5], ["All", 1]].map(([label, pct]) => (
                  <button
                    key={label}
                    onClick={() => setPercent(pct)}
                    className="py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-primary hover:text-primary transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 shrink-0 mt-0.5"><ShieldIcon /></span>
                <p className="text-xs text-gray-500">
                  Withdrawals cannot be cancelled once processed. Please verify all details are correct before confirming.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowAmountForm(false); setAmount(""); }}
                  className="flex-1 py-3 border border-gray-200 text-gray-500 font-semibold rounded-full text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!isValid || actionStatus === "loading"}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary hover:bg-secondary-dark text-white font-bold rounded-full transition-colors text-sm disabled:opacity-50"
                >
                  {actionStatus === "loading" && <SpinnerIcon size={14} className="text-white" />}
                  {actionStatus === "loading" ? "Submitting…" : "Confirm Withdrawal"}
                  {actionStatus !== "loading" && <ArrowRightIcon />}
                </button>
              </div>
            </div>
          )}

          {/*
            Select Payment Method — Stripe Connect payouts always go to the
            provider's connected bank account (managed via the Stripe
            dashboard), so there is no in-app payment method picker for
            withdrawals. Leaving this section out until we support multiple
            payout destinations.
          */}
        </div>
      </div>

      {withdrawalResult && (
        <SuccessModal
          withdrawalData={withdrawalResult}
          onClose={() => { setWithdrawalResult(null); router.push("/dashboard/earnings"); }}
        />
      )}
    </div>
  );
}
