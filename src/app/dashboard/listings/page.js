"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchListings,
  fetchDraft,
  deleteDraft,
  deleteListing,
  selectListingsStatus,
} from "@/store/slices/listingsSlice";
import { BASE_URL } from "@/lib/api";
import ListingsStats from "@/components/dashboard/ListingsStats";
import ListingsFilters from "@/components/dashboard/ListingsFilters";
import ListingsTable from "@/components/dashboard/ListingsTable";
import ListingsCards from "@/components/dashboard/ListingsCards";
import EditListingWizard from "@/components/dashboard/EditListingWizard";

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
  const dispatch = useDispatch();
  const listingsStatus = useSelector(selectListingsStatus);

  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "all";
    return new URLSearchParams(window.location.search).get("tab") ?? "all";
  });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState("table");
  const [editingListing, setEditingListing] = useState(null);
  const [deletingListing, setDeletingListing] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loading = listingsStatus === "loading";

  const loadListings = useCallback(async () => {
    const [listingsResult, draftResult] = await Promise.all([
      dispatch(fetchListings({ page, limit })),
      dispatch(fetchDraft()),
    ]);

    let allRaw = [];

    if (fetchListings.fulfilled.match(listingsResult)) {
      const listData = listingsResult.payload?.data;
      const list = listData?.listings ?? listData ?? listingsResult.payload;
      if (listData?.pagination) {
        setTotalPages(listData.pagination.totalPages || 1);
      }
      if (Array.isArray(list)) allRaw = list.map(item => ({ ...item, _fromPublished: true }));
    }

    if (fetchDraft.fulfilled.match(draftResult) && draftResult.payload) {
      const res = draftResult.payload;
      const draft = res?.data?.draft || res?.draft || res;
      if (draft && (draft.id || draft._id)) {
        const draftId = draft.id ?? draft._id;
        const exists = allRaw.some(item => (item.id ?? item._id) === draftId);
        if (!exists) allRaw.push({ ...draft, status: "Draft" });
      }
    }

    const normalized = allRaw.map((item) => {
      let imageUrl = null;
      if (Array.isArray(item.photos) && item.photos.length > 0) imageUrl = item.photos[0];
      else if (Array.isArray(item.details?.photos) && item.details.photos.length > 0) imageUrl = item.details.photos[0];
      else if (item.image) imageUrl = item.image;

      if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("blob:") && !imageUrl.startsWith("data:")) {
        imageUrl = `${BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
      }

      return {
        id: item.id ?? item._id,
        name: item.basicInformation?.activityTitle || item.details?.title || item.name || "Untitled Draft",
        location: item.placeLocation?.addressLine1
          ? [item.placeLocation.addressLine1, item.placeLocation.city, item.placeLocation.state, item.placeLocation.country].filter(Boolean).join(", ")
          : item.basicInformation?.location || item.details?.location || item.location || "—",
        category: item.category ?? "—",
        type: item.type ?? "—",
        price: item.price?.amount != null
          ? `$${item.price.amount} / person`
          : (item.price && item.price !== "" ? `$${item.price}` : "—"),
        bookings: item.bookings ?? 0,
        rating: item.rating ?? "—",
        reviews: item.reviews ?? 0,
        status: item.status ?? (item._fromPublished ? "Active" : "Draft"),
        image: imageUrl,
        slots: Array.isArray(item.availability) ? item.availability : [],
        date: item.availability?.[0]?.day ?? item.date ?? "—",
        time: item.availability?.[0]
          ? `${item.availability[0].startTime} – ${item.availability[0].endTime}`
          : item.time ?? "—",
      };
    });

    setListings(normalized);

    if (!fetchListings.fulfilled.match(listingsResult) && !fetchDraft.fulfilled.match(draftResult)) {
      toast.error("Failed to load listings.");
    }
  }, [dispatch, page, limit]);

  useEffect(() => { setPage(1); }, [activeTab, search, category]);
  useEffect(() => { loadListings(); }, [loadListings]);

  const handleStatusChange = (id, newStatus) => {
    setListings((prev) => prev.map((item) => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleEditSaved = (updated) => {
    setListings((prev) => prev.map((item) => item.id === updated.id ? updated : item));
  };

  const handleDeleteConfirm = async () => {
    if (!deletingListing) return;
    setDeleteLoading(true);
    const isDraft = deletingListing.status?.toLowerCase() === "draft";
    const result = isDraft
      ? await dispatch(deleteDraft())
      : await dispatch(deleteListing(deletingListing.id));
    setDeleteLoading(false);

    const succeeded = isDraft
      ? deleteDraft.fulfilled.match(result)
      : deleteListing.fulfilled.match(result);

    if (succeeded) {
      toast.success("Listing deleted.");
      setListings((prev) => prev.filter((item) => item.id !== deletingListing.id));
    } else {
      toast.error(result.payload ?? "Failed to delete listing.");
    }
    setDeletingListing(null);
  };

  const countByStatus = (status) => listings.filter((item) => item.status?.toLowerCase() === status).length;
  const tabCounts = {
    active: countByStatus("active"),
    inactive: countByStatus("inactive"),
    draft: countByStatus("draft"),
  };

  const filtered = listings.filter((item) => {
    const matchesTab = activeTab === "all" || item.status?.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = search === "" || item.name?.toLowerCase().includes(search.toLowerCase()) || item.location?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All Categories" || item.category === category;
    return matchesTab && matchesSearch && matchesCategory;
  });

  const isEmpty = !loading && filtered.length === 0;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto flex flex-col gap-6 flex-1">
      <ListingsStats />

      <div className="bg-white rounded-[32px] p-4 sm:p-6 lg:p-8 shadow-sm border border-[var(--color-border)] flex flex-col" style={{ minHeight: 600 }}>
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

        <div className="flex-1 flex flex-col min-h-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/>
              </svg>
            </div>
          ) : isEmpty ? (
            <EmptyState />
          ) : viewMode === "table" ? (
            <ListingsTable
              data={filtered} currentPage={page} totalPages={totalPages} onPageChange={setPage}
              onStatusChange={handleStatusChange} onEdit={setEditingListing} onDelete={setDeletingListing}
            />
          ) : (
            <ListingsCards
              data={filtered} currentPage={page} totalPages={totalPages} onPageChange={setPage}
              onStatusChange={handleStatusChange} onEdit={setEditingListing} onDelete={setDeletingListing}
            />
          )}
        </div>
      </div>

      {editingListing && (
        <EditListingWizard listing={editingListing} onClose={() => setEditingListing(null)} onSaved={handleEditSaved} />
      )}

      {deletingListing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setDeletingListing(null); }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h2 className="text-base font-extrabold text-[var(--color-text)] mb-1">Delete listing?</h2>
            <p className="text-sm text-gray-400 font-medium mb-6">
              &ldquo;{deletingListing.name}&rdquo; will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingListing(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} disabled={deleteLoading}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-60">
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
