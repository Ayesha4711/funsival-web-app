"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { Country, State } from "country-state-city";
import {
  DropdownField,
  ComboboxField,
  TagInputField,
} from "@/components/shared/FieldControls";
import { LocationMap } from "@/components/shared/MapControls";
import { uploadListingImages } from "@/store/slices/listingsSlice";
import { UsersIcon, ChevronUpIcon, ChevronDownIcon, InfoIcon } from "@/icons";
import {
  Label,
  TextInput,
  Textarea,
  FieldError,
  SectionTitle,
  DESCRIPTION_MAX,
} from "./StepDetailsFieldControls";
import PhotoUpload from "./StepDetailsPhotoUpload";
import LocationDropdowns from "./StepDetailsLocationDropdowns";
import StepDetailsAvailabilitySection from "./StepDetailsAvailabilitySection";
import { geocodeSearch, reverseGeocodeToAddressFields } from "./locationGeocoding";

/* ─── Step ─────────────────────────────────────────────────────────────────── */
export default function StepDetails({ details, onChange, onNext, onBack, fieldErrors = null }) {
  const dispatch = useDispatch();
  // Local copy of field errors — cleared per-field as the user edits
  const [activeErrors, setActiveErrors] = useState(fieldErrors || {});
  const [photoUploadsPending, setPhotoUploadsPending] = useState(0);

  // Sync when new errors arrive from parent (after a failed submit) and scroll to first error
  useEffect(() => {
    if (!fieldErrors || Object.keys(fieldErrors).length === 0) return;
    setActiveErrors(fieldErrors);
    // Scroll to the first field that has an error
    const firstKey = Object.keys(fieldErrors)[0];
    setTimeout(() => {
      const el = document.querySelector(`[data-field="${firstKey}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }, [fieldErrors]);

  const fe = activeErrors;
  const isUploadingPhotos = photoUploadsPending > 0;

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
    availabilityType: "",
    recurringSlots: {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
    },
    recurringStartDate: "",
    recurringEndDate: "",
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

  // Sync form state when details prop changes (for edit mode only — run once on mount)
  const detailsRef = React.useRef(details);
  useEffect(() => {
    const d = detailsRef.current;
    if (d && Object.keys(d).length > 0) {
      setForm(prev => ({ ...prev, ...d }));
    }
  }, []);

  // ── Map search state ────────────────────────────────────────────────────────
  const [mapQuery, setMapQuery] = useState(details?.addressLine1 || "");
  const [mapSuggestions, setMapSuggestions] = useState([]);
  const [mapCoords, setMapCoords] = useState(() => {
    if (details?.mapLat && details?.mapLng) return { lat: details.mapLat, lon: details.mapLng };
    return { lat: 24.8607, lon: 67.0011 };
  });
  const [mapLoading, setMapLoading] = useState(false);
  const mapDebounceRef = useRef(null);

  // On mount: if address is pre-filled but coords are still default, geocode to pan the map
  useEffect(() => {
    const prefilled = details?.addressLine1 || details?.location;
    if (!prefilled || (details?.mapLat && details?.mapLng)) return;
    geocodeSearch(prefilled, 1)
      .then(result => { if (result) setMapCoords({ lat: parseFloat(result.lat), lon: parseFloat(result.lon) }); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchMap = useCallback(async (q) => {
    if (!q.trim() || q.length < 3) { setMapSuggestions([]); return; }
    setMapLoading(true);
    try {
      const results = await geocodeSearch(q, 5);
      setMapSuggestions(results);
    } catch { setMapSuggestions([]); }
    finally { setMapLoading(false); }
  }, []);

  const handleMapQueryChange = (val) => {
    setMapQuery(val);
    setForm(prev => ({ ...prev, addressLine1: val, location: val }));
    if (activeErrors.addressLine1) {
      setActiveErrors(prev => { const n = { ...prev }; delete n.addressLine1; return n; });
    }
    clearTimeout(mapDebounceRef.current);
    mapDebounceRef.current = setTimeout(async () => {
      await searchMap(val);
      // Also pan the map to the top result so the iframe updates immediately
      await geocodeAndPan(val);
    }, 600);
  };

  const handleMapSelect = async (s) => {
    const lat = parseFloat(s.lat);
    const lon = parseFloat(s.lon);
    setMapCoords({ lat, lon });
    setMapSuggestions([]);

    // Fetch full address details to populate all fields
    try {
      const fields = await reverseGeocodeToAddressFields(lat, lon, s.display_name, form.postalCode);
      setMapQuery(fields.addressLine1);
      setForm(prev => ({ ...prev, ...fields }));
    } catch {
      // Fallback: just set address line from display_name
      setMapQuery(s.display_name);
      setForm(prev => ({ ...prev, addressLine1: s.display_name, location: s.display_name }));
    }

    setActiveErrors(prev => {
      const n = { ...prev };
      delete n.addressLine1;
      delete n.country;
      delete n.state;
      delete n.placeCity;
      delete n.city;
      return n;
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation is not supported by your browser."); return; }
    navigator.geolocation.getCurrentPosition(async ({ coords: { latitude: lat, longitude: lon } }) => {
      setMapCoords({ lat, lon });
      try {
        const fallbackName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        const fields = await reverseGeocodeToAddressFields(lat, lon, fallbackName, form.postalCode);
        setMapQuery(fields.addressLine1);
        setForm(prev => ({ ...prev, ...fields }));
        setActiveErrors(prev => {
          const n = { ...prev };
          delete n.addressLine1; delete n.country; delete n.state; delete n.placeCity; delete n.city;
          return n;
        });
      } catch {
        const name = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        setMapQuery(name);
        setForm(prev => ({ ...prev, addressLine1: name, location: name }));
      }
    }, (err) => {
      toast.error("Location access denied.", { description: err.message });
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handlePhotosChange = useCallback((nextPhotos) => {
    setForm((prev) => ({
      ...prev,
      photos: typeof nextPhotos === "function" ? nextPhotos(prev.photos) : nextPhotos,
    }));
  }, []);

  const handleUploadFiles = useCallback(async (filesArray) => {
    setPhotoUploadsPending((count) => count + 1);
    try {
      const result = await dispatch(uploadListingImages(filesArray));
      if (uploadListingImages.rejected.match(result)) {
        throw new Error(
          typeof result.payload === "string"
            ? result.payload
            : result.payload?.message || "Failed to upload images. Please try again."
        );
      }
      return result.payload;
    } finally {
      setPhotoUploadsPending((count) => Math.max(0, count - 1));
    }
  }, [dispatch]);

  // Geocode a free-form query and pan the map there (fire-and-forget)
  const geocodeAndPan = useCallback(async (query) => {
    try {
      const result = await geocodeSearch(query, 1);
      if (result) setMapCoords({ lat: parseFloat(result.lat), lon: parseFloat(result.lon) });
    } catch { /* ignore */ }
  }, []);

  const clearSlotErrors = () => {
    if (activeErrors.slots || activeErrors.availability) {
      setActiveErrors(prev => { const n = { ...prev }; delete n.slots; delete n.availability; return n; });
    }
  };
  const updateSlot = (i, key, val) => {
    setForm(prev => {
      const next = [...(prev.slots || [])];
      next[i] = { ...(next[i] || { day: "", startTime: "", endTime: "" }), [key]: val };
      return { ...prev, slots: next };
    });
    clearSlotErrors();
  };

  return (
    <div className="pb-10">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">Add Details</h2>
        <p className="text-xs text-gray-400 mt-1">Tell the key details of your activity — what you offer, where it takes place and what guests can expect</p>
      </div>

      <div className="space-y-6">
        {/* ── 1. Basic Information ─────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <SectionTitle num="1">Basic Information</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div data-field="activityTitle">
              <Label required>Activity Title</Label>
              <TextInput placeholder="Give your activity a clear name so guests instantly understand what you offer" value={form.title} error={!!fe.activityTitle} onChange={(e) => setWithClear("title", e.target.value, "activityTitle")} />
              <FieldError msg={fe.activityTitle} />
            </div>
            <div className="sm:col-span-2">
              <Label required>Description</Label>
              <Textarea placeholder="Tell guests what your experience includes and why it's unique" value={form.description} error={!!fe.description} onChange={(e) => setWithClear("description", e.target.value, "description")} maxLength={DESCRIPTION_MAX} rows={4} />
              <FieldError msg={fe.description} />
            </div>
          </div>
        </section>

        {/* ── 2. Service Details ────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <SectionTitle num="2">Service Details</SectionTitle>

          {/* Row 1: Difficulty | Duration | Max Participants */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div data-field="difficulty">
              <Label required>Difficulty Level</Label>
              <DropdownField
                value={form.difficulty}
                placeholder="Select the experience level best suited for this activity"
                error={!!fe.difficulty}
                options={[
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advanced", label: "Advanced" },
                  { value: "all_levels", label: "All Levels" },
                ]}
                onChange={(value) => setWithClear("difficulty", value, "difficulty")}
              />
              <FieldError msg={fe.difficulty} />
            </div>
            <div data-field="duration">
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
              <div className="flex items-center h-[42px] rounded-xl border border-transparent bg-[#F5F5F5] overflow-hidden">
                <div className="flex items-center gap-2 flex-1 px-3">
                  <UsersIcon size={14} className="shrink-0 text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">{form.maxParticipants}</span>
                </div>
                <div className="flex flex-col h-full border-l border-gray-200">
                  <button type="button" onClick={() => set("maxParticipants", form.maxParticipants + 1)} className="flex-1 w-8 flex items-center justify-center text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 transition-colors border-b border-gray-200">
                    <ChevronUpIcon size={10} />
                  </button>
                  <button type="button" onClick={() => set("maxParticipants", Math.max(1, form.maxParticipants - 1))} className="flex-1 w-8 flex items-center justify-center text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 transition-colors">
                    <ChevronDownIcon size={10} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Instructor Name | Cancellation Policy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div data-field="instructorName">
              <Label required>Instructor Name</Label>
              <TextInput placeholder="Enter the name of the guide or instructor leading this activity" value={form.instructorName} error={!!fe.instructorName} onChange={(e) => setWithClear("instructorName", e.target.value, "instructorName")} />
              <FieldError msg={fe.instructorName} />
            </div>
            <div data-field="cancellationPolicy">
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
                <button type="button" className="shrink-0" title="Learn about cancellation policies">
                  <InfoIcon size={28} className="text-gray-400" />
                </button>
              </div>
              <FieldError msg={fe.cancellationPolicy} />
            </div>
          </div>

          {/* Row 3: What's Included (full width) */}
          <div className="mb-4" data-field="whatsIncluded">
            <Label required>What&apos;s Included</Label>
            <TagInputField
              tags={form.included}
              placeholder="List everything provided — gear, equipment, or snacks"
              onAdd={(value) => {
                set("included", [...form.included, value]);
                if (activeErrors.whatsIncluded) {
                  setActiveErrors(prev => { const n = { ...prev }; delete n.whatsIncluded; return n; });
                }
              }}
              onRemove={(index) => set("included", form.included.filter((_, i) => i !== index))}
              error={!!fe.whatsIncluded}
            />
            <FieldError msg={fe.whatsIncluded} />
          </div>

          {/* Row 4: Requirements (full width) */}
          <div className="mb-4">
            <Label>Requirements</Label>
            <TagInputField
              tags={form.requirementsList}
              placeholder="Let guests know what they need to bring or prepare"
              onAdd={(value) => {
                const next = [...form.requirementsList, value];
                set("requirementsList", next);
                set("requirements", next.join(", "));
                if (activeErrors.requirements) {
                  setActiveErrors(prev => { const n = { ...prev }; delete n.requirements; return n; });
                }
              }}
              onRemove={(index) => {
                const next = form.requirementsList.filter((_, i) => i !== index);
                set("requirementsList", next);
                set("requirements", next.join(", "));
              }}
            />
            <FieldError msg={fe.requirements} />
          </div>

        </section>

        {/* ── 3. Location Map ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <SectionTitle num="3">Where&apos;s Your Place Located?</SectionTitle>
          <p className="text-xs text-gray-400 mb-4">Your address is only shown to guests after they&apos;ve made a booking.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div data-field="addressLine1">
              <Label required>Address Line 1</Label>
              <TextInput
                placeholder="Street address"
                value={form.addressLine1}
                error={!!fe.addressLine1}
                onChange={(e) => {
                  setWithClear("addressLine1", e.target.value, "addressLine1");
                  setMapQuery(e.target.value);
                  clearTimeout(mapDebounceRef.current);
                  mapDebounceRef.current = setTimeout(() => {
                    searchMap(e.target.value);
                    const stateName = State.getStateByCodeAndCountry(form.stateCode, form.countryCode)?.name || form.stateCode;
                    const countryName = Country.getCountryByCode(form.countryCode)?.name || form.countryCode;
                    const q = [e.target.value, stateName, countryName].filter(Boolean).join(", ");
                    geocodeAndPan(q);
                  }, 500);
                }}
              />
              <FieldError msg={fe.addressLine1} />
            </div>
            <div>
              <Label>Address Line 2</Label>
              <TextInput placeholder="Apt, suite, unit (optional)" value={form.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} />
            </div>
            <div data-field="country" className="contents">
            <LocationDropdowns
              country={form.countryCode}
              state={form.stateCode}
              city={form.placeCity}
              onCountryChange={(val) => {
                const countryObj = Country.getCountryByCode(val);
                setWithClear("countryCode", val, "country");
                set("country", countryObj?.name || val);
                geocodeAndPan(countryObj?.name || val);
              }}
              onStateChange={(val) => {
                const stateObj = State.getStateByCodeAndCountry(val, form.countryCode);
                setWithClear("stateCode", val, "state");
                set("state", stateObj?.name || val);
                const q = [stateObj?.name || val, Country.getCountryByCode(form.countryCode)?.name].filter(Boolean).join(", ");
                geocodeAndPan(q);
              }}
              onCityChange={(val) => {
                setWithClear("placeCity", val, fe.placeCity ? "placeCity" : "city");
                const stateName = State.getStateByCodeAndCountry(form.stateCode, form.countryCode)?.name || form.stateCode;
                const countryName = Country.getCountryByCode(form.countryCode)?.name || form.countryCode;
                const q = [val, stateName, countryName].filter(Boolean).join(", ");
                geocodeAndPan(q);
              }}
              errors={fe}
            />
            </div>
            <div>
              <Label>Postal Code</Label>
              <TextInput placeholder="Postal / ZIP code" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
            </div>
          </div>

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

        {/* ── 4. Photos ──────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6" data-field="photos">
          <SectionTitle num="4">Add Some Photos Of Your Activity</SectionTitle>
          <p className="text-xs text-gray-400 mb-4">Add at least 5 photos to increase your bookings. You can edit or add more later.</p>
          <PhotoUpload
            photos={form.photos}
            onPhotosChange={(photos) => {
              handlePhotosChange(photos);
              if (activeErrors.photos) {
                setActiveErrors(prev => { const n = { ...prev }; delete n.photos; return n; });
              }
            }}
            onUploadFiles={handleUploadFiles}
            isUploading={isUploadingPhotos}
          />
          <FieldError msg={fe.photos} />
        </section>

        {/* ── 5. Availability ─────────────────────────────────────────────── */}
        <StepDetailsAvailabilitySection
          form={form}
          fe={fe}
          set={set}
          updateSlot={updateSlot}
          activeErrors={activeErrors}
          setActiveErrors={setActiveErrors}
        />
      </div>

      {/* Nav buttons — full-width on mobile */}
      <div className="flex items-center gap-4 mt-8 sm:mt-10 sm:justify-center">
        <button onClick={onBack} className="flex-1 sm:flex-none sm:w-[244px] h-[58px] rounded-[100px] font-semibold text-sm border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors">Go Back</button>
        <button
          disabled={isUploadingPhotos}
          onClick={() => {
            const errs = {};
            if (isUploadingPhotos) {
              toast.error("Please wait for image uploads to finish.");
              return;
            }
            if (!form.title?.trim()) errs.activityTitle = "Activity title is required";
            if (!form.description?.trim()) errs.description = "Description is required";
            else if (form.description.length > DESCRIPTION_MAX) errs.description = `Description must be ${DESCRIPTION_MAX} characters or less`;
            if (!form.difficulty) errs.difficulty = "Difficulty level is required";
            if (!form.duration) errs.duration = "Duration is required";
            if (!form.instructorName?.trim()) errs.instructorName = "Instructor name is required";
            if (!form.cancellationPolicy) errs.cancellationPolicy = "Cancellation policy is required";
            if (!form.included || form.included.length === 0) errs.whatsIncluded = "What's Included must be a non-empty array";
            if (!form.photos || form.photos.length === 0) errs.photos = "Please add at least one photo of your activity";
            if (!form.addressLine1?.trim()) errs.addressLine1 = "Address is required";
            if (!form.countryCode) errs.country = "Country is required";
            if (!form.stateCode) {
              const hasStates = !form.countryCode || State.getStatesOfCountry(form.countryCode).length > 0;
              if (hasStates) errs.state = "State / Province is required";
            }
            if (!form.placeCity?.trim()) errs.placeCity = "City is required";

            // Availability is optional overall, but once the host picks a type, its slots must be complete.
            if (form.availabilityType === "one_time") {
              const s = form.slots[0];
              if (!s?.day || !s?.startTime || !s?.endTime) {
                errs.availability = "Please complete the date and time for the one-time slot.";
              }
            } else if (form.availabilityType === "recurring") {
              if (!form.recurringStartDate || !form.recurringEndDate) {
                errs.availability = "Please select a start and end date for the recurring schedule.";
              } else {
                const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                const dayJsIndex = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
                const sDate = new Date(form.recurringStartDate);
                const eDate = new Date(form.recurringEndDate);
                const activeDaysSet = new Set();

                if (!isNaN(sDate) && !isNaN(eDate) && sDate <= eDate) {
                  const diffDays = Math.round((eDate.getTime() - sDate.getTime()) / 86400000) + 1;
                  if (diffDays >= 7) {
                    allDays.forEach(d => activeDaysSet.add(d));
                  } else {
                    for (let d = new Date(sDate); d <= eDate; d.setDate(d.getDate() + 1)) {
                      const name = allDays.find(n => dayJsIndex[n] === d.getDay());
                      if (name) activeDaysSet.add(name);
                    }
                  }
                } else {
                  allDays.forEach(d => activeDaysSet.add(d));
                }

                const activeDaysList = allDays.filter(d => activeDaysSet.has(d));
                const hasAnySlot = activeDaysList.some(d => (form.recurringSlots?.[d] || []).length > 0);

                if (!hasAnySlot) {
                  errs.availability = "Please add at least one time slot to an available day.";
                } else {
                  const incomplete = activeDaysList.some(d =>
                    (form.recurringSlots?.[d] || []).some(s => !s.startTime || !s.endTime)
                  );
                  if (incomplete) errs.availability = "Please complete all recurring time slots.";
                }
              }
            }

            if (Object.keys(errs).length > 0) {
              setActiveErrors(errs);
              // Scroll to the first error field
              const firstKey = Object.keys(errs)[0];
              const el = document.querySelector(`[data-field="${firstKey}"]`);
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
              return;
            }
            const hasAddress = !!(form.addressLine1?.trim() || form.location?.trim());
            onChange({ ...form, mapLat: hasAddress ? mapCoords.lat : undefined, mapLng: hasAddress ? mapCoords.lon : undefined });
            onNext();
          }}
          className="flex-1 sm:flex-none sm:w-[244px] h-[58px] rounded-[100px] font-semibold text-sm bg-[var(--color-secondary)] text-[#2D2D2D] hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
