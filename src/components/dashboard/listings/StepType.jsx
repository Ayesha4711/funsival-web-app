"use client";

import React, { useState, useMemo } from "react";

/* ─── Activity type data ───────────────────────────────────────────────────── */
const ACTIVITY_TYPES = [
  { id: "skydiving", label: "Skydiving", emoji: "🪂" },
  { id: "horse_riding", label: "Horse riding", emoji: "🐴" },
  { id: "scuba_diving", label: "Scuba diving", emoji: "🤿" },
  { id: "paragliding", label: "Paragliding", emoji: "🪁" },
  { id: "zipline", label: "Zipline", emoji: "🚠" },
  { id: "jeep_rally", label: "Jeep Rally", emoji: "🗺️" },
  { id: "hang_glider", label: "Hang glider", emoji: "🤿" },
  { id: "bungee", label: "Bungee", emoji: "🎪" },
  { id: "bowling", label: "Bowling", emoji: "🎳" },
  { id: "trampoline", label: "Trampoline", emoji: "🎭" },
  { id: "golf", label: "Golf", emoji: "⛳" },
  { id: "boating", label: "Boating", emoji: "⛵" },
  { id: "snowboarding", label: "Snowboarding", emoji: "🏂" },
  { id: "surfing", label: "Surfing", emoji: "🏄" },
  { id: "adventure_atvs", label: "Adventure ATV's", emoji: "🏍️" },
  { id: "jetski", label: "Jetski", emoji: "🚤" },
];

const PLACE_TYPES = [
  { id: "beach", label: "Beach", emoji: "🏖️" },
  { id: "mountain", label: "Mountain", emoji: "⛰️" },
  { id: "forest", label: "Forest", emoji: "🌲" },
  { id: "desert", label: "Desert", emoji: "🏜️" },
  { id: "lake", label: "Lake", emoji: "🏞️" },
  { id: "waterfall", label: "Waterfall", emoji: "💧" },
  { id: "cave", label: "Cave", emoji: "🕳️" },
  { id: "island", label: "Island", emoji: "🏝️" },
];

const EQUIPMENT_TYPES = [
  { id: "bikes", label: "Bikes", emoji: "🚴" },
  { id: "kayak", label: "Kayak", emoji: "🚣" },
  { id: "camping_gear", label: "Camping Gear", emoji: "⛺" },
  { id: "diving_gear", label: "Diving Gear", emoji: "🤿" },
  { id: "surfboard", label: "Surfboard", emoji: "🏄" },
  { id: "skis", label: "Skis", emoji: "⛷️" },
  { id: "telescope", label: "Telescope", emoji: "🔭" },
  { id: "drone", label: "Drone", emoji: "🚁" },
];

const TYPE_MAP = {
  activities: ACTIVITY_TYPES,
  places: PLACE_TYPES,
  equipment: EQUIPMENT_TYPES,
};

/* ─── Type tile ────────────────────────────────────────────────────────────── */
function TypeTile({ item, selected, onClick }) {
  return (
    <button
      onClick={() => onClick(item.id)}
      className={[
        "relative flex flex-col items-center justify-center gap-2 p-3 w-full aspect-[4/3]",
        "rounded-[12px] border-2 transition-all duration-150 cursor-pointer text-center",
        selected
          ? "border-[#1d8c82] bg-[var(--color-primary-light)]"
          : "border-gray-200 bg-white",
      ].join(" ")}
    >
      {selected && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--color-secondary)] flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      <span className="text-3xl leading-none">{item.emoji}</span>
      <span className="text-[14px] font-semibold text-gray-600 leading-tight">{item.label}</span>
    </button>
  );
}

/* ─── Step ─────────────────────────────────────────────────────────────────── */
export default function StepType({ category, selected, onSelect, onNext, onBack }) {
  const [search, setSearch] = useState("");
  const types = TYPE_MAP[category] ?? ACTIVITY_TYPES;

  const filtered = useMemo(
    () => types.filter((t) => t.label.toLowerCase().includes(search.toLowerCase())),
    [types, search]
  );

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] mb-2 text-center flex items-center gap-2">
        Which Of These Best Describes Your Service?
        <span className="inline-flex text-[#E95764] align-middle">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </span>
      </h2>

      <p className="text-[#475467] text-[13px] sm:text-[14px] leading-[20px] sm:leading-[22px] text-center max-w-[260px] sm:max-w-md mb-8 font-normal font-sofia">
        In this step, we&apos;ll ask you which type of property you have and if guests will book the entire place or just a room. Then let us know the location and how many guests can stay.
      </p>

      {/* Search */}
      <div className="relative w-full max-w-2xl mb-6 px-0">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search here"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-5 py-3 sm:py-3.5 rounded-full border border-gray-200 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
        />
      </div>

      {/* Cards — 3 cols on mobile, 4 cols on tablet/desktop */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 w-full max-w-3xl mb-12 sm:mb-16">
        {filtered.map((item) => (
          <TypeTile
            key={item.id}
            item={item}
            selected={selected === item.id}
            onClick={onSelect}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-3 w-full text-center text-sm text-gray-400 py-8">No results for &quot;{search}&quot;</p>
        )}
      </div>

      {/* Buttons — full-width on mobile */}
      <div className="flex items-center gap-3 w-full sm:w-auto px-0 sm:px-0">
        <button
          onClick={onBack}
          className="flex-1 sm:flex-none sm:px-14 py-3 sm:py-3.5 rounded-full font-semibold text-sm border-2 border-[#2D2D2D] text-gray-700 hover:border-gray-400 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={onNext}
          disabled={!selected}
          className="flex-1 sm:flex-none sm:px-14 py-3 sm:py-3.5 rounded-full font-semibold text-sm bg-[var(--color-secondary)] text-[#2D2D2D] hover:opacity-90 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
}
