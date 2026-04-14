"use client";

import React from "react";

/* ─── helpers ───────────────────────────────────────────────────────────────── */
function cap(str) {
  if (!str) return "—";
  return str.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/* ─── Section heading ────────────────────────────────────────────────────────── */
function SectionHead({ children }) {
  return (
    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
      {children}
    </h3>
  );
}

/* ─── Map placeholder (same as StepDetails) ─────────────────────────────────── */
function MapPreview() {
  return (
    <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
      {/* tiled bg */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 opacity-20">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={`border border-gray-300 ${i % 3 === 0 ? "bg-green-100" : i % 2 === 0 ? "bg-blue-50" : "bg-gray-50"}`} />
        ))}
      </div>
      {/* street lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 200" preserveAspectRatio="none">
        <line x1="0" y1="100" x2="400" y2="100" stroke="#666" strokeWidth="2"/>
        <line x1="200" y1="0" x2="200" y2="200" stroke="#666" strokeWidth="2"/>
        <line x1="0" y1="50" x2="400" y2="50" stroke="#999" strokeWidth="1"/>
        <line x1="0" y1="150" x2="400" y2="150" stroke="#999" strokeWidth="1"/>
        <line x1="100" y1="0" x2="100" y2="200" stroke="#999" strokeWidth="1"/>
        <line x1="300" y1="0" x2="300" y2="200" stroke="#999" strokeWidth="1"/>
      </svg>
      {/* pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-lg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        </div>
      </div>
      {/* label chips that look like map POIs */}
      <div className="absolute top-4 left-4 bg-white rounded-lg px-2 py-1 shadow text-[9px] font-semibold text-gray-600 border border-gray-100">📍 Activity Location</div>
    </div>
  );
}

/* ─── Photo strip ────────────────────────────────────────────────────────────── */
const PHOTO_COLORS = [
  "from-sky-300 to-blue-400",
  "from-orange-200 to-amber-400",
  "from-teal-200 to-teal-400",
  "from-purple-200 to-violet-400",
];

const PHOTO_EMOJIS = ["🪂", "⛰️", "🏄", "🚣"];

function PhotoStrip() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {PHOTO_COLORS.map((grad, i) => (
        <div
          key={i}
          className={`shrink-0 w-28 h-20 sm:w-36 sm:h-24 rounded-xl bg-gradient-to-br ${grad} flex items-end justify-center pb-2 text-2xl`}
        >
          {PHOTO_EMOJIS[i]}
        </div>
      ))}
    </div>
  );
}

/* ─── Tag badge ──────────────────────────────────────────────────────────────── */
function Tag({ children, color = "teal" }) {
  const styles = {
    teal: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
    yellow: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[color]}`}>
      {children}
    </span>
  );
}

/* ─── Divider ────────────────────────────────────────────────────────────────── */
function Divider() {
  return <hr className="border-gray-100 my-5" />;
}

/* ─── Component ──────────────────────────────────────────────────────────────── */
export default function StepReview({ data, onNext, onBack }) {
  const { category, type, details = {}, price } = data;

  const title = details.title || "Skydiving Adventures";
  const location = details.location || "Queenstown, New Zealand";
  const description = details.description || "Lorem ipsum dolor sit amet consectetur. Amet tempus aliquam nec odio. Pellentesque sit libero ultrices accumsan nisi diam laoreet. Auctor laoreet lorem vitae cras neque. Lorem ipsum dolor sit amet consectetur.";
  const difficulty = details.difficulty || "Expert";
  const duration = details.duration || "3 hrs";
  const maxParticipants = details.maxParticipants || 12;
  const instructorName = details.instructorName || "John Doe";
  const included = details.included?.length ? details.included : ["Air Conditioning", "WiFi"];
  const requirements = details.requirements || "Lorem ipsum dolor sit amet consectetur. Amet tempus aliquam nec odio. Pellentesque sit libero ultrices accumsan nisi diam laoreet.";
  const cancellationPolicy = details.cancellationPolicy || "Lorem ipsum dolor sit amet consectetur. Amet tempus aliquam nec odio.";
  const slots = details.slots?.length ? details.slots : [{ date: "September 25, 2025", time: "9:00 AM – 10:00 AM" }];
  const serviceCategory = cap(type) || "Adventures";
  const displayPrice = price ? `$ ${Number(price).toFixed(0)}` : "$ 285";

  return (
    <div className="pb-10 max-w-4xl mx-auto">
      {/* ── Heading ──────────────────────────────────────────────────────── */}
      <div className="text-center mb-8 pt-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] inline-flex items-center gap-2">
          Review Details
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-lg mx-auto leading-relaxed">
          In this step, we'll ask you which type of property you have and if guests Will book the entire place or just a room. Then let us know the location and how many guests can stay
        </p>
      </div>

      {/* ── Main card ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7 space-y-0">

        {/* Row 1 — title / location / price / category */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 mb-5">
          <div>
            <SectionHead>Activity Title</SectionHead>
            <p className="text-sm font-semibold text-gray-800">{title}</p>
          </div>
          <div>
            <SectionHead>Location</SectionHead>
            <p className="text-sm font-semibold text-gray-800">{location}</p>
          </div>
          <div>
            <SectionHead>Price per Person</SectionHead>
            <p className="text-sm font-semibold text-gray-800">{displayPrice}</p>
          </div>
          <div>
            <SectionHead>Service Category</SectionHead>
            <p className="text-sm font-semibold text-gray-800">{serviceCategory}</p>
          </div>
        </div>

        <Divider />

        {/* Description */}
        <div className="mb-5">
          <SectionHead>Description</SectionHead>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>

        <Divider />

        {/* Row 2 — difficulty / duration / max participants / instructor */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 mb-5">
          <div>
            <SectionHead>Difficulty level</SectionHead>
            <p className="text-sm font-semibold text-gray-800">{cap(difficulty)}</p>
          </div>
          <div>
            <SectionHead>Duration</SectionHead>
            <p className="text-sm font-semibold text-gray-800">{duration}</p>
          </div>
          <div>
            <SectionHead>Max Participants</SectionHead>
            <p className="text-sm font-semibold text-gray-800">{maxParticipants}</p>
          </div>
          <div>
            <SectionHead>Instructor Guide name</SectionHead>
            <p className="text-sm font-semibold text-gray-800">{instructorName}</p>
          </div>
        </div>

        <Divider />

        {/* What's Included */}
        <div className="mb-5">
          <SectionHead>What's Included</SectionHead>
          <div className="flex flex-wrap gap-2 mt-1">
            {included.map((item, i) => (
              <Tag key={i} color={i % 2 === 0 ? "teal" : "yellow"}>{item}</Tag>
            ))}
          </div>
        </div>

        <Divider />

        {/* Requirements + Cancellation Policy — side by side on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
          <div>
            <SectionHead>Requirements</SectionHead>
            <p className="text-xs text-gray-500 leading-relaxed">{requirements}</p>
          </div>
          <div>
            <SectionHead>Cancellation Policy</SectionHead>
            <p className="text-xs text-gray-500 leading-relaxed">{cancellationPolicy}</p>
          </div>
        </div>

        <Divider />

        {/* Map */}
        <div className="mb-5">
          <MapPreview />
        </div>

        <Divider />

        {/* Photos */}
        <div className="mb-5">
          <PhotoStrip />
        </div>

        <Divider />

        {/* Availability */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <SectionHead>Select Date</SectionHead>
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {slots[0]?.date || "September 25, 2025"}
            </p>
          </div>
          <div>
            <SectionHead>Select Time</SectionHead>
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {slots[0]?.time || "9:00 AM – 10:00 AM"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav buttons ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={onBack}
          className="px-10 py-3 rounded-full font-bold text-sm border-2 border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={onNext}
          className="px-10 py-3 rounded-full font-bold text-sm bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
