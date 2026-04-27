"use client";

import React, { useMemo, useState } from "react";
import { getPriceMode, normalizeListingPrice } from "./listingPrice";

const modeCopy = {
  activities: {
    title: "Per Person",
    helper: "Enter the amount customers pay for this service.",
    note: "Funsival fee is 15%. Customers will see the final price before booking.",
  },
  equipment: {
    title: "Pricing Structure",
    helper: "Set the hourly, daily, and delivery pricing for this equipment.",
    note: "You can set one or both pricing options. Clients see every rate you configure.",
  },
  places: {
    title: "Pricing Type",
    helper: "Choose how you want to charge for this place.",
    note: "Use hourly pricing or switch to daily pricing when the listing fits longer stays.",
  },
};

function FieldHint({ children }) {
  return <p className="text-[11px] sm:text-xs text-[#62748E] leading-relaxed mt-2">{children}</p>;
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-[#228E8A]" : "bg-gray-300",
      ].join(" ")}
      aria-pressed={checked}
    >
      <span
        className={[
          "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

function CurrencyInput({ value, onChange, suffix, placeholder = "0.00" }) {
  return (
    <div className="flex items-center bg-[#F5F5F5] rounded-xl overflow-hidden border border-transparent focus-within:border-[var(--color-primary)] transition-colors min-h-[42px] sm:min-h-[48px]">
      <span className="pl-4 pr-2 text-gray-400 font-bold text-base select-none">$</span>
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 py-2.5 sm:py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent"
      />
      {suffix ? <span className="pr-4 text-[11px] sm:text-sm font-semibold text-gray-400">{suffix}</span> : null}
    </div>
  );
}

export default function StepPrice({ category, price, onChange, onNext, onBack }) {
  const mode = getPriceMode(category);
  const [form, setForm] = useState(() => normalizeListingPrice(category, price));

  const copy = modeCopy[mode];

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateDelivery = (key, value) => {
    setForm((prev) => ({
      ...prev,
      delivery: {
        ...(prev.delivery ?? { enabled: false, fee: "" }),
        [key]: value,
      },
    }));
  };

  const canProceed = useMemo(() => {
    if (mode === "equipment") {
      return form.hourly !== "" || form.daily !== "" || form.delivery?.fee !== "";
    }
    if (mode === "places") {
      return form.billingType === "daily" ? form.daily !== "" : form.hourly !== "";
    }
    return form.perPerson !== "";
  }, [form, mode]);

  const handleNext = () => {
    onChange(form);
    onNext();
  };

  const containerClass = [
    "flex flex-col items-center pt-4 sm:pt-8 pb-10 px-4",
    "min-[1280px]:pt-8",
  ].join(" ");

  return (
    <div className={containerClass}>
      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-2 text-center">
        Set Price
      </h2>
      <p className="text-sm text-gray-400 text-center mb-8 sm:mb-10 max-w-xl">
        Tell us how you charge for this service
      </p>

      {mode === "activities" && (
        <div className="w-full max-w-md space-y-5">
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {copy.title}
            </p>

            <CurrencyInput
              value={form.perPerson}
              onChange={(value) => update("perPerson", value)}
            />

            <FieldHint>{copy.helper}</FieldHint>
          </div>

          <hr className="border-gray-200" />

          <p className="text-sm text-gray-400 leading-relaxed text-center">
            <span className="text-primary font-bold">Funsival fee is 15%</span>.
            {" "}
            Customers will see the final price before booking.
          </p>
        </div>
      )}

      {mode === "equipment" && (
        <div className="w-full max-w-[560px] space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Hourly Rate
            </p>
            <CurrencyInput
              value={form.hourly}
              onChange={(value) => update("hourly", value)}
              suffix="/hr"
            />
            <FieldHint>Enter the rate you want to charge per hour.</FieldHint>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Daily Rate
            </p>
            <CurrencyInput
              value={form.daily}
              onChange={(value) => update("daily", value)}
              suffix="/day"
            />
            <FieldHint>Enter the rate you want to charge per day.</FieldHint>
          </div>

          <div className="rounded-2xl bg-[#D6ECEB] border border-[#C7E4E2] p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#50627A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7h13l3 4v6H3z" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--color-text)]">Delivery Option</p>
                <p className="text-sm text-black/80">Add delivery fee</p>
              </div>
              <Toggle
                checked={Boolean(form.delivery?.enabled)}
                onChange={(value) => updateDelivery("enabled", value)}
              />
            </div>

            {form.delivery?.enabled && (
              <div className="mt-4 pl-1 space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Price</p>
                <CurrencyInput
                  value={form.delivery?.fee}
                  onChange={(value) => updateDelivery("fee", value)}
                  placeholder="0.00"
                />
                <FieldHint>One-time fee for delivery and pickup.</FieldHint>
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          <p className="text-sm text-gray-400 leading-relaxed text-center max-w-xl mx-auto">
            {copy.note}
          </p>
        </div>
      )}

      {mode === "places" && (
        <div className="w-full max-w-md space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => update("billingType", "hourly")}
              className={[
                "rounded-2xl border px-4 py-4 text-center transition-all min-h-[96px] flex flex-col items-center justify-center gap-2",
                form.billingType === "hourly"
                  ? "border-[#FFB12B] bg-[#FFF7E6] text-[#FF8A00]"
                  : "border-[#D8E0EA] bg-white text-[#50627A]",
              ].join(" ")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <div className="text-sm font-semibold">Hourly</div>
            </button>
            <button
              type="button"
              onClick={() => update("billingType", "daily")}
              className={[
                "rounded-2xl border px-4 py-4 text-center transition-all min-h-[96px] flex flex-col items-center justify-center gap-2",
                form.billingType === "daily"
                  ? "border-[#D7E0F5] bg-[#F7FAFF] text-[#4263EB]"
                  : "border-[#D8E0EA] bg-white text-[#50627A]",
              ].join(" ")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <div className="text-sm font-semibold">Daily</div>
            </button>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Price Amount
            </p>

            <CurrencyInput
              value={form.billingType === "daily" ? form.daily : form.hourly}
              onChange={(value) => {
                if (form.billingType === "daily") update("daily", value);
                else update("hourly", value);
              }}
              suffix={form.billingType === "daily" ? "/day" : "/hr"}
            />

            <FieldHint>{form.billingType === "daily" ? "Enter the rate you want to charge per day." : "Enter the rate you want to charge per hour."}</FieldHint>
          </div>

          <div className="rounded-2xl bg-[#D6ECEB] border border-[#C7E4E2] p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#50627A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7h13l3 4v6H3z" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--color-text)]">Delivery Option</p>
                <p className="text-sm text-black/80">Add delivery fee</p>
              </div>
              <Toggle
                checked={Boolean(form.delivery?.enabled)}
                onChange={(value) => update("delivery", { enabled: value, fee: value ? form.delivery?.fee ?? "" : "" })}
              />
            </div>

            {form.delivery?.enabled && (
              <div className="mt-4 pl-1 space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Price</p>
                <CurrencyInput
                  value={form.delivery?.fee}
                  onChange={(value) => update("delivery", { enabled: true, fee: value })}
                />
                <FieldHint>Use this for a one-time delivery charge.</FieldHint>
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          <p className="text-sm text-gray-400 leading-relaxed text-center">
            {copy.note}
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 mt-8 sm:mt-10 w-full max-w-md">
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
