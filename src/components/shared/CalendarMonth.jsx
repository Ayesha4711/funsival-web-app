"use client";

import React from "react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * Renders a single calendar month grid for a date-range picker.
 *
 * Props:
 *   year, month          – which month to display
 *   selectedStart/End    – Date | null
 *   onSelectDate         – (date: Date) => void
 *   hovered              – Date | null  (hover preview for range highlight)
 *   onHover              – (date: Date | null) => void
 */
export default function CalendarMonth({
  year,
  month,
  selectedStart,
  selectedEnd,
  onSelectDate,
  hovered,
  onHover,
}) {
  const days = getDaysInMonth(year, month);
  let firstDay = getFirstDayOfMonth(year, month);
  // Convert Sunday-first (0) to Monday-first
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));

  return (
    <div className="flex-1 min-w-[220px]">
      <p className="text-center text-sm font-semibold text-gray-800 mb-3">
        {MONTH_NAMES[month]} {year}
      </p>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <div key={d} className="text-center text-[10px] text-gray-400 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const ts = date.getTime();
          const isStart = selectedStart && selectedStart.getTime() === ts;
          const isEnd = selectedEnd && selectedEnd.getTime() === ts;
          const isToday = new Date().toDateString() === date.toDateString();
          const endOrHovered = selectedEnd || hovered;
          const inRange =
            selectedStart &&
            endOrHovered &&
            ts > selectedStart.getTime() &&
            ts < endOrHovered.getTime();

          return (
            <button
              key={i}
              onMouseEnter={() => onHover(date)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelectDate(date)}
              className={`text-[11px] h-8 w-full flex items-center justify-center rounded-full transition-colors
                ${isStart || isEnd ? "bg-[#4AA7A7] text-white font-bold" : ""}
                ${isToday && !isStart && !isEnd
                  ? "border border-[#4AA7A7] text-[#4AA7A7] font-semibold"
                  : ""}
                ${inRange ? "bg-[#4AA7A7]/15 text-[#4AA7A7]" : ""}
                ${!isStart && !isEnd && !inRange && !isToday
                  ? "text-gray-700 hover:bg-gray-100"
                  : ""}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
