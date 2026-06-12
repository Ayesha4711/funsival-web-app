"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSavedCards,
  setDefaultCard,
  deleteCard,
  selectSavedCards,
  selectCardsLoading,
  selectCardActionLoading,
} from "@/store/slices/paymentsSlice";
import AddPaymentModal from "@/components/shared/settings/AddPaymentModal";
import {
  ArrowLeftIcon,
  HomeIcon,
  ChevronRightIcon,
  BankIcon,
  TrashIcon,
  DollarIcon,
  ClockIcon,
  ShieldIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SpinnerIcon,
} from "@/icons";

/* ─── Withdraw Funds Modal ───────────────────────────────────────────────────── */
function WithdrawModal({ availableBalance, paymentMethod, onClose, onConfirm }) {
  const [amount, setAmount] = useState(
    availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );

  const rawAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const processingFee = rawAmount > 0 ? parseFloat((rawAmount * 0.0002).toFixed(2)) : 0;
  const youReceive = rawAmount > 0 ? (rawAmount - processingFee).toFixed(2) : "0.00";

  const setPercent = (pct) => {
    const val = pct === 1 ? availableBalance : availableBalance * pct;
    setAmount(val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const cardBrand = paymentMethod.card?.brand ?? "card";
  const last4 = paymentMethod.card?.last4 ?? "••••";
  const displayName = `${cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1)} ····${last4}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-3 pb-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto flex flex-col max-h-[80vh] sm:max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-secondary"><DollarIcon /></span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Withdraw Funds</h2>
              <p className="text-xs text-gray-400 mt-0.5">Transfer your available funds to your preferred payment method</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0 ml-2">
            <span className="text-lg leading-none">✕</span>
          </button>
        </div>

        <div className="px-4 sm:px-6 pb-5 sm:pb-6 flex flex-col gap-3 sm:gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Add Amount:</label>
            <div className="flex items-center border-2 border-primary rounded-xl px-3 py-2.5 gap-2 bg-white">
              <span className="text-sm font-bold text-gray-500">$</span>
              <input
                className="flex-1 text-sm font-bold text-gray-900 focus:outline-none min-w-0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
            <p className="text-xs text-gray-500">Minimum withdrawal: $10 • Maximum: ${availableBalance.toLocaleString()}</p>
          </div>

          <div className="border border-gray-100 rounded-xl p-3 sm:p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
              <span className="text-gray-500 shrink-0">Withdrawal Amount:</span>
              <span className="font-bold text-gray-900">${rawAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
              <span className="text-gray-500 shrink-0">Processing Fee:</span>
              <span className="font-bold text-gray-500">-${processingFee}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm gap-2 pt-2 border-t border-gray-100">
              <span className="font-bold text-gray-900 shrink-0">You&apos;ll receive:</span>
              <span className="font-bold text-primary">${parseFloat(youReceive).toLocaleString()}</span>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-3 sm:p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 shrink-0"><BankIcon /></span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-400">····{last4}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
              <ClockIcon /><span>Estimated arrival: 3-5 business days</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-400 shrink-0 mt-0.5"><ShieldIcon /></span>
            <div>
              <p className="text-xs font-semibold text-gray-700">Security Notice:</p>
              <p className="text-xs text-gray-500 mt-0.5">Withdrawals cannot be cancelled once processed. Please verify all details are correct before confirming.</p>
            </div>
          </div>

          <button
            onClick={() => onConfirm({ amount: rawAmount, fee: processingFee, net: youReceive, method: paymentMethod })}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 bg-secondary hover:bg-secondary-dark text-white font-bold rounded-full transition-colors text-sm"
          >
            Confirm Withdrawal <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Success Modal ──────────────────────────────────────────────────────────── */
function SuccessModal({ withdrawalData, onClose }) {
  const txId = "WD-" + Math.floor(Math.random() * 9000000000 + 1000000000);
  const cardBrand = withdrawalData.method.card?.brand ?? "card";
  const last4 = withdrawalData.method.card?.last4 ?? "••••";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-3 pb-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto flex flex-col shadow-2xl">
        <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-secondary"><DollarIcon /></span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Withdraw Funds</h2>
              <p className="text-xs text-gray-400 mt-0.5">Transfer your available funds to your preferred payment method</p>
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
              Your withdrawal of ${parseFloat(withdrawalData.net).toLocaleString()} has been processed and will arrive in 3-5 business days.
            </p>
          </div>
          <div className="w-full border border-gray-100 rounded-xl p-3 sm:p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center gap-2 text-xs sm:text-sm">
              <span className="text-gray-500 shrink-0">Transaction ID:</span>
              <span className="font-bold text-gray-900 text-[10px] sm:text-xs truncate">{txId}</span>
            </div>
            <div className="flex justify-between items-center gap-2 text-xs sm:text-sm">
              <span className="text-gray-500 shrink-0">Method:</span>
              <span className="font-bold text-gray-900 truncate">
                {cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1)} ····{last4}
              </span>
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

/* ─── Card Row ───────────────────────────────────────────────────────────────── */
function CardRow({ card, onDelete, actionLoading }) {
  const brand = card.card?.brand ?? "card";
  const last4 = card.card?.last4 ?? "••••";
  const expMonth = card.card?.exp_month;
  const expYear = card.card?.exp_year;
  const displayName = `${brand.charAt(0).toUpperCase() + brand.slice(1)} ····${last4}`;

  return (
    <div className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-xl gap-2">
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
        <BankIcon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{displayName}</p>
        <p className="text-[10px] sm:text-xs text-gray-400">
          {expMonth && expYear ? `Expires ${expMonth}/${String(expYear).slice(-2)}` : "····" + last4}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 sm:gap-1.5 shrink-0">
        {card.isDefault && (
          <span className="px-2 sm:px-3 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[9px] sm:text-[10px] font-bold">Default</span>
        )}
        <button
          onClick={() => onDelete(card.id)}
          disabled={actionLoading}
          className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {actionLoading ? <SpinnerIcon size={10} /> : <TrashIcon />}
          Delete
        </button>
      </div>
    </div>
  );
}

/* ─── Main Withdraw Page ─────────────────────────────────────────────────────── */
export default function WithdrawPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const cards = useSelector(selectSavedCards);
  const cardsLoading = useSelector(selectCardsLoading);
  const actionLoading = useSelector(selectCardActionLoading);

  const [modal, setModal] = useState(null);
  const [withdrawalResult, setWithdrawalResult] = useState(null);

  // Balance is not yet available via API — keep as 0 until endpoint exists
  const availableBalance = 0;

  const defaultCard = cards.find((c) => c.isDefault) ?? cards[0] ?? null;

  useEffect(() => {
    dispatch(fetchSavedCards());
  }, [dispatch]);

  const handleDelete = async (pmId) => {
    await dispatch(deleteCard(pmId));
  };

  const handleWithdrawConfirm = (data) => {
    setWithdrawalResult(data);
    setModal("success");
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
              ${availableBalance.toLocaleString()}
            </p>
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 mt-4 sm:mt-8">
              <p className="text-sm text-gray-400">Ready for withdrawal</p>
              <button
                onClick={() => defaultCard && setModal("withdraw")}
                disabled={!defaultCard || availableBalance <= 0}
                className="flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 bg-secondary hover:bg-secondary-dark text-white text-sm font-bold rounded-full transition-colors w-full xs:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Paid <ArrowRightIcon />
              </button>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-4 sm:mb-6 p-4 sm:p-5 border-2 border-gray-200 rounded-xl">
            <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
              <h2 className="text-sm sm:text-base font-bold text-gray-900">Select Payment Method</h2>
              <button
                onClick={() => setModal("addCard")}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:border-primary hover:text-primary transition-colors shrink-0"
              >
                + Add Method
              </button>
            </div>

            {cardsLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <SpinnerIcon size={20} />
              </div>
            ) : cards.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No payment methods added yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {cards.map((card) => (
                  <CardRow
                    key={card.id}
                    card={card}
                    onDelete={handleDelete}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modal === "addCard" && (
        <AddPaymentModal
          onClose={() => setModal(null)}
          onSuccess={() => setModal(null)}
        />
      )}

      {modal === "withdraw" && defaultCard && (
        <WithdrawModal
          availableBalance={availableBalance}
          paymentMethod={defaultCard}
          onClose={() => setModal(null)}
          onConfirm={handleWithdrawConfirm}
        />
      )}

      {modal === "success" && withdrawalResult && (
        <SuccessModal
          withdrawalData={withdrawalResult}
          onClose={() => { setModal(null); router.push("/dashboard/earnings"); }}
        />
      )}
    </div>
  );
}
