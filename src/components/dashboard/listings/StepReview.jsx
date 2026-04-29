"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";
import { SimpleMap } from "@/components/shared/MapControls";
import { describeListingPrice, formatListingPrice, getPriceMode } from "./listingPrice";

function cap(str) {
  if (!str) return "—";
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function FieldLabel({ children }) {
  return (
    <p
      className="mb-1"
      style={{
        fontFamily: "Sofia Pro, sans-serif",
        fontWeight: 500,
        fontSize: "14px",
        lineHeight: "100%",
        letterSpacing: "0%",
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
        fontFamily: "Sofia Pro, sans-serif",
        fontWeight: 400,
        fontSize: "13px",
        lineHeight: "100%",
        letterSpacing: "0%",
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

/* ── Icons ─────────────────────────────────────────────────────────────────── */
function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
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

  useEffect(() => {
    if (submitError) {
      const errorEntries = fieldErrors ? Object.entries(fieldErrors) : [];
      const errorMessage =
        errorEntries.length > 0
          ? `${submitError}\n${errorEntries.map(([field, msg]) => `• ${field.replace(/([A-Z])/g, " $1").trim()}: ${msg}`).join("\n")}`
          : submitError;
      toast.error(errorMessage);
    }
  }, [submitError, fieldErrors]);

  const title = details.title || "—";
  const location = details.addressLine1
    ? [details.addressLine1, details.placeCity, details.state, details.country].filter(Boolean).join(", ")
    : details.location || "—";
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
  const slots = details.slots?.filter((s) => s.day || s.startTime) || [];
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
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
              <PinIcon />
              {location}
            </FieldValue>
          </div>
          <div>
            <FieldLabel>{priceMode === "activities" ? "Price per Person" : priceMode === "equipment" ? "Equipment Price" : "Place Price"}</FieldLabel>
            <FieldValue className="flex items-start gap-1">
              <DollarIcon />
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
              <ClockIcon />
              {cap(duration)}
            </FieldValue>
          </div>
          <div>
            <FieldLabel>Max Participants</FieldLabel>
            <FieldValue className="flex items-center gap-1.5">
              <PeopleIcon />
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

        {/* Availability slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {slots.map((slot, i) => (
            <React.Fragment key={i}>
              <div>
                <FieldLabel>Select Date</FieldLabel>
                <FieldValue className="flex items-center gap-1.5">
                  <CalendarIcon />
                  {slot.day || "—"}
                </FieldValue>
              </div>
              <div>
                <FieldLabel>Select Time</FieldLabel>
                <FieldValue className="flex items-center gap-1.5">
                  <ClockIcon />
                  {slot.startTime && slot.endTime
                    ? `${slot.startTime} – ${slot.endTime}`
                    : slot.startTime || slot.endTime || "—"}
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
            className="flex-1 sm:flex-none sm:px-14 py-3 sm:py-3.5 rounded-full font-semibold text-sm border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            Go Back
          </button>
          <button
            onClick={onNext}
            disabled={submitting}
            className="flex-1 sm:flex-none sm:px-14 py-3 sm:py-3.5 rounded-full font-semibold text-sm bg-[var(--color-secondary)] text-white hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/>
              </svg>
            )}
            {submitting ? "Submitting..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
