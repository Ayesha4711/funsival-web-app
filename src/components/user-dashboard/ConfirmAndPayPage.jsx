"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe } from "@stripe/react-stripe-js";

import {
  createBooking,
  fetchBookingQuote,
  selectBookingQuote,
  selectBookingQuoteStatus,
} from "@/store/slices/bookingsSlice";
import {
  fetchSavedCards,
  selectSavedCards,
  selectCardsLoading,
} from "@/store/slices/paymentsSlice";
import AppFooter from "@/components/shared/AppFooter";
import AddPaymentModal from "@/components/shared/settings/AddPaymentModal";
import {
  ArrowLeftIcon as BackIcon,
  EditIcon,
  CheckIcon,
  CreditCardIcon,
  PlusIcon,
  SpinnerIcon,
} from "@/icons";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

/* ─── Build booking payload from URL params ──────────────────────────────────── */
function buildBookingPayload(params) {
  const listingId    = params.get("listingId")    || "";
  const bookingType  = params.get("bookingType")  || "";
  const pricingMode  = params.get("pricingMode")  || "";
  const startDate    = params.get("startDate")    || "";
  const endDate      = params.get("endDate")      || "";
  const startTime    = params.get("startTime")    || "";
  const endTime      = params.get("endTime")      || "";
  const durationHours  = params.get("durationHours");
  const durationDays   = params.get("durationDays");
  const numberOfGuests = params.get("numberOfGuests");
  const includeDelivery = params.get("includeDelivery");

  const base = { listingId };

  if (bookingType === "per_person") {
    return {
      ...base,
      startDate,
      startTime,
      endTime,
      numberOfGuests: Number(numberOfGuests) || 1,
    };
  }

  const mode = pricingMode || (bookingType === "daily" ? "daily" : "hourly");
  const payload = { ...base, pricingMode: mode, startDate };

  if (mode === "hourly") {
    payload.startTime = startTime;
    if (endTime) payload.endTime = endTime;
    if (durationHours) payload.durationHours = Number(durationHours);
  } else {
    if (endDate) payload.endDate = endDate;
    if (startTime) payload.startTime = startTime;
    if (durationDays) payload.durationDays = Number(durationDays);
  }

  if (numberOfGuests) payload.numberOfGuests = Number(numberOfGuests);
  if (includeDelivery === "true") payload.includeDelivery = true;
  return payload;
}

/* ─── Card picker ─────────────────────────────────────────────────────────────── */
function PaymentSection({ selectedPmId, onSelect, onNewCardReady }) {
  const dispatch = useDispatch();
  const cards = useSelector(selectSavedCards);
  const cardsLoading = useSelector(selectCardsLoading);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchSavedCards());
  }, [dispatch]);

  // Auto-select default card when cards load
  useEffect(() => {
    if (cards.length > 0 && !selectedPmId) {
      const def = cards.find((c) => c.isDefault) ?? cards[0];
      onSelect(def.id);
    }
  }, [cards]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleModalSuccess = async (pmId) => {
    await dispatch(fetchSavedCards());
    if (pmId) {
      onNewCardReady(pmId);
      onSelect(pmId);
    }
    setShowModal(false);
  };

  if (cardsLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
        <SpinnerIcon size={14} className="text-[#4AA7A7]" /> Loading saved cards…
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Saved cards */}
        {cards.map((card) => {
          const brand = card.card?.brand ?? card.brand ?? "card";
          const last4 = card.card?.last4 ?? card.last4 ?? "••••";
          const isSelected = selectedPmId === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelect(card.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-colors text-left ${isSelected ? "border-[#4AA7A7] bg-[#EBF6F6]" : "border-gray-200 bg-white hover:border-[#4AA7A7]"}`}
            >
              <div className="flex items-center gap-3">
                <CreditCardIcon size={20} className="text-[#4AA7A7]" />
                <div>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{brand} •••• {last4}</p>
                  {card.isDefault && <p className="text-xs text-[#4AA7A7] font-medium">Default</p>}
                </div>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-[#4AA7A7] flex items-center justify-center shrink-0">
                  <CheckIcon size={11} className="text-white" />
                </div>
              )}
            </button>
          );
        })}

        {/* Add new card — opens modal */}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed border-gray-300 bg-white hover:border-[#4AA7A7] hover:bg-[#EBF6F6] transition-colors text-left"
        >
          <PlusIcon size={18} className="text-[#4AA7A7]" />
          <span className="text-sm font-semibold text-gray-600">Add a new card</span>
        </button>
      </div>

      {showModal && (
        <AddPaymentModal
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
}

/* ─── 3DS confirmation handler ───────────────────────────────────────────────── */
async function handle3DS(stripe, clientSecret) {
  if (!clientSecret || !stripe) return { error: null };
  const { error } = await stripe.confirmCardPayment(clientSecret);
  return { error };
}

/* ─── Inner page (needs Stripe + Elements context) ────────────────────────────── */
function ConfirmAndPayInner() {
  const router   = useRouter();
  const params   = useSearchParams();
  const dispatch = useDispatch();
  const stripe   = useStripe();

  const quote       = useSelector(selectBookingQuote);
  const quoteStatus = useSelector(selectBookingQuoteStatus);

  const title       = params.get("title")       || "Listing";
  const description = params.get("description") || "";
  const image       = params.get("image")       || "https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=200&q=80";
  const dateFrom    = params.get("dateFrom")    || params.get("startDate") || "";
  const dateTo      = params.get("dateTo")      || params.get("endDate")   || "";
  const startTime   = params.get("startTime")   || "";
  const endTime     = params.get("endTime")     || "";
  const bookingType = params.get("bookingType") || "";

  useEffect(() => {
    const payload = buildBookingPayload(params);
    const rawType = params.get("listingType") || "";
    const typeMap = { activities: "activity", places: "place", equipment: "equipment" };
    const lt = typeMap[rawType] ?? rawType;
    if (lt) payload.listingType = lt;
    if (payload.listingId) dispatch(fetchBookingQuote(payload));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toNum = (v, fb = 0) => { const n = Number(String(v ?? "").replace(/[^\d.-]/g, "")); return Number.isFinite(n) ? n : fb; };
  const fallbackPPU   = toNum(params.get("pricePerUnit"), 0);
  const fallbackUnits = toNum(params.get("units") ?? params.get("hours"), 1);
  const fallbackFee   = toNum(params.get("funsivalFee"), 8);

  const pricing      = quote?.pricing;
  const pricePerUnit = pricing?.pricePerUnit ?? fallbackPPU;
  const unitsBooked  = pricing?.unitsBooked  ?? fallbackUnits;
  const subtotal     = pricing?.subtotal     ?? pricePerUnit * unitsBooked;
  const serviceFee   = pricing?.serviceFee   ?? fallbackFee;
  const deliveryFee  = pricing?.deliveryFee  ?? 0;
  const total        = pricing?.totalAmount  ?? subtotal + serviceFee + deliveryFee;

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  };

  const serverEndTime = quote?.endTime || endTime;
  const serverEndDate = quote?.endDate
    ? new Date(quote.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : dateTo || dateFrom;

  const priceLabel = (() => {
    if (bookingType === "per_person") return `$${pricePerUnit} × ${unitsBooked} person(s)`;
    if (bookingType === "hourly" || bookingType === "per_hour") return `$${pricePerUnit} × ${unitsBooked} hour(s)`;
    if (bookingType === "daily") return `$${pricePerUnit} × ${unitsBooked} day(s)`;
    return `$${pricePerUnit} × ${unitsBooked}`;
  })();

  const [selectedPmId, setSelectedPmId] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canPay = agreed && !submitting && !!selectedPmId;

  const handleConfirmAndPay = async () => {
    if (!selectedPmId) {
      toast.error("Please select or add a payment method.");
      return;
    }
    const bookingPayload = buildBookingPayload(params);
    if (!bookingPayload.listingId) return;

    // Send normalized listingType so the backend can determine booking mode
    const rawListingType = params.get("listingType") || "";
    const listingTypeMap = { activities: "activity", places: "place", equipment: "equipment" };
    const normalizedType = listingTypeMap[rawListingType] ?? rawListingType;
    if (normalizedType) bookingPayload.listingType = normalizedType;

    bookingPayload.paymentMethodId = selectedPmId;

    setSubmitting(true);
    try {
      const result = await dispatch(createBooking(bookingPayload)).unwrap();
      const clientSecret = result?.data?.clientSecret ?? result?.clientSecret;
      const bookingId    = result?.data?.booking?.id  ?? result?.data?.id;

      // Handle 3DS if the PI requires additional action
      if (clientSecret) {
        const { error } = await handle3DS(stripe, clientSecret);
        if (error) {
          toast.error(error.message || "Card authentication failed.");
          setSubmitting(false);
          return;
        }
      }

      const skey = params.get("_skey");
      if (skey) sessionStorage.removeItem(skey);

      const successParams = new URLSearchParams();
      if (bookingId) successParams.set("bookingId", bookingId);
      const recipientId = params.get("recipientId");
      const listingId   = params.get("listingId");
      if (recipientId) successParams.set("recipientId", recipientId);
      if (listingId)   successParams.set("listingId",   listingId);

      router.push(`/user-dashboard/booking-success?${successParams.toString()}`);
    } catch (err) {
      const fieldErrors = err?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        Object.values(fieldErrors).forEach((msg) => toast.error(msg));
      } else {
        toast.error(typeof err === "string" ? err : (err?.message || "Booking failed. Please try again."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-16 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-900 hover:opacity-70 transition-opacity shrink-0">
            <BackIcon />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Confirm And Pay</h1>
        </div>
      </div>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 items-start">

          {/* LEFT column */}
          <div className="flex flex-col gap-4">

            {/* Trip Details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Trip Details</h2>
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#4AA7A7] hover:text-[#3d9090] transition-colors"
                >
                  <EditIcon /> Edit Details
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {(dateFrom || serverEndDate) && (
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-0.5">Dates</p>
                    <p className="text-sm text-gray-500">
                      {dateFrom && serverEndDate && dateFrom !== serverEndDate
                        ? `${dateFrom} – ${serverEndDate}`
                        : dateFrom || serverEndDate}
                    </p>
                  </div>
                )}
                {(startTime || serverEndTime) && (
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-0.5">Time</p>
                    <p className="text-sm text-gray-500">
                      {startTime && serverEndTime && startTime !== serverEndTime
                        ? `${formatTime(startTime)} – ${formatTime(serverEndTime)}`
                        : formatTime(startTime || serverEndTime)}
                    </p>
                  </div>
                )}
                {(() => {
                  const guestVal = params.get("numberOfGuests") || params.get("guests");
                  const displayGuests = guestVal
                    ? (isNaN(Number(guestVal)) ? guestVal : `${Number(guestVal)} guest${Number(guestVal) !== 1 ? "s" : ""}`)
                    : null;
                  return displayGuests ? (
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-0.5">Guests</p>
                      <p className="text-sm text-gray-500">{displayGuests}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Payment + Policy + Rules */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Select Payment Method</h2>
                <PaymentSection
                  selectedPmId={selectedPmId}
                  onSelect={setSelectedPmId}
                  onNewCardReady={setSelectedPmId}
                />
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Cancellation Policy</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  If you cancel before the host accepts, your card will not be charged.
                  If you cancel after the host accepts, the standard cancellation policy applies.
                </p>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Ground Rules</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Please treat all spaces and equipment with respect. Follow the host's house rules
                  and communicate any issues promptly.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT column */}
          <div className="flex flex-col gap-4">

            {/* Summary card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5">
              {/* Listing */}
              <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden shrink-0">
                  <img src={image} alt={title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                  {description && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>}
                </div>
              </div>

              {/* Price breakdown */}
              {quoteStatus === "loading" ? (
                <div className="flex items-center gap-2 py-2 text-sm text-gray-400">
                  <SpinnerIcon size={14} className="text-[#4AA7A7]" /> Loading price…
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-base font-bold text-gray-900 mb-3">Price Details</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{priceLabel}</span>
                      <span className="font-semibold text-gray-900">${subtotal.toLocaleString()}.00</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-gray-500">Delivery fee</span>
                        <span className="font-semibold text-gray-900">${deliveryFee}.00</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900 mb-3">Taxes &amp; Fees</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Funsival Fee</span>
                      <span className="font-semibold text-gray-900">${serviceFee}.00</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-[#F5C842]">$ {total.toLocaleString()}.00</span>
                  </div>
                </>
              )}
            </div>

            {/* Authorization notice */}
            <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
              <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-xs text-blue-700 leading-relaxed">
                Your card will be <strong>authorized but not charged</strong> until the host accepts your
                booking (up to 6 days). If declined or ignored, no charge occurs.
              </p>
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-[#FFF8E7] border border-[#F5C842]/30">
              <div className="relative mt-0.5 shrink-0">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="sr-only" />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${agreed ? "bg-[#4AA7A7] border-[#4AA7A7]" : "bg-white border-gray-300"}`}>
                  {agreed && <CheckIcon size={10} className="text-white" />}
                </div>
              </div>
              <span className="text-[12px] text-gray-600 leading-relaxed">
                I agree to the Cancellation Policy, Ground Rules, and Terms of Service
              </span>
            </label>

            {/* Confirm & Pay */}
            <div className="flex justify-end">
              <button
                onClick={handleConfirmAndPay}
                disabled={!canPay}
                className={`px-10 py-3.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${canPay ? "bg-[#FEB538] text-gray-900 hover:opacity-90" : "bg-[#F5C842]/40 text-gray-400 cursor-not-allowed"}`}
              >
                {submitting && <SpinnerIcon size={14} className="text-gray-600" />}
                {submitting ? "Processing…" : "Confirm & Pay"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

/* ─── Exported page — wraps with Stripe Elements ─────────────────────────────── */
export default function ConfirmAndPayPage() {
  return (
    <Elements stripe={stripePromise}>
      <ConfirmAndPayInner />
    </Elements>
  );
}
