"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import LandingNavbar from "@/components/landing/LandingNavbar";
import FAQSection from "@/components/landing/FAQSection";
import AppFooter from "@/components/shared/AppFooter";
import EmptyState from "@/components/shared/EmptyState";
import ActivityHero from "@/components/activities/ActivityHero";
import PublicListingCard from "@/components/activities/PublicListingCard";
import {
  fetchBrowseDestinations,
  fetchBrowseListings,
  selectBrowseDestinations,
  selectBrowseDestinationsStatus,
  selectActivities,
  selectActivitiesStatus,
} from "@/store/slices/activitiesSlice";

export default function DestinationDetailPage({ params: paramsPromise }) {
  const dispatch = useDispatch();
  const params = React.use(paramsPromise);
  const city = decodeURIComponent(params?.city || "");

  const allDestinations = useSelector(selectBrowseDestinations);
  const destinationsStatus = useSelector(selectBrowseDestinationsStatus);
  const listings = useSelector(selectActivities);
  const listingsStatus = useSelector(selectActivitiesStatus);

  useEffect(() => {
    dispatch(fetchBrowseDestinations({ limit: 50 }));
  }, [dispatch]);

  useEffect(() => {
    if (city) dispatch(fetchBrowseListings({ city, page: 1, limit: 12 }));
  }, [dispatch, city]);

  const activeDestination = allDestinations.find(
    (d) => d.city.toLowerCase() === city.toLowerCase()
  );
  const count = activeDestination?.count ?? 0;
  const title = activeDestination
    ? [activeDestination.city, activeDestination.state].filter(Boolean).join(", ")
    : city;
  const description = `Discover ${count} experience${count === 1 ? "" : "s"} in ${city}.`;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <div className="relative">
          <LandingNavbar />
        </div>

        <ActivityHero title={title} subtitle={description} />

        {/* Tabs — switch destination via client-side navigation */}
        <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 py-4 min-w-max">
              {destinationsStatus === "loading" && allDestinations.length === 0 ? (
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-9 w-28 rounded-full bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                allDestinations.map((d) => (
                  <Link
                    key={`${d.city}-${d.state ?? ""}-${d.country ?? ""}`}
                    href={`/destinations/${encodeURIComponent(d.city)}`}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                      d.city.toLowerCase() === city.toLowerCase()
                        ? "bg-[#4AA7A7] text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {[d.city, d.state].filter(Boolean).join(", ") || d.city}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Listings grid — all categories, no category filter */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] py-10">
          {listingsStatus === "loading" && listings.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <EmptyState
              image="/images/No listings.png"
              imageAlt="No listings"
              title="No listings available in this destination yet."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <PublicListingCard key={listing._id || listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>

        <FAQSection />
      </main>

      <AppFooter />
    </div>
  );
}
