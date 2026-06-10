"use client";

import React, { useEffect, useState } from "react";
import { ImageIcon, ChevronDownIcon, CalendarIcon } from "@/icons";
import { formatListingPrice } from "./listingPrice";

const FONT = "var(--font-sofia-pro), Sofia Pro, sans-serif";

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-[14px] border-b border-gray-100 last:border-0">
      <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 14, color: "#374151" }}>{label}</span>
      <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 14, color: "#9CA3AF" }} className="text-right max-w-[55%]">
        {value || "—"}
      </span>
    </div>
  );
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  const ampm = h < 12 ? "AM" : "PM";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatSlotDay(raw) {
  if (!raw) return "—";
  if (raw.includes("T") || raw.match(/^\d{4}-\d{2}-\d{2}/)) {
    const d = new Date(raw);
    if (!isNaN(d)) return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default function ListingDetailsPanel({ item, onClose, onEdit }) {
  const [showSlots, setShowSlots] = useState(false);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!item) return null;

  const slots = item.slots || [];
  const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";

  return (
    <>
      {/* Dim backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col bg-white shadow-2xl w-full sm:w-[420px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 shrink-0"
          style={{ backgroundColor: "#2FA39F", height: 60 }}
        >
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, color: "#fff" }}>Details</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {/* Hero image */}
          <div className="px-4 sm:px-5 pt-4 sm:pt-5">
            <div className="relative w-full overflow-hidden rounded-2xl bg-gray-100" style={{ height: 180 }}>
              {item.image && (item.image.startsWith("http") || item.image.startsWith("blob:") || item.image.startsWith("data:")) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon size={40} />
                </div>
              )}
            </div>
          </div>

          {/* Detail rows */}
          <div className="px-4 sm:px-6 pt-1 pb-4">
            <DetailRow label="Activity name" value={item.name} />
            <DetailRow label="Category"      value={cap(item.category)} />
            <DetailRow label="Type"          value={cap(item.type)} />
            <DetailRow label="Price"         value={formatListingPrice(item.category, item.price)} />
            <DetailRow label="Location"      value={item.location} />
            <DetailRow label="Status"        value={item.status} />

            {/* Time slots */}
            <div className="py-[14px] border-b border-gray-100 last:border-0">
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 14, color: "#374151" }}>Time Slots</span>
                <button
                  onClick={() => setShowSlots((v) => !v)}
                  className="flex items-center gap-1 text-sm font-semibold text-[#2FA39F] hover:underline"
                  style={{ fontFamily: FONT }}
                >
                  {slots.length > 0 ? (showSlots ? "Hide Slots" : "View Slots") : "No Slots"}
                  {slots.length > 0 && (
                    <span className={`transition-transform inline-block ${showSlots ? "rotate-180" : ""}`}>
                      <ChevronDownIcon size={12} />
                    </span>
                  )}
                </button>
              </div>
              {showSlots && slots.length > 0 && (
                <div className="mt-2 rounded-xl border border-gray-100 overflow-hidden">
                  {slots.map((s, i) => {
                    const day  = formatSlotDay(s.day ?? s.date);
                    const time = s.startTime && s.endTime
                      ? `${formatTime(s.startTime)} – ${formatTime(s.endTime)}`
                      : (s.time ?? "—");
                    return (
                      <div key={i} className={`flex items-center gap-3 px-4 py-2.5 text-xs ${i !== slots.length - 1 ? "border-b border-gray-50" : ""}`}>
                        <span className="text-[#2FA39F] shrink-0"><CalendarIcon /></span>
                        <span className="font-semibold text-gray-700">{day}</span>
                        <span className="text-gray-400 ml-auto">{time}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 sm:px-6 py-4 sm:py-5 flex gap-3 border-t border-gray-100 bg-white">
          <button
            onClick={onClose}
            style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, color: "#2FA39F", border: "1.5px solid #2FA39F", backgroundColor: "transparent" }}
            className="flex-1 py-3 rounded-full transition-colors hover:bg-teal-50"
          >
            Go Back
          </button>
          <button
            onClick={() => { onClose(); onEdit(item); }}
            style={{ fontFamily: FONT, fontWeight: 600, fontSize: 14, backgroundColor: "#2FA39F", color: "#fff" }}
            className="flex-1 py-3 rounded-full transition-opacity hover:opacity-90"
          >
            Edit
          </button>
        </div>
      </div>
    </>
  );
}
