"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchListings,
  fetchDraft,
  deleteDraft,
  deleteListing,
  setListingStatus,
  fetchHostListingStats,
  selectListingsStatus,
  selectHostListingStats,
} from "@/store/slices/listingsSlice";
import { BASE_URL } from "@/lib/api";
import { NoListingIcon, NoListingFilteredIcon, SpinnerIcon, TrashIcon } from "@/icons";
import ListingsStats from "@/components/dashboard/ListingsStats";
import ListingsFilters, { DEFAULT_FILTERS } from "@/components/dashboard/ListingsFilters";
import ListingsTable from "@/components/dashboard/ListingsTable";
import ListingsCards from "@/components/dashboard/ListingsCards";
import EditListingWizard from "@/components/dashboard/EditListingWizard";
import ListingDetailsPanel from "@/components/dashboard/listings/ListingDetailsPanel";
import { describeListingPrice, formatListingPrice } from "@/components/dashboard/listings/listingPrice";

/* ─── Empty state ────────────────────────────────────────────────────────────── */
function EmptyState({ hasFilters, onClearFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-5">
      <div className="relative flex items-center justify-center w-52 h-52 mb-4">
        <div className="w-52 h-52 rounded-full bg-gray-50 absolute top-0 left-0" />
        <div className="w-36 h-36 rounded-full bg-gray-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative w-24 h-24 rounded-full bg-[#e8f4f0] flex items-center justify-center z-10">
          {hasFilters ? (
            <NoListingFilteredIcon size={42} />
          ) : (
            <NoListingIcon size={42} />
          )}
        </div>
      </div>
      {hasFilters ? (
        <>
          <p className="text-lg font-bold text-gray-800 relative z-10">No results match your filters</p>
          <p className="text-sm text-gray-400 text-center max-w-xs">Try adjusting or clearing your filters to find what you&apos;re looking for.</p>
          <button
            onClick={onClearFilters}
            className="relative z-10 mt-1 px-6 py-2.5 rounded-full bg-[var(--color-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Clear Filters
          </button>
        </>
      ) : (
        <p className="text-lg font-bold text-gray-800 relative z-10">No Data Found</p>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function ListingsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const listingsStatus = useSelector(selectListingsStatus);
  const hostStats = useSelector(selectHostListingStats);

  const [listings, setListings] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === "undefined") return "all";
    return new URLSearchParams(window.location.search).get("tab") ?? "all";
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const searchDebounceRef = useRef(null);
  const [viewMode, setViewMode] = useState("table");
  const [editingListing, setEditingListing] = useState(null);
  const [deletingListing, setDeletingListing] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bookingWarning, setBookingWarning] = useState(null);
  const [bookingWarningLoading, setBookingWarningLoading] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);
  const pendingEditRef = useRef(
    typeof window === "undefined"
      ? null
      : (() => {
          const params = new URLSearchParams(window.location.search);
          const editId = params.get("edit");
          const editStep = parseInt(params.get("step"), 10);
          return editId ? { id: editId, step: Number.isFinite(editStep) ? editStep : 1 } : null;
        })()
  );

  const loading = listingsStatus === "loading";

  const capStatus = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);

  const updateEditUrlParams = useCallback((listingId, step) => {
    const params = new URLSearchParams(window.location.search);
    if (listingId) {
      params.set("edit", listingId);
      params.set("step", String(step ?? 1));
    } else {
      params.delete("edit");
      params.delete("step");
    }
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  }, [router]);

  const openEditingListing = useCallback((item, extra = {}) => {
    setEditingListing({ ...item, ...extra });
    updateEditUrlParams(item.id, extra._initialStep ?? 1);
  }, [updateEditUrlParams]);

  const closeEditingListing = useCallback(() => {
    setEditingListing(null);
    updateEditUrlParams(null);
  }, [updateEditUrlParams]);

  const handleEditStepChange = useCallback((step) => {
    if (editingListing) updateEditUrlParams(editingListing.id, step);
  }, [editingListing, updateEditUrlParams]);

  const loadListings = useCallback(async () => {
    const [listingsResult, draftResult] = await Promise.all([
      dispatch(fetchListings({
        page, limit, category,
        search: debouncedSearch,
        city: filters.city || undefined,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice < 5000 ? filters.maxPrice : undefined,
        sort: filters.sort || undefined,
        status: activeTab !== "all" && activeTab !== "draft" ? activeTab : undefined,
      })),
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
        if (!exists) allRaw.push({ ...draft, status: "Draft", _currentStep: draft.currentStep ?? 1 });
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
        description: item.basicInformation?.description || item.details?.description || "",
        category: item.category ?? "—",
        type: item.type ?? "—",
        price: item.price ?? null,
        priceLabel: formatListingPrice(item.category, item.price),
        priceDetails: describeListingPrice(item.category, item.price),
        bookings: item.bookingCount ?? item.bookings ?? 0,
        rating: item.reviewSummary?.overallRating ?? item.rating ?? "—",
        reviews: item.reviewSummary?.count ?? item.reviews ?? 0,
        status: capStatus(item.status) ?? (item._fromPublished ? "Active" : "Draft"),
        image: imageUrl,
        slots: Array.isArray(item.availability)
          ? item.availability
          : item.nextAvailability
          ? [item.nextAvailability]
          : [],
        date: item.nextAvailability?.day ?? item.availability?.[0]?.day ?? item.date ?? "—",
        time: item.nextAvailability
          ? `${item.nextAvailability.startTime} – ${item.nextAvailability.endTime}`
          : item.availability?.[0]
          ? `${item.availability[0].startTime} – ${item.availability[0].endTime}`
          : item.time ?? "—",
        currentStep: item._currentStep ?? null,
      };
    });

    setListings(normalized);

    if (pendingEditRef.current) {
      const { id, step } = pendingEditRef.current;
      pendingEditRef.current = null;
      const match = normalized.find((entry) => String(entry.id) === String(id));
      if (match) {
        setEditingListing({ ...match, _initialStep: step });
      } else {
        updateEditUrlParams(null);
      }
    }

    if (!fetchListings.fulfilled.match(listingsResult) && !fetchDraft.fulfilled.match(draftResult)) {
      toast.error("Failed to load listings.");
    }
  }, [dispatch, page, limit, category, debouncedSearch, filters, activeTab, updateEditUrlParams]);

  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 400);
  }, []);

  const handleCategoryChange = useCallback((value) => {
    setCategory(value);
    setPage(1);
    setDebouncedSearch(search);
  }, [search]);

  const handleFiltersChange = useCallback((f) => {
    setFilters(f);
    setCategory(f.category || "All Categories");
    setPage(1);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadListings();
  }, [loadListings]);

  const handleStatusChange = async (itemOrId, newStatus) => {
    const item = typeof itemOrId === "object"
      ? itemOrId
      : listings.find((entry) => entry.id === itemOrId);

    if (!item) return;

    if (item.status?.toLowerCase() === "draft" && newStatus === "Active") {
      openEditingListing(item, { _initialStep: item.currentStep ?? 1, _targetStatus: "Active" });
      return;
    }

    const previousStatus = item.status;
    setListings((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, status: newStatus } : entry));

    const result = await dispatch(setListingStatus({ listingId: item.id, isActive: newStatus === "Active" }));
    if (setListingStatus.fulfilled.match(result)) {
      dispatch(fetchHostListingStats());
    } else {
      setListings((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, status: previousStatus } : entry));
      const message = typeof result.payload === "string" ? result.payload : result.payload?.message;
      toast.error(message ?? "Failed to update status.");
    }
  };

  const handleEditSaved = (updated) => {
    setListings((prev) => prev.map((item) => item.id === updated.id ? updated : item));
  };

  const handleDeleteConfirm = async () => {
    if (!deletingListing) return;
    setDeleteLoading(true);

    const isDraft = deletingListing.status === "Draft";
    const result = await dispatch(
      isDraft ? deleteDraft() : deleteListing({ listingId: deletingListing.id, confirm: false })
    );
    setDeleteLoading(false);

    if (!isDraft && deleteListing.rejected.match(result) && result.payload?.requiresConfirmation) {
      const name = deletingListing.name;
      setDeletingListing(null);
      setBookingWarning({ listingId: result.payload.listingId, name, upcomingCount: result.payload.upcomingCount });
      return;
    }

    const action = isDraft ? deleteDraft : deleteListing;
    if (action.fulfilled.match(result)) {
      toast.success(isDraft ? "Draft discarded." : "Listing deleted.");
      setListings((prev) => prev.filter((item) => item.id !== deletingListing.id));
      dispatch(fetchHostListingStats());
    } else {
      toast.error(result.payload ?? (isDraft ? "Failed to discard draft." : "Failed to delete listing."));
    }
    setDeletingListing(null);
  };

  const handleBookingWarningConfirm = async () => {
    if (!bookingWarning) return;
    setBookingWarningLoading(true);

    const result = await dispatch(deleteListing({ listingId: bookingWarning.listingId, confirm: true }));
    setBookingWarningLoading(false);

    if (deleteListing.fulfilled.match(result)) {
      toast.success("Listing deleted and reservations cancelled.");
      setListings((prev) => prev.filter((item) => item.id !== bookingWarning.listingId));
      dispatch(fetchHostListingStats());
    } else {
      const message = typeof result.payload === "string" ? result.payload : "Failed to delete listing.";
      toast.error(message);
    }
    setBookingWarning(null);
  };

  const handleResumeDraft = (item) => {
    router.push(`/dashboard/listings/add?mode=resume`);
  };

  const countByStatus = (status) => listings.filter((item) => item.status?.toLowerCase() === status).length;
  const tabCounts = hostStats?.tabs
    ? {
        active: hostStats.tabs.active ?? 0,
        inactive: hostStats.tabs.inactive ?? 0,
        draft: hostStats.tabs.draft ?? 0,
      }
    : {
        active: countByStatus("active"),
        inactive: countByStatus("inactive"),
        draft: countByStatus("draft"),
      };
  const hasDraft = tabCounts.draft > 0;

  const filtered = listings.filter((item) =>
    activeTab === "all" || item.status?.toLowerCase() === activeTab.toLowerCase()
  );

  const isEmpty = !loading && filtered.length === 0;

  const hasActiveFilters =
    (filters.city && filters.city.trim()) ||
    filters.sort ||
    (filters.category && filters.category !== "All Categories") ||
    filters.minPrice > 0 ||
    filters.maxPrice < 5000 ||
    search.trim().length > 0;

  const handleClearFilters = () => {
    handleFiltersChange(DEFAULT_FILTERS);
    handleSearchChange("");
  };

  return (
    <div className="p-3 xs:p-4 sm:p-6 w-full flex flex-col gap-4 sm:gap-5 flex-1">
      <ListingsStats />

      <div className="bg-white flex flex-col flex-1" style={{ width: "100%", gap: 20, borderRadius: 24, border: "1px solid var(--color-border)", padding: 24 }}>
        <ListingsFilters
          activeTab={activeTab}
          onTabChange={handleTabChange}
          search={search}
          onSearchChange={handleSearchChange}
          category={category}
          onCategoryChange={handleCategoryChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          tabCounts={tabCounts}
          hasDraft={hasDraft}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        <div className="flex flex-col flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <SpinnerIcon size={24} className="text-gray-400" />
            </div>
          ) : isEmpty ? (
            <EmptyState hasFilters={!!hasActiveFilters} onClearFilters={handleClearFilters} />
          ) : viewMode === "table" ? (
            <ListingsTable
              data={filtered} currentPage={page} totalPages={totalPages} onPageChange={setPage}
              onStatusChange={handleStatusChange} onEdit={openEditingListing} onDelete={setDeletingListing}
              onResumeDraft={handleResumeDraft} onViewDetails={setDetailsItem}
            />
          ) : (
            <ListingsCards
              data={filtered} currentPage={page} totalPages={totalPages} onPageChange={setPage}
              onStatusChange={handleStatusChange} onEdit={openEditingListing} onDelete={setDeletingListing}
              onResumeDraft={handleResumeDraft} onViewDetails={setDetailsItem}
            />
          )}
        </div>
      </div>

      {detailsItem && (
        <ListingDetailsPanel
          item={detailsItem}
          onClose={() => setDetailsItem(null)}
          onEdit={(item) => { setDetailsItem(null); openEditingListing(item); }}
        />
      )}

      {editingListing && (
        <EditListingWizard
          listing={editingListing}
          initialStep={editingListing._initialStep}
          targetStatus={editingListing._targetStatus}
          onClose={closeEditingListing}
          onSaved={handleEditSaved}
          onStepChange={handleEditStepChange}
        />
      )}

      {deletingListing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setDeletingListing(null); }}
        >
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 sm:p-8">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <TrashIcon size={26} />
              </div>
            </div>
            <h2 className="text-base font-extrabold text-[var(--color-text)] mb-1">
              {deletingListing.status === "Draft" ? "Discard draft?" : "Delete listing?"}
            </h2>
            <p className="text-sm text-gray-400 font-medium mb-6">
              {deletingListing.status === "Draft"
                ? `Your draft "${deletingListing.name}" will be permanently discarded. This cannot be undone.`
                : `"${deletingListing.name}" will be permanently removed. This cannot be undone.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingListing(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} disabled={deleteLoading}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-60">
                {deleteLoading
                  ? (deletingListing.status === "Draft" ? "Discarding…" : "Deleting…")
                  : (deletingListing.status === "Draft" ? "Discard" : "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {bookingWarning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setBookingWarning(null); }}
        >
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 sm:p-8">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <TrashIcon size={26} />
              </div>
            </div>
            <h2 className="text-base font-extrabold text-[var(--color-text)] mb-1">
              Delete listing with upcoming reservations?
            </h2>
            <p className="text-sm text-gray-400 font-medium mb-6">
              {`"${bookingWarning.name}" has ${bookingWarning.upcomingCount} upcoming reservation${bookingWarning.upcomingCount === 1 ? "" : "s"}. Deleting it will cancel ${bookingWarning.upcomingCount === 1 ? "it" : "them"} and refund the guest${bookingWarning.upcomingCount === 1 ? "" : "s"}. This cannot be undone.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setBookingWarning(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleBookingWarningConfirm} disabled={bookingWarningLoading}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-60">
                {bookingWarningLoading ? "Cancelling & Deleting…" : "Delete & Cancel Reservations"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
