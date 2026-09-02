"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeftIcon, ChevronRightIcon, ArrowUpRightIcon } from "@/icons";
import { ACTIVITY_TYPES } from "@/components/dashboard/listings/StepType";
import {
  fetchBrowseTypes,
  selectBrowseTypes,
  selectBrowseTypesStatus,
  selectLandingSearch,
} from "@/store/slices/activitiesSlice";

// Same emoji set hosts pick from when creating a listing (StepType.jsx),
// so a type always renders identically on both sides.
const EMOJI_BY_TYPE = Object.fromEntries(ACTIVITY_TYPES.map((t) => [t.id, t.emoji]));

const BG_BY_TYPE = {
  skydiving: "bg-[#FFE8D6]",
  horse_riding: "bg-[#F3E6D8]",
  scuba_diving: "bg-[#D5F5E3]",
  paragliding: "bg-[#D6EAF8]",
  zipline: "bg-[#FDEBD0]",
  jeep_rally: "bg-[#E8DAEF]",
  hang_glider: "bg-[#D6EAF8]",
  bungee: "bg-[#FDE2E2]",
  bowling: "bg-[#E3E8FD]",
  trampoline: "bg-[#FDEBD0]",
  golf: "bg-[#D5F5E3]",
  boating: "bg-[#D6EAF8]",
  snowboarding: "bg-[#E8EEF4]",
  surfing: "bg-[#D6EAF8]",
  adventure_atvs: "bg-[#E8DAEF]",
  jetski: "bg-[#D6EAF8]",
};

const FALLBACK_BG = ["bg-[#FFE8D6]", "bg-[#D6EAF8]", "bg-[#D5F5E3]", "bg-[#E8DAEF]", "bg-[#FDEBD0]", "bg-[#D6DBDF]"];

function tileHref(t) {
  return `/activities/${encodeURIComponent(t.type)}`;
}

const PAGE_SIZE = 4;

export default function BrowseByAdventure() {
  const dispatch = useDispatch();
  const types = useSelector(selectBrowseTypes);
  const status = useSelector(selectBrowseTypesStatus);
  const landingSearch = useSelector(selectLandingSearch);
  const [page, setPage] = useState(0);
  const isSearchActive = Boolean(landingSearch.location || landingSearch.from || landingSearch.until);

  useEffect(() => {
    dispatch(fetchBrowseTypes({
      limit: 50,
      location: landingSearch.location || undefined,
      from: landingSearch.from || undefined,
      until: landingSearch.until || undefined,
    }));
  }, [dispatch, landingSearch.location, landingSearch.from, landingSearch.until]);

  const tiles = types
    .filter((t) => t.category === "activity")
    .map((t, i) => ({
      ...t,
      href: tileHref(t),
      emoji: EMOJI_BY_TYPE[t.type] || "✨",
      bg: BG_BY_TYPE[t.type] || FALLBACK_BG[i % FALLBACK_BG.length],
    }));

  const pageCount = Math.max(1, Math.ceil(tiles.length / PAGE_SIZE));
  // Clamping here already handles a shrinking result set (e.g. after a
  // search) without needing to explicitly reset `page` from an effect.
  const clampedPage = Math.min(page, pageCount - 1);
  const visibleTiles = tiles.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE);

  const goTo = (direction) => {
    setPage((p) => {
      const next = direction === "next" ? p + 1 : p - 1;
      return Math.min(Math.max(next, 0), pageCount - 1);
    });
  };

  // Keep the section (and its scroll anchor) visible while a search is
  // active even with zero matches, so the empty state is reachable —
  // otherwise only hide when there's genuinely nothing to show at all.
  if (status !== "loading" && tiles.length === 0 && !isSearchActive) return null;

  return (
    <section id="browse-by-adventure" className="py-10 md:py-14 2xl:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Browse by adventure
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goTo("prev")}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#4AA7A7] transition-colors disabled:opacity-40"
              disabled={clampedPage === 0}
            >
              <ChevronLeftIcon size={16} className="text-gray-500" />
            </button>
            <button
              onClick={() => goTo("next")}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#4AA7A7] transition-colors disabled:opacity-40"
              disabled={clampedPage === pageCount - 1}
            >
              <ChevronRightIcon size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {status === "loading" && tiles.length === 0 ? (
          <div className="flex items-stretch gap-4 lg:grid lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="shrink-0 rounded-2xl bg-gray-100 animate-pulse w-40 h-[130px] sm:w-55 sm:h-40 lg:w-auto lg:h-52 xl:h-56 2xl:h-64" />
            ))}
          </div>
        ) : tiles.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No matching adventures found. Try a different search.</p>
        ) : (
          <>
            {/* Activity cards — always 4 per page, next/prev buttons page through the rest */}
            <div className="flex items-stretch gap-4 overflow-x-auto pb-2 scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible">
              {visibleTiles.map(tab =>
                <Link
                  key={`${tab.category}-${tab.type}`}
                  href={tab.href}
                  className={`shrink-0 flex flex-col justify-between p-3 sm:p-4 lg:p-6 rounded-2xl ${tab.bg} hover:opacity-90 transition-all duration-200 group w-40 h-[130px] sm:w-55 sm:h-40 lg:w-auto lg:h-52 xl:h-56 2xl:h-64 relative overflow-hidden`}
                >
                  <div className="relative bg-white rounded-xl flex items-center justify-center w-12 h-12 sm:w-15 sm:h-15 lg:w-16 lg:h-16 xl:w-[70px] xl:h-[70px]">
                    <span className="text-2xl sm:text-3xl lg:text-4xl">{tab.emoji}</span>
                  </div>
                  <div className="relative flex items-center justify-between">
                    <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold text-gray-800 group-hover:text-gray-900">
                      {tab.label}
                    </span>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-[#4AA7A7] flex items-center justify-center shrink-0">
                      <ArrowUpRightIcon size={14} className="text-white" />
                    </div>
                  </div>
                </Link>
              )}
            </div>

            {/* Pagination dots */}
            {pageCount > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: pageCount }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    aria-label={`Go to page ${i + 1}`}
                    className={`h-1 rounded-full transition-all duration-300 ${i === clampedPage ? "w-8 bg-[#4AA7A7]" : "w-2 bg-gray-200"}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

    </section>
  );
}
