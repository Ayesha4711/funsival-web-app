"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import heroImg from "@/assets/images/HeroImg.jpg";

const FONT = "var(--font-sofia-pro), Sofia Pro, sans-serif";

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-[14px] border-b border-gray-100 last:border-0">
      <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 14, color: "#374151" }}>
        {label}
      </span>
      <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 14, color: "#9CA3AF" }} className="text-right max-w-[55%]">
        {value}
      </span>
    </div>
  );
}

export default function ReservationDetailsPanel({ reservation, onClose, onCancel }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!reservation) return null;

  const isCancelled  = reservation.status === "Cancelled";
  const cancelledBy  = reservation._cancelledBy || reservation.reservedBy;
  const cancelReason = reservation._cancelReason;

  const rawPhoto    = reservation._raw?.listing?.photos?.[0];
  const hasRealPhoto = rawPhoto && !rawPhoto.startsWith("blob:");

  return (
    <>
      {/* Dim backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white shadow-2xl w-full sm:w-[420px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Amber header ── */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 shrink-0"
          style={{ backgroundColor: "#F5A623", height: 60 }}
        >
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, color: "#fff" }}>
            Details
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>

          {/* Hero image — padded with rounded corners like the design */}
          <div className="px-4 sm:px-5 pt-4 sm:pt-5">
            <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: 180 }}>
              <Image
                src={hasRealPhoto ? rawPhoto : heroImg}
                alt={reservation.name}
                fill
                sizes="(max-width: 640px) 100vw, 400px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Detail rows */}
          <div className="px-4 sm:px-6 pt-1 pb-4">
            <DetailRow label="Category"       value={reservation.category} />
            <DetailRow label="Equipment name" value={reservation.name} />
            <DetailRow
              label="Price"
              value={reservation.totalAmount != null ? `$${reservation.totalAmount}` : "—"}
            />
            <DetailRow label="Reserved By" value={reservation.reservedBy} />
            <DetailRow label="Date"        value={reservation.dateRange || reservation.date} />
            <DetailRow label="Location"    value={reservation.location} />
          </div>

          {/* Cancelled banner */}
          {isCancelled && (
            <div
              className="mx-4 sm:mx-6 mb-6 rounded-2xl px-4 sm:px-5 py-4"
              style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}
            >
              <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "#EA580C" }} className="mb-1">
                Booking Was Canceled
              </p>
              <p style={{ fontFamily: FONT, fontWeight: 500, fontSize: 13, color: "#EA580C" }} className="mb-0.5">
                {`This booking was canceled by ${cancelledBy}${reservation._raw?.cancelledAt ? `, on ${new Date(reservation._raw.cancelledAt).toLocaleDateString("en-GB")}` : ""}`}
              </p>
              {cancelReason && (
                <p style={{ fontFamily: FONT, fontWeight: 500, fontSize: 13, color: "#EA580C" }}>
                  Reason: {cancelReason}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Footer buttons ── */}
        {!isCancelled && (
          <div className="shrink-0 px-4 sm:px-6 py-4 sm:py-5 flex gap-3 border-t border-gray-100 bg-white">
            {/* Go Back — amber outline */}
            <button
              onClick={onClose}
              style={{
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 14,
                color: "#F5A623",
                border: "1.5px solid #F5A623",
                backgroundColor: "transparent",
              }}
              className="flex-1 py-3 rounded-full transition-colors hover:bg-orange-50"
            >
              Go Back
            </button>

            {/* Cancel Booking — teal filled, only when Upcoming */}
            {reservation.status === "Upcoming" && (
              <button
                onClick={() => onCancel(reservation)}
                style={{
                  fontFamily: FONT,
                  fontWeight: 600,
                  fontSize: 14,
                  backgroundColor: "#1d8c82",
                  color: "#fff",
                }}
                className="flex-1 py-3 rounded-full transition-opacity hover:opacity-90"
              >
                Cancel Booking
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
