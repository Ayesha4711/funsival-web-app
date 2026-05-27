"use client";

import React from "react";
import Image from "next/image";
import { CheckIcon, InfoIcon } from "@/icons";
import placesImg from "@/assets/images/placesImg.svg";
import equipmentImg from "@/assets/images/equipmntImg.svg";
import activitiesImg from "@/assets/images/activitiesImg.svg";

const CATEGORIES = [
  { id: "places", label: "Places", img: placesImg },
  { id: "equipment", label: "Equipment", img: equipmentImg },
  { id: "activities", label: "Activities", img: activitiesImg },
];

/* ─── Next button ──────────────────────────────────────────────────────────── */
function NextBtn({ disabled, onClick }) {
  return (
    // <button
    //   onClick={onClick}
    //   disabled={disabled}
    //   className="px-10 py-3 rounded-full font-bold text-sm bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
    // >
    //   Next
    // </button>

    <button
      onClick={onClick}
      disabled={disabled}
      className="px-10 py-3 rounded-full font-bold text-sm bg-[#228E8A] text-white hover:bg-[#1d7a77] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      Next
    </button>
  );
}

/* ─── Step ─────────────────────────────────────────────────────────────────── */
export default function StepCategory({ selected, onSelect, onNext }) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-2 text-center">
        Select One Of The Following
        <span className="inline-flex ml-2 text-[#E95764] align-middle">
          <InfoIcon size={18} />
        </span>
      </h2>

      <p className="text-[#475467] text-[13px] sm:text-[14px] leading-[20px] sm:leading-[22px] text-center max-w-[260px] sm:max-w-md mb-8 font-normal font-sofia">
        In this step, we&apos;ll ask you which type of property you have and if guests will book the entire place or just a room. Then let us know the location and how many guests can stay.
      </p>

      {/* Cards grid — 3 col on desktop/tablet, 1 col on mobile (stacked, reduced width) */}
      <div className="flex flex-col sm:grid sm:grid-cols-3 items-center gap-3 sm:gap-4 w-full sm:max-w-2xl mb-16 sm:mb-20">
        {CATEGORIES.map(({ id, label, img }) =>
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={[
              "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer",
              "w-[200px] min-[320px]:w-[220px] h-[110px] sm:w-full sm:h-[180px]",
              selected === id
                ? "border-[#1d8c82] bg-[var(--color-primary-light)]"
                : "border-gray-200 bg-white"
            ].join(" ")}
          >
            {selected === id && (
              <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white">
                <CheckIcon size={10} />
              </span>
            )}
            <Image
              src={img}
              alt={label}
              width={80}
              height={80}
              className="w-12 h-12 sm:w-20 sm:h-20 object-contain"
            />
            <span className="text-sm sm:text-base font-semibold text-[var(--color-primary)]">
              {label}
            </span>
          </button>
        )}
      </div>

      <NextBtn disabled={!selected} onClick={onNext} />
    </div>
  );
}
