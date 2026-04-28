"use client";

import React, { useMemo, useState } from "react";
import { getPriceMode, normalizeListingPrice } from "./listingPrice";

function FieldHint({ children }) {
  return <p className="text-[11px] sm:text-xs text-[#62748E] leading-relaxed mt-1.5">{children}</p>;
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
        checked ? "bg-[#228E8A]" : "bg-gray-300",
      ].join(" ")}
      aria-pressed={checked}
    >
      <span
        className={[
          "inline-block h-5 w-5 rounded-full bg-white transition-transform",
          checked ? "translate-x-5" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

function CurrencyInput({ value, onChange, suffix, placeholder = "0.00" }) {
  return (
    <div className="flex items-center bg-[#F5F5F5] rounded-xl overflow-hidden border border-transparent focus-within:border-[var(--color-primary)] transition-colors min-h-[48px]">
      <span className="pl-4 pr-2 text-gray-400 font-bold text-base select-none">$</span>
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent"
      />
      {suffix && <span className="pr-4 text-sm font-semibold text-gray-400">{suffix}</span>}
    </div>
  );
}

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const TruckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#50627A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7h13l3 4v6H3z" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
  </svg>
);

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4263EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default function StepPrice({ category, price, onChange, onNext, onBack }) {
  const mode = getPriceMode(category);
  const [form, setForm] = useState(() => normalizeListingPrice(category, price));

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateDelivery = (key, value) =>
    setForm((prev) => ({
      ...prev,
      delivery: { ...(prev.delivery ?? { enabled: false, fee: "" }), [key]: value },
    }));

  const canProceed = useMemo(() => {
    if (mode === "equipment") return form.hourly !== "" || form.daily !== "" || form.delivery?.fee !== "";
    if (mode === "places") return form.hourly !== "";
    return form.perPerson !== "";
  }, [form, mode]);

  const handleNext = () => { onChange(form); onNext(); };

  return (
    <div className="flex flex-col items-center pt-6 sm:pt-10 pb-10 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-2 text-center">Set Price</h2>
      <p className="text-sm text-gray-400 text-center mb-8 sm:mb-10">Tell us how you charge for this service</p>

      {/* ── Activities: Per Person ── */}
      {mode === "activities" && (
        <div className="w-full max-w-md space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <ClockIcon /> Per Person
            </p>
            <CurrencyInput
              value={form.perPerson}
              onChange={(v) => update("perPerson", v)}
            />
            <FieldHint>Enter the amount customers pay for this service.</FieldHint>
          </div>

          <hr className="border-gray-200" />

          <p className="text-sm text-gray-400 text-center leading-relaxed">
            Funsival fee is{" "}
            <span className="text-[#228E8A] font-bold">15%</span>.{" "}
            Customers will see the final price before booking.
          </p>
        </div>
      )}

      {/* ── Equipment: Hourly + Daily + Delivery ── */}
      {mode === "equipment" && (
        <div className="w-full max-w-[560px] space-y-5">
          {/* Hourly Rate */}
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <ClockIcon /> Hourly Rate
            </p>
            <CurrencyInput
              value={form.hourly}
              onChange={(v) => update("hourly", v)}
              suffix="/hr"
            />
            <FieldHint>Enter the rate you want to charge per hour</FieldHint>
          </div>

          {/* Daily Rate */}
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <CalendarIcon /> Daily Rate
            </p>
            <CurrencyInput
              value={form.daily}
              onChange={(v) => update("daily", v)}
              suffix="/day"
            />
            <FieldHint>Enter the rate you want to charge per day</FieldHint>
          </div>

          {/* Delivery & Pickup */}
          <div className="rounded-2xl bg-[#EAF4F4] border border-[#C7E4E2] p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <TruckIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text)]">Delivery &amp; Pickup Option</p>
                <p className="text-xs text-gray-500">Add delivery &amp; pickup fee</p>
              </div>
              <Toggle
                checked={Boolean(form.delivery?.enabled)}
                onChange={(v) => updateDelivery("enabled", v)}
              />
            </div>

            {form.delivery?.enabled && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-600">Price</p>
                <CurrencyInput
                  value={form.delivery?.fee}
                  onChange={(v) => updateDelivery("fee", v)}
                  placeholder="0.00"
                />
                <FieldHint>One-time fee for delivery and pickup</FieldHint>
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          <div className="flex items-start gap-2.5">
            <span className="shrink-0 mt-0.5"><InfoIcon /></span>
            <p className="text-sm text-gray-400 leading-relaxed">
              You can set one or both pricing options. Your clients will see all rates you configure.
            </p>
          </div>
        </div>
      )}

      {/* ── Places: Per Hour ── */}
      {mode === "places" && (
        <div className="w-full max-w-md space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <ClockIcon /> Hourly Rate
            </p>
            <CurrencyInput
              value={form.hourly}
              onChange={(v) => update("hourly", v)}
              suffix="/hr"
            />
            <FieldHint>Enter the rate you want to charge per hour</FieldHint>
          </div>

          <hr className="border-gray-200" />

          <div className="flex items-start gap-2.5">
            <span className="shrink-0 mt-0.5"><InfoIcon /></span>
            <p className="text-sm text-gray-400 leading-relaxed">
              You can set one or both pricing options. Your clients will see all rates you configure.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mt-10 w-full max-w-md">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-full font-bold text-sm border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex-1 py-3.5 rounded-full font-bold text-sm bg-[var(--color-secondary)] text-white hover:opacity-90 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
