"use client";

import React, { useState } from "react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function CustomCalendar({ value, onChange, onClose }) {
  const today = new Date();
  const initial = value ? new Date(value) : today;

  const [viewYear, setViewYear]   = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [selected, setSelected]   = useState(value || null);

  /* first day-of-week offset + total days */
  const firstDay  = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev  = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleSelect = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    const formatted = `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}/${d.getFullYear()}`;
    setSelected(formatted);
    onChange && onChange(formatted);
    onClose && onClose();
  };

  const isSelected = (day) => {
    if (!selected) return false;
    const [m, d, y] = selected.split("/").map(Number);
    return y === viewYear && m - 1 === viewMonth && d === day;
  };
  const isToday = (day) => {
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  /* build calendar grid — prev-month trailing, current, next-month leading */
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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-[280px] sm:w-[320px] select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <span className="text-sm font-bold text-gray-900">
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

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const isCurrent  = cell.type === "current";
          const sel        = isCurrent && isSelected(cell.day);
          const tod        = isCurrent && isToday(cell.day);

          return (
            <button
              key={i}
              disabled={!isCurrent}
              onClick={() => isCurrent && handleSelect(cell.day)}
              className={`
                w-full aspect-square flex items-center justify-center text-sm font-medium rounded-full transition-all
                ${!isCurrent ? "text-gray-300 cursor-default" : "cursor-pointer"}
                ${sel
                  ? "bg-[#F5C842] text-gray-900 font-bold shadow-sm"
                  : tod
                    ? "bg-[#F5C842]/20 text-[#d4a017] font-semibold"
                    : isCurrent
                      ? "text-gray-800 hover:bg-gray-100"
                      : ""
                }
              `}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
