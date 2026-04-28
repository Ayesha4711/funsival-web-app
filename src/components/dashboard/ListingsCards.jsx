"use client";

import React, { useState, useRef, useEffect } from "react";
import Pagination from "@/components/shared/Pagination";
import { formatListingPrice } from "./listings/listingPrice";

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const ChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const STATUS_OPTIONS = ["Draft", "Active", "Inactive"];
const STATUS_STYLES = {
  Active:   { pill: "bg-green-50 text-green-500 border-green-100",    dot: "bg-green-400" },
  Inactive: { pill: "bg-red-50 text-red-400 border-red-100",          dot: "bg-red-400" },
  Draft:    { pill: "bg-orange-50 text-orange-400 border-orange-100", dot: "bg-orange-400" },
};

function StatusDropdown({ status, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const styles = STATUS_STYLES[status] ?? { pill: "bg-gray-100 text-gray-400 border-gray-100", dot: "bg-gray-400" };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap ${styles.pill}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
        {status}
        <ChevronDown />
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-30 bg-white rounded-xl border border-gray-100 py-1 min-w-[110px]">
          {STATUS_OPTIONS.map((opt) => {
            const s = STATUS_STYLES[opt];
            return (
              <button
                key={opt}
                onClick={() => { onStatusChange(opt); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold transition-colors hover:bg-gray-50 ${opt === status ? "opacity-100" : "opacity-70"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                <span className={s.pill.split(" ").filter(c => c.startsWith("text-")).join(" ")}>{opt}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActionMenu({ item, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-gray-300 hover:text-gray-600 transition-colors p-1"
      >
        <MoreIcon />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-30 bg-white border border-gray-100 rounded-2xl py-1.5 min-w-[130px]">
          <button
            onClick={() => { setOpen(false); onEdit(item); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-bold text-[var(--color-text)] hover:bg-gray-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
          <button
            onClick={() => { setOpen(false); onDelete(item); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function ListingsCards({
  data,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex flex-col gap-4">
      {data.length === 0 && (
        <p className="text-center text-sm text-gray-400 font-medium py-12">No listings found.</p>
      )}
      {data.map((item) => (
        <div key={item.id} className="bg-white rounded-[32px] p-5 border border-[var(--color-border)] relative">
          <div className="absolute top-5 right-5">
            <ActionMenu item={item} onEdit={onEdit} onDelete={onDelete} />
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 relative">
              {item.image && (item.image.startsWith("http") || item.image.startsWith("blob:") || item.image.startsWith("data:")) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
              )}
            </div>
            <div>
              <p className="text-base font-extrabold text-[var(--color-text)]">{item.name}</p>
              <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-gray-300" /> {item.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <StatusDropdown
              status={item.status}
              onStatusChange={(newStatus) => onStatusChange(item, newStatus)}
            />
            <div className="px-4 py-1.5 rounded-full bg-[#F3F4F6] text-gray-500 text-[11px] font-bold">
              {item.category}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-6 pt-5 border-t border-gray-50 ">
            <div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-1">Price</p>
                <p className="text-xs font-bold text-[var(--color-text)]">{item.priceLabel ?? formatListingPrice(item.category, item.price)}</p>
             </div>
             <div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-1">Bookings</p>
                <p className="text-xs font-bold text-[var(--color-text)]">{item.bookings}</p>
             </div>
             <div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-1">Availability</p>
                <p className="text-xs font-bold text-[var(--color-text)]">{item.date} — {item.time}</p>
             </div>
             <div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-1">Rating</p>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--color-text)]">
                   <StarIcon /> {item.rating} <span className="text-gray-300 font-medium font-bold">({item.reviews})</span>
                </div>
             </div>
          </div>
        </div>
      ))}

      <div className="py-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
