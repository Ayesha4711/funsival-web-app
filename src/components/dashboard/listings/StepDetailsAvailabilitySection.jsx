"use client";

import React from "react";
import { CalendarField, DropdownField } from "@/components/shared/FieldControls";
import { PlusIcon, TrashIcon } from "@/icons";
import { SectionTitle } from "./StepDetailsFieldControls";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// JS day index: 0=Sun,1=Mon,...,6=Sat
const DAY_JS_INDEX = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

function getOneHourLater(timeStr) {
  if (!timeStr) return "";
  const [h] = String(timeStr).split(":").map(Number);
  if (!Number.isFinite(h)) return "";
  const nextHour = (h + 1) % 24;
  return `${String(nextHour).padStart(2, "0")}:00`;
}

function buildHourlyOptions() {
  const opts = [];
  for (let h = 0; h < 24; h++) {
    const val = `${String(h).padStart(2, "0")}:00`;
    const ampm = h < 12 ? "AM" : "PM";
    const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
    opts.push({ value: val, label: `${String(hr).padStart(2, "0")}:00 ${ampm}` });
  }
  return opts;
}

// Compute the set of day-names present in the [startDate, endDate] range
function getActiveDays(start, end) {
  if (!start || !end) return new Set();
  const s = new Date(start); const e = new Date(end);
  if (isNaN(s) || isNaN(e) || s > e) return new Set();
  // If range spans 7+ days every day is active
  const diffDays = Math.round((e - s) / 86400000) + 1;
  if (diffDays >= 7) return new Set(ALL_DAYS);
  const active = new Set();
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const jsDay = d.getDay(); // 0=Sun
    const name = ALL_DAYS.find(n => DAY_JS_INDEX[n] === jsDay);
    if (name) active.add(name);
  }
  return active;
}

/* ─── Availability section (one-time + recurring schedule) ─────────────────── */
export default function StepDetailsAvailabilitySection({ form, fe, set, updateSlot, activeErrors, setActiveErrors }) {
  const timeOptions = buildHourlyOptions();
  const activeDays = getActiveDays(form.recurringStartDate, form.recurringEndDate);
  const hasRange = !!(form.recurringStartDate && form.recurringEndDate);

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 overflow-visible" data-field="availability">
      <SectionTitle num="5">Availability</SectionTitle>
      <p className="text-xs text-gray-400 mb-4">Choose when this activity is available for booking</p>

      {/* Activity type selector */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-600 mb-2">Select Activity Type:</p>
        <div className="w-48">
          <DropdownField
            value={form.availabilityType}
            placeholder="choose type"
            options={[
              { value: "one_time", label: "One Time" },
              { value: "recurring", label: "Recurring" },
            ]}
            onChange={(value) => {
              set("availabilityType", value);
              if (activeErrors.availability || activeErrors.slots) {
                setActiveErrors(prev => { const n = { ...prev }; delete n.availability; delete n.slots; return n; });
              }
            }}
          />
        </div>
      </div>

      {/* One Time UI */}
      {form.availabilityType === "one_time" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-[#CEE6E5] bg-[#f0faf9] p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-gray-500 mb-1.5">Select Date</p>
                <CalendarField
                  value={form.slots[0]?.day || ""}
                  placeholder="Pick a date"
                  onChange={(value) => updateSlot(0, "day", value)}
                />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Select Time</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <DropdownField
                      value={form.slots[0]?.startTime || ""}
                      placeholder="When the activity begins"
                      options={timeOptions}
                      onChange={(value) => {
                        updateSlot(0, "startTime", value);
                        updateSlot(0, "endTime", getOneHourLater(value));
                      }}
                      splitDisplay
                      teal
                      allowTyping
                    />
                  </div>
                  <div className="flex-1">
                    <DropdownField
                      value={form.slots[0]?.endTime || ""}
                      placeholder="When the activity ends"
                      options={timeOptions}
                      onChange={(value) => updateSlot(0, "endTime", value)}
                      splitDisplay
                      teal
                      allowTyping
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {(fe.availability || fe.slots) && (
            <p className="text-xs text-red-500 font-medium">{fe.availability || fe.slots}</p>
          )}
        </div>
      )}

      {/* Recurring UI */}
      {form.availabilityType === "recurring" && (
        <div className="flex flex-col gap-4">
          {/* Date range */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-gray-500 mb-1.5">Start Date</p>
              <CalendarField
                value={form.recurringStartDate || ""}
                placeholder="September 25, 2025"
                onChange={(value) => set("recurringStartDate", value)}
              />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-gray-500 mb-1.5">End Date</p>
              <CalendarField
                value={form.recurringEndDate || ""}
                placeholder="September 30, 2025"
                onChange={(value) => set("recurringEndDate", value)}
                align="right"
              />
            </div>
          </div>

          {/* Day-by-day slots — only shown once both dates are picked */}
          {hasRange && (
            <div className="flex flex-col gap-2">
              {ALL_DAYS.map((day) => {
                const isActive = activeDays.has(day);
                const daySlots = form.recurringSlots?.[day] || [];
                return (
                  <div key={day}>
                    <p className="text-xs font-semibold text-gray-600 mb-1.5">{day}:</p>
                    {!isActive ? (
                      <div className="w-full flex items-center justify-center h-10 rounded-xl bg-[#FFF3E0] text-xs font-semibold text-[#E65100]">
                        Unavailable
                      </div>
                    ) : daySlots.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          set("recurringSlots", { ...form.recurringSlots, [day]: [{ startTime: "", endTime: "" }] });
                        }}
                        className="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl border-2 border-dashed border-[#CEE6E5] bg-[#f0faf9] text-xs font-semibold text-[var(--color-primary)] hover:bg-[#e0f5f4] transition-colors"
                      >
                        <PlusIcon size={12} /> Add time slot
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {daySlots.map((slot, si) => (
                          <div key={si} className="flex items-center gap-2">
                            <div className="flex-1">
                              <DropdownField
                                value={slot.startTime || ""}
                                placeholder="When the activity begins"
                                options={timeOptions}
                                onChange={(value) => {
                                  const next = [...daySlots];
                                  next[si] = { ...next[si], startTime: value, endTime: getOneHourLater(value) };
                                  set("recurringSlots", { ...form.recurringSlots, [day]: next });
                                }}
                                splitDisplay
                                teal
                                allowTyping
                              />
                            </div>
                            <div className="flex-1">
                              <DropdownField
                                value={slot.endTime || ""}
                                placeholder="When the activity ends"
                                options={timeOptions}
                                onChange={(value) => {
                                  const next = [...daySlots];
                                  next[si] = { ...next[si], endTime: value };
                                  set("recurringSlots", { ...form.recurringSlots, [day]: next });
                                }}
                                splitDisplay
                                teal
                                allowTyping
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const next = daySlots.filter((_, i) => i !== si);
                                set("recurringSlots", { ...form.recurringSlots, [day]: next });
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors shrink-0"
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        ))}
                        <div className="flex justify-end mt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              set("recurringSlots", { ...form.recurringSlots, [day]: [...daySlots, { startTime: "", endTime: "" }] });
                            }}
                            className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline"
                          >
                            <PlusIcon size={11} /> Add Another Slot
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {(fe.availability || fe.slots) && (
            <p className="text-xs text-red-500 font-medium">{fe.availability || fe.slots}</p>
          )}
        </div>
      )}
    </section>
  );
}
