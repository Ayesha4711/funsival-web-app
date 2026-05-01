"use client";

import React, { useState } from "react";

const DAYS   = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const FONT = "var(--font-sofia-pro), Sofia Pro, sans-serif";

export default function CustomCalendar({ value, onChange, onClose }) {
  const today   = new Date();
  const initial = value ? new Date(value) : today;

  const [viewYear,  setViewYear]  = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [selected,  setSelected]  = useState(value || null);

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

  const handleSelect = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    const formatted = `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
    setSelected(formatted);
    onChange?.(formatted);
    onClose?.();
  };

  const isSelected = (day) => {
    if (!selected) return false;
    const [m, d, y] = selected.split("/").map(Number);
    return y === viewYear && m - 1 === viewMonth && d === day;
  };

  const isToday = (day) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

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
      {/* ── Month navigation ── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <span
          style={{ fontFamily: FONT, fontWeight: 700, fontSize: 13 }}
          className="text-gray-900"
        >
          {MONTHS[viewMonth]} {viewYear}
        </span>

        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
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

          return (
            <button
              key={i}
              type="button"
              disabled={!isCurrent}
              onClick={() => isCurrent && handleSelect(cell.day)}
              style={{ fontFamily: FONT, fontWeight: sel ? 700 : 500, fontSize: 11 }}
              className={[
                "w-full aspect-square flex items-center justify-center rounded-full transition-all",
                !isCurrent
                  ? "text-gray-300 cursor-default"
                  : "cursor-pointer",
                sel
                  ? "bg-[#F5C842] text-gray-900"
                  : tod
                    ? "bg-[#F5C842]/20 text-[#c49a0a] font-semibold"
                    : isCurrent
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
