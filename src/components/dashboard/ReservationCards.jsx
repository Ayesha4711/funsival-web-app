"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import heroImg from "@/assets/images/HeroImg.jpg";
import Pagination from "@/components/shared/Pagination";

/* ─── Icons ─────────────────────────────────────────────────────────────────── */
const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const RefundIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

/* ─── Action Dropdown ────────────────────────────────────────────────────────── */
function ActionMenu({ item, onViewDetails, onCancel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-gray-400 hover:text-[var(--color-text)] transition-colors p-1 rounded-lg hover:bg-gray-100"
      >
        <MoreIcon />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-30 bg-white border border-gray-200 rounded-2xl py-1.5 min-w-[140px]">
          <button
            onClick={() => { setOpen(false); onViewDetails(item); }}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-gray-50 transition-colors"
          >
            View Details
          </button>
          {item.status === "Upcoming" && (
            <button
              onClick={() => { setOpen(false); onCancel(item); }}
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

/* ─── Cards ──────────────────────────────────────────────────────────────────── */
export default function ReservationCards({ data, onViewDetails, onCancel }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Upcoming": return "bg-blue-50 text-blue-400 border border-blue-100";
      case "Completed": return "bg-green-50 text-green-400 border border-green-100";
      case "Cancelled": return "bg-red-50 text-red-500 border border-red-100";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getInvoiceStyle = (status) => {
    switch (status) {
      case "Paid": return "bg-green-50 text-green-500 border-green-100";
      case "Overdue": return "bg-orange-50 text-orange-500 border-orange-100";
      case "Refunded": return "bg-red-50 text-red-400 border-red-100";
      default: return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  const getInvoiceIcon = (status) => {
    switch (status) {
      case "Paid": return <CheckIcon />;
      case "Overdue": return <ClockIcon />;
      case "Refunded": return <RefundIcon />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {data.map((item) => (
        <div key={item.id} className="bg-white rounded-2xl p-4 border border-[var(--color-border)] relative">
          {/* Three-dot menu */}
          <div className="absolute top-4 right-4">
            <ActionMenu item={item} onViewDetails={onViewDetails} onCancel={onCancel} />
          </div>

          {/* Header Info */}
          <div className="flex items-center gap-3 mb-4 pr-8">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative">
              {item.image
                ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                : <Image src={heroImg} alt={item.name} fill sizes="56px" className="object-cover" />
              }
            </div>
            <div>
              <p className="text-sm font-extrabold text-[var(--color-text)]">{item.name}</p>
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-gray-300" /> {item.location}
              </p>
            </div>
          </div>

          {/* Status, Invoice Badges + Cancel */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${getStatusStyle(item.status)}`}>
              {item.status}
            </span>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${getInvoiceStyle(item.invoice)}`}>
              {getInvoiceIcon(item.invoice)}
              {item.invoice}
            </span>
            {item.status === "Upcoming" && (
              <button
                onClick={() => onCancel(item)}
                className="text-[10px] font-bold px-3 py-1 rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-colors ml-auto"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-y-4 pt-4 border-t border-[var(--color-border)]">
            <div>
              <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1">Category</p>
              <p className="text-xs font-bold text-[var(--color-text)]">{item.category}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1">Reserved By</p>
              <p className="text-xs font-bold text-[var(--color-text)]">{item.reservedBy}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1">Date & Time</p>
              <p className="text-xs font-bold text-[var(--color-text)]">{item.date} — {item.time}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="py-4">
        <Pagination currentPage={1} totalPages={10} onPageChange={() => {}} />
      </div>
    </div>
  );
}
