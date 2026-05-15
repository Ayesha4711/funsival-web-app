"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import heroImg from "@/assets/images/HeroImg.jpg";
import { CloseIcon, LocationIcon, CalendarIcon, ClockIcon, UserIcon, TagIcon, ReceiptIcon } from "@/icons";

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
          <Image src={heroImg} alt={reservation.name} fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
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
