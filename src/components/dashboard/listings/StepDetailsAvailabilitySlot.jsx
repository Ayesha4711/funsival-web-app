"use client";

import React from "react";
import { CalendarField, DropdownField } from "@/components/shared/FieldControls";
import { TrashIcon } from "@/icons";

/* ─── Availability slot ──────────────────────────────────────────────────────── */
export default function AvailabilitySlot({ slot, index, onChange, onRemove, canRemove }) {
  const getOneHourLater = (timeStr) => {
    if (!timeStr) return "";
    const [h] = String(timeStr).split(":").map(Number);
    if (!Number.isFinite(h)) return "";
    const nextHour = (h + 1) % 24;
    return `${String(nextHour).padStart(2, "0")}:00`;
  };

  // Generate 24h hourly time options in HH:00 format
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    const val = `${String(h).padStart(2, "0")}:00`;
    const ampm = h < 12 ? "AM" : "PM";
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const label = `${String(hour).padStart(2, "0")}:00 ${ampm}`;
    timeOptions.push({ value: val, label });
  }

  const handleStartTimeChange = (value) => {
    onChange(index, "startTime", value);
    onChange(index, "endTime", getOneHourLater(value));
  };

  return (
    <div className="rounded-2xl border border-[#CEE6E5] bg-[#f0faf9]">
      {/* ── Desktop (lg+): date left | vertical divider | Select Time label + dropdowns right ── */}
      <div className="hidden lg:flex items-stretch">
        {/* Date section */}
        <div className="w-[280px] shrink-0 px-4 py-3">
          <p className="text-[10px] font-semibold text-gray-500 mb-1.5">Select Date</p>
          <CalendarField
            value={slot.day || ""}
            placeholder="Pick a date"
            onChange={(value) => onChange(index, "day", value)}
          />
        </div>

        {/* Vertical divider */}
        <div className="w-px bg-[#CEE6E5] shrink-0 my-3" />

        {/* Time section: label above two dropdowns */}
        <div className="flex-1 px-4 py-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Select Time</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <DropdownField
                value={slot.startTime || ""}
                placeholder="When the activity begins"
                options={timeOptions}
                onChange={handleStartTimeChange}
                splitDisplay
                teal
              />
            </div>
            <div className="flex-1">
              <DropdownField
                value={slot.endTime || ""}
                placeholder="When the activity ends"
                options={timeOptions}
                onChange={(value) => onChange(index, "endTime", value)}
                splitDisplay
                teal
              />
            </div>
          </div>
        </div>

        {/* Delete icon */}
        {canRemove && (
          <div className="flex items-center justify-center px-3 shrink-0">
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="flex items-center justify-center w-8 h-8 rounded-full text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Remove slot"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Mobile / tablet (< lg): stacked ── */}
      <div className="flex flex-col lg:hidden divide-y divide-[#CEE6E5]">
        {/* Date row */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold text-gray-500 mb-1.5">Select Date</p>
          <CalendarField
            value={slot.day || ""}
            placeholder="Pick a date"
            onChange={(value) => onChange(index, "day", value)}
          />
        </div>

        {/* Select Time label + dropdowns */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Select Time</p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 min-w-0">
              <DropdownField
                value={slot.startTime || ""}
                placeholder="Begins"
                options={timeOptions}
                onChange={handleStartTimeChange}
                splitDisplay
                teal
              />
            </div>
            <div className="flex-1 min-w-0">
              <DropdownField
                value={slot.endTime || ""}
                placeholder="Ends"
                options={timeOptions}
                onChange={(value) => onChange(index, "endTime", value)}
                splitDisplay
                teal
              />
            </div>
          </div>
        </div>

        {/* Delete row — only when removable */}
        {canRemove && (
          <div className="flex justify-end px-3 py-2">
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-500 transition-colors"
              aria-label="Remove slot"
            >
              <TrashIcon size={12} />
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
