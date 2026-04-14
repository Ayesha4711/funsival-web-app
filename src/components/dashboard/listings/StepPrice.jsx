"use client";

import React, { useState } from "react";

export default function StepPrice({ price, onChange, onNext, onBack }) {
  const [value, setValue] = useState(price || "");

  const handleNext = () => {
    onChange(value);
    onNext();
  };

  return (
    <div className="flex flex-col items-center pt-8 pb-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-2 text-center">
        Set Price
      </h2>
      <p className="text-sm text-gray-400 text-center mb-10">
        Tell us how you charge for this service
      </p>

      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
        {/* Per Person label */}
        <div>
          <p className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Per Person
          </p>

          {/* Price input with currency prefix */}
          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-[var(--color-primary)] transition-colors">
            <span className="px-3 py-3 bg-gray-50 border-r border-gray-200 text-gray-400 font-bold text-sm select-none">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="flex-1 px-3 py-3 text-sm text-gray-700 focus:outline-none bg-white"
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Enter the amount customers pay for this service.
          </p>
        </div>

        {/* Platform fee note */}
        <div className="flex items-start gap-2 bg-[var(--color-primary-light)] rounded-xl px-4 py-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-[11px] text-[var(--color-primary)] leading-relaxed">
            Funsival fee is <strong>10%</strong>. Customers will see the final price before booking.
          </p>
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center gap-4 mt-10">
        <button
          onClick={onBack}
          className="px-10 py-3 rounded-full font-bold text-sm border-2 border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={handleNext}
          disabled={!value || Number(value) <= 0}
          className="px-10 py-3 rounded-full font-bold text-sm bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
