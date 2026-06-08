"use client";

import { useRouter, useSearchParams } from "next/navigation";
import AppFooter from "@/components/shared/AppFooter";
import { ArrowRightIcon } from "@/icons";

export default function BookingCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || searchParams.get("BOOKING_ID");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6 text-4xl">
          ✕
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          Payment Cancelled
        </h1>
        <p className="text-gray-400 text-sm text-center max-w-xs mb-10">
          You cancelled the payment process. Your booking has not been confirmed.
        </p>

        <div className="flex flex-col items-center gap-4 w-56">
          {bookingId && (
            <button
              onClick={() => router.push(`/user-dashboard/bookings`)}
              className="flex items-center justify-between bg-[#4AA7A7] hover:opacity-90 text-white font-bold text-sm rounded-full transition-opacity pl-8 pr-2 py-2 w-full"
            >
              <span className="flex-1 text-center">View My Bookings</span>
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-[#4AA7A7]">
                <ArrowRightIcon />
              </span>
            </button>
          )}
          <button
            onClick={() => router.push("/user-dashboard/explore")}
            className="flex items-center justify-between bg-[#FEB538] text-gray-900 font-bold text-sm rounded-full transition-colors pl-8 pr-2 py-2 w-full"
          >
            <span className="flex-1 text-center">Explore Listings</span>
            <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-gray-800">
              <ArrowRightIcon />
            </span>
          </button>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
