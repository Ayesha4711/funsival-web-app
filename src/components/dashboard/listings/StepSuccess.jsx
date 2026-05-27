"use client";

import React from "react";
import Image from "next/image";
import illustration from "@/assets/images/Celebration.jpg";

/* ─── Component ──────────────────────────────────────────────────────────────── */
export default function StepSuccess({ onDone, onAddMore }) {
  return (
    <div className="flex flex-col items-center text-center px-4 pt-8 pb-12">
      {/* Celebration illustration */}
      <Image src={illustration} alt="" width={180} height={220} className="mx-auto h-auto w-[180px]" priority />

      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mt-6 mb-3">
        Listing Posted Successfully
      </h2>
      <p className="text-xs sm:text-sm text-gray-400 max-w-sm sm:max-w-md leading-relaxed mb-7">
        Lorem ipsum dolor sit amet consectetur. In pellentesque id arcu ut risus ipsum. Tortor sed malesuada nisi. Consectetur pellentesque. Ipsum at posuere nulla alit nisi.
      </p>

      {/* Action buttons — side by side full width on mobile */}
      <div className="flex items-center gap-3 w-full sm:w-auto sm:justify-center">
        <button
          onClick={onDone}
          className="flex-1 sm:flex-none sm:px-10 py-3 rounded-full font-bold text-sm border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={onAddMore}
          className="flex-1 sm:flex-none sm:px-10 py-3 rounded-full font-bold text-sm bg-[var(--color-primary)] text-white hover:opacity-90 transition-colors"
        >
          Add More
        </button>
      </div>
    </div>
  );
}
