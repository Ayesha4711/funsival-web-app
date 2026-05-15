"use client";

import React from "react";
import Image from "next/image";
import heroImg from "@/assets/images/HeroImg.jpg";
import { ChevronLeftIcon, LocationIcon, CalendarIcon, ClockIcon, UserIcon, TagIcon, ReceiptIcon } from "@/icons";

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
const getStatusStyle = (status) => {
  switch (status) {
    case "Upcoming":  return "bg-blue-50 text-blue-500 border border-blue-200";
    case "Completed": return "bg-green-50 text-green-500 border border-green-200";
    case "Cancelled": return "bg-red-50 text-red-500 border border-red-200";
    default:          return "bg-gray-100 text-gray-600 border border-gray-200";
  }
};

const getInvoiceStyle = (invoice) => {
  switch (invoice) {
    case "Paid":     return "bg-green-50 text-green-500 border border-green-200";
    case "Overdue":  return "bg-orange-50 text-orange-500 border border-orange-200";
    case "Refunded": return "bg-red-50 text-red-400 border border-red-200";
    default:         return "bg-gray-100 text-gray-500 border border-gray-200";
  }
};

/* ─── Info Row ───────────────────────────────────────────────────────────────── */
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-4 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 text-[var(--color-primary)] shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-[var(--color-text)]">{value}</p>
      </div>
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function ReservationDetailView({ reservation, onBack, onCancel }) {
  if (!reservation) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto">

      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-6"
      >
        <ChevronLeftIcon size={18} />
        Back to Reservations
      </button>

      {/* Page title */}
      <h1 className="text-2xl font-extrabold text-[var(--color-text)] mb-6">
        Reservation Details
      </h1>

      {/* Main card */}
      <div className="bg-white rounded-[32px] border border-[var(--color-border)] overflow-hidden">

        {/* Hero image */}
        <div className="relative w-full h-48 sm:h-64 lg:h-72">
          <Image
            src={heroImg}
            alt={reservation.name}
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover"
          />
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Status badge over image */}
          <div className="absolute bottom-5 left-6 flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${getStatusStyle(reservation.status)}`}>
              {reservation.status}
            </span>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${getInvoiceStyle(reservation.invoice)}`}>
              {reservation.invoice}
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6 sm:p-8 lg:p-10">

          {/* Title + location */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text)] mb-2">
              {reservation.name}
            </h2>
            <p className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
              <LocationIcon />
              {reservation.location}
            </p>
          </div>

          {/* Detail rows — 1 col on mobile, 2 cols on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 mb-8">
            <InfoRow icon={<UserIcon />}    label="Reserved By"    value={reservation.reservedBy} />
            <InfoRow icon={<TagIcon />}     label="Category"       value={reservation.category} />
            <InfoRow icon={<CalendarIcon />} label="Date"          value={reservation.date} />
            <InfoRow icon={<ClockIcon />}   label="Time"           value={reservation.time} />
            <InfoRow icon={<ReceiptIcon />} label="Invoice Status" value={reservation.invoice} />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onBack}
              className="flex-1 sm:flex-none sm:min-w-[160px] py-3.5 px-6 rounded-full bg-[var(--color-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Back to List
            </button>

            {reservation.status === "Upcoming" && (
              <button
                onClick={() => { onCancel(reservation); onBack(); }}
                className="flex-1 sm:flex-none sm:min-w-[160px] py-3.5 px-6 rounded-full border-2 border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors"
              >
                Cancel Reservation
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
