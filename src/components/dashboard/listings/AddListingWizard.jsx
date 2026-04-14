"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import StepCategory from "./StepCategory";
import StepType from "./StepType";
import StepDetails from "./StepDetails";
import StepPrice from "./StepPrice";
import StepReview from "./StepReview";
import StepSuccess from "./StepSuccess";

/* ─── Step config ──────────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Category" },
  { id: 2, label: "Type" },
  { id: 3, label: "Details" },
  { id: 4, label: "Price" },
  { id: 5, label: "Review" },
  { id: 6, label: "Success" },
];

/* ─── Stepper ──────────────────────────────────────────────────────────────── */
function Stepper({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 w-full overflow-x-auto py-2">
      {STEPS.map((step, idx) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <React.Fragment key={step.id}>
            {/* Step node */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={[
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors",
                  done
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                    : active
                    ? "border-[var(--color-secondary)] text-[var(--color-secondary)]"
                    : "border-gray-300 text-gray-400",
                ].join(" ")}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  String(step.id).padStart(2, "0")
                )}
              </div>
              <span
                className={[
                  "mt-1 text-[10px] sm:text-xs font-semibold whitespace-nowrap",
                  active ? "text-[var(--color-secondary)]" : done ? "text-[var(--color-primary)]" : "text-gray-400",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className={[
                  "h-px flex-1 min-w-[16px] max-w-[80px] mx-1 mb-4 transition-colors",
                  done ? "bg-[var(--color-primary)]" : "bg-gray-200",
                ].join(" ")}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Wizard ───────────────────────────────────────────────────────────────── */
export default function AddListingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    category: "",
    type: "",
    details: {},
    price: "",
  });

  const update = (key, val) => setData((d) => ({ ...d, [key]: val }));
  const next = () => setStep((s) => Math.min(s + 1, 6));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button
            onClick={() => (step === 1 ? router.push("/dashboard/listings") : back())}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] transition-colors shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[var(--color-text)] leading-tight">
              Add New Listings
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-400 hidden sm:block">
              Manage your account preferences and settings
            </p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-2">
        <div className="max-w-3xl mx-auto">
          <Stepper current={step} />
        </div>
      </div>

      {/* Step content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-5xl mx-auto">
          {step === 1 && (
            <StepCategory
              selected={data.category}
              onSelect={(v) => update("category", v)}
              onNext={next}
            />
          )}
          {step === 2 && (
            <StepType
              category={data.category}
              selected={data.type}
              onSelect={(v) => update("type", v)}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 3 && (
            <StepDetails
              details={data.details}
              onChange={(v) => update("details", v)}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 4 && (
            <StepPrice
              price={data.price}
              onChange={(v) => update("price", v)}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 5 && (
            <StepReview data={data} onNext={next} onBack={back} />
          )}
          {step === 6 && (
            <StepSuccess onDone={() => router.push("/dashboard/listings")} />
          )}
        </div>
      </div>
    </div>
  );
}
