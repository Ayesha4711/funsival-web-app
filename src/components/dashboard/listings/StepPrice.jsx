"use client";

import React, { useState, useEffect } from "react";

export default function StepPrice({ price, onChange, onNext, onBack }) {
  const [value, setValue] = useState(price || "");

  // Sync value when price prop changes (for edit mode)
  useEffect(
    () => {
      if (price !== undefined && price !== null && price !== "") {
        setValue(price);
      }
    },
    [price]
  );

  const handleNext = () => {
    onChange(value);
    onNext();
  };

  return (
    <div className="flex flex-col items-center pt-8 pb-10 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-2 text-center">
        Set Price
      </h2>
      <p className="text-sm text-gray-400 text-center mb-10">
        Tell us how you charge for this service
      </p>

      <div className="w-full max-w-md space-y-5">
        {/* Per Person label with clock icon */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            {/* Clock / timer icon — matches the image */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F5A623"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Per Person
          </p>

          {/* Price input */}
          <div className="flex items-center bg-[#F5F5F5] rounded-xl overflow-hidden border border-transparent focus-within:border-[var(--color-primary)] transition-colors">
            <span className="pl-4 pr-2 text-gray-400 font-bold text-base select-none">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="flex-1 pr-4 py-3 text-sm text-gray-700 focus:outline-none bg-transparent"
            />
          </div>

          <p className="text-[11px] text-[#62748E] mt-2">
            Enter the amount customers pay for this service.
          </p>
        </div>

        {/* Divider */}
        <hr className="border-gray-200" />

        {/* Fee note */}
        <p className="text-sm text-gray-400 leading-relaxed text-center">
          Funsival fee is{" "}
          <span className="text-primary font-bold">15%</span>
          . Customers will see the final price before booking.
        </p>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center gap-4 mt-10 w-full max-w-md">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-full font-bold text-sm border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={handleNext}
          disabled={!value || Number(value) <= 0}
          className="flex-1 py-3.5 rounded-full font-bold text-sm bg-[var(--color-secondary)] text-white hover:opacity-90 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
