"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@/icons";

const DAYS   = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const FONT = "var(--font-sofia-pro), Sofia Pro, sans-serif";

/* ─── Inline dropdown (opens below, no OS chrome) ───────────────────────── */
function InlineSelect({ value, options, onChange, width = 110 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative" style={{ width }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ fontFamily: FONT, width }}
        className="flex items-center justify-between gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 hover:border-gray-300 transition-colors"
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDownIcon size={10} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-[200] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          style={{ width, maxHeight: 200, overflowY: "auto" }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{ fontFamily: FONT }}
              className={[
                "w-full text-left px-3 py-1.5 text-xs transition-colors",
                opt.value === value
                  ? "bg-[var(--color-primary)] text-white font-bold"
                  : "text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CustomCalendar({ value, onChange, onClose, availableDates, minDate }) {
  const today   = new Date();
  const initial = value ? new Date(value) : today;

  const [viewYear,  setViewYear]  = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const currentYear = today.getFullYear();
  const yearStart = Math.min(currentYear - 100, initial.getFullYear());
  const yearOptions = [];
  for (let year = currentYear; year >= yearStart; year -= 1) {
    yearOptions.push({ value: year, label: String(year) });
  }
  const monthOptions = MONTHS.map((m, i) => ({ value: i, label: m }));

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev  = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const minDateObj = minDate ? new Date(`${minDate}T00:00:00`) : null;

  const handleSelect = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    if (availableDates && !availableDates.includes(formatted)) {
      return;
    }
    if (minDateObj && d < minDateObj) {
      return;
    }

    onChange?.(formatted);
    onClose?.();
  };

  const isSelected = (day) => {
    if (!value) return false;
    const [y, m, d] = value.split("-").map(Number);
    return y === viewYear && m - 1 === viewMonth && d === day;
  };

  const isToday = (day) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  const isAvailable = (day) => {
    if (minDateObj && new Date(viewYear, viewMonth, day) < minDateObj) return false;
    if (!availableDates) return true;
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return availableDates.includes(formatted);
  };

  /* Build 6-row grid */
  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: daysInPrev - firstDay + i + 1, type: "prev" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, type: "current" });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, type: "next" });
  }

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 shadow-xl select-none"
      style={{ width: 268, padding: "14px 14px 12px" }}
    >
      {/* ── Month / Year navigation ── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          type="button"
        >
          <ChevronLeftIcon size={16} />
        </button>

        <div className="flex items-center gap-2">
          <InlineSelect
            value={viewMonth}
            options={monthOptions}
            onChange={(v) => setViewMonth(Number(v))}
            width={104}
          />
          <InlineSelect
            value={viewYear}
            options={yearOptions}
            onChange={(v) => setViewYear(Number(v))}
            width={74}
          />
        </div>

        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          type="button"
        >
          <ChevronRightIcon size={16} />
        </button>
      </div>

      {/* ── Day-of-week headers ── */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div
            key={d}
            style={{ fontFamily: FONT, fontWeight: 600, fontSize: 11 }}
            className="text-center text-gray-400 py-0.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── Date grid ── */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell, i) => {
          const isCurrent = cell.type === "current";
          const sel       = isCurrent && isSelected(cell.day);
          const tod       = isCurrent && isToday(cell.day);
          const avail     = isCurrent && isAvailable(cell.day);

          return (
            <button
              key={i}
              type="button"
              disabled={!isCurrent || !avail}
              onClick={() => isCurrent && avail && handleSelect(cell.day)}
              style={{ fontFamily: FONT, fontWeight: sel ? 700 : 500, fontSize: 11 }}
              className={[
                "w-full aspect-square flex items-center justify-center rounded-full transition-all",
                (!isCurrent || !avail)
                  ? "text-gray-300 cursor-default"
                  : "cursor-pointer",
                sel
                  ? "bg-[#F5C842] text-gray-900"
                  : tod
                    ? "bg-[#F5C842]/20 text-[#c49a0a] font-semibold"
                    : isCurrent && avail
                      ? "text-gray-800 hover:bg-[#EDF6F6] hover:text-[#1d8c82]"
                      : "",
              ].join(" ")}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
