"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchBooking } from "@/store/slices/bookingsSlice";
import AppFooter from "@/components/shared/AppFooter";
import { ArrowRightIcon, MessageIcon as ChatIcon, SpinnerIcon } from "@/icons";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20; // ~60 seconds

export default function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const bookingId = searchParams.get("bookingId") || searchParams.get("BOOKING_ID");
  const recipientId = searchParams.get("recipientId");
  const listingId = searchParams.get("listingId");

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [polling, setPolling] = useState(!!bookingId);
  const pollCount = useRef(0);

  useEffect(() => {
    if (!bookingId) {
      setPolling(false);
      return;
    }

    let timer;
    const poll = async () => {
      try {
        const result = await dispatch(fetchBooking(bookingId)).unwrap();
        const status = result?.data?.paymentStatus ?? result?.paymentStatus;
        setPaymentStatus(status);
        if (status === "held" || status === "released") {
          setPolling(false);
          return;
        }
      } catch {
        // keep polling on transient errors
      }
      pollCount.current += 1;
      if (pollCount.current >= MAX_POLLS) {
        setPolling(false);
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
    return () => clearTimeout(timer);
  }, [bookingId, dispatch]);

  const handleChatWithProvider = () => {
    if (!recipientId) return;
    const params = new URLSearchParams({ startChat: recipientId });
    if (listingId) params.set("listingId", listingId);
    params.set("message", "Hi, I just made a reservation. Looking forward to it!");
    router.push(`/user-dashboard/messages?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {polling ? (
          <div className="flex flex-col items-center gap-4 mb-8">
            <SpinnerIcon size={40} className="text-[#4AA7A7]" />
            <p className="text-gray-500 text-sm text-center">Confirming your payment…</p>
          </div>
        ) : (
          <div className="mb-8">
            <Image
              src="/congratulations.png"
              alt="Congratulations"
              width={320}
              height={320}
              className="mx-auto"
              priority
            />
          </div>
        )}

        {!polling && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">
              {paymentStatus === "held" || paymentStatus === "released"
                ? "Booking Confirmed!"
                : "Booking Received!"}
            </h1>
            <p className="text-gray-400 text-sm text-center mb-10">
              {paymentStatus === "held" || paymentStatus === "released"
                ? "Your payment was successful. Your booking is confirmed."
                : "We received your booking. Payment confirmation may take a moment."}
            </p>

            <div className="flex flex-col items-center gap-4 w-56">
              {recipientId && (
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
