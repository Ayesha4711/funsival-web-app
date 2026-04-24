"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import skydivingImg from "@/assets/icons/skydivingicon.svg";
import scubaDivingImg from "@/assets/icons/scubadivingicon.svg";
import jeepRallyImg from "@/assets/icons/jeeprallyicon.svg";
import jetSkiingImg from "@/assets/icons/jetskingicon.svg";

const tabs = [
  {
    id: "skydiving",
    href: "/activities/skydiving",
    label: "Skydiving",
    icon: skydivingImg,
    bg: "bg-[#FFE8D6]"
  },
  {
    id: "jet-skiing",
    href: "/activities/jet-skiing",
    label: "Jet Skiing",
    icon: jetSkiingImg,
    bg: "bg-[#D6EAF8]"
  },
  {
    id: "scuba-diving",
    href: "/activities/scuba-diving",
    label: "Scuba Diving",
    icon: scubaDivingImg,
    bg: "bg-[#D5F5E3]"
  },
  {
    id: "jeep-rally",
    href: "/activities/jeep-rally",
    label: "Jeep Rally",
    icon: jeepRallyImg,
    bg: "bg-[#E8DAEF]"
  }
];

export default function BrowseByAdventure() {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollTo = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstChild?.offsetWidth + 16 || 200;
    const next = direction === "next"
      ? Math.min(activeIndex + 1, tabs.length - 1)
      : Math.max(activeIndex - 1, 0);
    setActiveIndex(next);
    el.scrollTo({ left: next * cardWidth, behavior: "smooth" });
  };

  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Browse by adventure
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollTo("prev")}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#4AA7A7] transition-colors disabled:opacity-40"
              disabled={activeIndex === 0}
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollTo("next")}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#4AA7A7] transition-colors disabled:opacity-40"
              disabled={activeIndex === tabs.length - 1}
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Activity cards */}
        <div
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        >
          {tabs.map(tab =>
            <Link
              key={tab.id}
              href={tab.href}
              className={`shrink-0 flex flex-col justify-between p-3 sm:p-4 rounded-2xl ${tab.bg} hover:opacity-90 transition-all duration-200 group w-40 h-[130px] sm:w-55 sm:h-40 lg:w-70 lg:h-45`}
            >
              <div className="bg-white rounded-xl flex items-center justify-center w-12 h-12 sm:w-15 sm:h-15 lg:w-[70px] lg:h-[70px]">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12">
                  <Image src={tab.icon} alt={tab.label} fill className="object-contain" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 group-hover:text-gray-900">
                  {tab.label}
                </span>
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#4AA7A7] flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mt-6">
          {tabs.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i === activeIndex ? "w-8 bg-[#4AA7A7]" : "w-2 bg-gray-200"}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
