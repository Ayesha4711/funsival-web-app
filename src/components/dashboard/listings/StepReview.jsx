"use client";

import React from "react";
import { SimpleMap } from "@/components/shared/MapControls";
import { parseCalendarDate } from "@/components/shared/dateUtils";
import { describeListingPrice, formatListingPrice, getPriceMode } from "./listingPrice";
import { MapPinIcon, DollarIcon, ClockIcon, UsersIcon, CalendarIcon, InfoIcon, SpinnerIcon } from "@/icons";

function fmt12(timeStr) {
  if (!timeStr) return "";
  if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

function fmtLongDate(raw) {
  if (!raw) return "";
  let date = null;
  if (raw instanceof Date) {
    date = raw;
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [month, day, year] = raw.split("/").map(Number);
    date = new Date(year, month - 1, day);
  } else {
    const parsed = new Date(raw);
    if (!isNaN(parsed)) date = parsed;
  }
  if (!date || isNaN(date)) return raw;
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function cap(str) {
  if (!str) return "—";
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function FieldLabel({ children }) {
  return (
    <p
      className="mb-1"
      style={{
        fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif",
        fontWeight: 500,
        fontSize: "14px",
        lineHeight: "100%",
        letterSpacing: "0",
        color: "#212121",
      }}
    >
      {children}
    </p>
  );
}

function FieldValue({ children, className = "", ...props }) {
  return (
    <p
      className={className}
      style={{
        fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif",
        fontWeight: 400,
        fontSize: "13px",
        lineHeight: "100%",
        letterSpacing: "0",
        color: "#4A4A4A",
      }}
      {...props}
    >
      {children}
    </p>
  );
}

function Divider() {
  return <hr className="border-gray-200 my-5" />;
}

/* Amber pill — matches the image "Air Conditioning" / "WiFi" tags */
function IncludedTag({ children }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF3CD] text-[#92600A]">
      {children}
    </span>
  );
}

function PhotoStrip({ photos }) {
  if (!photos || photos.length === 0) {
    return <p className="text-xs text-gray-400 italic">No photos uploaded.</p>;
  }
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {photos.map((src, i) => (
        <div key={i} className="shrink-0 w-36 h-28 rounded-xl overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}


/* ── Main component ─────────────────────────────────────────────────────────── */
export default function StepReview({
  data,
  onNext,
  onBack,
  onBackToDetails,
  submitting = false,
  submitError = null,
  fieldErrors = null,
  submitLabel = "Submit",
}) {
  const { category, type, details = {}, price } = data;

  const title = details.title || "—";
  const location = [details.placeCity, details.state, details.country].filter(Boolean).join(", ")
    || details.addressLine1
    || details.location
    || "—";
  const description = details.description || "—";
  const difficulty = details.difficulty || "—";
  const duration = details.duration || "—";
  const maxParticipants = details.maxParticipants || "—";
  const instructorName = details.instructorName || "—";
  const included = details.included?.length ? details.included : [];
  const airConditioning = details.airConditioning;
  const wifi = details.wifi;
  const requirements = details.requirements || "—";
  const cancellationPolicy = details.cancellationPolicy || "—";

  // Recurring slots are stored per-weekday (details.recurringSlots) across a date
  // range, separately from one-time slots (details.slots) — show whichever type
  // the provider currently has selected, expanding recurring weekdays into actual
  // calendar dates so both cases display as concrete Select Date / Select Time rows.
  // Must match the completeness check in buildAvailability/normalizeSlot (listingWizardUtils.js)
  // so Review never displays a slot as filled when the submit payload would actually drop it.
  const oneTimeSlots = details.slots?.filter((s) => s.day && s.startTime && s.endTime) || [];
  const recurringSlots = (() => {
    const start = parseCalendarDate(details.recurringStartDate);
    const end = parseCalendarDate(details.recurringEndDate);
    if (!start || !end || start > end) return [];
    const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const rows = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayName = DAY_NAMES[d.getDay()];
      const daySlots = details.recurringSlots?.[dayName] || [];
      daySlots.forEach((s) => {
        if (s.startTime && s.endTime) {
          rows.push({ day: new Date(d), startTime: s.startTime, endTime: s.endTime });
        }
      });
    }
    return rows;
  })();
  const slots =
    details.availabilityType === "recurring"
      ? (recurringSlots.length > 0 ? recurringSlots : oneTimeSlots)
      : details.availabilityType === "one_time"
        ? oneTimeSlots
        : (oneTimeSlots.length > 0 ? oneTimeSlots : recurringSlots);
  const photos = details.photos || [];
  const serviceCategory = cap(type) || "—";
  const displayPrice = formatListingPrice(category, price);
  const priceLines = describeListingPrice(category, price);
  const priceMode = getPriceMode(category);

  const addressLine1 = details.addressLine1 || "";
  const addressLine2 = details.addressLine2 || "";
  const placeCity = details.placeCity || "";
  const state = details.state || "";
  const country = details.country || "";
  const postalCode = details.postalCode || "";
  const fullAddress = [addressLine1, addressLine2, placeCity, state, postalCode, country].filter(Boolean).join(", ") || "—";

  /* Merge wifi/airConditioning toggles into the included list for display */
  const allIncluded = [
    ...included,
    ...(airConditioning ? ["Air Conditioning"] : []),
    ...(wifi ? ["WiFi"] : []),
  ];

  return (
    <div className="pb-10 w-full">
      {/* Heading */}
      <div className="text-center mb-8 pt-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] inline-flex items-center gap-2">
          Review Details
          {/* <InfoIcon size={20} className="text-[var(--color-secondary)]" /> */}
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl mx-auto leading-relaxed">
          In this step, we&apos;ll ask you which type of property you have and if guests will book the entire place or just a room. Then let us know the location and how many guests can stay.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-7">

        {/* Row 1 — title / location / price / category */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
          <div>
            <FieldLabel>Activity Title</FieldLabel>
            <FieldValue>{title}</FieldValue>
          </div>
          <div>
            <FieldLabel>Location</FieldLabel>
            <FieldValue className="flex items-start gap-1">
              <MapPinIcon size={14} className="shrink-0 mt-0.5 text-gray-400" />
              {location}
            </FieldValue>
          </div>
          <div>
            <FieldLabel>{priceMode === "activities" ? "Price per Person" : priceMode === "equipment" ? "Equipment Price" : "Place Price"}</FieldLabel>
            <FieldValue className="flex items-start gap-1">
              <DollarIcon size={14} className="shrink-0 mt-0.5 text-gray-400" />
              {displayPrice}
            </FieldValue>
          </div>
          <div>
            <FieldLabel>Service Category</FieldLabel>
            <FieldValue>{serviceCategory}</FieldValue>
          </div>
        </div>

        <Divider />

        {/* Description */}
        <div>
          <FieldLabel>Description</FieldLabel>
          <FieldValue>{description}</FieldValue>
        </div>

        <Divider />

        {/* Row 2 — difficulty / duration / max / instructor */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
          <div>
            <FieldLabel>Difficulty level</FieldLabel>
            <FieldValue>{cap(difficulty)}</FieldValue>
          </div>
          <div>
            <FieldLabel>Duration</FieldLabel>
            <FieldValue className="flex items-center gap-1.5">
              <ClockIcon size={14} className="shrink-0 mt-0.5 text-gray-400" />
              {cap(duration)}
            </FieldValue>
          </div>
          <div>
            <FieldLabel>Max Participants</FieldLabel>
            <FieldValue className="flex items-center gap-1.5">
              <UsersIcon size={15} className="shrink-0 mt-0.5 text-gray-400" />
              {maxParticipants}
            </FieldValue>
          </div>
          <div>
            <FieldLabel>Instructor Guide name</FieldLabel>
            <FieldValue>{instructorName}</FieldValue>
          </div>
        </div>

        <Divider />

        {/* What's Included */}
        {allIncluded.length > 0 && (
          <>
            <div>
              <FieldLabel>What&apos;s Included</FieldLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {allIncluded.map((item, i) => (
                  <IncludedTag key={i}>{item}</IncludedTag>
                ))}
              </div>
            </div>
            <Divider />
          </>
        )}

        {/* Requirements + Cancellation Policy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <FieldLabel>Requirements</FieldLabel>
            <FieldValue>{requirements}</FieldValue>
          </div>
          <div>
            <FieldLabel>Cancellation Policy</FieldLabel>
            <FieldValue>{cap(cancellationPolicy)}</FieldValue>
          </div>
        </div>

        <Divider />

        {/* Map */}
        <SimpleMap
          location={fullAddress !== "—" ? fullAddress : location}
          lat={details.mapLat}
          lng={details.mapLng}
          height={240}
        />

        <Divider />

        {/* Photos */}
        <PhotoStrip photos={photos} />

        <Divider />

        {/* Availability slots — two-column Date / Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {slots.map((slot, i) => (
            <React.Fragment key={i}>
              <div>
                <FieldLabel>Select Date</FieldLabel>
                <FieldValue className="flex items-center gap-1.5">
                  <CalendarIcon size={14} className="shrink-0 mt-0.5 text-gray-400" />
                  {fmtLongDate(slot.day) || "—"}
                </FieldValue>
              </div>
              <div>
                <FieldLabel>Select Time</FieldLabel>
                <FieldValue className="flex items-center gap-1.5">
                  <ClockIcon size={14} className="shrink-0 mt-0.5 text-gray-400" />
                  {slot.startTime && slot.endTime
                    ? `${fmt12(slot.startTime)} – ${fmt12(slot.endTime)}`
                    : fmt12(slot.startTime || slot.endTime) || "—"}
                </FieldValue>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex flex-col items-center gap-3 mt-8">
        {fieldErrors && Object.keys(fieldErrors).length > 0 && (
          <button
            onClick={onBackToDetails ?? onBack}
            className="text-xs font-semibold text-[var(--color-primary)] underline underline-offset-2 hover:opacity-80"
          >
            Fix errors in Details step →
          </button>
        )}
        <div className="flex items-center gap-3 w-full sm:w-auto sm:justify-center">
          <button
            onClick={onBack}
            disabled={submitting}
            className="flex-1 sm:flex-none sm:w-[244px] h-[58px] rounded-[100px] font-semibold text-sm border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            Go Back
          </button>
          <button
            onClick={onNext}
            disabled={submitting}
            className="flex-1 sm:flex-none sm:w-[244px] h-[58px] rounded-[100px] font-semibold text-sm bg-[var(--color-secondary)] text-[#2D2D2D] hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <SpinnerIcon size={14} />}
            {submitting ? "Submitting..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
