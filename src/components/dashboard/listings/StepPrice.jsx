"use client";

import React, { useMemo, useState } from "react";
import { getPriceMode, normalizeListingPrice } from "./listingPrice";
import { ClockIcon, CalendarIcon, TruckIcon, InfoIcon } from "@/icons";

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
    <div className="flex items-center bg-white rounded-xl overflow-hidden border border-[#C7E4E2] focus-within:border-[var(--color-primary)] transition-colors min-h-14">
      <span className="pl-4 pr-2 text-gray-400 font-bold text-base select-none">$</span>
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 py-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent"
      />
      {suffix && <span className="pr-4 text-sm font-semibold text-gray-400">{suffix}</span>}
    </div>
  );
}

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
    if (mode === "places") return form.hourly !== "" || form.daily !== "";
    return form.perPerson !== "";
  }, [form, mode]);

  const handleNext = () => { onChange(form); onNext(); };

  return (
    <div className="flex flex-col items-center pt-6 sm:pt-10 pb-10 px-4">
      <h2
        className="mb-2 text-center capitalize"
        style={{
          fontFamily: "Sofia Pro, sans-serif",
          fontWeight: 600,
          fontSize: "36px",
          lineHeight: "140%",
          letterSpacing: "0%",
          color: "var(--color-text)",
        }}
      >
        Set Price
      </h2>
      <p className="text-sm text-gray-400 text-center mb-8 sm:mb-10">Tell us how you charge for this service</p>

      {/* ── Activities: Per Person ── */}
      {mode === "activities" && (
        <div className="w-full max-w-md space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <ClockIcon size={18} className="text-[#F5A623]" /> Per Person
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
        <div className="w-[384px] flex flex-col gap-7.5">
          {/* Hourly Rate */}
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <ClockIcon size={18} className="text-[#F5A623]" /> Hourly Rate
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
              <CalendarIcon size={18} className="text-[#F5A623]" /> Daily Rate
            </p>
            <CurrencyInput
              value={form.daily}
              onChange={(v) => update("daily", v)}
              suffix="/day"
            />
            <FieldHint>Enter the rate you want to charge per day</FieldHint>
          </div>

          {/* Delivery & Pickup */}
          <div className="rounded-2xl bg-[#EAF4F4] border border-[#C7E4E2] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0">
                <TruckIcon size={20} className="text-[#50627A]" />
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
            <span className="shrink-0 mt-0.5"><InfoIcon size={18} className="text-[#4263EB]" /></span>
            <p className="text-sm text-gray-400 leading-relaxed">
              You can set one or both pricing options. Your clients will see all rates you configure.
            </p>
          </div>
        </div>
      )}

      {/* ── Places: Hourly + Daily ── */}
      {mode === "places" && (
        <div className="w-[384px] flex flex-col gap-7.5">
          {/* Hourly Rate */}
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <ClockIcon size={18} className="text-[#F5A623]" /> Hourly Rate
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
              <CalendarIcon size={18} className="text-[#F5A623]" /> Daily Rate
            </p>
            <CurrencyInput
              value={form.daily}
              onChange={(v) => update("daily", v)}
              suffix="/day"
            />
            <FieldHint>Enter the rate you want to charge per day</FieldHint>
          </div>

          <hr className="border-gray-200" />

          <div className="flex items-start gap-2.5">
            <span className="shrink-0 mt-0.5"><InfoIcon size={18} className="text-[#4263EB]" /></span>
            <p className="text-sm text-gray-400 leading-relaxed">
              You can set one or both pricing options. Your clients will see all rates you configure.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-6 mt-10 w-full max-w-140">
        <button
          onClick={onBack}
          className="w-45 py-4 rounded-full font-semibold text-base border-2 border-black text-gray-800 hover:border-gray-400 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="w-45 py-4 rounded-full font-semibold text-base bg-secondary text-black hover:opacity-90 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
