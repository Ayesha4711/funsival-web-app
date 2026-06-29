"use client";

import React from "react";
import { CheckIcon } from "@/icons";

export const DEFAULT_WIZARD_STEPS = [
  { id: 1, label: "Category" },
  { id: 2, label: "Type" },
  { id: 3, label: "Details" },
  { id: 4, label: "Price" },
  { id: 5, label: "Review" },
];

/* ─── Stepper ──────────────────────────────────────────────────────────────── */
export default function Stepper({ current, onStepClick, steps = DEFAULT_WIZARD_STEPS }) {
  return (
    /* mobile/tablet: justify-between fills full width
       laptop (lg+): justify-center so steps don't stretch */
    <div className="flex items-center justify-between lg:justify-center w-full py-2 px-1">
      {steps.map((step, idx) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <React.Fragment key={step.id}>
            {/* Step node */}
            <button
              type="button"
              onClick={() => onStepClick(step.id)}
              className="flex flex-col items-center shrink-0"
            >
              <div
                className={[
                  "w-7 h-7 min-[375px]:w-8 min-[375px]:h-8 lg:w-10 lg:h-10 rounded-full border-2 flex items-center justify-center text-[10px] min-[375px]:text-xs lg:text-sm font-bold transition-colors",
                  done
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                    : active
                      ? "border-[#FF7201] text-[#FF7201]"
                      : "border-[#465668] text-[#465668]"
                ].join(" ")}
              >
                {done
                  ? <CheckIcon size={12} />
                  : String(step.id).padStart(2, "0")}
              </div>
              <span
                className={[
                  "mt-1 text-[8px] min-[375px]:text-[10px] lg:text-xs font-semibold whitespace-nowrap",
                  active
                    ? "text-[#FF7201]"
                    : done ? "text-[var(--color-primary)]" : "text-[#465668]"
                ].join(" ")}
              >
                {step.label}
              </span>
            </button>

            {/* Connector line */}
            {idx < steps.length - 1 &&
              <div
                className={[
                  "h-px mb-4 transition-colors",
                  /* mobile: flex-1 fills space; laptop: fixed width */
                  "flex-1 mx-0.5 lg:flex-none lg:w-16 lg:mx-2",
                  done ? "bg-[var(--color-primary)]" : "bg-[#465668]"
                ].join(" ")}
              />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
