"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { ArrowUpRightIcon } from "@/icons";
import {
  fetchBrowseTypes,
  selectBrowseTypes,
  selectBrowseTypesStatus,
  selectLandingSearch,
} from "@/store/slices/activitiesSlice";

const CATEGORY_IMAGES = ["img5.webp", "hero.webp", "img3.webp", "img4.webp", "img2.webp", "img1.webp"];

function tileHref(t) {
  if (t.category === "activity") return `/activities/${encodeURIComponent(t.type)}`;
  return `/user-dashboard/explore?category=${encodeURIComponent(t.category)}`;
}

export default function BrowseByAdventure() {
  const dispatch = useDispatch();
  const types = useSelector(selectBrowseTypes);
  const status = useSelector(selectBrowseTypesStatus);
  const landingSearch = useSelector(selectLandingSearch);
  const isSearchActive = Boolean(landingSearch.location || landingSearch.from || landingSearch.until);

  useEffect(() => {
    dispatch(fetchBrowseTypes({
      limit: 50,
      location: landingSearch.location || undefined,
      from: landingSearch.from || undefined,
      until: landingSearch.until || undefined,
    }));
  }, [dispatch, landingSearch.location, landingSearch.from, landingSearch.until]);

  const tiles = types.map((t, i) => ({
      ...t,
      href: tileHref(t),
      image: CATEGORY_IMAGES[i % CATEGORY_IMAGES.length],
  }));

  // Keep the section (and its scroll anchor) visible while a search is
  // active even with zero matches, so the empty state is reachable —
  // otherwise only hide when there's genuinely nothing to show at all.
  if (tiles.length === 0 && !isSearchActive && status !== "loading") return null;

  return (
    <section id="browse-by-adventure" className="landing-adventures sounds-fun-section py-10 md:py-14 2xl:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px]">
        {/* Header */}
        <div className="sounds-fun-heading flex items-center justify-between mb-6">
          <div className="sounds-fun-heading-copy">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">What sounds fun?</h2>
            <p>Browse experiences by the kind of adventure you’re looking for.</p>
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
            {/* Show all activity types returned by the browse API. */}
            <div className="sounds-fun-api-list flex items-stretch gap-4 overflow-x-auto pb-2 scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible">
              {tiles.map(tab => {
                const isRentals = /rentals?/i.test(tab.label || "");
                return (
                <Link
                  key={`${tab.category}-${tab.type}`}
                  href={tab.href}
                  prefetch={true}
                      className={`sounds-fun-card shrink-0 flex flex-col justify-between p-3 sm:p-4 lg:p-6 rounded-2xl hover:opacity-95 transition-all duration-200 group w-40 h-[130px] sm:w-55 sm:h-40 lg:w-auto lg:h-52 xl:h-56 2xl:h-64 relative overflow-hidden${isRentals ? " sounds-fun-rentals" : ""}`}
                      style={isRentals ? undefined : { backgroundImage: `linear-gradient(180deg, rgba(4,18,20,.03) 30%, rgba(4,18,20,.74)), url('/images/optimized/${tab.image}')` }}
                >
                  <div className="relative flex items-center justify-between">
                    <span className="sounds-fun-count">{Number(tab.count ?? tab.listingCount ?? 0).toLocaleString()} {Number(tab.count ?? tab.listingCount ?? 0) === 1 ? "Listing" : "Listings"}</span>
                    <span className="sounds-fun-arrow"><ArrowUpRightIcon size={17} /></span>
                  </div>
                  <div className="relative flex items-center justify-between">
                      <span className="sounds-fun-title text-xs sm:text-sm lg:text-base xl:text-lg font-semibold text-white group-hover:text-white">
                      {tab.label}
                    </span>
                  </div>
                </Link>
                );
              })}
            </div>

          </>
        )}
      </div>

    </section>
  );
}
