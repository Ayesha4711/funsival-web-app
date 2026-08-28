"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe } from "@stripe/react-stripe-js";

import {
  createBooking,
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

function readStoredBooking(sessionKey) {
  if (!sessionKey || typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(sessionKey) || "{}");
  } catch {
    return {};
  }
}

function parseStoredSlots(rawSlots) {
  if (Array.isArray(rawSlots)) return rawSlots;
  if (typeof rawSlots === "string" && rawSlots.trim()) {
    try {
      const parsed = JSON.parse(rawSlots);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/* ─── Trip Details field typography ──────────────────────────────────────────── */
const SECTION_HEADING_STYLE = {
  fontFamily: "var(--font-sofia-pro)",
  fontWeight: 600,
  fontSize: "20px",
  lineHeight: "140%",
  letterSpacing: "0px",
  verticalAlign: "middle",
};
const FIELD_LABEL_STYLE = {
  fontFamily: "var(--font-sofia-pro)",
  fontWeight: 500,
  fontSize: "18.48px",
  lineHeight: "160%",
  letterSpacing: "0%",
  verticalAlign: "middle",
  color: "#121D1D",
};
const FIELD_SUBTEXT_STYLE = {
  fontFamily: "var(--font-sofia-pro)",
  fontWeight: 300,
  fontSize: "18.48px",
  lineHeight: "160%",
  letterSpacing: "0%",
  verticalAlign: "middle",
  color: "#717171",
};

function formatMoney(amount, currency = "USD", minimumFractionDigits = 2, maximumFractionDigits = 2) {
  const numeric = Number(amount);
  const value = Number.isFinite(numeric) ? numeric : 0;
  const code = String(currency || "").trim().toUpperCase();
  const symbol = code === "PKR" ? "Rs" : code === "USD" ? "$" : code === "EUR" ? "€" : code === "GBP" ? "£" : (code || "$");
  return `${symbol} ${value.toLocaleString("en-US", { minimumFractionDigits, maximumFractionDigits })}`;
}

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
  const sessionKey = params.get("_skey");
  const stored = readStoredBooking(sessionKey);
  const storedSlots = parseStoredSlots(stored.slots);

  const returnUrl = typeof window !== "undefined"
    ? `${window.location.origin}/user-dashboard/booking-success`
    : "";

  const base = {
    listingId,
    return_url: returnUrl,
    returnUrl: returnUrl,
  };

  if (bookingType === "per_person") {
    return {
      ...base,
      startDate,
      startTime,
      endTime,
      numberOfGuests: Number(numberOfGuests) || 1,
    };
  }

  const mode = pricingMode || stored.pricingMode || (bookingType === "daily" ? "daily" : "hourly");
  const payload = { ...base, pricingMode: mode, startDate: startDate || stored.selectedDate || stored.startDate || "" };

  if (mode === "hourly") {
    const slots = storedSlots.length > 0 ? storedSlots : parseStoredSlots(params.get("slots"));
    if (slots.length > 0) {
      payload.slots = slots
        .filter((slot) => slot?.startTime && slot?.endTime)
        .map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
        }));
    } else {
      payload.startTime = startTime || stored.startTime || "";
      if (endTime || stored.endTime) payload.endTime = endTime || stored.endTime;
      if (durationHours || stored.totalHours) payload.durationHours = Number(durationHours || stored.totalHours);
    }
  } else {
    // daily mode — endDate required; send startTime = endTime so both are stored
    if (endDate) payload.endDate = endDate;
    if (startTime) {
      payload.startTime = startTime;
      payload.endTime   = startTime;
    }
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

  const handleModalSuccess = (pmId) => {
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
  const returnUrl = typeof window !== "undefined"
    ? `${window.location.origin}/user-dashboard/booking-success`
    : undefined;
  const { error } = await stripe.confirmCardPayment(clientSecret, {
    return_url: returnUrl,
  });
  return { error };
}

/* ─── Inner page (needs Stripe + Elements context) ────────────────────────────── */
function ConfirmAndPayInner() {
  const router   = useRouter();
  const params   = useSearchParams();
  const dispatch = useDispatch();
  const stripe   = useStripe();

  const title       = params.get("title")       || "Listing";
  const description = params.get("description") || "";
  const image       = params.get("image")       || "https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=200&q=80";
  const dateFrom    = params.get("dateFrom")    || params.get("startDate") || "";
  const dateTo      = params.get("dateTo")      || params.get("endDate")   || "";
  const startTime   = params.get("startTime")   || "";
  const endTime     = params.get("endTime")     || "";
  const bookingType  = params.get("bookingType")  || "";
  const pricingMode  = params.get("pricingMode")  || "";
  const sessionKey   = params.get("_skey") || "";
  const storedBooking = readStoredBooking(sessionKey);
  const storedSlots = parseStoredSlots(storedBooking.slots);

  const toNum = (v, fb = 0) => { const n = Number(String(v ?? "").replace(/[^\d.-]/g, "")); return Number.isFinite(n) ? n : fb; };
  const pricePerUnit = toNum(params.get("pricePerUnit"), toNum(storedBooking.hourlyPrice, 0));
  const unitsBooked  = storedSlots.length > 0
    ? toNum(params.get("units") ?? params.get("hours") ?? storedBooking.totalHours, storedBooking.slotDurationMinutes
      ? storedSlots.reduce((sum, slot) => {
          const minutes = toNum(slot.durationMinutes, toNum(storedBooking.slotDurationMinutes, 0));
          return sum + (minutes / 60);
        }, 0)
      : 1)
    : toNum(params.get("units") ?? params.get("hours") ?? storedBooking.totalHours, 1);
  const serviceFee   = toNum(params.get("funsivalFee"), 8);
  const subtotal     = pricePerUnit * unitsBooked;
  const total        = subtotal + serviceFee;
  const currency     = storedBooking.currency || "USD";

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  };

  const serverEndDate = dateTo || dateFrom;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const priceLabel = (() => {
    if (bookingType === "per_person") return `$${pricePerUnit} × ${unitsBooked} person(s)`;
    if (bookingType === "hourly" || bookingType === "per_hour") return `${formatMoney(pricePerUnit, currency)} × ${unitsBooked} hour(s)`;
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
      const isSlotConflict =
        err?.status === 409 ||
        !!err?.details?.slots ||
        !!err?.errors?.slots ||
        (typeof err?.message === "string" && err.message.toLowerCase().includes("no longer available"));

      if (isSlotConflict) {
        toast.error("One or more selected time slots are no longer available. Please refresh and reselect.");
        const listingId = params.get("listingId");
        const rawListingType = params.get("listingType") || "";
        if (listingId) {
          const backParams = new URLSearchParams();
          if (rawListingType) backParams.set("type", rawListingType);
          backParams.set("slotRefresh", String(Date.now()));
          router.push(`/user-dashboard/listing/${listingId}?${backParams.toString()}`);
        } else {
          router.back();
        }
        return;
      }

      const mainMsg = typeof err === "string"
        ? err
        : (typeof err?.message === "string" ? err.message : "Booking failed. Please try again.");

      toast.error(mainMsg);

      if (err?.errors && typeof err.errors === "object") {
        Object.entries(err.errors).forEach(([key, val]) => {
          if (key === "slots") return;
          if (typeof val === "string") {
            toast.error(val);
          } else if (Array.isArray(val)) {
            val.forEach((item) => {
              if (typeof item === "string") {
                toast.error(item);
              } else if (item && typeof item === "object") {
                const itemStr = Object.values(item).filter((v) => typeof v === "string").join(" - ");
                if (itemStr) toast.error(itemStr);
              }
            });
          }
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-100">
        <div className="flex items-center gap-4 px-3 sm:px-6 lg:px-8 h-14 sm:h-16">
          <button
            onClick={() => router.back()}
            className="flex shrink-0 items-center justify-center text-gray-700 hover:text-[#4AA7A7] transition-colors"
          >
            <BackIcon />
          </button>
          <h1 className="font-bold text-gray-900" style={{ fontFamily: "var(--font-sofia-pro)", fontSize: "22px" }}>Confirm And Pay</h1>
        </div>
      </div>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 items-start">

          {/* LEFT column */}
          <div className="flex flex-col gap-4">

            {/* Trip Details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900 capitalize" style={SECTION_HEADING_STYLE}>
                  Trip Details
                </h2>
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-1.5 text-[#4AA7A7] hover:text-[#3d9090] transition-colors"
                  style={{ fontFamily: "var(--font-sofia-pro)", fontWeight: 600, fontSize: "14px", lineHeight: "170%", letterSpacing: "0%", verticalAlign: "middle", textDecoration: "underline" }}
                >
                  <EditIcon /> Edit Details
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {(pricingMode === "daily" || bookingType === "daily") ? (
                  /* Daily — dates row + optional time row */
                  (dateFrom || serverEndDate) && (
                    <>
                      <div>
                        <p className="text-gray-900 mb-0.5" style={FIELD_LABEL_STYLE}>Dates</p>
                        <p style={FIELD_SUBTEXT_STYLE}>
                          {dateFrom && serverEndDate && dateFrom !== serverEndDate
                            ? `${formatDate(dateFrom)} – ${formatDate(serverEndDate)}`
                            : formatDate(dateFrom || serverEndDate)}
                        </p>
                      </div>
                      {(startTime || endTime) && (
                        <div>
                          <p className="text-gray-900 mb-0.5" style={FIELD_LABEL_STYLE}>Time</p>
                          <p style={FIELD_SUBTEXT_STYLE}>
                            {startTime && endTime && startTime !== endTime
                              ? `${formatTime(startTime)} – ${formatTime(endTime)}`
                              : formatTime(startTime || endTime)}
                          </p>
                        </div>
                      )}
                      {(startTime || endTime) && (
                        <div className="rounded-2xl border border-[#E9EEF8] bg-[#F9FBFF] p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900">
                                {startTime && endTime && startTime !== endTime
                                  ? `${formatTime(startTime)} – ${formatTime(endTime)}`
                                  : formatTime(startTime || endTime)}
                              </p>
                              <p className="mt-0.5 text-xs text-gray-500">Daily slot preview</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Price</p>
                              <p className="text-base font-bold text-[#2f4d86]">{formatMoney(subtotal, currency)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )
                ) : (
                  /* Hourly / per-person — separate Dates + Time rows */
                  <>
                    {(dateFrom || serverEndDate) && (
                      <div>
                        <p className="text-gray-900 mb-0.5" style={FIELD_LABEL_STYLE}>Dates</p>
                        <p style={FIELD_SUBTEXT_STYLE}>
                          {dateFrom && serverEndDate && dateFrom !== serverEndDate
                            ? `${formatDate(dateFrom)} – ${formatDate(serverEndDate)}`
                            : formatDate(dateFrom || serverEndDate)}
                        </p>
                      </div>
                    )}
                    {storedSlots.length > 0 ? (
                      <div>
                        <p className="text-gray-900 mb-0.5" style={FIELD_LABEL_STYLE}>Selected Slots</p>
                        <div className="space-y-1">
                          {storedSlots.map((slot, index) => (
                            <p key={`${slot.startTime}-${slot.endTime}-${index}`} style={FIELD_SUBTEXT_STYLE}>
                              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      (startTime || endTime) && (
                        <div>
                          <p className="text-gray-900 mb-0.5" style={FIELD_LABEL_STYLE}>Time</p>
                          <p style={FIELD_SUBTEXT_STYLE}>
                            {startTime && endTime && startTime !== endTime
                              ? `${formatTime(startTime)} – ${formatTime(endTime)}`
                              : formatTime(startTime || endTime)}
                          </p>
                        </div>
                      )
                    )}
                  </>
                )}
                {(() => {
                  const guestVal = params.get("numberOfGuests") || params.get("guests");
                  const displayGuests = guestVal
                    ? (isNaN(Number(guestVal)) ? guestVal : `${Number(guestVal)} guest${Number(guestVal) !== 1 ? "s" : ""}`)
                    : null;
                  return displayGuests ? (
                    <div>
                      <p className="text-gray-900 mb-0.5" style={FIELD_LABEL_STYLE}>Guests</p>
                      <p style={FIELD_SUBTEXT_STYLE}>{displayGuests}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Payment + Policy + Rules */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-6">
              <div>
                <h2 className="text-gray-900 capitalize mb-4" style={SECTION_HEADING_STYLE}>Select Payment Method</h2>
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
                  Please treat all spaces and equipment with respect. Follow the host&apos;s house rules
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
              <div>
                <p
                  className="mb-3 capitalize"
                  style={{ fontFamily: "var(--font-sofia-pro)", fontWeight: 600, fontSize: "20px", lineHeight: "140%", letterSpacing: "0px", verticalAlign: "middle", color: "#121D1D" }}
                >
                  Price Details
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ fontFamily: "var(--font-sofia-pro)", fontWeight: 300, fontSize: "16px", lineHeight: "160%", letterSpacing: "0%", verticalAlign: "middle", color: "#424242" }}>{priceLabel}</span>
                  <span style={{ color: "#424242" }}>{formatMoney(subtotal, currency)}</span>
                </div>
              </div>
              <div>
                <p
                  className="mb-3 capitalize"
                  style={{ fontFamily: "var(--font-sofia-pro)", fontWeight: 600, fontSize: "20px", lineHeight: "140%", letterSpacing: "0px", verticalAlign: "middle", color: "#121D1D" }}
                >
                  Taxes &amp; Fees
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ fontFamily: "var(--font-sofia-pro)", fontWeight: 300, fontSize: "16px", lineHeight: "160%", letterSpacing: "0%", verticalAlign: "middle", color: "#424242" }}>Funsival Fee</span>
                  <span style={{ color: "#424242" }}>${serviceFee}.00</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span
                  className="capitalize"
                  style={{ fontFamily: "var(--font-sofia-pro)", fontWeight: 600, fontSize: "24px", lineHeight: "140%", letterSpacing: "0%", textAlign: "right", color: "#FF7201" }}
                >
                  Total
                </span>
                <span
                  className="capitalize"
                  style={{ fontFamily: "var(--font-sofia-pro)", fontWeight: 600, fontSize: "24px", lineHeight: "140%", letterSpacing: "0%", textAlign: "right", color: "#FF7201" }}
                >
                  {formatMoney(total, currency)}
                </span>
              </div>
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
                className={`rounded-full transition-all flex items-center justify-center gap-2 ${canPay ? "bg-[#FEB538] text-gray-900 hover:opacity-90" : "bg-[#FEB538] text-gray-900 cursor-not-allowed opacity-30"}`}
                style={{ width: 300, height: 64, fontFamily: "var(--font-sofia-pro)", fontWeight: 500, fontSize: "20px", lineHeight: "160%", letterSpacing: "0%", verticalAlign: "middle" }}
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
