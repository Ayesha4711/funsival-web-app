"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  fetchSavedCards,
  setDefaultCard,
  deleteCard,
  selectSavedCards,
  selectCardsLoading,
  selectCardActionLoading,
} from "@/store/slices/paymentsSlice";
import { CreditCardIcon, TrashIcon, PlusIcon, SpinnerIcon } from "@/icons";
import AddPaymentModal from "./AddPaymentModal";

/* ─── Saved Card Row ────────────────────────────────────────────────────────── */
function CardRow({ card, onSetDefault, onDelete, actionLoading }) {
  const brand = card.card?.brand ?? card.brand ?? "card";
  const last4 = card.card?.last4 ?? card.last4 ?? "••••";
  const expMonth = String(card.card?.exp_month ?? card.exp_month ?? "").padStart(2, "0");
  const expYear = String(card.card?.exp_year ?? card.exp_year ?? "").slice(-2);
  const isDefault = card.isDefault ?? false;

  return (
    <div className={`flex items-center gap-3 sm:gap-4 rounded-2xl border px-4 sm:px-5 py-4 ${isDefault ? "border-[#4AA7A7] bg-[#4AA7A7]/5" : "border-gray-200 bg-white"}`}>
      <div className="w-10 h-10 rounded-xl bg-[#4AA7A7]/10 flex items-center justify-center shrink-0 text-[#4AA7A7]">
        <CreditCardIcon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-800 capitalize">{brand} •••• {last4}</p>
          {isDefault && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#4AA7A7] text-white rounded-full">Default</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Expires {expMonth}/{expYear}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {!isDefault && (
          <button
            onClick={() => onSetDefault(card.id)}
            disabled={actionLoading}
            className="text-xs text-[#4AA7A7] border border-[#4AA7A7] rounded-lg px-2 sm:px-3 py-1 hover:bg-[#4AA7A7]/5 transition-colors font-semibold whitespace-nowrap disabled:opacity-50"
          >
            Set Default
          </button>
        )}
        <button
          onClick={() => onDelete(card.id)}
          disabled={actionLoading}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

/* ─── Payment Method Tab ────────────────────────────────────────────────────── */
export default function PaymentMethodTab() {
  const dispatch = useDispatch();
  const cards = useSelector(selectSavedCards);
  const cardsLoading = useSelector(selectCardsLoading);
  const actionLoading = useSelector(selectCardActionLoading);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchSavedCards());
  }, [dispatch]);

  const handleSetDefault = async (pmId) => {
    try {
      await dispatch(setDefaultCard(pmId)).unwrap();
      toast.success("Default card updated.");
    } catch {
      toast.error("Could not update default card.");
    }
  };

  const handleDelete = async (pmId) => {
    try {
      await dispatch(deleteCard(pmId)).unwrap();
      toast.success("Card removed.");
    } catch {
      toast.error("Could not remove card.");
    }
  };

  return (
    <div className="space-y-6 2xl:min-h-[calc(100vh-400px)]">
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-6 2xl:min-h-150">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CreditCardIcon size={22} /> Payment Methods
            </h2>
            <p className="text-sm text-gray-400 mt-1">Manage your saved cards for bookings</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[#4AA7A7] hover:opacity-90 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-opacity shrink-0 mt-1"
          >
            <PlusIcon /> Add Card
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {cardsLoading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-gray-400">
              <SpinnerIcon size={16} className="text-[#4AA7A7]" />
              Loading cards…
            </div>
          ) : cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <CreditCardIcon size={22} />
              </div>
              <p className="text-sm font-semibold text-gray-500">No saved cards</p>
              <p className="text-xs text-gray-400">Add a card to use for future bookings.</p>
            </div>
          ) : (
            cards.map((card) => (
              <CardRow
                key={card.id}
                card={card}
                onSetDefault={handleSetDefault}
                onDelete={handleDelete}
                actionLoading={actionLoading}
              />
            ))
          )}

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mt-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-700">Secure card storage</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Cards are stored securely by Stripe. We never see or store your card number.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <AddPaymentModal
          onClose={() => setShowModal(false)}
          onSuccess={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
