"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import AppFooter from "@/components/shared/AppFooter";
import { ArrowRightIcon, MessageIcon as ChatIcon } from "@/icons";

export default function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ConfirmAndPayPage passes these via query string after booking creation
  const recipientId = searchParams.get("recipientId");
  const listingId = searchParams.get("listingId");

  const handleChatWithProvider = () => {
    if (!recipientId) return;
    const params = new URLSearchParams({ startChat: recipientId });
    if (listingId) params.set("listingId", listingId);
    params.set(
      "message",
      "Hi, I just made a reservation. Looking forward to it!",
    );
    router.push(`/user-dashboard/messages?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Illustration */}
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

        {/* Text */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">
          Congratulations !!!
        </h1>
        <p className="text-gray-400 text-sm text-center mb-10">
          Great !! Your Booking has been added successfully.
        </p>

        <div className="flex flex-col items-center gap-4 w-56">
          {/* Chat with Provider button — shown only when recipientId is available */}
          {recipientId && (
            <button
              onClick={handleChatWithProvider}
              className="flex items-center justify-between bg-(--color-primary,#4AA7A7) hover:opacity-90 text-white font-bold text-sm rounded-full transition-opacity pl-8 pr-2 py-2 w-full"
            >
              <span className="flex-1 text-center">Chat with Provider</span>
              <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-(--color-primary,#4AA7A7)">
                <ChatIcon />
              </span>
            </button>
          )}

          {/* Explore Now button */}
          <button
            onClick={() => router.push("/user-dashboard/explore")}
            className="flex items-center justify-between bg-[#FEB538]  text-gray-900 font-bold text-sm rounded-full transition-colors pl-8 pr-2 py-2 w-full"
          >
            <span className="flex-1 text-center">Explore Now</span>
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
