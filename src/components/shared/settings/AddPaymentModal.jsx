"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import {
  createSetupIntent,
  fetchSavedCards,
  setDefaultCard,
  selectSetupIntentLoading,
} from "@/store/slices/paymentsSlice";
import { CreditCardIcon, CloseIcon as XIcon, SpinnerIcon } from "@/icons";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "14px",
      color: "#1a1a1a",
      fontFamily: "inherit",
      "::placeholder": { color: "#9CA3AF" },
    },
    invalid: { color: "#EF4444" },
  },
};

function AddPaymentModalInner({ onClose, onSuccess }) {
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();
  const setupIntentLoading = useSelector(selectSetupIntentLoading);

  const [holderName, setHolderName] = useState("");
  const [setDefault, setSetDefault] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!holderName.trim()) {
      setCardError("Please enter the account holder name.");
      return;
    }
    setSaving(true);
    setCardError(null);
    try {
      const res = await dispatch(createSetupIntent()).unwrap();
      const clientSecret = res?.data?.clientSecret ?? res?.clientSecret;
      if (!clientSecret) throw new Error("Could not initialise card setup.");

      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: holderName.trim() },
        },
      });

      if (error) {
        setCardError(error.message);
        return;
      }

      if (setupIntent.status === "succeeded") {
        const pmId = setupIntent.payment_method;
        // Stripe has already attached the PM to the customer — just refresh the list
        await dispatch(fetchSavedCards());
        if (setDefault && pmId) {
          await dispatch(setDefaultCard(pmId));
        }
        toast.success("Card added successfully.");
        onSuccess?.(pmId, setDefault);
        onClose();
      }
    } catch (err) {
      setCardError(typeof err === "string" ? err : (err?.message ?? "Failed to save card."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4AA7A7]/10 flex items-center justify-center text-[#4AA7A7]">
              <CreditCardIcon size={18} />
            </div>
            <h3 className="text-base font-bold text-gray-900">Add Payment Method</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleAdd} className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm text-gray-500">Add a card to use for bookings.</p>

          {/* Account Holder Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Account Holder Name <span className="text-red-400">*</span>
            </label>
            <input
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="John Doe"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4AA7A7]/20 focus:border-[#4AA7A7] placeholder-gray-400 transition-colors"
            />
          </div>

          {/* Card Details (Stripe CardElement) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Card Details <span className="text-red-400">*</span>
            </label>
            <div className="border border-gray-200 rounded-xl px-4 py-3.5 bg-white focus-within:border-[#4AA7A7] focus-within:ring-2 focus-within:ring-[#4AA7A7]/20 transition-colors">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          {cardError && (
            <p className="text-xs text-red-500 font-medium -mt-1">{cardError}</p>
          )}

          {/* Set as default */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={setDefault}
              onChange={(e) => setSetDefault(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-[#4AA7A7]"
            />
            <span className="text-sm text-gray-700 font-medium">Set as default payment method</span>
          </label>

          {/* Secure Payment notice */}
          <div className="flex items-start gap-3 bg-[#4AA7A7]/8 border border-[#4AA7A7]/20 rounded-xl px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4AA7A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <div>
              <p className="text-xs font-semibold text-[#4AA7A7]">Secure Payment Information</p>
              <p className="text-xs text-[#4AA7A7]/80 mt-0.5 leading-relaxed">
                Your card is encrypted and securely stored by Stripe. We never see or store your card number.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-sm font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || saving || setupIntentLoading}
              className="flex-1 bg-[#4AA7A7] text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {(saving || setupIntentLoading) && <SpinnerIcon size={13} className="text-white" />}
              {saving || setupIntentLoading ? "Saving…" : "+ Add Payment Method"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddPaymentModal({ onClose, onSuccess }) {
  return (
    <Elements stripe={stripePromise}>
      <AddPaymentModalInner onClose={onClose} onSuccess={onSuccess} />
    </Elements>
  );
}
