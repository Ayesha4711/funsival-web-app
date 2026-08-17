"use client";

import React, { Suspense, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHostBookings,
  cancelBooking,
  acceptBooking,
  declineBooking,
  selectHostBookings,
  selectHostBookingsPagination,
  selectHostBookingsFilters,
  selectHostBookingsStatus,
  selectHostBookingsError,
} from "@/store/slices/bookingsSlice";
import axiosInstance from "@/store/axiosInstance";
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
function EmptyState({ hasActiveFilters = false, onClearFilters }) {
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
        {hasActiveFilters ? "No reservations match your filters" : "No Data Found"}
      </p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm font-semibold text-[var(--color-primary)] hover:opacity-80"
        >
          Clear filters
        </button>
      )}
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

function formatTimeRange(startTime, endTime) {
  if (!startTime) return "";
  if (endTime && endTime !== startTime) {
    return `${fmt12(startTime)} – ${fmt12(endTime)}`;
  }
  return fmt12(startTime);
}

function getBookingTimeRanges(b) {
  const slots = Array.isArray(b.slots) ? b.slots.filter((slot) => slot?.startTime) : [];
  if (slots.length > 0) {
    const formatted = slots.map((slot) => formatTimeRange(slot.startTime, slot.endTime)).filter(Boolean);
    if (formatted.length > 0) return formatted;
  }

  const startTime = b.startTime;
  const endTime = b.endTime;
  if (startTime) return [formatTimeRange(startTime, endTime)];

  const dateStr = b.startDate ? b.startDate.split("T")[0] : null;
  const slot = dateStr
    ? (b.listing?.availability ?? []).find((a) => a.date && a.date.split("T")[0] === dateStr)
    : null;
  if (slot?.startTime) return [formatTimeRange(slot.startTime, slot.endTime)];

  return [];
}

function formatDateRange(startDate, endDate) {
  const fmt = (d) => d
    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start.getTime() !== end.getTime()) {
    return `${fmt(start)} – ${fmt(end)}`;
  }
  return fmt(start);
}

function mapReservationStatus(b) {
  const raw = String(b.status || b.bookingStatus || b.state || "").toLowerCase();
  if (raw === "completed") return "Completed";
  if (raw === "cancelled" || raw === "canceled" || raw === "declined") return "Cancelled";
  if (raw === "pending" || raw === "awaiting_host_approval") return "Action Needed";
  if (raw === "confirmed" || raw === "upcoming" || raw === "active") return "Upcoming";
  return "Action Needed";
}

function mapPaymentStatus(paymentStatus) {
  const raw = String(paymentStatus || "").toLowerCase();
  if (["held", "releasing", "released"].includes(raw)) return "Paid";
  if (raw === "refunded") return "Refunded";
  if (raw === "refunding") return "Refunding";
  if (raw === "processing") return "Processing";
  if (raw === "authorized") return "Authorized";
  if (raw === "failed") return "Failed";
  if (raw === "requires_payment") return "Payment Required";
  if (raw === "disputed") return "Disputed";
  if (raw === "auth_released") return "Authorization Released";
  return raw ? raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";
}

/* ─── Map API booking → row shape ─────────────────────────────────────────── */
function mapBookingToRow(b) {
  const info = b.listing?.basicInformation ?? {};
  const loc = b.listing?.placeLocation ?? {};
  const title = info.activityTitle || info.equipmentName || info.placeName || b.listing?.title || "Booking";
  const location = info.location || [loc.city, loc.state, loc.country].filter(Boolean).join(", ") || "—";
  const category = b.listing?.category ? b.listing.category.charAt(0).toUpperCase() + b.listing.category.slice(1) : "—";
  const status = mapReservationStatus(b);
  const invoice = mapPaymentStatus(b.paymentStatus);
  const startDate = b.startDate ? new Date(b.startDate) : null;
  const endDate = b.endDate ? new Date(b.endDate) : null;
  const dateRange = formatDateRange(startDate, endDate);
  const timeRanges = getBookingTimeRanges(b);
  const bookedBy = b.bookedBy;
  const providerProfile = typeof bookedBy === "object" ? bookedBy?.providerProfile ?? {} : {};
  const reservedBy = typeof bookedBy === "string"
    ? bookedBy
    : [providerProfile.firstName, providerProfile.lastName].filter(Boolean).join(" ").trim()
      || bookedBy?.email
      || bookedBy?.name
      || bookedBy?.id
      || "Guest";
  const image = b.listing?.photos?.[0] ?? b.listing?.images?.[0] ?? null;

  return {
    id: b.id,
    name: title,
    location,
    category,
    invoice,
    paymentStatus: b.paymentStatus ?? null,
    activeRefundRequest: b.activeRefundRequest ?? null,
    reservedBy,
    date: formatDateRange(startDate, startDate),
    dateRange,
    timeRanges,
    time: timeRanges.length === 1 ? timeRanges[0] : timeRanges.join("\n"),
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

const VALID_TABS = ["all", "upcoming", "completed", "cancelled"];

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function ReservationsPage() {
  return (
    <Suspense fallback={null}>
      <ReservationsPageContent />
    </Suspense>
  );
}

function getInitialUrlState(searchParams) {
  const tabParam = searchParams.get("tab");
  const pageParam = parseInt(searchParams.get("page"), 10);
  return {
    tab: VALID_TABS.includes(tabParam) ? tabParam : "all",
    search: searchParams.get("search") || "",
    date: searchParams.get("date") || "",
    page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1,
  };
}

function ReservationsPageContent() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const tableAreaRef = useRef(null);
  const requestRef = useRef(null);

  const hostBookings = useSelector(selectHostBookings);
  const pagination   = useSelector(selectHostBookingsPagination);
  const hostFilters  = useSelector(selectHostBookingsFilters);
  const status       = useSelector(selectHostBookingsStatus);
  const error        = useSelector(selectHostBookingsError);

  const [activeTab,    setActiveTab]    = useState(() => getInitialUrlState(searchParams).tab);
  const [currentPage,  setCurrentPage]  = useState(() => getInitialUrlState(searchParams).page);
  const [limit]       = useState(10);
  const [searchInput,  setSearchInput]   = useState(() => getInitialUrlState(searchParams).search);
  const [debouncedSearch, setDebouncedSearch] = useState(() => getInitialUrlState(searchParams).search);
  const [selectedDate, setSelectedDate]  = useState(() => getInitialUrlState(searchParams).date);
  const [retryTick, setRetryTick] = useState(0);

  /* detail panel */
  const [panelItem,    setPanelItem]    = useState(null);

  /* cancel modal */
  const [cancelTarget, setCancelTarget] = useState(null);

  /* accept / decline */
  const [acceptTarget,  setAcceptTarget]  = useState(null);
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch, selectedDate]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab && activeTab !== "all") params.set("tab", activeTab);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedDate) params.set("date", selectedDate);
    if (currentPage > 1) params.set("page", String(currentPage));
    const query = params.toString();
    const url = query ? `?${query}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [activeTab, debouncedSearch, selectedDate, currentPage]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const pageParam = parseInt(params.get("page"), 10);
      setActiveTab(VALID_TABS.includes(tabParam) ? tabParam : "all");
      setSearchInput(params.get("search") || "");
      setDebouncedSearch(params.get("search") || "");
      setSelectedDate(params.get("date") || "");
      setCurrentPage(Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (requestRef.current?.abort) requestRef.current.abort();
    const request = dispatch(fetchHostBookings({
      tab: activeTab,
      search: debouncedSearch || undefined,
      date: selectedDate || undefined,
      page: currentPage,
      limit,
    }));
    requestRef.current = request;
    return () => request.abort?.();
  }, [dispatch, activeTab, debouncedSearch, selectedDate, currentPage, limit, retryTick]);

  useEffect(() => {
    if (tableAreaRef.current) tableAreaRef.current.scrollIntoView({ block: "start" });
  }, [currentPage]);

  const rows = useMemo(() => hostBookings.map(mapBookingToRow), [hostBookings]);
  const counts = hostFilters?.counts ?? {};
  const hasActiveFilters = activeTab !== "all" || Boolean(debouncedSearch) || Boolean(selectedDate);

  const handleTabChange = useCallback((t) => {
    setActiveTab(t);
    setCurrentPage(1);
  }, []);
  const handleSearchChange = useCallback((v) => {
    setSearchInput(v);
  }, []);
  const handleDateChange = useCallback((v) => {
    setSelectedDate(v);
    setCurrentPage(1);
  }, []);
  const handleClearFilters = useCallback(() => {
    setActiveTab("all");
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedDate("");
    setCurrentPage(1);
  }, []);

  const handleViewDetails = (item) => setPanelItem(item);
  const handleClosePanel  = ()     => setPanelItem(null);

  /* Accept booking */
  const handleRequestAccept = (item) => setAcceptTarget(item);

  const handleConfirmAccept = async () => {
    if (!acceptTarget?.id) return;
    try {
      await dispatch(acceptBooking(acceptTarget.id)).unwrap();
      toast.success("Booking accepted. Guest's card has been charged.");
      dispatch(fetchHostBookings({
        tab: activeTab,
        search: debouncedSearch || undefined,
        date: selectedDate || undefined,
        page: currentPage,
        limit,
      }));
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
      dispatch(fetchHostBookings({
        tab: activeTab,
        search: debouncedSearch || undefined,
        date: selectedDate || undefined,
        page: currentPage,
        limit,
      }));
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
    dispatch(fetchHostBookings({
      tab: activeTab,
      search: debouncedSearch || undefined,
      date: selectedDate || undefined,
      page: currentPage,
      limit,
    }));
    setPanelItem((prev) =>
      prev?.id === cancelTarget.id
        ? { ...prev, status: "Cancelled", invoice: "Refunded", _cancelReason: reason, _cancelledBy: prev.reservedBy }
        : prev
    );
    setCancelTarget(null);
  };

  const totalPages = pagination?.totalPages ?? 1;
  const visibleRows = rows;

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      params.set("tab", activeTab);
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedDate) params.set("date", selectedDate);
      const { data, headers } = await axiosInstance.get(`/bookings/host/export?${params.toString()}`, {
        responseType: "blob",
      });
      const blob = new Blob([data], { type: headers?.["content-type"] || "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reservations_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Could not export reservations. Please try again.");
    }
  };

  return (
    <div className="p-3 xs:p-4 sm:p-6 w-full flex-1 flex flex-col gap-4 sm:gap-5">
      <ReservationStats />

      <div
        className="bg-white border border-gray-200 flex flex-col w-full flex-1"
        style={{ borderRadius: 16, padding: 20, gap: 0 }}
        ref={tableAreaRef}
      >
        <ReservationFilters
          activeTab={activeTab}
          onTabChange={handleTabChange}
          search={searchInput}
          onSearchChange={handleSearchChange}
          dateValue={selectedDate}
          onDateChange={handleDateChange}
          onExportCSV={handleExportCSV}
          counts={counts}
        />

        {status === "loading" && visibleRows.length === 0 && (
          <div className="flex items-center justify-center flex-1">
            <div className="w-8 h-8 border-4 border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {status === "failed" && visibleRows.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-red-500 text-sm">
            <p>{error || "Failed to load reservations."}</p>
            <button
              type="button"
              onClick={() => setRetryTick((t) => t + 1)}
              className="text-sm font-semibold text-[var(--color-primary)] hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        {status === "failed" && visibleRows.length > 0 && (
          <div className="flex items-center justify-between gap-3 mt-4 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm">
            <span>{error || "Failed to refresh reservations."}</span>
            <button
              type="button"
              onClick={() => setRetryTick((t) => t + 1)}
              className="font-semibold hover:opacity-80 shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {visibleRows.length === 0 && status === "succeeded" && (
          <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
        )}

        {visibleRows.length > 0 && (
          <div className={`mt-4 relative transition-opacity ${status === "loading" ? "opacity-60 pointer-events-none" : ""}`}>
            {/* Table: iPad (md) and up */}
            <div className="hidden md:block">
              <ReservationTable
                data={visibleRows}
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
                data={visibleRows}
                onViewDetails={handleViewDetails}
                onCancel={handleRequestCancel}
                onAccept={handleRequestAccept}
                onDecline={handleRequestDecline}
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
                The guest&apos;s card will be charged <strong>${acceptTarget.totalAmount}</strong> immediately.
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
