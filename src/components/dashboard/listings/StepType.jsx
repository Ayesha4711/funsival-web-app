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
        "relative flex flex-col items-center justify-center gap-2 py-5 px-2 rounded-2xl border-2 transition-all duration-150 cursor-pointer text-center",
        selected
          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
          : "border-gray-200 bg-white hover:border-[var(--color-primary-light)] hover:shadow-sm",
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
      <span className="text-xs font-semibold text-gray-600 leading-tight">{item.label}</span>
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
    <div className="flex flex-col items-center pt-6 pb-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-8 text-center">
        Which Of These Best Describes Your Service?
      </h2>

      {/* Search */}
      <div className="relative w-full max-w-2xl mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search here"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
        />
      </div>

      {/* Grid — 4 cols desktop, 3 tablet, 2 mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full max-w-2xl mb-10">
        {filtered.map((item) => (
          <TypeTile
            key={item.id}
            item={item}
            selected={selected === item.id}
            onClick={onSelect}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-4 text-center text-sm text-gray-400 py-8">No results for "{search}"</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="px-10 py-3 rounded-full font-bold text-sm border-2 border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={onNext}
          disabled={!selected}
          className="px-10 py-3 rounded-full font-bold text-sm bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
