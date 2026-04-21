"use client";

import React from "react";
import { useRouter } from "next/navigation";

/* ─── Celebration character illustration ─────────────────────────────────────── */
function CelebrationIllustration() {
  return (
    <svg
      width="180"
      height="220"
      viewBox="0 0 180 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* Confetti pieces */}
      <circle cx="30" cy="40" r="5" fill="#F5C842" opacity="0.9"/>
      <circle cx="150" cy="30" r="4" fill="#4DB6AC" opacity="0.9"/>
      <rect x="140" y="55" width="8" height="8" rx="2" fill="#F5C842" transform="rotate(30 144 59)"/>
      <rect x="20" y="70" width="7" height="7" rx="1.5" fill="#4DB6AC" transform="rotate(-20 23 73)"/>
      <circle cx="160" cy="80" r="3.5" fill="#EF5350" opacity="0.8"/>
      <circle cx="18" cy="105" r="3" fill="#7C4DFF" opacity="0.8"/>
      <rect x="155" y="100" width="6" height="6" rx="1.5" fill="#F5C842" transform="rotate(15 158 103)"/>
      <rect x="10" y="130" width="5" height="9" rx="1" fill="#4DB6AC" transform="rotate(-10 12 134)"/>
      <circle cx="165" cy="130" r="4" fill="#F5C842" opacity="0.9"/>
      <rect x="25" y="155" width="7" height="7" rx="2" fill="#EF5350" transform="rotate(25 28 158)"/>
      <circle cx="155" cy="160" r="3" fill="#4DB6AC" opacity="0.8"/>

      {/* Arms raised — left */}
      <path
        d="M72 110 C60 100 48 88 42 78"
        stroke="#5C3D1E"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Arms raised — right */}
      <path
        d="M108 110 C120 100 132 88 138 78"
        stroke="#5C3D1E"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* Body — yellow coat */}
      <path
        d="M72 130 L70 185 Q90 195 110 185 L108 130 Q90 122 72 130Z"
        fill="#F5C842"
      />
      {/* Coat lapels / collar */}
      <path d="M85 130 L90 145 L95 130" stroke="#E0A800" strokeWidth="2" fill="none" strokeLinejoin="round"/>

      {/* Legs — purple */}
      <rect x="76" y="183" width="14" height="30" rx="7" fill="#5C35B5"/>
      <rect x="90" y="183" width="14" height="30" rx="7" fill="#5C35B5"/>
      {/* Shoes */}
      <ellipse cx="83" cy="213" rx="10" ry="6" fill="#3D2080"/>
      <ellipse cx="97" cy="213" rx="10" ry="6" fill="#3D2080"/>

      {/* Neck */}
      <rect x="84" y="115" width="12" height="16" rx="6" fill="#D4956A"/>

      {/* Head */}
      <circle cx="90" cy="98" r="22" fill="#D4956A"/>

      {/* Eyes — happy closed curves */}
      <path d="M82 95 Q85 91 88 95" stroke="#3D2080" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M92 95 Q95 91 98 95" stroke="#3D2080" strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* Smile */}
      <path d="M83 103 Q90 110 97 103" stroke="#3D2080" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

      {/* Hair / hat brim */}
      <ellipse cx="90" cy="77" rx="23" ry="8" fill="#3D2080"/>
      {/* Hat body */}
      <rect x="74" y="57" width="32" height="22" rx="6" fill="#5C35B5"/>
      {/* Hat decoration star */}
      <circle cx="90" cy="68" r="4" fill="#F5C842"/>
    </svg>
  );
}

/* ─── Component ──────────────────────────────────────────────────────────────── */
export default function StepSuccess({ onDone, onAddMore }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center text-center px-4 pt-8 pb-12">
      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-3">
        Listing Posted Successfully
      </h2>
      <p className="text-xs sm:text-sm text-gray-400 max-w-sm sm:max-w-md leading-relaxed mb-7">
        Lorem ipsum dolor sit amet consectetur. In pellentesque id arcu ut risus ipsum. Tortor sed malesuada nisi. Consectetur pellentesque. Ipsum at posuere nulla alit nisi.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
        <button
          onClick={onDone}
          className="w-44 sm:w-auto px-8 py-3 rounded-full font-bold text-sm border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
        >
          Go to Home Page
        </button>
        <button
          onClick={onAddMore}
          className="w-44 sm:w-auto px-8 py-3 rounded-full font-bold text-sm bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark,#2d7d7d)] transition-colors"
        >
          Add More
        </button>
      </div>

      {/* Celebration illustration */}
      <CelebrationIllustration />
    </div>
  );
}
