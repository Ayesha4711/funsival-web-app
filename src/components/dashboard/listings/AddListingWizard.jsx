"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/images/logo.svg";
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
  { id: 6, label: "Success" }
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
                      ? "border-[#FF7201] text-[#FF7201]"
                      : "border-gray-300 text-gray-400"
                ].join(" ")}
              >
                {done
                  ? <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  : String(step.id).padStart(2, "0")}
              </div>
              <span
                className={[
                  "mt-1 text-[10px] sm:text-xs font-semibold whitespace-nowrap",
                  active
                    ? "border-[#FF7201] text-[#FF7201]"
                    : done ? "text-[var(--color-primary)]" : "text-gray-400"
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 &&
              <div
                className={[
                  "h-px flex-1 min-w-[16px] max-w-[80px] mx-1 mb-4 transition-colors",
                  done ? "bg-[var(--color-primary)]" : "bg-gray-200"
                ].join(" ")}
              />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Wizard navbar (desktop only — shown when sidebar/navbar are hidden) ───── */
function WizardNavbar({ step, onBack, router }) {
  return (
    <header className="hidden lg:flex h-16 bg-[var(--color-primary)] items-center px-8 gap-4 shrink-0 sticky top-0 z-20">
      {/* Logo */}
      <Image
        src={logo}
        alt="Funsival"
        width={120}
        height={36}
        className="h-9 w-auto object-contain shrink-0"
      />

      {/* Search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search here"
            className="w-full h-9 pl-10 pr-4 rounded-full bg-white text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="flex items-center gap-1 text-white text-sm font-medium">
          Provider
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
        <button className="text-white/90 hover:text-white p-1 relative">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[var(--color-secondary)] rounded-full text-[9px] flex items-center justify-center text-white font-bold border border-[var(--color-primary)]">
            3
          </span>
        </button>
        <button className="text-white/90 hover:text-white p-1">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
        <div className="w-9 h-9 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm border-2 border-white/30">
          P
        </div>
      </div>
    </header>
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
    price: ""
  });

  const update = (key, val) => setData(d => ({ ...d, [key]: val }));
  const next = () => setStep(s => Math.min(s + 1, 6));
  const back = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-white">
      {/* Full navbar shown on desktop when sidebar is hidden */}
      <WizardNavbar step={step} onBack={back} router={router} />

      {/* Compact top bar — mobile/tablet, and desktop sub-header */}
      <div className="sticky top-0 lg:top-16 z-10 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-10 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              step === 1 ? router.push("/dashboard/listings") : back()}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] transition-colors shrink-0"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
      <div className="px-4 sm:px-6 lg:px-10 pt-5 pb-2">
        <Stepper current={step} />
      </div>

      {/* Step content */}
      <div className="px-4 sm:px-6 lg:px-10 py-4">
        <div className="w-full">
          {step === 1 &&
            <StepCategory
              selected={data.category}
              onSelect={v => update("category", v)}
              onNext={next}
            />}
          {step === 2 &&
            <StepType
              category={data.category}
              selected={data.type}
              onSelect={v => update("type", v)}
              onNext={next}
              onBack={back}
            />}
          {step === 3 &&
            <StepDetails
              details={data.details}
              onChange={v => update("details", v)}
              onNext={next}
              onBack={back}
            />}
          {step === 4 &&
            <StepPrice
              price={data.price}
              onChange={v => update("price", v)}
              onNext={next}
              onBack={back}
            />}
          {step === 5 && <StepReview data={data} onNext={next} onBack={back} />}
          {step === 6 &&
            <StepSuccess onDone={() => router.push("/dashboard/listings")} />}
        </div>
      </div>
    </div>
  );
}
