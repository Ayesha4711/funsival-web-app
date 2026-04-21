"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import ListingsStats from "@/components/dashboard/ListingsStats";
import ListingsFilters from "@/components/dashboard/ListingsFilters";
import ListingsTable from "@/components/dashboard/ListingsTable";
import ListingsCards from "@/components/dashboard/ListingsCards";
import { getListings, getDraft, BASE_URL } from "@/lib/api";

/* ─── Empty state ────────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-5">
      <div className="relative flex items-center justify-center w-52 h-52 mb-4">
        <div className="w-52 h-52 rounded-full bg-gray-50 absolute top-0 left-0" />
        <div className="w-36 h-36 rounded-full bg-gray-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative w-24 h-24 rounded-full bg-[#e8f4f0] flex items-center justify-center z-10">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="2" width="12" height="18" rx="2" fill="#2a9d8f" opacity="0.15"/>
            <rect x="4" y="2" width="12" height="18" rx="2" stroke="#2a9d8f" strokeWidth="1.5"/>
            <path d="M8 7h5M8 11h5M8 15h3" stroke="#2a9d8f" strokeWidth="1.5" strokeLinecap="round"/>
            <rect x="12" y="13" width="8" height="8" rx="2" fill="#2a9d8f"/>
            <path d="M16 15.5v3M14.5 17h3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      <p className="text-lg font-bold text-gray-800 relative z-10">No Data Found</p>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState("table");

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      // Fetch both published listings and current in-progress draft
      const [listingsRes, draftRes] = await Promise.all([
        getListings(),
        getDraft()
      ]);

      let allRaw = [];

      // 1. Process published listings
      if (listingsRes.ok) {
        const list = listingsRes.data?.data?.listings ?? listingsRes.data?.data ?? listingsRes.data;
        if (Array.isArray(list)) allRaw = [...list];
      }

      // 2. Process current draft (if not already in the list)
      if (draftRes.ok) {
        const draft = draftRes.data?.data?.draft || draftRes.data?.draft || draftRes.data;
        if (draft && (draft.id || draft._id)) {
          const draftId = draft.id ?? draft._id;
          const exists = allRaw.some(item => (item.id ?? item._id) === draftId);
          if (!exists) {
            // Push it with forced "Draft" status
            allRaw.push({ ...draft, status: "Draft" });
          }
        }
      }

      // 3. Normalize for UI
      const normalized = allRaw.map((item) => {
        // Get the first photo URL
        let imageUrl = null;
        if (Array.isArray(item.photos) && item.photos.length > 0) {
          imageUrl = item.photos[0];
        } else if (Array.isArray(item.details?.photos) && item.details.photos.length > 0) {
          imageUrl = item.details.photos[0];
        } else if (item.image) {
          imageUrl = item.image;
        }

        // Convert relative paths to absolute URLs
        if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("blob:") && !imageUrl.startsWith("data:")) {
          imageUrl = `${BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
        }

        return {
          id: item.id ?? item._id,
          name: item.basicInformation?.activityTitle || item.details?.title || item.name || "Untitled Draft",
          location: item.basicInformation?.location || item.details?.location || item.placeLocation?.city || item.location || "—",
          category: item.category ?? "—",
          type: item.type ?? "—",
          price: item.price?.amount != null
            ? `$${item.price.amount} / person`
            : (item.price && item.price !== "" ? `$${item.price}` : "—"),
          bookings: item.bookings ?? 0,
          rating: item.rating ?? "—",
          reviews: item.reviews ?? 0,
          status: item.status ?? "Draft",
          image: imageUrl,
          slots: Array.isArray(item.availability) ? item.availability : [],
          date: item.availability?.[0]?.day ?? item.date ?? "—",
          time: item.availability?.[0]
            ? `${item.availability[0].startTime} – ${item.availability[0].endTime}`
            : item.time ?? "—",
        };
      });

      setListings(normalized);
      if (listingsRes.ok || draftRes.ok) {
        toast.success("Listings fetched successfully.");
      } else {
        toast.error("Failed to load listings.");
      }
      setLoading(false);
    }
    fetchListings();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setListings((prev) =>
      prev.map((item) => item.id === id ? { ...item, status: newStatus } : item)
    );
  };

  // Compute per-status counts from live data
  const countByStatus = (status) =>
    listings.filter((item) => item.status?.toLowerCase() === status).length;

  const tabCounts = {
    active: countByStatus("active"),
    inactive: countByStatus("inactive"),
    draft: countByStatus("draft"),
  };

  const filtered = listings.filter((item) => {
    const matchesTab =
      activeTab === "all" || item.status?.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      search === "" ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.location?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "All Categories" || item.category === category;
    return matchesTab && matchesSearch && matchesCategory;
  });

  const isEmpty = !loading && filtered.length === 0;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto flex flex-col gap-6 flex-1">
      <ListingsStats />

      <div className="bg-white rounded-[32px] p-4 sm:p-6 lg:p-8 shadow-sm border border-[var(--color-border)] flex flex-col min-h-[600px]">
        <ListingsFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          tabCounts={tabCounts}
        />

        <div className="flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/>
              </svg>
            </div>
          ) : isEmpty ? (
            <EmptyState />
          ) : viewMode === "table" ? (
            <ListingsTable data={filtered} onStatusChange={handleStatusChange} />
          ) : (
            <ListingsCards data={filtered} onStatusChange={handleStatusChange} />
          )}
        </div>
      </div>
    </div>
  );
}
