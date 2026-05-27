"use client";

import React, { useState, useRef, useEffect } from "react";
import { CalendarIcon, ChevronDownIcon } from "@/icons";

function formatSlotDay(raw) {
  if (!raw) return "—";
  if (raw.includes("T") || raw.match(/^\d{4}-\d{2}-\d{2}/)) {
    const d = new Date(raw);
    if (!isNaN(d))
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  if (raw.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const d = new Date(raw);
    if (!isNaN(d))
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  if (!raw) return "—";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  const ampm = h < 12 ? "AM" : "PM";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function AvailabilityCell({ slots = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!slots.length) return <span className="text-gray-300 text-xs">—</span>;

  const renderSlotRow = (s, i) => {
    const day  = formatSlotDay(s.day ?? s.date);
    const time = s.startTime && s.endTime
      ? `${formatTime(s.startTime)} – ${formatTime(s.endTime)}`
      : (s.time ?? "");
    return (
      <div key={i} className="flex items-start gap-2.5 px-4 py-2.5">
        <div className="mt-0.5 w-5 h-5 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center shrink-0 text-[var(--color-primary)]">
          <CalendarIcon />
        </div>
        <div>
          <p className="text-xs font-bold text-[var(--color-text)] leading-tight">{day}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">{time}</p>
        </div>
      </div>
    );
  };

  if (slots.length === 1) {
    const s    = slots[0];
    const day  = formatSlotDay(s.day ?? s.date);
    const time = s.startTime && s.endTime
      ? `${formatTime(s.startTime)} – ${formatTime(s.endTime)}`
      : (s.time ?? "");
    return (
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 text-[var(--color-primary)]">
          <CalendarIcon />
        </span>
        <div>
          <p className="text-xs font-bold text-[var(--color-text)] leading-tight">{day}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">{time}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 rounded-lg text-[10px] font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
      >
        <CalendarIcon />
        {slots.length} slots
        <ChevronDownIcon size={9} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-40 bg-white rounded-2xl border border-gray-100 w-56 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wide">
              {slots.length} Availability Slots
            </p>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {slots.map((slot, i) => renderSlotRow(slot, i))}
          </div>
        </div>
      )}
    </div>
  );
}
