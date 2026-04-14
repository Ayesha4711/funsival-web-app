"use client";

import React from "react";

/* ─── Category illustrations (inline SVG placeholders styled to match design) */
const PlacesIllustration = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="36" cy="36" r="36" fill="#FFF5E6" />
    <path d="M22 50L30 28L36 40L42 32L50 50H22Z" fill="#81C784" stroke="#4CAF50" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="48" cy="26" r="7" fill="#FFD54F" stroke="#FFB300" strokeWidth="1.5"/>
    <path d="M36 20C33 20 30 23 30 27C30 32 36 38 36 38C36 38 42 32 42 27C42 23 39 20 36 20Z" fill="#EF5350" stroke="#D32F2F" strokeWidth="1.5"/>
    <circle cx="36" cy="27" r="2.5" fill="white"/>
  </svg>
);

const EquipmentIllustration = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="36" cy="36" r="36" fill="#FFF5E6" />
    {/* Bicycle */}
    <circle cx="26" cy="44" r="8" stroke="#E65100" strokeWidth="2" fill="none"/>
    <circle cx="46" cy="44" r="8" stroke="#E65100" strokeWidth="2" fill="none"/>
    <path d="M26 44L34 28L38 36H46" stroke="#E65100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M26 44L34 28" stroke="#E65100" strokeWidth="2" strokeLinecap="round"/>
    {/* Surfboard */}
    <path d="M52 18C52 18 58 24 56 32C54 40 50 38 50 38L44 28C44 28 46 20 52 18Z" fill="#FF8A65" stroke="#E64A19" strokeWidth="1.5"/>
  </svg>
);

const ActivitiesIllustration = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="36" cy="36" r="36" fill="#FFF5E6" />
    {/* Person */}
    <circle cx="36" cy="22" r="5" fill="#4DB6AC" stroke="#00897B" strokeWidth="1.5"/>
    <path d="M28 35C28 30 32 28 36 28C40 28 44 30 44 35V42H28V35Z" fill="#4DB6AC" stroke="#00897B" strokeWidth="1.5"/>
    <path d="M28 42L26 52M44 42L46 52" stroke="#00897B" strokeWidth="2" strokeLinecap="round"/>
    <path d="M28 32L22 38M44 32L50 38" stroke="#00897B" strokeWidth="2" strokeLinecap="round"/>
    {/* Map/guide */}
    <rect x="48" y="30" width="12" height="16" rx="2" fill="#FFD54F" stroke="#FFB300" strokeWidth="1.5"/>
    <path d="M51 35H57M51 38H57M51 41H55" stroke="#FFB300" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const ServicesIllustration = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="36" cy="36" r="36" fill="#FFF5E6" />
    <rect x="20" y="26" width="32" height="24" rx="4" fill="#CE93D8" stroke="#8E24AA" strokeWidth="1.5"/>
    <path d="M28 26V24C28 21 30 20 36 20C42 20 44 21 44 24V26" stroke="#8E24AA" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="36" cy="38" r="5" fill="white" stroke="#8E24AA" strokeWidth="1.5"/>
    <path d="M36 35V38L38 40" stroke="#8E24AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CATEGORIES = [
  { id: "places", label: "Places", Illustration: PlacesIllustration },
  { id: "equipment", label: "Equipment", Illustration: EquipmentIllustration },
  { id: "activities", label: "Activities", Illustration: ActivitiesIllustration },
];

/* ─── Next button ──────────────────────────────────────────────────────────── */
function NextBtn({ disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-10 py-3 rounded-full font-bold text-sm bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      Next
    </button>
  );
}

/* ─── Step ─────────────────────────────────────────────────────────────────── */
export default function StepCategory({ selected, onSelect, onNext }) {
  return (
    <div className="flex flex-col items-center pt-6 pb-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-2 text-center">
        Select One Of The Following
        <span className="inline-flex ml-2 text-[var(--color-secondary)] align-middle">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </span>
      </h2>
      <p className="text-sm text-gray-400 text-center max-w-lg mb-10 leading-relaxed">
        In this step, we'll ask you which type of property you have and if guests Will book the entire
        place or just a room. Then let us know the location and how many guests can stay
      </p>

      {/* Cards grid — 3 col on desktop/tablet, 1 col on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-2xl mb-12">
        {CATEGORIES.map(({ id, label, Illustration }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={[
              "flex flex-col items-center justify-center gap-4 py-10 px-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer",
              selected === id
                ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                : "border-gray-200 bg-white hover:border-[var(--color-primary-light)] hover:shadow-sm",
            ].join(" ")}
          >
            <Illustration />
            <span
              className={[
                "text-base font-semibold",
                selected === id ? "text-[var(--color-primary)]" : "text-[var(--color-primary)]",
              ].join(" ")}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      <NextBtn disabled={!selected} onClick={onNext} />
    </div>
  );
}
