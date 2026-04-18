"use client";

import React from "react";
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
  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Browse by adventure
          </h2>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#4AA7A7] transition-colors">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#4AA7A7] transition-colors">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Activity cards — clicking navigates to activity page */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab =>
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex-shrink-0 flex flex-col justify-between p-4 rounded-2xl ${tab.bg} hover:opacity-90 transition-all duration-200 group`}
              style={{ width: "280px", height: "200px" }}
            >
              {/* Image in white rounded box */}
              <div
                className="bg-white rounded-xl flex items-center justify-center"
                style={{ width: "80px", height: "80px" }}
              >
                <div className="relative w-14 h-14">
                  <Image
                    src={tab.icon}
                    alt={tab.label}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              {/* Label + arrow */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">
                  {tab.label}
                </span>
                <div className="w-7 h-7 rounded-full bg-[#4AA7A7] flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M7 17L17 7M17 7H7M17 7v10"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mt-6">
          <span className="w-8 h-1 bg-[#4AA7A7] rounded-full" />
          <span className="w-2 h-1 bg-gray-200 rounded-full" />
          <span className="w-2 h-1 bg-gray-200 rounded-full" />
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
