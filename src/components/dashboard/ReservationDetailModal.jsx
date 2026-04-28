"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import heroImg from "@/assets/images/HeroImg.jpg";

/* ─── Icons ─────────────────────────────────────────────────────────────────── */
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const ReceiptIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
const getStatusStyle = (status) => {
  switch (status) {
    case "Upcoming": return "bg-blue-50 text-blue-500 border border-blue-100";
    case "Completed": return "bg-green-50 text-green-500 border border-green-100";
    case "Cancelled": return "bg-red-50 text-red-500 border border-red-100";
    default: return "bg-gray-100 text-gray-600";
  }
};

const getInvoiceStyle = (invoice) => {
  switch (invoice) {
    case "Paid": return "bg-green-50 text-green-500 border border-green-100";
    case "Overdue": return "bg-orange-50 text-orange-500 border border-orange-100";
    case "Refunded": return "bg-red-50 text-red-400 border border-red-100";
    default: return "bg-gray-100 text-gray-500 border border-gray-200";
  }
};

/* ─── Detail Row ─────────────────────────────────────────────────────────────── */
function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 text-[var(--color-primary)] shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-[var(--color-text)]">{value}</p>
      </div>
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function ReservationDetailModal({ reservation, onClose, onCancel }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!reservation) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      {/* Panel — stops propagation so clicks inside don't close */}
      <div
        className="relative bg-white rounded-3xl w-full max-w-[420px] sm:max-w-[520px] lg:max-w-[560px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Hero image ─────────────────────────────────────── */}
        <div className="relative w-full h-48 sm:h-56 lg:h-64 rounded-t-3xl overflow-hidden shrink-0">
          <Image src={heroImg} alt={reservation.name} fill className="object-cover" />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:bg-white transition-colors"
          >
            <CloseIcon />
          </button>

          {/* Status badge on image */}
          <div className="absolute bottom-4 left-4">
            <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${getStatusStyle(reservation.status)}`}>
              {reservation.status}
            </span>
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────── */}
        <div className="p-5 sm:p-6 lg:p-8">
          {/* Title + invoice */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text)] leading-tight">
              {reservation.name}
            </h2>
            <span className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full ${getInvoiceStyle(reservation.invoice)}`}>
              {reservation.invoice}
            </span>
          </div>

          {/* Location subtitle */}
          <p className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-6">
            <LocationIcon />
            {reservation.location}
          </p>

          {/* Detail rows */}
          <div className="divide-y divide-gray-100 mb-6">
            <DetailRow icon={<UserIcon />} label="Reserved By" value={reservation.reservedBy} />
            <DetailRow icon={<TagIcon />} label="Category" value={reservation.category} />
            <DetailRow icon={<CalendarIcon />} label="Date" value={reservation.date} />
            <DetailRow icon={<ClockIcon />} label="Time" value={reservation.time} />
            <DetailRow icon={<ReceiptIcon />} label="Invoice Status" value={reservation.invoice} />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {reservation.status === "Upcoming" && (
              <button
                onClick={() => { onCancel(reservation); onClose(); }}
                className="w-full py-3.5 rounded-full border-2 border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors"
              >
                Cancel Reservation
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-full bg-[var(--color-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
