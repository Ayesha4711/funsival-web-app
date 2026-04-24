"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import NewsletterSection from "@/components/landing/NewsletterSection";
import LandingFooter from "@/components/landing/LandingFooter";

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);

const DollarCircleIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CardIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const VisaIcon = () => (
  <svg className="w-10 h-6" viewBox="0 0 60 20" fill="none">
    <text x="0" y="16" fontSize="16" fontWeight="bold" fill="#1A1F71" fontFamily="Arial">VISA</text>
  </svg>
);

const MastercardIcon = () => (
  <svg className="w-8 h-5" viewBox="0 0 50 30" fill="none">
    <circle cx="18" cy="15" r="13" fill="#EB001B" />
    <circle cx="32" cy="15" r="13" fill="#F79E1B" />
    <path d="M25 5.8A13 13 0 0132 15a13 13 0 01-7 9.2A13 13 0 0118 15a13 13 0 017-9.2z" fill="#FF5F00" />
  </svg>
);

/* ─── Navbar ─────────────────────────────────────────────────────────────────── */
function PayNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#4AA7A7] shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          <Link href="/user-dashboard/explore" className="flex items-center gap-2 shrink-0">
            <svg className="w-7 h-7 text-[#F5C842]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-xl font-bold text-white hidden sm:inline">funsival</span>
          </Link>
          <div className="flex-1 max-w-xl mx-2 sm:mx-4">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search here" className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none w-full" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 text-white text-sm font-medium">
              User <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <button className="w-9 h-9 rounded-full bg-[#F5C842] flex items-center justify-center text-gray-900 font-bold text-sm border-2 border-white/40 overflow-hidden">
              <img src="https://i.pravatar.cc/40?img=47" alt="User" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ─── Saved Cards (mock) ─────────────────────────────────────────────────────── */
const SAVED_CARDS = [
  { id: 1, brand: "visa", last4: "5614", default: true },
  { id: 2, brand: "visa", last4: "5614", default: false },
  { id: 3, brand: "mastercard", last4: "5614", default: false },
];

/* ─── Payment Method Variants ────────────────────────────────────────────────── */

/* State 1 — Initial: "Select card" dropdown, + Add new card */
function PaymentInitial({ onSelectNewCard, onOpenSavedCards }) {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={onOpenSavedCards}
        className="w-full flex items-center justify-between px-4 py-3.5 border border-gray-200 rounded-xl bg-white hover:border-[#4AA7A7] transition-colors"
      >
        <div className="flex items-center gap-2 text-gray-400">
          <DollarCircleIcon />
          <span className="text-sm">Select card</span>
        </div>
        <ChevronDownIcon />
      </button>
      <div className="flex justify-end">
        <button
          onClick={onSelectNewCard}
          className="flex items-center gap-1.5 text-sm font-medium text-[#4AA7A7] hover:text-[#3d9090] transition-colors"
        >
          <PlusIcon />
          Add new card
        </button>
      </div>
    </div>
  );
}

/* State 2 — Saved cards dropdown open */
function PaymentSavedCards({ onSelectCard, selectedCardId, onClose }) {
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={onClose}
        className="w-full flex items-center justify-between px-4 py-3.5 border border-gray-200 rounded-xl bg-white"
      >
        <div className="flex items-center gap-2 text-gray-400">
          <DollarCircleIcon />
          <span className="text-sm">Select Payment method</span>
        </div>
        <ChevronUpIcon />
      </button>
      <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white shadow-sm">
        {SAVED_CARDS.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelectCard(card)}
            className={`w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50 ${selectedCardId === card.id ? "bg-amber-50/60" : ""}`}
          >
            <div className="flex items-center gap-3">
              {card.brand === "visa" ? <VisaIcon /> : <MastercardIcon />}
              <span className="text-sm text-gray-700">**** **** **** {card.last4}</span>
            </div>
            {card.default && <span className="text-xs text-gray-400 font-medium">Default</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* State 3 — New card form (Debit Card selected) */
function PaymentNewCardForm({ onConfirm }) {
  const [cardType, setCardType] = useState("Debit Card");
  const [cardTypeOpen, setCardTypeOpen] = useState(false);
  const cardTypes = ["Debit Card", "Credit Card"];

  return (
    <div className="flex flex-col gap-3">
      {/* Card type dropdown */}
      <div className="relative">
        <button
          onClick={() => setCardTypeOpen(!cardTypeOpen)}
          className="w-full flex items-center justify-between px-4 py-3.5 border border-gray-200 rounded-xl bg-white"
        >
          <div className="flex items-center gap-2">
            <CardIcon />
            <span className="text-sm font-medium text-gray-700">{cardType}</span>
          </div>
          <ChevronDownIcon />
        </button>
        {cardTypeOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
            {cardTypes.map((t) => (
              <button
                key={t}
                onClick={() => { setCardType(t); setCardTypeOpen(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cardholder name */}
      <div className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl bg-white">
        <UserIcon />
        <input
          type="text"
          placeholder="Card holder name"
          className="flex-1 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none bg-transparent"
        />
      </div>

      {/* Card number */}
      <div className="flex items-center justify-between px-4 py-3.5 border border-gray-200 rounded-xl bg-white">
        <div className="flex items-center gap-3 flex-1">
          <CardIcon />
          <input
            type="text"
            placeholder="XXXX – XXXX – XXXX – XXXX"
            maxLength={19}
            className="flex-1 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none bg-transparent"
          />
        </div>
        <VisaIcon />
      </div>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 px-4 py-3.5 border border-gray-200 rounded-xl bg-white">
          <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input type="text" placeholder="Expiration Date" className="flex-1 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none bg-transparent min-w-0" />
        </div>
        <div className="flex items-center gap-2 px-4 py-3.5 border border-gray-200 rounded-xl bg-white">
          <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <input type="text" placeholder="CVV" maxLength={4} className="flex-1 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none bg-transparent" />
        </div>
      </div>
    </div>
  );
}

/* State 4 — Credit or Debit selected from saved (collapsed with checkmark) */
function PaymentCreditDebitSelected({ onClose }) {
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={onClose}
        className="w-full flex items-center justify-between px-4 py-3.5 border border-gray-200 rounded-xl bg-white"
      >
        <div className="flex items-center gap-2 text-gray-400">
          <DollarCircleIcon />
          <span className="text-sm">Select Payment method</span>
        </div>
        <ChevronUpIcon />
      </button>
      <div className="flex items-center justify-between px-4 py-3.5 border border-gray-200 rounded-xl bg-white">
        <div className="flex items-center gap-3">
          <CardIcon />
          <span className="text-sm text-gray-600">Credit or Debit Card</span>
        </div>
        <div className="w-5 h-5 rounded-full bg-[#F5C842] flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
export default function ConfirmAndPayPage() {
  const router = useRouter();
  const params = useSearchParams();

  const title = params.get("title") || "Pool";
  const description = params.get("description") || "Lorem ipsum dolor sit amet consectetur. Eget imperdiet eu enim lobortis sed.";
  const image = params.get("image") || "https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=200&q=80";
  const dateFrom = params.get("dateFrom") || "Nov 26";
  const dateTo = params.get("dateTo") || "Dec 01";
  const guests = params.get("guests") || "2 guest , 1 infant";
  const pricePerUnit = Number(params.get("pricePerUnit") || 70);
  const hours = Number(params.get("hours") || 120);
  const funsivalFee = Number(params.get("funsivalFee") || 30);

  const priceDetail = `$${pricePerUnit} * ${hours} Hours`;
  const priceAmount = pricePerUnit * hours;
  const total = priceAmount + funsivalFee;

  // Payment UI state: 'initial' | 'saved_open' | 'new_card' | 'credit_debit_selected'
  const [paymentState, setPaymentState] = useState("initial");
  const [selectedCard, setSelectedCard] = useState(null);
  const [agreed, setAgreed] = useState(false);

  const handleSelectSavedCard = (card) => {
    setSelectedCard(card);
    setPaymentState("credit_debit_selected");
  };

  const canPay = agreed;

  return (
    <div className="bg-gray-50 flex flex-col">

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-16 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <BackIcon />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Confirm And Pay</h1>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <button className="w-8 h-8 flex items-center justify-center hover:text-gray-600 transition-colors"><HeartIcon /></button>
            <button className="w-8 h-8 flex items-center justify-center hover:text-gray-600 transition-colors"><ShareIcon /></button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 items-start">

          {/* LEFT column */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6">

            {/* Trip Details */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-900">Trip Details</h2>
                <button className="flex items-center gap-1.5 text-sm font-medium text-[#4AA7A7] hover:text-[#3d9090] transition-colors">
                  <EditIcon />
                  Edit Details
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Dates</p>
                  <p className="text-sm text-gray-500">{dateFrom} – {dateTo}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Guests</p>
                  <p className="text-sm text-gray-500">{guests}</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-3">
                {paymentState === "new_card" ? "Select New Payment Method" : "Select Your Payment Method"}
              </h2>

              {paymentState === "initial" && (
                <PaymentInitial
                  onSelectNewCard={() => setPaymentState("new_card")}
                  onOpenSavedCards={() => setPaymentState("saved_open")}
                />
              )}

              {paymentState === "saved_open" && (
                <PaymentSavedCards
                  onSelectCard={handleSelectSavedCard}
                  selectedCardId={selectedCard?.id}
                  onClose={() => setPaymentState("initial")}
                />
              )}

              {paymentState === "new_card" && (
                <PaymentNewCardForm onConfirm={() => setPaymentState("credit_debit_selected")} />
              )}

              {paymentState === "credit_debit_selected" && (
                <PaymentCreditDebitSelected onClose={() => setPaymentState("saved_open")} />
              )}
            </div>

            {/* Cancellation Policy */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-2">Cancellation Policy</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Lorem ipsum dolor sit amet consectetur. Eget imperdiet eu enim lobortis sed.</p>
            </div>

            {/* Ground Rules */}
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-2">Ground Rules</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Lorem ipsum dolor sit amet consectetur. Eget imperdiet eu enim lobortis sed.</p>
            </div>
          </div>

          {/* RIGHT column */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">

              {/* Listing summary */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden shrink-0">
                  <img src={image} alt={title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
                </div>
              </div>

              {/* Price Details */}
              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">Price Details</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{priceDetail}</span>
                  <span className="font-semibold text-gray-900">${priceAmount.toLocaleString()}.00</span>
                </div>
              </div>

              {/* Taxes & Fees */}
              <div>
                <p className="text-sm font-bold text-gray-900 mb-3">Taxes &amp; Fees</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Funsival Fee</span>
                  <span className="font-semibold text-gray-900">${funsivalFee}.00</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-[#F5C842]">$ {total.toLocaleString()}.00</span>
              </div>

              {/* Agreement checkbox */}
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${agreed ? "bg-[#4AA7A7] border-[#4AA7A7]" : "bg-white border-gray-300"}`}>
                    {agreed && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-600 leading-relaxed">
                  I agree to the <span className="font-semibold text-gray-800">Cancellation Policy</span>, <span className="font-semibold text-gray-800">Ground Rules</span>, and <span className="font-semibold text-gray-800">Terms of Service</span>
                </span>
              </label>

              {/* Confirm & Pay button */}
              <button
                disabled={!canPay}
                className={`w-full py-4 rounded-full text-sm font-bold transition-all ${canPay ? "bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 shadow-md" : "bg-[#F5C842]/50 text-gray-500 cursor-not-allowed"}`}
              >
                Confirm &amp; Pay
              </button>
            </div>
          </div>

        </div>
      </main>

      <NewsletterSection />
      <LandingFooter />
    </div>
  );
}
