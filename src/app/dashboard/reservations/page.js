"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHostBookings,
  cancelBooking,
  selectHostBookings,
  selectHostBookingsPagination,
  selectHostBookingsStatus,
  selectHostBookingsError,
} from "@/store/slices/bookingsSlice";
import { NoListingIcon } from "@/icons";
import ReservationStats from "@/components/dashboard/ReservationStats";
import ReservationFilters from "@/components/dashboard/ReservationFilters";
import ReservationTable from "@/components/dashboard/ReservationTable";
import ReservationCards from "@/components/dashboard/ReservationCards";
import ReservationDetailsPanel from "@/components/dashboard/ReservationDetailsPanel";
import CancelReasonModal from "@/components/dashboard/CancelReasonModal";
import Pagination from "@/components/shared/Pagination";

/* ─── Empty state ─────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-5 py-16">
      <div className="relative flex items-center justify-center w-52 h-52">
        <div className="w-52 h-52 rounded-full bg-gray-50 absolute top-0 left-0" />
        <div className="w-36 h-36 rounded-full bg-gray-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative w-24 h-24 rounded-full bg-[#e8f4f0] flex items-center justify-center z-10">
          <NoListingIcon size={42} />
        </div>
      </div>
      <p
        className="text-lg font-bold text-gray-800 relative z-10"
        style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}
      >
        No Data Found
      </p>
    </div>
  );
}

/* ─── Map API booking → row shape ─────────────────────────────────────────── */
function mapBookingToRow(b) {
  const info = b.listing?.basicInformation ?? {};
  const loc  = b.listing?.placeLocation ?? {};

  const name =
    info.activityTitle || info.equipmentName || info.placeName || "Booking";

  const location =
    [loc.city, loc.state, loc.country].filter(Boolean).join(", ") ||
    info.location ||
    "—";

  const category = b.listing?.category
    ? b.listing.category.charAt(0).toUpperCase() + b.listing.category.slice(1)
    : "—";

  const paymentStatus =
    b.paymentStatus === "paid"
      ? "Paid"
      : b.status === "cancelled"
        ? "Refunded"
        : "Overdue";

  const statusMap = { confirmed: "Upcoming", completed: "Completed", cancelled: "Cancelled" };
  const status = statusMap[b.status] ?? "Upcoming";

  const startDate = b.startDate
    ? new Date(b.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";
  const endDate = b.endDate
    ? new Date(b.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const timeRange = b.startTime && b.endTime ? `${b.startTime} to ${b.endTime}` : "—";
  const dateRange = endDate ? `${startDate} to ${endDate}` : startDate;

  const bookedBy   = b.bookedBy;
  const reservedBy =
    typeof bookedBy === "string"
      ? bookedBy
      : bookedBy?.email || bookedBy?.name || bookedBy?.id || "Guest";

  const image = b.listing?.photos?.[0] ?? b.listing?.images?.[0] ?? null;

  return {
    id: b.id,
    name,
    location,
    category,
    invoice: paymentStatus,
    reservedBy,
    date: startDate,
    dateRange,
    time: timeRange,
    status,
    totalAmount: b.totalAmount,
    currency: b.currency,
    cancelledAt: b.cancelledAt,
    cancelledBy: b.cancelledBy,
    image,
    _raw: b,
  };
}

/* ─── CSV export ──────────────────────────────────────────────────────────── */
function exportToCSV(rows) {
  const headers = ["Name", "Location", "Category", "Invoice", "Reserved By", "Date", "Time", "Status", "Total Amount", "Currency"];
  const esc = (v) => { const s = String(v ?? "").replace(/"/g, '""'); return /[",\n]/.test(s) ? `"${s}"` : s; };
  const lines = [headers.join(","), ...rows.map((r) =>
    [r.name, r.location, r.category, r.invoice, r.reservedBy, r.date, r.time, r.status, r.totalAmount, r.currency].map(esc).join(",")
  )];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `reservations_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function ReservationsPage() {
  const dispatch = useDispatch();

  const hostBookings = useSelector(selectHostBookings);
  const pagination   = useSelector(selectHostBookingsPagination);
  const status       = useSelector(selectHostBookingsStatus);
  const error        = useSelector(selectHostBookingsError);

  const [activeTab,    setActiveTab]    = useState("all");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [search,       setSearch]       = useState("");
  const [dateFilter,   setDateFilter]   = useState("");

  /* detail panel */
  const [panelItem,    setPanelItem]    = useState(null);

  /* cancel modal */
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchHostBookings({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const rows = hostBookings.map(mapBookingToRow);

  const tabCounts = rows.reduce(
    (acc, row) => {
      const key = row.status.toLowerCase();
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    { upcoming: 0, completed: 0, cancelled: 0 }
  );

  const filteredRows = rows.filter((r) => {
    if (activeTab !== "all" && r.status.toLowerCase() !== activeTab.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (![r.name, r.reservedBy, r.category, r.location].some((v) => v.toLowerCase().includes(q))) return false;
    }
    if (dateFilter) {
      const fd  = new Date(dateFilter);
      const rd  = r._raw?.startDate ? new Date(r._raw.startDate) : null;
      if (!rd) return false;
      if (rd.getFullYear() !== fd.getFullYear() || rd.getMonth() !== fd.getMonth() || rd.getDate() !== fd.getDate()) return false;
    }
    return true;
  });

  const handleTabChange    = useCallback((t) => { setActiveTab(t);  setCurrentPage(1); }, []);
  const handleSearchChange = useCallback((v) => { setSearch(v);     setCurrentPage(1); }, []);
  const handleDateChange   = useCallback((v) => { setDateFilter(v); setCurrentPage(1); }, []);

  const handleViewDetails = (item) => setPanelItem(item);
  const handleClosePanel  = ()     => setPanelItem(null);

  /* Opens cancel modal (from table action or from panel) */
  const handleRequestCancel = (item) => {
    setCancelTarget(item);
  };

  /* Called after reason is selected in modal */
  const handleConfirmCancel = async (reason) => {
    if (!cancelTarget?.id) return;
    await dispatch(cancelBooking(cancelTarget.id));
    dispatch(fetchHostBookings({ page: currentPage, limit: 10 }));
    /* update panel item to show cancelled state */
    setPanelItem((prev) =>
      prev?.id === cancelTarget.id
        ? { ...prev, status: "Cancelled", invoice: "Refunded", _cancelReason: reason, _cancelledBy: prev.reservedBy }
        : prev
    );
    setCancelTarget(null);
  };

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full flex-1 flex flex-col gap-4">
      <ReservationStats />

      <div
        className="bg-white border border-gray-200 flex flex-col w-full flex-1"
        style={{ borderRadius: 16, padding: 20, gap: 0 }}
      >
        <ReservationFilters
          activeTab={activeTab}
          onTabChange={handleTabChange}
          search={search}
          onSearchChange={handleSearchChange}
          dateValue={dateFilter}
          onDateChange={handleDateChange}
          onExportCSV={() => exportToCSV(filteredRows)}
          counts={tabCounts}
        />

        {status === "loading" && (
          <div className="flex items-center justify-center flex-1">
            <div className="w-8 h-8 border-4 border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {status === "failed" && (
          <div className="flex items-center justify-center flex-1 text-red-500 text-sm">
            {error || "Failed to load reservations."}
          </div>
        )}

        {status === "succeeded" && filteredRows.length === 0 && <EmptyState />}

        {status === "succeeded" && filteredRows.length > 0 && (
          <div className="mt-4 flex-1 min-h-0 overflow-hidden">
            {/* Table: iPad (md) and up */}
            <div className="hidden md:block h-full">
              <ReservationTable
                data={filteredRows}
                onViewDetails={handleViewDetails}
                onCancel={handleRequestCancel}
              />
            </div>
            {/* Cards: mobile only */}
            <div className="block md:hidden">
              <ReservationCards
                data={filteredRows}
                onViewDetails={handleViewDetails}
                onCancel={handleRequestCancel}
              />
            </div>
          </div>
        )}

        {status === "succeeded" && totalPages >= 1 && (
          <div className="border-t border-gray-100 mt-4 pt-4 shrink-0">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>

      {/* ── Right-side details panel ── */}
      {panelItem && (
        <ReservationDetailsPanel
          reservation={panelItem}
          onClose={handleClosePanel}
          onCancel={handleRequestCancel}
        />
      )}

      {/* ── Cancel reason modal ── */}
      {cancelTarget && (
        <CancelReasonModal
          onClose={() => setCancelTarget(null)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
}
