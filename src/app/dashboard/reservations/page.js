"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHostBookings,
  cancelBooking,
  selectHostBookings,
  selectHostBookingsPagination,
  selectHostBookingsStatus,
  selectHostBookingsError,
  selectBookingsCancelStatus,
} from "@/store/slices/bookingsSlice";
import ReservationStats from "@/components/dashboard/ReservationStats";
import ReservationFilters from "@/components/dashboard/ReservationFilters";
import ReservationTable from "@/components/dashboard/ReservationTable";
import ReservationCards from "@/components/dashboard/ReservationCards";
import ReservationDetailView from "@/components/dashboard/ReservationDetailView";
import Pagination from "@/components/shared/Pagination";

/* ─── Map API booking → shape expected by table/detail components ─────────── */
function mapBookingToRow(b) {
  const info = b.listing?.basicInformation ?? {};
  const loc = b.listing?.placeLocation ?? {};

  const name =
    info.activityTitle ||
    info.equipmentName ||
    info.placeName ||
    "Booking";

  const location = [loc.city, loc.state, loc.country].filter(Boolean).join(", ") ||
    info.location ||
    "—";

  const category = b.listing?.category
    ? b.listing.category.charAt(0).toUpperCase() + b.listing.category.slice(1)
    : "—";

  const paymentStatus = b.paymentStatus === "paid"
    ? "Paid"
    : b.paymentStatus === "pending"
      ? "Overdue"
      : b.status === "cancelled"
        ? "Refunded"
        : "Overdue";

  const statusMap = {
    confirmed: "Upcoming",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  const status = statusMap[b.status] ?? "Upcoming";

  const startDate = b.startDate
    ? new Date(b.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  const timeRange = b.startTime && b.endTime ? `${b.startTime} to ${b.endTime}` : "—";

  const bookedBy = b.bookedBy;
  const reservedBy = typeof bookedBy === "string"
    ? bookedBy
    : bookedBy?.email || bookedBy?.name || bookedBy?.id || "Guest";

  return {
    id: b.id,
    name,
    location,
    category,
    invoice: paymentStatus,
    reservedBy,
    date: startDate,
    time: timeRange,
    status,
    totalAmount: b.totalAmount,
    currency: b.currency,
    _raw: b,
  };
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function ReservationsPage() {
  const dispatch = useDispatch();

  const hostBookings = useSelector(selectHostBookings);
  const pagination = useSelector(selectHostBookingsPagination);
  const status = useSelector(selectHostBookingsStatus);
  const error = useSelector(selectHostBookingsError);
  const cancelStatus = useSelector(selectBookingsCancelStatus);

  const [activeTab, setActiveTab] = useState("all");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchHostBookings({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const rows = hostBookings.map(mapBookingToRow);

  const filteredRows = activeTab === "all"
    ? rows
    : rows.filter((r) => r.status.toLowerCase() === activeTab.toLowerCase());

  const handleViewDetails = (item) => setSelectedReservation(item);

  const handleCancel = async (item) => {
    if (!item?.id) return;
    await dispatch(cancelBooking(item.id));
    dispatch(fetchHostBookings({ page: currentPage, limit: 10 }));
  };

  if (selectedReservation) {
    return (
      <ReservationDetailView
        reservation={selectedReservation}
        onBack={() => setSelectedReservation(null)}
        onCancel={(item) => handleCancel(item)}
      />
    );
  }

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-400 mx-auto flex-1 flex flex-col gap-4">
      <ReservationStats />

      {/* White card — matches image: width ~1080, border-radius 16, border 1px */}
      <div className="bg-white border border-gray-200 flex flex-col gap-4" style={{ borderRadius: 16, padding: 20 }}>
        <ReservationFilters activeTab={activeTab} onTabChange={setActiveTab} />

        {status === "loading" && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {status === "failed" && (
          <div className="text-center py-12 text-red-500 text-sm">
            {error || "Failed to load reservations."}
          </div>
        )}

        {status === "succeeded" && filteredRows.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No reservations found.
          </div>
        )}

        {status === "succeeded" && filteredRows.length > 0 && (
          <>
            <div className="block md:hidden xl:block">
              <ReservationTable
                data={filteredRows}
                onViewDetails={handleViewDetails}
                onCancel={handleCancel}
              />
            </div>
            <div className="hidden md:block xl:hidden">
              <ReservationCards
                data={filteredRows}
                onViewDetails={handleViewDetails}
                onCancel={handleCancel}
              />
            </div>
          </>
        )}
      </div>

      {/* Pagination — centered below card, matching image */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />
      )}
    </div>
  );
}
