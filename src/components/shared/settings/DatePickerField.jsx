"use client";

import React, { useState, useEffect, useRef } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@/icons";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function DatePickerField({ value, onChange, hasError, errorMsg }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("day"); // "day" | "month" | "year"
  const ref = useRef(null);

  const today = new Date();
  const parsed = value ? new Date(value + "T00:00:00") : null;
  const [cursor, setCursor] = useState({
    year: parsed?.getFullYear() ?? today.getFullYear() - 20,
    month: parsed?.getMonth() ?? today.getMonth(),
  });
  const [yearStart, setYearStart] = useState(
    Math.floor((parsed?.getFullYear() ?? today.getFullYear() - 20) / 12) * 12
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectDate = (day) => {
    const mm = String(cursor.month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${cursor.year}-${mm}-${dd}`);
    setOpen(false);
    setView("day");
  };

  const selectMonth = (idx) => { setCursor((c) => ({ ...c, month: idx })); setView("day"); };
  const selectYear = (yr) => { setCursor((c) => ({ ...c, year: yr })); setView("month"); };

  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const firstDay = new Date(cursor.year, cursor.month, 1).getDay();
  const dayGrid = [];
  for (let i = 0; i < firstDay; i++) dayGrid.push(null);
  for (let d = 1; d <= daysInMonth; d++) dayGrid.push(d);

  const displayValue = parsed
    ? `${parsed.getDate()} ${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`
    : "";

  return (
    <div className="sm:col-span-2" ref={ref}>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5">
        <span className="text-gray-400"><CalendarIcon /></span>
        Date of Birth
      </label>

      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setView("day"); }}
        className={`w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
          hasError
            ? "border-red-400 focus:ring-red-200 focus:border-red-400"
            : "border-gray-200 focus:ring-primary/20 focus:border-primary"
        }`}
      >
        <span className={displayValue ? "text-text" : "text-gray-400"}>
          {displayValue || "Select date of birth"}
        </span>
        <span className="text-gray-400"><CalendarIcon /></span>
      </button>
      {hasError && <p className="mt-1 text-xs text-red-500 font-medium">{errorMsg}</p>}

      {open && (
        <div className="absolute z-30 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 w-72">

          {/* ── Day view ── */}
          {view === "day" && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setCursor((c) => {
                  const m = c.month === 0 ? 11 : c.month - 1;
                  const y = c.month === 0 ? c.year - 1 : c.year;
                  return { year: y, month: m };
                })} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
                  <ChevronLeftIcon />
                </button>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => setView("month")}
                    className="text-sm font-bold text-text hover:text-primary px-1">
                    {MONTHS[cursor.month]}
                  </button>
                  <button type="button" onClick={() => { setYearStart(Math.floor(cursor.year / 12) * 12); setView("year"); }}
                    className="text-sm font-bold text-text hover:text-primary px-1">
                    {cursor.year}
                  </button>
                </div>
                <button type="button" onClick={() => setCursor((c) => {
                  const m = c.month === 11 ? 0 : c.month + 1;
                  const y = c.month === 11 ? c.year + 1 : c.year;
                  return { year: y, month: m };
                })} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
                  <ChevronRightIcon />
                </button>
              </div>
              <div className="grid grid-cols-7 mb-1">
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-0.5">
                {dayGrid.map((day, idx) => {
                  if (!day) return <div key={`e-${idx}`} />;
                  const sel = parsed && parsed.getDate() === day && parsed.getMonth() === cursor.month && parsed.getFullYear() === cursor.year;
                  return (
                    <button key={day} type="button" onClick={() => selectDate(day)}
                      className={`text-xs py-1.5 rounded-lg font-medium transition-colors ${
                        sel ? "bg-primary text-white" : "hover:bg-primary/10 text-text"
                      }`}>
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Month view ── */}
          {view === "month" && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setCursor((c) => ({ ...c, year: c.year - 1 }))} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronLeftIcon /></button>
                <button type="button" onClick={() => { setYearStart(Math.floor(cursor.year / 12) * 12); setView("year"); }}
                  className="text-sm font-bold text-text hover:text-primary">{cursor.year}</button>
                <button type="button" onClick={() => setCursor((c) => ({ ...c, year: c.year + 1 }))} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronRightIcon /></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MONTHS.map((m, idx) => (
                  <button key={m} type="button" onClick={() => selectMonth(idx)}
                    className={`text-xs py-2 rounded-xl font-medium transition-colors ${
                      idx === cursor.month ? "bg-primary text-white" : "hover:bg-primary/10 text-text"
                    }`}>
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Year view ── */}
          {view === "year" && (
            <>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setYearStart((y) => y - 12)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronLeftIcon /></button>
                <span className="text-sm font-bold text-text">{yearStart} – {yearStart + 11}</span>
                <button type="button" onClick={() => setYearStart((y) => y + 12)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronRightIcon /></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 12 }, (_, i) => yearStart + i).map((yr) => (
                  <button key={yr} type="button" onClick={() => selectYear(yr)}
                    className={`text-xs py-2 rounded-xl font-medium transition-colors ${
                      yr === cursor.year ? "bg-primary text-white" : "hover:bg-primary/10 text-text"
                    }`}>
                    {yr}
                  </button>
                ))}
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}
