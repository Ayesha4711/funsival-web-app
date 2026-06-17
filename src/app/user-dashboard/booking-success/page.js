"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchBooking } from "@/store/slices/bookingsSlice";
import AppFooter from "@/components/shared/AppFooter";
import { ArrowRightIcon, MessageIcon as ChatIcon, SpinnerIcon } from "@/icons";

const SETTLED_STATUSES = ["authorized", "held", "released", "refunded", "auth_released", "failed"];
const MAX_POLLS = 10;          // hard cap — ~30 s total worst-case
const BASE_INTERVAL_MS = 2000; // first retry after 2 s, then 4 s, 4 s, …
const MAX_INTERVAL_MS  = 4000;

export default function BookingSuccessPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const dispatch     = useDispatch();

  const bookingId   = searchParams.get("bookingId") || searchParams.get("BOOKING_ID");
  const recipientId = searchParams.get("recipientId");
  const listingId   = searchParams.get("listingId");

  const [bookingStatus, setBookingStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [polling, setPolling]             = useState(!!bookingId);

  const timerRef    = useRef(null);
  const pollCount   = useRef(0);
  const destroyed   = useRef(false);

  useEffect(() => {
    if (!bookingId) { setPolling(false); return; }
    destroyed.current = false;

    const poll = async () => {
      if (destroyed.current) return;
      try {
        const result = await dispatch(fetchBooking(bookingId)).unwrap();
        if (destroyed.current) return;
        const bStatus = result?.data?.status        ?? result?.status;
        const pStatus = result?.data?.paymentStatus ?? result?.paymentStatus;
        setBookingStatus(bStatus);
        setPaymentStatus(pStatus);

        if (SETTLED_STATUSES.includes(pStatus)) { setPolling(false); return; }
      } catch {
        // keep trying on transient errors
      }

      pollCount.current += 1;
      if (pollCount.current >= MAX_POLLS) { setPolling(false); return; }

      const delay = Math.min(BASE_INTERVAL_MS * Math.pow(1.5, pollCount.current - 1), MAX_INTERVAL_MS);
      timerRef.current = setTimeout(poll, delay);
    };

    poll();
    return () => {
      destroyed.current = true;
      clearTimeout(timerRef.current);
    };
  }, [bookingId, dispatch]);

  const handleChatWithProvider = () => {
    if (!recipientId) return;
    const p = new URLSearchParams({ startChat: recipientId });
    if (listingId) p.set("listingId", listingId);
    p.set("message", "Hi, I just sent a booking request. Looking forward to it!");
    router.push(`/user-dashboard/messages?${p.toString()}`);
  };

  // Derive UI state from booking/payment status
  const isAwaitingHost = bookingStatus === "awaiting_host_approval" || paymentStatus === "authorized";
  const isConfirmed    = bookingStatus === "confirmed" || paymentStatus === "held" || paymentStatus === "released";
  const isDeclined     = bookingStatus === "declined"  || bookingStatus === "cancelled";

  const headline = isConfirmed  ? "Booking Confirmed!"
                 : isDeclined   ? "Booking Declined"
                 : isAwaitingHost ? "Request Sent!"
                 : "Booking Received!";

  const subtext = isConfirmed
    ? "Your payment was successful and the host has accepted."
    : isDeclined
    ? "The host has declined your request. No charge was made."
    : isAwaitingHost
    ? "Your card has been authorized. Your booking request has been sent to the host. You will only be charged if the host accepts (up to 6 days)."
    : "We received your booking. Confirming payment status…";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">

        {polling ? (
          <div className="flex flex-col items-center gap-4 mb-8">
            <SpinnerIcon size={40} className="text-[#4AA7A7]" />
            <p className="text-gray-500 text-sm text-center">Confirming your booking…</p>
          </div>
        ) : (
          <div className="mb-8">
            <Image
              src="/congratulations.png"
              alt="Booking status"
              width={320}
              height={320}
              className="mx-auto"
              priority
            />
          </div>
        )}

        {!polling && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">{headline}</h1>

            <p className="text-gray-400 text-sm text-center mb-4 max-w-sm leading-relaxed">{subtext}</p>

            {/* Awaiting host banner */}
            {isAwaitingHost && (
              <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl mb-8 max-w-sm">
                <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs text-blue-700 leading-relaxed">
                  The host has up to <strong>6 days</strong> to respond. If they don't act, your booking is auto-declined and no charge occurs.
                </p>
              </div>
            )}

            <div className="flex flex-col items-center gap-4 w-56 mt-2">
              {recipientId && !isDeclined && (
                <button
                  onClick={handleChatWithProvider}
                  className="flex items-center justify-between bg-[#4AA7A7] hover:opacity-90 text-white font-bold text-sm rounded-full transition-opacity pl-8 pr-2 py-2 w-full"
                >
                  <span className="flex-1 text-center">Chat with Provider</span>
                  <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-[#4AA7A7]">
                    <ChatIcon />
                  </span>
                </button>
              )}
              <button
                onClick={() => router.push("/user-dashboard/bookings")}
                className="flex items-center justify-between bg-[#FEB538] text-gray-900 font-bold text-sm rounded-full transition-colors pl-8 pr-2 py-2 w-full"
              >
                <span className="flex-1 text-center">View My Bookings</span>
                <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-gray-800">
                  <ArrowRightIcon />
                </span>
              </button>
              <button
                onClick={() => router.push("/user-dashboard/explore")}
                className="text-sm text-[#4AA7A7] hover:underline font-medium"
              >
                Explore More
              </button>
            </div>
          </>
        )}
      </main>

      <AppFooter />
    </div>
  );
}
