"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import AppFooter from "@/components/shared/AppFooter";
const ArrowRightIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
export default function BookingSuccessPage() {
  const router = useRouter();

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

        {/* Explore Now button */}
        <button
          onClick={() => router.push("/user-dashboard/explore")}
          className="flex items-center justify-between bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-bold text-sm rounded-full transition-colors pl-8 pr-2 py-2 w-56"
        >
          <span className="flex-1 text-center">Explore Now</span>
          <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-gray-800">
            <ArrowRightIcon />
          </span>
        </button>
      </main>

      <AppFooter />
    </div>
  );
}
