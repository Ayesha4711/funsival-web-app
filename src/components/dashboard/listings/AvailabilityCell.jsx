"use client";

import React from "react";
import { createPortal } from "react-dom";
import { CalendarIcon, ChevronDownIcon } from "@/icons";
import useDropdownPosition from "@/hooks/useDropdownPosition";

const PANEL_WIDTH  = 224; // w-56
const HEADER_HEIGHT = 36;
const ROW_HEIGHT    = 50;
const LIST_MAX_HEIGHT = 256; // max-h-64

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
  const getHeight = React.useCallback(
    () => HEADER_HEIGHT + Math.min(slots.length * ROW_HEIGHT, LIST_MAX_HEIGHT),
    [slots.length]
  );
  const { open, toggle, pos, btnRef, menuRef } = useDropdownPosition({
    width: PANEL_WIDTH,
    getHeight,
  });

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

  const panel = open && (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top:      pos.top,
        left:     pos.left,
        zIndex:   9999,
        width:    PANEL_WIDTH,
      }}
      className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
    >
      <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
        <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wide">
          {slots.length} Availability Slots
        </p>
      </div>
      <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
        {slots.map((slot, i) => renderSlotRow(slot, i))}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={toggle}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 rounded-lg text-[10px] font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
      >
        <CalendarIcon />
        {slots.length} slots
        <ChevronDownIcon size={9} />
      </button>

      {typeof document !== "undefined" && createPortal(panel, document.body)}
    </div>
  );
}
