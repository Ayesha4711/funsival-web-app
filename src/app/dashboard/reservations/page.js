"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHostBookings,
  cancelBooking,
  acceptBooking,
  declineBooking,
  selectHostBookings,
  selectHostBookingsPagination,
  selectHostBookingsStatus,
  selectHostBookingsError,
} from "@/store/slices/bookingsSlice";
import { toast } from "sonner";
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

function fmt12(t) {
  if (!t) return "";
  if (t.includes("AM") || t.includes("PM")) return t;
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return t;
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
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

  const invoiceLabel =
    b.paymentStatus === "held"     || b.paymentStatus === "released"  ? "Paid"
    : b.paymentStatus === "refunded"                                  ? "Refunded"
    : b.paymentStatus === "authorized"                                ? "Authorized"
    : b.paymentStatus === "auth_released" || b.status === "declined"  ? "Refunded"
    : b.status === "cancelled"                                        ? "Refunded"
    : "Overdue";

  const statusMap = {
    confirmed:               "Upcoming",
    awaiting_host_approval:  "Action Needed",
    completed:               "Completed",
    cancelled:               "Cancelled",
    declined:                "Declined",
    pending:                 "Pending",
  };
  const status = statusMap[b.status] ?? "Upcoming";

  const rawStart = b.startDate ? new Date(b.startDate) : null;
  const rawEnd   = b.endDate   ? new Date(b.endDate)   : null;

  const fmtDate = (d) => d
    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const startDate = fmtDate(rawStart) ?? "—";
  const endDate   = fmtDate(rawEnd);

  // day count for daily bookings
  const dayCount = rawStart && rawEnd
    ? Math.round((rawEnd.getTime() - rawStart.getTime()) / 86400000) + 1
    : null;

  const isDaily = b.pricingMode === "daily" || (rawEnd && rawStart && rawEnd > rawStart);

  // Time from top-level fields or availability array
  const avail0 = b.availability?.[0];
  const rawStartTime = b.startTime || avail0?.startTime || "";
  const rawEndTime   = b.endTime   || avail0?.endTime   || "";

  const timeRange = rawStartTime && rawEndTime && rawStartTime !== rawEndTime
    ? `${fmt12(rawStartTime)} – ${fmt12(rawEndTime)}`
    : rawStartTime
      ? fmt12(rawStartTime)
      : "—";

  // Date range: "Jun 22, 2026 – Jun 24, 2026 (3 days)" for daily, just start for hourly
  const dateRange = endDate && endDate !== startDate
    ? `${startDate} – ${endDate}${isDaily && dayCount ? ` (${dayCount} day${dayCount > 1 ? "s" : ""})` : ""}`
    : startDate;

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
    invoice: invoiceLabel,
    paymentStatus: b.paymentStatus ?? null,
    activeRefundRequest: b.activeRefundRequest ?? null,
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

  /* accept / decline */
  const [acceptTarget,  setAcceptTarget]  = useState(null);
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

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
    { upcoming: 0, completed: 0, cancelled: 0, pending: 0 }
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

  /* Accept booking */
  const handleRequestAccept = (item) => setAcceptTarget(item);

  const handleConfirmAccept = async () => {
    if (!acceptTarget?.id) return;
    try {
      await dispatch(acceptBooking(acceptTarget.id)).unwrap();
      toast.success("Booking accepted. Guest's card has been charged.");
      dispatch(fetchHostBookings({ page: currentPage, limit: 10 }));
      setPanelItem((prev) => prev?.id === acceptTarget.id ? { ...prev, status: "Upcoming", paymentStatus: "held" } : prev);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Could not accept booking. Please try again.");
    } finally {
      setAcceptTarget(null);
    }
  };

  /* Decline booking */
  const handleRequestDecline = (item) => { setDeclineTarget(item); setDeclineReason(""); };

  const handleConfirmDecline = async () => {
    if (!declineTarget?.id) return;
    try {
      await dispatch(declineBooking({ bookingId: declineTarget.id, reason: declineReason || undefined })).unwrap();
      toast.success("Booking declined. Authorization has been voided.");
      dispatch(fetchHostBookings({ page: currentPage, limit: 10 }));
      setPanelItem((prev) => prev?.id === declineTarget.id ? { ...prev, status: "Declined", paymentStatus: "auth_released" } : prev);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Could not decline booking. Please try again.");
    } finally {
      setDeclineTarget(null);
      setDeclineReason("");
    }
  };

  /* Opens cancel modal (from table action or from panel) */
  const handleRequestCancel = (item) => setCancelTarget(item);

  /* Called after reason is selected in modal */
  const handleConfirmCancel = async (reason) => {
    if (!cancelTarget?.id) return;
    await dispatch(cancelBooking(cancelTarget.id));
    dispatch(fetchHostBookings({ page: currentPage, limit: 10 }));
    setPanelItem((prev) =>
      prev?.id === cancelTarget.id
        ? { ...prev, status: "Cancelled", invoice: "Refunded", _cancelReason: reason, _cancelledBy: prev.reservedBy }
        : prev
    );
    setCancelTarget(null);
  };

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="p-3 xs:p-4 sm:p-6 w-full flex-1 flex flex-col gap-4 sm:gap-5">
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
                activeTab={activeTab}
                onViewDetails={handleViewDetails}
                onCancel={handleRequestCancel}
                onAccept={handleRequestAccept}
                onDecline={handleRequestDecline}
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
          onAccept={handleRequestAccept}
          onDecline={handleRequestDecline}
        />
      )}

      {/* ── Cancel reason modal ── */}
      {cancelTarget && (
        <CancelReasonModal
          onClose={() => setCancelTarget(null)}
          onConfirm={handleConfirmCancel}
        />
      )}

      {/* ── Accept confirmation modal ── */}
      {acceptTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Accept Booking</h2>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <p className="text-sm text-gray-500">
                Accept <strong>{acceptTarget.name}</strong> from <strong>{acceptTarget.reservedBy}</strong>?<br />
                The guest's card will be charged <strong>${acceptTarget.totalAmount}</strong> immediately.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setAcceptTarget(null)} className="flex-1 py-3 border border-gray-200 text-gray-500 font-semibold rounded-full text-sm hover:bg-gray-50">Cancel</button>
                <button onClick={handleConfirmAccept} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-full text-sm hover:opacity-90 transition-opacity">Accept &amp; Charge</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Decline modal ── */}
      {declineTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Decline Booking</h2>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <p className="text-sm text-gray-500">
                The authorization hold will be voided and the guest will not be charged.
              </p>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Reason <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g. Already booked offline."
                  rows={3}
                  className="w-full px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeclineTarget(null)} className="flex-1 py-3 border border-gray-200 text-gray-500 font-semibold rounded-full text-sm hover:bg-gray-50">Cancel</button>
                <button onClick={handleConfirmDecline} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-full text-sm hover:opacity-90 transition-opacity">Decline Booking</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
