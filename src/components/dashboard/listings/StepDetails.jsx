"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Country, State, City } from "country-state-city";
import {
  CalendarField,
  DropdownField,
  ComboboxField,
  TagInputField,
} from "@/components/shared/FieldControls";

/* ─── Shared field components ───────────────────────────────────────────────── */
function Label({ children, required }) {
  return (
    <label className="block text-xs font-bold text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ error, className, ...props }) {
  return (
    <input
      className={[
        "w-full px-3 py-2.5 rounded-xl border bg-[#F9FAFB] text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-colors",
        error
          ? "border-red-400 focus:ring-red-200 focus:border-red-500"
          : "border-gray-200 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]",
        className
      ].join(" ")}
      {...props}
    />
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>;
}

function Textarea({ error, rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={[
        "w-full px-3 py-2.5 rounded-xl border bg-[#F9FAFB] text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white resize-none transition-colors",
        error
          ? "border-red-400 focus:ring-red-200 focus:border-red-500"
          : "border-gray-200 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
      ].join(" ")}
      {...props}
    />
  );
}

function SectionTitle({ num, children }) {
  return (
    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-1">
      <span className="text-gray-900 text-base font-bold shrink-0">
        {num}.
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
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200" style={{ height: 220 }}>
      <iframe key={`${coords.lat}-${coords.lon}`} src={mapSrc} className="w-full h-full border-0" title="Location map" loading="lazy" />

      {/* Search overlay - bottom on mobile, center on desktop */}
      <div className="absolute bottom-3 sm:bottom-auto sm:top-1/2 left-1/2 -translate-x-1/2 sm:-translate-y-1/2 z-10 w-full px-3 sm:px-4 sm:max-w-2xl">
        <div className="relative">
          <div className="flex items-center gap-2 bg-white rounded-full px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg border border-gray-100">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            <input type="text" value={query} onChange={handleInput} placeholder="Enter address" className="flex-1 min-w-0 text-xs sm:text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent" />
            {loading && <svg className="animate-spin shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/></svg>}
            <div className="w-px h-4 bg-gray-200 shrink-0" />
            <button type="button" onClick={useCurrentLocation} className="flex items-center gap-1 text-[10px] sm:text-xs text-[var(--color-primary)] font-semibold hover:opacity-80 transition-opacity whitespace-nowrap shrink-0">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
              <span className="hidden sm:inline">Use my current location</span>
              <span className="sm:hidden">My location</span>
            </button>
          </div>
          {suggestions.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20 max-h-48 overflow-y-auto">
              {suggestions.map((s) => (
                <button key={s.place_id} onClick={() => selectSuggestion(s)} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors flex items-start gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                  <span className="line-clamp-2">{s.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Photo upload ───────────────────────────────────────────────────────────── */
function PhotoUpload({ photos, onPhotosChange }) {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleFiles = (files) => {
    const newPhotos = Array.from(files).map((f) => URL.createObjectURL(f));
    onPhotosChange([...photos, ...newPhotos]);
  };

  const deletePhoto = (index) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
    setOpenMenuIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3 flex-wrap">
        {photos.map((src, i) => (
          <div key={i} className="relative w-32 h-24 sm:w-40 sm:h-28 rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 shrink-0 group">
            {src.startsWith("blob:") || src.startsWith("http") || src.startsWith("data:") ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={src} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-sky-200 to-blue-300 flex items-center justify-center text-2xl">🪂</div>
            )}
            {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-secondary)] text-white text-[9px] font-bold text-center py-0.5">Cover Image</div>}

            {/* Three dots menu button */}
            <div className="absolute top-2 right-2" ref={openMenuIndex === i ? menuRef : null}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === i ? null : i); }}
                className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center shadow-md transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {openMenuIndex === i && (
                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[120px] z-20">
                  <button
                    type="button"
                    onClick={() => deletePhoto(i)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6"/>
                      <path d="M14 11v6"/>
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <label className="flex flex-col items-center justify-center w-32 h-24 sm:w-40 sm:h-28 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <input id="photo-add-input" type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(e) => handleFiles(e.target.files)} multiple />
        </label>
      </div>
      <label className="flex flex-col items-center justify-center w-full py-8 rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors" onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }} onDragOver={(e) => e.preventDefault()}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <p className="text-sm font-bold text-gray-700 mt-2">Upload & Drag Images Here</p>
        <p className="text-xs text-gray-400 mt-0.5">JPEG or PNG files only</p>
        <p className="text-xs text-gray-400">Max size: 5MB</p>
        <input type="file" accept="image/jpeg,image/png" multiple className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
      </label>
    </div>
  );
}

/* ─── Availability slot ──────────────────────────────────────────────────────── */
function AvailabilitySlot({ slot, index, onChange, onRemove, canRemove, totalSlots }) {
  const dayOptions = [
    { value: "monday",    label: "Monday" },
    { value: "tuesday",   label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday",  label: "Thursday" },
    { value: "friday",    label: "Friday" },
    { value: "saturday",  label: "Saturday" },
    { value: "sunday",    label: "Sunday" },
  ];

  // Generate 24h time options in HH:MM format (what the API expects)
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const val = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const ampm = h < 12 ? "AM" : "PM";
      const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
      timeOptions.push({ value: val, label });
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0 rounded-2xl border border-gray-200 bg-[#F9FAFB] overflow-visible" style={{ position: "relative", zIndex: 1 }}>
      {/* Day of week */}
      <div className="flex-1 border-b sm:border-b-0 sm:border-r border-gray-200 px-4 py-3">
        <p className="text-[10px] font-semibold text-gray-500 mb-1.5 mt-1">Select Day</p>
        <DropdownField
          value={slot.day || ""}
          placeholder="Select day"
          options={dayOptions}
          onChange={(value) => onChange(index, "day", value)}
        />
      </div>

      {/* Divider label */}
      <div className="hidden sm:flex items-center px-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Select Time</span>
      </div>

      {/* Start time */}
      <div className="flex-1 border-b sm:border-b-0 sm:border-r border-gray-200 px-3 py-3">
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
      <div className="flex-1 px-3 py-3">
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

      {/* Delete button — only shown when there are multiple slots */}
      {canRemove && (
        <div className="flex items-center justify-center px-3 py-3 sm:border-l border-gray-200">
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex items-center justify-center w-8 h-8 rounded-full text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Remove slot"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Location cascading dropdowns ──────────────────────────────────────────── */
function LocationDropdowns({ country, state, city, onCountryChange, onStateChange, onCityChange, errors }) {
  const countryOptions = useMemo(
    () => Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name })),
    []
  );
  const stateOptions = useMemo(
    () => country ? State.getStatesOfCountry(country).map(s => ({ value: s.isoCode, label: s.name })) : [],
    [country]
  );
  const cityOptions = useMemo(
    () => (country && state) ? City.getCitiesOfState(country, state).map(c => ({ value: c.name, label: c.name })) : [],
    [country, state]
  );

  const handleCountryChange = (val) => {
    onCountryChange(val);
    onStateChange("");
    onCityChange("");
  };

  const handleStateChange = (val) => {
    onStateChange(val);
    onCityChange("");
  };

  return (
    <>
      <div>
        <Label required>Country</Label>
        <ComboboxField
          value={country}
          placeholder="Select country"
          options={countryOptions}
          onChange={handleCountryChange}
          error={!!errors?.country}
        />
        <FieldError msg={errors?.country} />
      </div>
      <div>
        <Label required>State / Province</Label>
        <ComboboxField
          value={state}
          placeholder={country ? (stateOptions.length ? "Select state" : "No states available") : "Select country first"}
          options={stateOptions}
          onChange={handleStateChange}
          disabled={!country || stateOptions.length === 0}
          error={!!errors?.state}
        />
        <FieldError msg={errors?.state} />
      </div>
      <div>
        <Label required>City</Label>
        <ComboboxField
          value={city}
          placeholder={state ? (cityOptions.length ? "Select city" : "No cities available") : "Select state first"}
          options={cityOptions}
          onChange={onCityChange}
          disabled={!state || cityOptions.length === 0}
          error={!!(errors?.city || errors?.placeCity)}
        />
        <FieldError msg={errors?.city || errors?.placeCity} />
      </div>
    </>
  );
}

/* ─── Step ─────────────────────────────────────────────────────────────────── */
export default function StepDetails({ details, onChange, onNext, onBack, fieldErrors = null }) {
  // Local copy of field errors — cleared per-field as the user edits
  const [activeErrors, setActiveErrors] = useState(fieldErrors || {});

  // Sync when new errors arrive from parent (after a failed submit)
  useEffect(() => {
    setActiveErrors(fieldErrors || {});
  }, [fieldErrors]);

  const fe = activeErrors;

  // Wrap set() so typing in a field immediately clears its error
  const setWithClear = (key, val, errorKey) => {
    if (errorKey && activeErrors[errorKey]) {
      setActiveErrors(prev => { const n = { ...prev }; delete n[errorKey]; return n; });
    }
    set(key, val);
  };

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
    requirementsList: [],
    photos: [],
    slots: [{ day: "", startTime: "", endTime: "" }],
    addressLine1: "",
    addressLine2: "",
    placeCity: "",
    state: "",
    stateCode: "",
    country: "",
    countryCode: "",
    postalCode: "",
    ...details,
  });

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
  const addSlot = () => set("slots", [...form.slots, { day: "", startTime: "", endTime: "" }]);
  const removeSlot = (i) => set("slots", form.slots.filter((_, idx) => idx !== i));
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
              <TextInput placeholder="Give your activity a name" value={form.title} error={!!fe.activityTitle} onChange={(e) => setWithClear("title", e.target.value, "activityTitle")} />
              <FieldError msg={fe.activityTitle} />
            </div>
            <div>
              <Label required>Location (City &amp; State)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Shown publicly to help guests find your activity"
                  value={form.location}
                  onChange={(e) => setWithClear("location", e.target.value, "location")}
                  className={[
                    "w-full pl-9 pr-3 py-2.5 rounded-xl border bg-[#F9FAFB] text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-colors",
                    fe.location
                      ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-200 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                  ].join(" ")}
                />
              </div>
              <FieldError msg={fe.location} />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea placeholder="Tell guests what your experience details and why it's unique" value={form.description} error={!!fe.description} onChange={(e) => set("description", e.target.value)} />
              <FieldError msg={fe.description} />
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
                placeholder="Select experience level"
                error={!!fe.difficulty}
                options={[
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advance", label: "Advance" },
                  { value: "expert", label: "Expert" },
                ]}
                onChange={(value) => setWithClear("difficulty", value, "difficulty")}
              />
              <FieldError msg={fe.difficulty} />
            </div>
            <div>
              <Label required>Duration</Label>
              <DropdownField
                value={form.duration}
                placeholder="How long does it take?"
                error={!!fe.duration}
                options={[
                  { value: "30min", label: "30 minutes" },
                  { value: "1h", label: "1 hour" },
                  { value: "2h", label: "2 hours" },
                  { value: "half_day", label: "Half day" },
                  { value: "full_day", label: "Full day" },
                ]}
                onChange={(value) => setWithClear("duration", value, "duration")}
              />
              <FieldError msg={fe.duration} />
            </div>
            <div>
              <Label>Max Participants</Label>
              <div className="flex items-center h-[42px] rounded-xl border border-gray-200 bg-[#F9FAFB] overflow-hidden">
                <div className="flex items-center gap-2 flex-1 px-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span className="text-sm font-bold text-gray-700">{form.maxParticipants}</span>
                </div>
                <div className="flex flex-col h-full border-l border-gray-200">
                  <button type="button" onClick={() => set("maxParticipants", form.maxParticipants + 1)} className="flex-1 w-8 flex items-center justify-center text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 transition-colors border-b border-gray-200">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                  </button>
                  <button type="button" onClick={() => set("maxParticipants", Math.max(1, form.maxParticipants - 1))} className="flex-1 w-8 flex items-center justify-center text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 transition-colors">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div>
              <Label required>Instructor Name</Label>
              <TextInput placeholder="Enter the name of the guide or instructor leading this activity" value={form.instructorName} error={!!fe.instructorName} onChange={(e) => setWithClear("instructorName", e.target.value, "instructorName")} />
              <FieldError msg={fe.instructorName} />
            </div>
            <div className="sm:col-span-2">
              <Label required>Cancellation Policy</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <DropdownField
                    value={form.cancellationPolicy}
                    placeholder="Moderate"
                    error={!!fe.cancellationPolicy}
                    options={[
                      { value: "flexible", label: "Flexible" },
                      { value: "moderate", label: "Moderate" },
                      { value: "strict", label: "Strict" },
                    ]}
                    onChange={(value) => setWithClear("cancellationPolicy", value, "cancellationPolicy")}
                  />
                </div>
                <button type="button" className="shrink-0 text-blue-400 hover:text-blue-600 transition-colors" title="Learn about cancellation policies">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </button>
              </div>
              <FieldError msg={fe.cancellationPolicy} />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <Label>What&apos;s Included</Label>
              <TagInputField
                tags={form.included}
                placeholder="List everything provided — gear, equipment, or snacks"
                onAdd={(value) => set("included", [...form.included, value])}
                onRemove={(index) => set("included", form.included.filter((_, i) => i !== index))}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Label>Requirements</Label>
              <TagInputField
                tags={form.requirementsList}
                placeholder="Let guests know what they need to bring or prepare"
                onAdd={(value) => {
                  const next = [...form.requirementsList, value];
                  set("requirementsList", next);
                  set("requirements", next.join(", "));
                }}
                onRemove={(index) => {
                  const next = form.requirementsList.filter((_, i) => i !== index);
                  set("requirementsList", next);
                  set("requirements", next.join(", "));
                }}
              />
              <FieldError msg={fe.requirements} />
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
          <p className="text-xs text-gray-400 mb-4">Your address is only shown to guests after they&apos;ve made a booking.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label required>Address Line 1</Label>
              <TextInput placeholder="Street address" value={form.addressLine1} error={!!fe.addressLine1} onChange={(e) => setWithClear("addressLine1", e.target.value, "addressLine1")} />
              <FieldError msg={fe.addressLine1} />
            </div>
            <div>
              <Label>Address Line 2</Label>
              <TextInput placeholder="Apt, suite, unit (optional)" value={form.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} />
            </div>
            <LocationDropdowns
              country={form.countryCode}
              state={form.stateCode}
              city={form.placeCity}
              onCountryChange={(val) => {
                const countryObj = Country.getCountryByCode(val);
                setWithClear("countryCode", val, "country");
                set("country", countryObj?.name || val);
              }}
              onStateChange={(val) => {
                const stateObj = State.getStateByCodeAndCountry(val, form.countryCode);
                set("stateCode", val);
                set("state", stateObj?.name || val);
              }}
              onCityChange={(val) => setWithClear("placeCity", val, fe.placeCity ? "placeCity" : "city")}
              errors={fe}
            />
            <div>
              <Label>Postal Code</Label>
              <TextInput placeholder="Postal / ZIP code" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
            </div>
          </div>

          <LocationMap location={form.location} onLocationChange={(v) => set("location", v)} />
        </section>

        {/* ── 4. Photos ──────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <SectionTitle num="4">Add Some Photos Of Your Activity</SectionTitle>
          <p className="text-xs text-gray-400 mb-4">Add at least 5 photos to increase your bookings. You can edit or add more later.</p>
          <PhotoUpload photos={form.photos} onPhotosChange={(photos) => set("photos", photos)} />
        </section>

        {/* ── 5. Availability ─────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm overflow-visible">
          <SectionTitle num="5">Availability</SectionTitle>
          <p className="text-xs text-gray-400 mb-4">Choose when this activity is available for booking</p>
          <div className="flex flex-col gap-3">
            {form.slots.map((slot, i) => (
              <div key={i} style={{ position: "relative", zIndex: form.slots.length - i }}>
                <AvailabilitySlot slot={slot} index={i} onChange={updateSlot} onRemove={removeSlot} canRemove={form.slots.length > 1} totalSlots={form.slots.length} />
              </div>
            ))}
          </div>
          <button type="button" onClick={addSlot} className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline ml-auto">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Another Slot
          </button>
        </section>
      </div>

      {/* Nav buttons — full-width on mobile */}
      <div className="flex items-center gap-3 mt-8 sm:mt-10 sm:justify-center">
        <button onClick={onBack} className="flex-1 sm:flex-none sm:px-14 py-3 sm:py-3.5 rounded-full font-semibold text-sm border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-colors">Go Back</button>
        <button
          onClick={() => {
            const errs = {};
            if (!form.title?.trim()) errs.activityTitle = "Activity title is required";
            if (!form.location?.trim()) errs.location = "Location is required";
            if (!form.difficulty) errs.difficulty = "Difficulty level is required";
            if (!form.duration) errs.duration = "Duration is required";
            if (!form.instructorName?.trim()) errs.instructorName = "Instructor name is required";
            if (!form.cancellationPolicy) errs.cancellationPolicy = "Cancellation policy is required";
            if (!form.addressLine1?.trim()) errs.addressLine1 = "Address is required";
            if (!form.countryCode) errs.country = "Country is required";
            if (!form.stateCode && form.countryCode) {
              const hasStates = State.getStatesOfCountry(form.countryCode).length > 0;
              if (hasStates) errs.state = "State / Province is required";
            }
            if (!form.placeCity?.trim()) errs.placeCity = "City is required";
            if (Object.keys(errs).length > 0) {
              setActiveErrors(errs);
              return;
            }
            onChange(form);
            onNext();
          }}
          className="flex-1 sm:flex-none sm:px-14 py-3 sm:py-3.5 rounded-full font-semibold text-sm bg-[var(--color-secondary)] text-white hover:opacity-90 transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
}
