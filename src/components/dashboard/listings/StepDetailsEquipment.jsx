"use client";

import React, { useState } from "react";
import {
  CalendarField,
  DropdownField,
  TagInputField,
} from "@/components/shared/FieldControls";
import { LocationMap } from "@/components/shared/MapControls";

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

/* ─── Availability slot (equipment: start + end time, delete button) ─────────── */
function AvailabilitySlot({ slot, index, onChange, onRemove, showDelete }) {
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
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
      <div className="flex-1 min-w-[120px]">
        <Label>Select Date</Label>
        <CalendarField
          value={slot.day || ""}
          placeholder="Pick a date"
          onChange={(value) => onChange(index, "day", value)}
        />
      </div>
      <div className="flex-1 min-w-[120px]">
        <Label>Start Time</Label>
        <DropdownField
          value={slot.startTime || ""}
          placeholder="Begins"
          options={timeOptions}
          onChange={(value) => onChange(index, "startTime", value)}
        />
      </div>
      <div className="flex-1 min-w-[120px]">
        <Label>End Time</Label>
        <DropdownField
          value={slot.endTime || ""}
          placeholder="Ends"
          options={timeOptions}
          onChange={(value) => onChange(index, "endTime", value)}
        />
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

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>;
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function StepDetailsEquipment({ details, onChange, onNext, onBack, fieldErrors = null }) {
  const [activeErrors, setActiveErrors] = useState(fieldErrors || {});

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
    slots: [{ day: "", startTime: "", endTime: "" }],
    addressLine1: "",
    placeCity: "",
    state: "",
    country: "",
    postalCode: "",
    ...details,
  });

  const fe = activeErrors;

  // ── Map search state ────────────────────────────────────────────────────────
  const [mapQuery, setMapQuery] = useState(form.addressLine1 || form.location || "");
  const [mapSuggestions, setMapSuggestions] = useState([]);
  const [mapCoords, setMapCoords] = useState({ lat: 24.8607, lon: 67.0011 });
  const [mapLoading, setMapLoading] = useState(false);
  const mapDebounceRef = React.useRef(null);

  const searchMap = React.useCallback(async (q) => {
    if (!q.trim() || q.length < 3) { setMapSuggestions([]); return; }
    setMapLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`);
      const data = await res.json();
      setMapSuggestions(data);
    } catch { setMapSuggestions([]); }
    finally { setMapLoading(false); }
  }, []);

  const handleMapQueryChange = (val) => {
    setMapQuery(val);
    setForm(prev => ({ ...prev, location: val, addressLine1: val }));
    clearTimeout(mapDebounceRef.current);
    mapDebounceRef.current = setTimeout(() => searchMap(val), 500);
  };

  const handleMapSelect = async (s) => {
    const lat = parseFloat(s.lat);
    const lon = parseFloat(s.lon);
    setMapCoords({ lat, lon });
    setMapSuggestions([]);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`);
      const data = await res.json();
      const addr = data.address || {};
      const street = addr.road || addr.pedestrian || "";
      const house = addr.house_number || "";
      const addressLine1 = [house, street].filter(Boolean).join(" ") || s.display_name;
      const placeCity = addr.city || addr.town || addr.village || "";
      const stateName = addr.state || "";
      const countryName = addr.country || "";
      
      setForm(prev => ({ 
        ...prev, 
        addressLine1, 
        placeCity, 
        state: stateName, 
        country: countryName, 
        postalCode: addr.postcode || "",
        location: addressLine1
      }));
      setMapQuery(addressLine1);
    } catch (err) { console.error("Reverse geocode error:", err); }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      handleMapSelect({ lat: latitude, lon: longitude, display_name: "Current Location" });
    });
  };

  const set = (key, val) => {
    if (activeErrors[key]) {
      setActiveErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const addSlot = () => set("slots", [...form.slots, { day: "", startTime: "", endTime: "" }]);
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
              <Label>What&apos;s Included</Label>
              <TagInputField
                tags={form.included}
                placeholder="List everything included with the rental"
                onAdd={(value) => set("included", [...form.included, value])}
                onRemove={(index) => set("included", form.included.filter((_, i) => i !== index))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Rules & Requirements</Label>
              <Textarea
                placeholder="Let renters know what rules or requirements apply"
                value={form.requirements}
                onChange={e => set("requirements", e.target.value)}
              />
              <FieldError msg={fe.requirements} />
            </div>
            <div>
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
          </div>
        </section>

        {/* ── 3. Location Map ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm overflow-visible">
          <SectionTitle num="3">Where&apos;s Your Equipment Located?</SectionTitle>
          <p className="text-xs text-gray-400 mb-3">
            Your address is only shown to renters after they&apos;ve made a booking.
          </p>
          <LocationMap 
            coords={mapCoords}
            searchValue={mapQuery}
            onSearchChange={handleMapQueryChange}
            onSelect={handleMapSelect}
            onUseCurrentLocation={handleUseCurrentLocation}
            searchLoading={mapLoading}
            suggestions={mapSuggestions}
          />
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
        <button
          onClick={() => {
            const errs = {};
            if (!form.equipmentName?.trim()) errs.equipmentName = "Equipment name is required";
            if (!form.location?.trim()) errs.location = "Location is required";
            if (!form.requirements?.trim()) errs.requirements = "At least one requirement is required";

            if (Object.keys(errs).length > 0) {
              setActiveErrors(errs);
              return;
            }
            onChange(form);
            onNext();
          }}
          className="px-10 py-3 rounded-full font-bold text-sm bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
