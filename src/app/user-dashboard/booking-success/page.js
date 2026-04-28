"use client";

import { useRouter } from "next/navigation";
import NewsletterSection from "@/components/landing/NewsletterSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function BookingSuccessPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Illustration */}
        <div className="relative mb-8">
          {/* Background circle */}
          <div className="w-52 h-52 rounded-full bg-[#F0FAF5] flex items-center justify-center">
            {/* Celebration SVG illustration */}
            <svg viewBox="0 0 200 200" className="w-44 h-44" fill="none">
              {/* Body */}
              <ellipse cx="100" cy="145" rx="28" ry="38" fill="#4AA7A7" />
              {/* Head */}
              <circle cx="100" cy="88" r="26" fill="#F5C842" />
              {/* Hair */}
              <ellipse cx="100" cy="66" rx="26" ry="14" fill="#E05C2A" />
              {/* Left arm up */}
              <path d="M72 115 Q50 90 42 68" stroke="#4AA7A7" strokeWidth="10" strokeLinecap="round" />
              {/* Right arm up */}
              <path d="M128 115 Q150 90 158 68" stroke="#4AA7A7" strokeWidth="10" strokeLinecap="round" />
              {/* Legs */}
              <path d="M88 180 Q84 198 80 210" stroke="#4AA7A7" strokeWidth="9" strokeLinecap="round" />
              <path d="M112 180 Q116 198 120 210" stroke="#4AA7A7" strokeWidth="9" strokeLinecap="round" />
              {/* Left balloon */}
              <circle cx="38" cy="58" r="16" fill="#F5823A" />
              <path d="M38 74 Q36 82 34 88" stroke="#F5823A" strokeWidth="1.5" />
              {/* Right balloon */}
              <circle cx="162" cy="52" r="16" fill="#4AA7A7" />
              <path d="M162 68 Q164 76 166 82" stroke="#4AA7A7" strokeWidth="1.5" />
              {/* Confetti */}
              <rect x="55" y="30" width="7" height="7" rx="1" fill="#F5C842" transform="rotate(20 55 30)" />
              <rect x="138" y="22" width="6" height="6" rx="1" fill="#F5823A" transform="rotate(-15 138 22)" />
              <rect x="25" y="100" width="5" height="5" rx="1" fill="#4AA7A7" transform="rotate(30 25 100)" />
              <rect x="165" y="95" width="6" height="6" rx="1" fill="#F5C842" transform="rotate(-25 165 95)" />
              <path d="M70 18 Q72 10 78 12" stroke="#4AA7A7" strokeWidth="2" strokeLinecap="round" />
              <path d="M130 28 Q135 20 140 24" stroke="#F5823A" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">Congratulations !!!</h1>
        <p className="text-gray-400 text-sm text-center mb-10">
          Great !! Your Booking has been added successfully.
        </p>

        {/* Explore Now button */}
        <button
          onClick={() => router.push("/user-dashboard/explore")}
          className="flex items-center gap-3 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-semibold text-sm px-8 py-3.5 rounded-full transition-colors"
        >
          Explore Now
          <span className="w-7 h-7 bg-white/40 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </main>

      <NewsletterSection />
      <LandingFooter />
    </div>
  );
}
