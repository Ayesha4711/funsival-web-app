"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  CalendarField,
  DropdownField,
  TagInputField,
} from "@/components/shared/FieldControls";

/* ─── Shared field components ───────────────────────────────────────────────── */
function Label({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ ...props }) {
  return (
    <input
      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:bg-white transition-colors"
      {...props}
    />
  );
}

function Textarea({ ...props }) {
  return (
    <textarea
      rows={3}
      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:bg-white resize-none transition-colors"
      {...props}
    />
  );
}

function SectionTitle({ num, children }) {
  return (
    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
        {num}
      </span>
      {children}
    </h3>
  );
}

/* ─── Map with live location search ─────────────────────────────────────────── */
function LocationMap({ location, onLocationChange }) {
  const [query, setQuery] = useState(location || "");
  const [suggestions, setSuggestions] = useState([]);
  const [coords, setCoords] = useState({ lat: 24.8607, lon: 67.0011 });
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const searchLocation = useCallback(async (q) => {
    if (!q.trim() || q.length < 3) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      setSuggestions(data);
    } catch { setSuggestions([]); }
    finally { setLoading(false); }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocation(val), 500);
  };

  const selectSuggestion = (s) => {
    setQuery(s.display_name);
    setCoords({ lat: parseFloat(s.lat), lon: parseFloat(s.lon) });
    setSuggestions([]);
    onLocationChange?.(s.display_name);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords: { latitude: lat, longitude: lon } }) => {
      setCoords({ lat, lon });
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, { headers: { "Accept-Language": "en" } });
        const data = await res.json();
        const name = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        setQuery(name);
        onLocationChange?.(name);
      } catch {
        const name = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        setQuery(name);
        onLocationChange?.(name);
      }
    });
  };

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.05}%2C${coords.lat - 0.05}%2C${coords.lon + 0.05}%2C${coords.lat + 0.05}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200" style={{ height: 280 }}>
      <iframe key={`${coords.lat}-${coords.lon}`} src={mapSrc} className="w-full h-full border-0" title="Location map" loading="lazy" />

      {/* Search overlay */}
      <div className="absolute top-3 left-3 right-3 z-10">
        <div className="relative">
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-md border border-gray-100">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" value={query} onChange={handleInput} placeholder="Search location..." className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent" />
            {loading && <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/></svg>}
          </div>
          {suggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20">
              {suggestions.map((s) => (
                <button key={s.place_id} onClick={() => selectSuggestion(s)} className="w-full text-left px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors flex items-start gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                  <span className="line-clamp-1">{s.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button onClick={useCurrentLocation} className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 shadow-md border border-gray-100 text-xs text-[var(--color-primary)] font-semibold hover:bg-gray-50 transition-colors">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
        Use my current location
      </button>
    </div>
  );
}

/* ─── Photo upload ───────────────────────────────────────────────────────────── */
function PhotoUpload({ photos, onPhotosChange }) {
  const handleFiles = (files) => {
    const newPhotos = Array.from(files).map((f) => URL.createObjectURL(f));
    onPhotosChange([...photos, ...newPhotos]);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {photos.map((src, i) => (
          <button key={i} type="button" onClick={() => document.getElementById("photo-add-input")?.click()} className="relative w-24 h-20 rounded-xl overflow-hidden border-2 border-[var(--color-secondary)] bg-gray-100 shrink-0 group">
            {src.startsWith("blob:") || src.startsWith("http") ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={src} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-sky-200 to-blue-300 flex items-center justify-center text-2xl">🪂</div>
            )}
            {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-secondary)] text-white text-[9px] font-bold text-center py-0.5">COVER</div>}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
          </button>
        ))}
        <label className="flex flex-col items-center justify-center w-24 h-20 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <input id="photo-add-input" type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(e) => handleFiles(e.target.files)} multiple />
        </label>
      </div>
      <label className="flex flex-col items-center justify-center w-full py-8 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors" onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }} onDragOver={(e) => e.preventDefault()}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <p className="text-xs font-semibold text-gray-500 mt-2">Upload & Drag Images Here</p>
        <p className="text-[10px] text-gray-300 mt-0.5">JPEG or PNG files only</p>
        <p className="text-[10px] text-gray-300">Max size 5mb</p>
        <input type="file" accept="image/jpeg,image/png" multiple className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
      </label>
    </div>
  );
}

/* ─── Availability slot — matches img2: one card row with date + start + end ── */
function AvailabilitySlot({ slot, index, onChange }) {
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const ampm = h < 12 ? "AM" : "PM";
      const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
      timeOptions.push({ value: label, label });
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0 rounded-2xl border border-gray-200 bg-[#F9FAFB] overflow-visible">
      {/* Date */}
      <div className="relative z-10 flex-1 border-b sm:border-b-0 sm:border-r border-gray-200 px-4 py-3">
        <p className="text-[10px] font-semibold text-gray-500 mb-0.5 mt-1">Select Date</p>
        <CalendarField
          value={slot.date}
          placeholder="Select date"
          onChange={(date) => onChange(index, "date", date)}
        />
      </div>

      {/* Divider label */}
      <div className="relative z-10 hidden sm:flex items-center px-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Select Time</span>
      </div>

      {/* Start time */}
      <div className="relative z-10 flex-1 border-b sm:border-b-0 sm:border-r border-gray-200 px-3 py-3">
        <div className="px-2 py-1">
          <p className="text-[10px] font-semibold text-gray-500 mb-0.5 mt-1 sm:hidden">Start Time</p>
        </div>
        <DropdownField
          value={slot.startTime || ""}
          placeholder="When the activity begins"
          options={timeOptions}
          onChange={(value) => onChange(index, "startTime", value)}
        />
      </div>

      {/* End time */}
      <div className="relative z-10 flex-1 px-3 py-3">
        <div className="px-2 py-1">
          <p className="text-[10px] font-semibold text-gray-500 mb-0.5 mt-1 sm:hidden">End Time</p>
        </div>
        <DropdownField
          value={slot.endTime || ""}
          placeholder="When the activity ends"
          options={timeOptions}
          onChange={(value) => onChange(index, "endTime", value)}
        />
      </div>
    </div>
  );
}

/* ─── Step ─────────────────────────────────────────────────────────────────── */
export default function StepDetails({ details, onChange, onNext, onBack }) {
  const [form, setForm] = useState({
    title: "",
    location: "",
    description: "",
    difficulty: "",
    duration: "",
    maxParticipants: 1,
    instructorName: "",
    cancellationPolicy: "",
    included: [],
    airConditioning: false,
    wifi: false,
    requirements: "",
    photos: [],
    slots: [{ date: "", startTime: "", endTime: "" }],
    ...details,
  });

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
  const addSlot = () => set("slots", [...form.slots, { date: "", startTime: "", endTime: "" }]);
  const updateSlot = (i, key, val) => {
    const next = [...form.slots];
    next[i] = { ...next[i], [key]: val };
    set("slots", next);
  };

  return (
    <div className="pb-10">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">Add Details</h2>
        <p className="text-xs text-gray-400 mt-1">Tell the key details of your activity — what you offer, where it takes place and what guests can expect</p>
      </div>

      <div className="space-y-6">
        {/* ── 1. Basic Information ─────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <SectionTitle num="1">Basic Information</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>Activity Title</Label>
              <TextInput placeholder="Give your activity a name" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <Label required>Location (City &amp; State)</Label>
              <div className="relative">
                <TextInput placeholder="City & state of your activity" value={form.location} onChange={(e) => set("location", e.target.value)} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea placeholder="Tell guests what your experience details and why it's unique" value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
          </div>
        </section>

        {/* ── 2. Service Details ────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <SectionTitle num="2">Service Details</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label required>Difficulty Level</Label>
              <DropdownField
                value={form.difficulty}
                placeholder="Select difficulty"
                options={[
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advanced", label: "Advanced" },
                  { value: "expert", label: "Expert" },
                ]}
                onChange={(value) => set("difficulty", value)}
              />
            </div>
            <div>
              <Label required>Duration</Label>
              <DropdownField
                value={form.duration}
                placeholder="Select duration"
                options={[
                  { value: "30min", label: "30 minutes" },
                  { value: "1h", label: "1 hour" },
                  { value: "2h", label: "2 hours" },
                  { value: "half_day", label: "Half day" },
                  { value: "full_day", label: "Full day" },
                ]}
                onChange={(value) => set("duration", value)}
              />
            </div>
            <div>
              <Label>Max Participants</Label>
              <div className="flex items-center gap-2 h-[42px] px-3 rounded-xl border border-gray-200 bg-[#F9FAFB]">
                <button type="button" onClick={() => set("maxParticipants", Math.max(1, form.maxParticipants - 1))} className="text-gray-400 hover:text-[var(--color-primary)] text-lg font-bold leading-none">−</button>
                <span className="flex-1 text-center text-sm font-bold text-gray-700">{form.maxParticipants}</span>
                <button type="button" onClick={() => set("maxParticipants", form.maxParticipants + 1)} className="text-gray-400 hover:text-[var(--color-primary)] text-lg font-bold leading-none">+</button>
              </div>
            </div>
            <div>
              <Label>Instructor Name</Label>
              <TextInput placeholder="Guide or instructor name" value={form.instructorName} onChange={(e) => set("instructorName", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Cancellation Policy</Label>
              <DropdownField
                value={form.cancellationPolicy}
                placeholder="Select a policy..."
                options={[
                  { value: "flexible", label: "Flexible — full refund 24h prior" },
                  { value: "moderate", label: "Moderate — full refund 5 days prior" },
                  { value: "strict", label: "Strict — 50% refund 7 days prior" },
                  { value: "non_refundable", label: "Non-refundable" },
                ]}
                onChange={(value) => set("cancellationPolicy", value)}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <Label>What&apos;s Included</Label>
              <TagInputField
                tags={form.included}
                placeholder="List everything included"
                onAdd={(value) => set("included", [...form.included, value])}
                onRemove={(index) => set("included", form.included.filter((_, i) => i !== index))}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Label>Requirements</Label>
              <Textarea placeholder="Let guests know what they need to bring or prepare" value={form.requirements} onChange={(e) => set("requirements", e.target.value)} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            {[{ key: "airConditioning", label: "Air Conditioning" }, { key: "wifi", label: "WiFi" }].map(({ key, label }) => (
              <button key={key} type="button" onClick={() => set(key, !form[key])} className={["flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border-2 transition-colors", form[key] ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]" : "border-gray-200 bg-[#F9FAFB] text-gray-500 hover:border-gray-300"].join(" ")}>
                {form[key] && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── 3. Location Map ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <SectionTitle num="3">Where&apos;s Your Place Located?</SectionTitle>
          <p className="text-xs text-gray-400 mb-3">Your address is only shown to guests after they&apos;ve made a booking.</p>
          <LocationMap location={form.location} onLocationChange={(v) => set("location", v)} />
        </section>

        {/* ── 4. Photos ──────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <SectionTitle num="4">Add Some Photos Of Your Activity</SectionTitle>
          <p className="text-xs text-gray-400 mb-4">Add at least 5 photos to increase your bookings. You can edit or add more later.</p>
          <PhotoUpload photos={form.photos} onPhotosChange={(photos) => set("photos", photos)} />
        </section>

        {/* ── 5. Availability ─────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <SectionTitle num="5">Availability</SectionTitle>
          <p className="text-xs text-gray-400 mb-4">Choose when this activity is available for booking</p>
          <div className="space-y-3">
            {form.slots.map((slot, i) => (
              <AvailabilitySlot key={i} slot={slot} index={i} onChange={updateSlot} />
            ))}
          </div>
          <button type="button" onClick={addSlot} className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline ml-auto">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Another Slot
          </button>
        </section>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <button onClick={onBack} className="px-14 py-3.5 rounded-full font-semibold text-sm border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-colors">Go Back</button>
        <button onClick={() => { onChange(form); onNext(); }} className="px-14 py-3.5 rounded-full font-semibold text-sm bg-[var(--color-secondary)] text-white hover:opacity-90 transition-all">Next</button>
      </div>
    </div>
  );
}
