"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@/icons";

export const STATUS_OPTIONS = ["Draft", "Active", "Inactive"];

export const STATUS_STYLES = {
  Active: {
    pill: "bg-[#EAFAF1] text-[#27AE60] border-[#B7EBD0]",
    dot:  "bg-[#27AE60]",
  },
  Inactive: {
    pill: "bg-[#FDECEA] text-[#E53935] border-[#F9C9C9]",
    dot:  "bg-[#E53935]",
  },
  Draft: {
    pill: "bg-[#FEF9EC] text-[#C9982A] border-[#F5DFA0]",
    dot:  "bg-[#C9982A]",
  },
};

/**
 * Inline status pill that opens a dropdown to switch between Active / Inactive.
 * Draft status is read-only (no dropdown).
 */
export default function ListingStatusDropdown({ status, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const styles = STATUS_STYLES[status] ?? {
    pill: "bg-gray-100 text-gray-400 border-gray-200",
    dot:  "bg-gray-400",
  };

  if (status === "Draft") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${styles.pill}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
        {status}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold whitespace-nowrap transition-colors ${styles.pill}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
        {status}
        <ChevronDownIcon size={9} />
      </button>

      {open && (
        <div className="absolute left-0 top-9 z-30 bg-white rounded-xl border border-gray-100 py-1 min-w-[110px]">
          {STATUS_OPTIONS.filter((opt) =>
            status === "Draft" ? opt === "Draft" : opt !== "Draft"
          ).map((opt) => {
            const s = STATUS_STYLES[opt];
            return (
              <button
                key={opt}
                onClick={() => { onStatusChange(opt); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold transition-colors hover:bg-gray-50 ${opt === status ? "opacity-100" : "opacity-60"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                <span className={s.pill.split(" ").find((c) => c.startsWith("text-"))}>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
