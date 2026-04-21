"use client";

import React from "react";

/* ─── helpers ───────────────────────────────────────────────────────────────── */
function cap(str) {
  if (!str) return "—";
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ─── Section label (small caps style) ──────────────────────────────────────── */
function FieldLabel({ children }) {
  return (
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
      {children}
    </p>
  );
}

/* ─── Section heading with teal left border ─────────────────────────────────── */
function SectionHead({ children }) {
  return (
    <h3 className="text-sm font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
      {children}
    </h3>
  );
}

/* ─── Thin divider ───────────────────────────────────────────────────────────── */
function Divider() {
  return <hr className="border-gray-100 my-5" />;
}

/* ─── Tag badge ──────────────────────────────────────────────────────────────── */
function Tag({ children }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary-light)] text-[var(--color-primary)]">
      {children}
    </span>
  );
}

/* ─── Live map using the stored location coords ──────────────────────────────── */
function ReviewMap({ location }) {
  // Default to Karachi if no location text provided
  const defaultSrc = "https://www.openstreetmap.org/export/embed.html?bbox=66.95%2C24.81%2C67.05%2C24.91&layer=mapnik&marker=24.8607%2C67.0011";

  // If we have a location string, use a geocode embed query
  const mapSrc = location
    ? `https://www.openstreetmap.org/export/embed.html?query=${encodeURIComponent(location)}&layer=mapnik`
    : defaultSrc;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-gray-200" style={{ height: 260 }}>
      <iframe
        src={mapSrc}
        className="w-full h-full border-0"
        title="Activity location"
        loading="lazy"
      />
    </div>
  );
}

/* ─── Photo strip — shows real uploaded blobs or placeholders ────────────────── */
function PhotoStrip({ photos }) {
  const hasSources = photos && photos.length > 0;

  if (hasSources) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-1">
        {photos.map((src, i) => (
          <div key={i} className="shrink-0 w-32 h-24 sm:w-40 sm:h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    );
  }

  // Placeholder gradient tiles
  const gradients = [
    "from-sky-300 to-blue-400",
    "from-orange-200 to-amber-400",
    "from-teal-200 to-teal-400",
    "from-purple-200 to-violet-400",
  ];
  const emojis = ["🪂", "⛰️", "🏄", "🚣"];

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {gradients.map((g, i) => (
        <div key={i} className={`shrink-0 w-32 h-24 sm:w-40 sm:h-28 rounded-xl bg-gradient-to-br ${g} flex items-end justify-center pb-2 text-2xl`}>
          {emojis[i]}
        </div>
      ))}
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────────────────────── */
export default function StepReview({ data, onNext, onBack }) {
  const { category, type, details = {}, price } = data;

  const title = details.title || "Skydiving Adventures";
  const location = details.location || "Queenstown, New Zealand";
  const description = details.description || "Lorem ipsum dolor sit amet consectetur. Amet tempus aliquam nec odio. Pellentesque sit libero ultrices accumsan nisi diam laoreet. Auctor laoreet lorem vitae cras neque.";
  const difficulty = details.difficulty || "Expert";
  const duration = details.duration || "3 hrs";
  const maxParticipants = details.maxParticipants || 12;
  const instructorName = details.instructorName || "John Doe";
  const included = details.included?.length ? details.included : ["Air Conditioning", "WiFi"];
  const requirements = details.requirements || "Lorem ipsum dolor sit amet consectetur. Amet tempus aliquam nec odio. Pellentesque sit libero ultrices accumsan nisi diam laoreet.";
  const cancellationPolicy = details.cancellationPolicy || "Lorem ipsum dolor sit amet consectetur. Amet tempus aliquam nec odio.";
  const slots = details.slots?.length ? details.slots : [{ date: "September 25, 2025", startTime: "09:00 AM", endTime: "10:00 AM" }];
  const photos = details.photos || [];
  const serviceCategory = cap(type) || "Adventures";
  const displayPrice = price ? `$ ${Number(price).toFixed(0)}` : "$ 285";

  return (
    <div className="pb-10 w-full">
      {/* ── Heading ──────────────────────────────────────────────────────── */}
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

      {/* ── Main card ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">

        {/* Row 1 — title / location / price / category */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 mb-2">
          <div>
            <FieldLabel>Activity Title</FieldLabel>
            <p className="text-sm font-semibold text-gray-800">{title}</p>
          </div>
          <div>
            <FieldLabel>Location</FieldLabel>
            <p className="text-sm font-semibold text-gray-800">{location}</p>
          </div>
          <div>
            <FieldLabel>Price per Person</FieldLabel>
            <p className="text-sm font-semibold text-gray-800">{displayPrice}</p>
          </div>
          <div>
            <FieldLabel>Service Category</FieldLabel>
            <p className="text-sm font-semibold text-gray-800">{serviceCategory}</p>
          </div>
        </div>

        <Divider />

        {/* Description */}
        <div className="mb-2">
          <FieldLabel>Description</FieldLabel>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>

        <Divider />

        {/* Row 2 — difficulty / duration / max / instructor */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 mb-2">
          <div>
            <FieldLabel>Difficulty level</FieldLabel>
            <p className="text-sm font-semibold text-gray-800">{cap(difficulty)}</p>
          </div>
          <div>
            <FieldLabel>Duration</FieldLabel>
            <p className="text-sm font-semibold text-gray-800">{duration}</p>
          </div>
          <div>
            <FieldLabel>Max Participants</FieldLabel>
            <p className="text-sm font-semibold text-gray-800">{maxParticipants}</p>
          </div>
          <div>
            <FieldLabel>Instructor Guide name</FieldLabel>
            <p className="text-sm font-semibold text-gray-800">{instructorName}</p>
          </div>
        </div>

        <Divider />

        {/* What's Included */}
        <div className="mb-2">
          <FieldLabel>What&apos;s Included</FieldLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {included.map((item, i) => <Tag key={i}>{item}</Tag>)}
          </div>
        </div>

        <Divider />

        {/* Requirements + Cancellation Policy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-2">
          <div>
            <FieldLabel>Requirements</FieldLabel>
            <p className="text-xs text-gray-500 leading-relaxed">{requirements}</p>
          </div>
          <div>
            <FieldLabel>Cancellation Policy</FieldLabel>
            <p className="text-xs text-gray-500 leading-relaxed">{cancellationPolicy}</p>
          </div>
        </div>

        <Divider />

        {/* Map — real OSM iframe */}
        <div className="mb-2">
          <ReviewMap location={location} />
        </div>

        <Divider />

        {/* Photos */}
        <div className="mb-2">
          <PhotoStrip photos={photos} />
        </div>

        <Divider />

        {/* Availability slots */}
        <div>
          <SectionHead>Availability</SectionHead>
          <div className="space-y-3">
            {slots.map((slot, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0 rounded-2xl border border-gray-200 bg-[#F9FAFB] overflow-hidden">
                {/* Date */}
                <div className="flex-1 px-5 py-3 border-b sm:border-b-0 sm:border-r border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Select Date</p>
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    {slot.date || "—"}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </p>
                </div>
                {/* Select Time label */}
                <div className="hidden sm:flex items-center px-4 shrink-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Time</p>
                </div>
                {/* Start */}
                <div className="flex-1 px-5 py-3 border-b sm:border-b-0 sm:border-r border-gray-200">
                  <p className="text-sm text-gray-400 text-xs mb-1">When the activity begins</p>
                  <p className="text-sm font-semibold text-gray-800">{slot.startTime || "—"}</p>
                </div>
                {/* End */}
                <div className="flex-1 px-5 py-3">
                  <p className="text-sm text-gray-400 text-xs mb-1">When the activity ends</p>
                  <p className="text-sm font-semibold text-gray-800">{slot.endTime || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Nav buttons ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button onClick={onBack} className="px-14 py-3.5 rounded-full font-semibold text-sm border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-colors">
          Go Back
        </button>
        <button onClick={onNext} className="px-14 py-3.5 rounded-full font-semibold text-sm bg-[var(--color-secondary)] text-white hover:opacity-90 transition-all">
          Next
        </button>
      </div>
    </div>
  );
}
