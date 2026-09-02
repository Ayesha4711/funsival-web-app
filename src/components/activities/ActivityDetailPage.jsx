"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import LandingNavbar from "@/components/landing/LandingNavbar";
import FAQSection from "@/components/landing/FAQSection";
import AppFooter from "@/components/shared/AppFooter";
import ActivityHero from "@/components/activities/ActivityHero";
import PublicListingCard from "@/components/activities/PublicListingCard";
import { getActivityMetadata } from "@/components/activities/activityMetadata";
import {
  fetchBrowseTypes,
  fetchBrowseListings,
  selectBrowseTypes,
  selectBrowseTypesStatus,
  selectActivities,
  selectActivitiesStatus,
} from "@/store/slices/activitiesSlice";

export default function ActivityDetailPage({ params: paramsPromise }) {
  const dispatch = useDispatch();
  const params = React.use(paramsPromise);
  const type = decodeURIComponent(params?.type || "");

  const allTypes = useSelector(selectBrowseTypes);
  const typesStatus = useSelector(selectBrowseTypesStatus);
  const listings = useSelector(selectActivities);
  const listingsStatus = useSelector(selectActivitiesStatus);

  useEffect(() => {
    dispatch(fetchBrowseTypes({ limit: 50 }));
  }, [dispatch]);

  useEffect(() => {
    if (type) dispatch(fetchBrowseListings({ category: "activity", type, page: 1, limit: 12 }));
  }, [dispatch, type]);

  const activityTabs = allTypes.filter((t) => t.category === "activity");
  const activeTab = activityTabs.find((t) => t.type === type);
  const count = activeTab?.count ?? 0;
  const meta = getActivityMetadata(type, activeTab?.label, count);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <div className="relative">
          <LandingNavbar />
        </div>

        <ActivityHero title={meta.title} subtitle={meta.description} backgroundImage={meta.banner} />

        {/* Tabs — switch activity subcategory via client-side navigation */}
        <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 py-4 min-w-max">
              {typesStatus === "loading" && activityTabs.length === 0 ? (
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-9 w-28 rounded-full bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                activityTabs.map((tab) => (
                  <Link
                    key={tab.type}
                    href={`/activities/${encodeURIComponent(tab.type)}`}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                      tab.type === type
                        ? "bg-[#4AA7A7] text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Listings grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] py-10">
          {listingsStatus === "loading" && listings.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <p className="text-center text-gray-400 py-16">No listings available for this activity yet.</p>
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
