"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import heroImg from "@/assets/images/HeroImg.jpg";

/* ─── Icons ─────────────────────────────────────────────────────────────────── */
const MoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const RefundIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const PinIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

/* ─── Action Dropdown ─────────────────────────────────────────────────────────
   Opens above when the row index is in the last 2 rows of the visible set.     */
function ActionMenu({ item, onViewDetails, onCancel, isNearBottom, totalRows }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Open upward only when near the bottom AND enough rows fill the scroll area */
  const popupPositionClass = (isNearBottom && totalRows >= 6)
    ? "bottom-full mb-1"
    : "top-full mt-1";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <MoreIcon />
      </button>

      {open && (
        <div
          className={`absolute right-0 z-40 bg-white border border-gray-200 rounded-2xl py-1.5 min-w-[148px] shadow-lg ${popupPositionClass}`}
        >
          <button
            onClick={() => { setOpen(false); onViewDetails(item); }}
            style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-gray-50 transition-colors"
          >
            View Details
          </button>
          {item.status === "Upcoming" && (
            <button
              onClick={() => { setOpen(false); onCancel(item); }}
              style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Table ──────────────────────────────────────────────────────────────────── */
export default function ReservationTable({ data, onViewDetails, onCancel }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Upcoming":  return "bg-[#EAF4FF] text-[#4DA6E8] border border-[#C7E3F9]";
      case "Completed": return "bg-[#EAFAF1] text-[#27AE60] border border-[#B7EBD0]";
      case "Cancelled": return "bg-[#FDECEA] text-[#FF0000] border border-[#F9C9C9]";
      default:          return "bg-gray-100 text-gray-500";
    }
  };

  const getInvoiceStyle = (status) => {
    switch (status) {
      case "Paid":     return "text-[#27AE60]";
      case "Overdue":  return "text-[#F5A623]";
      case "Refunded": return "text-[#E25C5C]";
      default:         return "text-gray-500";
    }
  };

  const getInvoiceIcon = (status) => {
    switch (status) {
      case "Paid":     return <CheckIcon />;
      case "Overdue":  return <ClockIcon />;
      case "Refunded": return <RefundIcon />;
      default:         return null;
    }
  };

  const totalRows = data.length;

  return (
    /* Outer: fills parent height, scrolls horizontally if needed */
    <div className="h-full overflow-x-auto">
      <div
        className="overflow-y-auto h-full"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}
      >
        <table className="w-full text-left border-collapse min-w-[780px]">
          {/* ── Thead: sticky top, teal background ── */}
          <thead className="sticky top-0 z-10">
            <tr style={{ backgroundColor: "#EDF6F6" }}>
              {["Reservation", "Category", "Invoice", "Reserved By", "Date & Time", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  style={{
                    fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                    lineHeight: "21px",
                    letterSpacing: 0,
                  }}
                  className="px-5 py-3.5 text-[var(--color-text)] whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Tbody ── */}
          <tbody className="divide-y divide-[#F0F0F0]">
            {data.map((item, index) => {
              const isNearBottom = index >= totalRows - 2;
              return (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  {/* Reservation */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 relative">
                        <Image src={heroImg} alt={item.name} fill sizes="44px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p
                          style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 600 }}
                          className="text-[13px] text-[var(--color-text)] whitespace-nowrap"
                        >
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted)] whitespace-nowrap flex items-center gap-1 mt-0.5">
                          <PinIcon />
                          {item.location}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4">
                    <span
                      style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 600 }}
                      className="text-[12px] text-[var(--color-text)] bg-[#F3F4F6] px-3 py-1 rounded-full whitespace-nowrap"
                    >
                      {item.category}
                    </span>
                  </td>

                  {/* Invoice */}
                  <td className="px-5 py-4">
                    <div className={`flex items-center gap-1.5 text-[12px] font-semibold ${getInvoiceStyle(item.invoice)}`}
                      style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}
                    >
                      {getInvoiceIcon(item.invoice)}
                      <span>{item.invoice}</span>
                    </div>
                  </td>

                  {/* Reserved By */}
                  <td
                    className="px-5 py-4 text-[12px] text-[var(--color-text)] whitespace-nowrap"
                    style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 500 }}
                  >
                    {item.reservedBy}
                  </td>

                  {/* Date & Time */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div
                      className="text-[12px] text-[var(--color-text)]"
                      style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 600 }}
                    >
                      {item.date}
                    </div>
                    <div
                      className="text-[11px] text-[var(--color-text-muted)] mt-0.5"
                      style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}
                    >
                      {item.time}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span
                      style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 600 }}
                      className={`text-[11px] px-3 py-1 rounded-full whitespace-nowrap ${getStatusStyle(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {item.status === "Upcoming" && (
                        <button
                          onClick={() => onCancel(item)}
                          style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 600 }}
                          className="text-[11px] px-3 py-1.5 rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      )}
                      <ActionMenu
                        item={item}
                        onViewDetails={onViewDetails}
                        onCancel={onCancel}
                        isNearBottom={isNearBottom}
                        totalRows={totalRows}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
