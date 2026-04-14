"use client";

import React, { useState } from "react";

/* ─── Shared field components ────────────────────────────────────────────────── */
function Label({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ ...props }) {
  return (
    <input
      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors"
      {...props}
    />
  );
}

function Textarea({ ...props }) {
  return (
    <textarea
      rows={3}
      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] resize-none transition-colors"
      {...props}
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select
      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] bg-white appearance-none transition-colors"
      {...props}
    >
      {children}
    </select>
  );
}

function SectionTitle({ num, children }) {
  return (
    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
      <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
        {num}
      </span>
      {children}
    </h3>
  );
}

/* ─── Map placeholder ───────────────────────────────────────────────────────── */
function MapPlaceholder() {
  return (
    <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 opacity-30">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={`border border-gray-300 ${i % 3 === 0 ? "bg-green-100" : i % 2 === 0 ? "bg-blue-50" : "bg-gray-50"}`} />
        ))}
      </div>
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 200" preserveAspectRatio="none">
        <line x1="0" y1="100" x2="400" y2="100" stroke="#666" strokeWidth="2"/>
        <line x1="200" y1="0" x2="200" y2="200" stroke="#666" strokeWidth="2"/>
        <line x1="0" y1="50" x2="400" y2="50" stroke="#999" strokeWidth="1"/>
        <line x1="0" y1="150" x2="400" y2="150" stroke="#999" strokeWidth="1"/>
        <line x1="100" y1="0" x2="100" y2="200" stroke="#999" strokeWidth="1"/>
        <line x1="300" y1="0" x2="300" y2="200" stroke="#999" strokeWidth="1"/>
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-lg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        </div>
      </div>
      <div className="absolute top-3 left-3 right-3">
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-100">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span className="text-xs text-gray-300">Search location…</span>
        </div>
      </div>
      <button className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 shadow-sm border border-gray-100 text-xs text-[var(--color-primary)] font-semibold">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
        </svg>
        Use my current location
      </button>
    </div>
  );
}

/* ─── Photo upload zone ─────────────────────────────────────────────────────── */
function PhotoUpload({ photos, onAdd }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {photos.map((_, i) => (
          <div key={i} className="relative w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden border-2 border-[var(--color-secondary)] bg-gray-100 shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-sky-200 to-blue-300 flex items-center justify-center text-2xl">🏕️</div>
            {i === 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-secondary)] text-white text-[9px] font-bold text-center py-0.5">
                COVER
              </div>
            )}
          </div>
        ))}
        <label className="flex flex-col items-center justify-center w-20 h-16 sm:w-24 sm:h-20 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <input type="file" accept="image/*" className="sr-only" onChange={onAdd} multiple />
        </label>
      </div>
      <label className="flex flex-col items-center justify-center w-full py-6 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p className="text-xs font-semibold text-gray-500 mt-2">Upload & Drag Images Here</p>
        <p className="text-[10px] text-gray-300 mt-0.5">JPEG or PNG files only</p>
        <p className="text-[10px] text-gray-300">Max size 5mb</p>
        <input type="file" accept="image/*" multiple className="sr-only" onChange={onAdd} />
      </label>
    </div>
  );
}

/* ─── Tag input ─────────────────────────────────────────────────────────────── */
function TagInput({ tags, placeholder, onAdd, onRemove }) {
  const [val, setVal] = useState("");
  const add = () => {
    if (val.trim()) { onAdd(val.trim()); setVal(""); }
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((t, i) => (
          <span key={i} className="flex items-center gap-1 px-3 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full text-xs font-semibold">
            {t}
            <button type="button" onClick={() => onRemove(i)} className="hover:text-red-500 ml-0.5">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
        />
        <button type="button" onClick={add} className="px-3 py-2 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-bold hover:bg-[var(--color-primary)] hover:text-white transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ─── Availability slot (equipment: start + end time, delete button) ─────────── */
function AvailabilitySlot({ slot, index, onChange, onRemove, showDelete }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
      <div className="flex-1">
        <Label>Select Date</Label>
        <TextInput type="date" value={slot.date} onChange={e => onChange(index, "date", e.target.value)} />
      </div>
      <div className="flex-1">
        <Label>Start Time</Label>
        <TextInput type="time" value={slot.startTime} onChange={e => onChange(index, "startTime", e.target.value)} />
      </div>
      <div className="flex-1">
        <Label>End Time</Label>
        <TextInput type="time" value={slot.endTime} onChange={e => onChange(index, "endTime", e.target.value)} />
      </div>
      {showDelete && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
          Delete
        </button>
      )}
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function StepDetailsEquipment({ details, onChange, onNext, onBack }) {
  const [form, setForm] = useState({
    equipmentName: "",
    location: "",
    description: "",
    brand: "",
    model: "",
    included: [],
    requirements: "",
    cancellationPolicy: "",
    photos: ["a", "b", "c", "d"],
    slots: [{ date: "", startTime: "", endTime: "" }],
    ...details,
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const addSlot = () => set("slots", [...form.slots, { date: "", startTime: "", endTime: "" }]);
  const updateSlot = (i, key, val) => {
    const next = [...form.slots];
    next[i] = { ...next[i], [key]: val };
    set("slots", next);
  };
  const removeSlot = (i) => set("slots", form.slots.filter((_, j) => j !== i));

  const save = () => onChange(form);

  return (
    <div className="pb-10">
      {/* Page heading */}
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">Add Details</h2>
        <p className="text-xs text-gray-400 mt-1">
          Tell the key details of your equipment — what you offer, where it is and what renters can expect
        </p>
      </div>

      <div className="space-y-8 max-w-3xl mx-auto">
        {/* ── 1. Basic Information ─────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <SectionTitle num="1">Basic Information</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>Equipment Name</Label>
              <TextInput
                placeholder="Give your equipment a name shown publicly"
                value={form.equipmentName}
                onChange={e => set("equipmentName", e.target.value)}
              />
            </div>
            <div>
              <Label required>Location (City & State)</Label>
              <div className="relative">
                <TextInput
                  placeholder="Help renters find your equipment"
                  value={form.location}
                  onChange={e => set("location", e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the equipment and why it's a great choice"
                value={form.description}
                onChange={e => set("description", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ── 2. Equipment Details ──────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <SectionTitle num="2">Equipment Details</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Brand</Label>
              <TextInput
                placeholder="Enter the brand of the equipment"
                value={form.brand}
                onChange={e => set("brand", e.target.value)}
              />
            </div>
            <div>
              <Label>Model</Label>
              <TextInput
                placeholder="Enter the model of the equipment"
                value={form.model}
                onChange={e => set("model", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>What's Included</Label>
              <TagInput
                tags={form.included}
                placeholder="List everything included with the rental"
                onAdd={v => set("included", [...form.included, v])}
                onRemove={i => set("included", form.included.filter((_, j) => j !== i))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Rules & Requirements</Label>
              <Textarea
                placeholder="Let renters know what rules or requirements apply"
                value={form.requirements}
                onChange={e => set("requirements", e.target.value)}
              />
            </div>
            <div>
              <Label>Cancellation Policy</Label>
              <Select value={form.cancellationPolicy} onChange={e => set("cancellationPolicy", e.target.value)}>
                <option value="">Select a policy…</option>
                <option value="flexible">Flexible — full refund 24h prior</option>
                <option value="moderate">Moderate — full refund 5 days prior</option>
                <option value="strict">Strict — 50% refund 7 days prior</option>
                <option value="non_refundable">Non-refundable</option>
              </Select>
            </div>
          </div>
        </section>

        {/* ── 3. Location Map ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <SectionTitle num="3">Where's Your Equipment Located?</SectionTitle>
          <p className="text-xs text-gray-400 mb-3">
            Your address is only shown to renters after they've made a booking.
          </p>
          <MapPlaceholder />
        </section>

        {/* ── 4. Photos ────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <SectionTitle num="4">Add Some Photos Of Your Equipment</SectionTitle>
          <p className="text-xs text-gray-400 mb-4">
            Add at least 5 photos to increase your bookings. You can edit or add more later.
          </p>
          <PhotoUpload photos={form.photos} onAdd={() => {}} />
        </section>

        {/* ── 5. Availability ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <SectionTitle num="5">Availability</SectionTitle>
          <p className="text-xs text-gray-400 mb-4">
            Set when this equipment is available for rental.
          </p>
          <div className="space-y-4">
            {form.slots.map((slot, i) => (
              <AvailabilitySlot
                key={i}
                slot={slot}
                index={i}
                onChange={updateSlot}
                onRemove={removeSlot}
                showDelete={form.slots.length > 1}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addSlot}
            className="mt-4 flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] hover:underline"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Another Slot
          </button>
        </section>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <button onClick={onBack} className="px-10 py-3 rounded-full font-bold text-sm border-2 border-gray-300 text-gray-600 hover:border-gray-400 transition-colors">
          Go Back
        </button>
        <button onClick={() => { save(); onNext(); }} className="px-10 py-3 rounded-full font-bold text-sm bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] transition-colors">
          Next
        </button>
      </div>
    </div>
  );
}
