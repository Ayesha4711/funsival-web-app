"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import heroImg from "@/assets/images/HeroImg.jpg";
import Pagination from "@/components/shared/Pagination";

const LocationIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);

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
  Active:   { pill: "bg-green-50 text-green-500 border-green-100",   dot: "bg-green-400" },
  Inactive: { pill: "bg-red-50 text-red-400 border-red-100",         dot: "bg-red-400" },
  Draft:    { pill: "bg-orange-50 text-orange-400 border-orange-100", dot: "bg-orange-400" },
};

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const MOCK_SLOTS = [
  { date: "Sep 24, 2025", time: "9:30 to 10:30" },
  { date: "Sep 24, 2025", time: "9:30 to 10:30" },
  { date: "Sep 24, 2025", time: "9:30 to 10:30" },
  { date: "Sep 24, 2025", time: "9:30 to 10:30" },
  { date: "Sep 24, 2025", time: "9:30 to 10:30" },
  { date: "Sep 24, 2025", time: "9:30 to 10:30" },
  { date: "Sep 24, 2025", time: "9:30 to 10:30" },
  { date: "Sep 24, 2025", time: "9:30 to 10:30" },
];

function SlotsPopover({ slots = MOCK_SLOTS }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F3F4F6] border border-gray-200 rounded-lg text-xs font-bold text-[var(--color-text)] w-fit hover:border-[var(--color-primary)] transition-colors"
      >
        <CalendarIcon />
        <span>{slots.length} slots</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-10 z-40 bg-white rounded-2xl shadow-xl border border-gray-100 w-52 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs font-bold text-[var(--color-text)]">Availability</p>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {slots.map((slot, i) => (
              <div key={i} className="px-4 py-2.5">
                <p className="text-xs font-bold text-[var(--color-text)]">{slot.date}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{slot.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold whitespace-nowrap transition-colors ${styles.pill}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
        {status}
        <ChevronDown />
      </button>

      {open && (
        <div className="absolute left-0 top-9 z-30 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[110px]">
          {STATUS_OPTIONS.map((opt) => {
            const s = STATUS_STYLES[opt];
            return (
              <button
                key={opt}
                onClick={() => { onStatusChange(opt); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold transition-colors hover:bg-gray-50 ${
                  opt === status ? "opacity-100" : "opacity-70"
                }`}
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

export default function ListingsTable({ data, onStatusChange }) {
  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-[#F3F4F6] text-[10px] uppercase font-extrabold text-[#111827]">
              <th className="px-6 py-4">Activity</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Bookings</th>
              <th className="px-6 py-4 whitespace-nowrap">Availability</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-400 font-medium">
                  No listings found.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="text-[11px] font-bold text-[var(--color-text)] hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative">
                        <Image src={heroImg} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-extrabold mb-0.5">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                          <LocationIcon /> {item.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-[#F3F4F6] px-3 py-1 rounded-full text-gray-500">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.price}</td>
                  <td className="px-6 py-4">{item.bookings}</td>
                  <td className="px-6 py-4 min-w-[140px]">
                    <SlotsPopover slots={item.slots || MOCK_SLOTS} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-extrabold">
                    <div className="flex items-center gap-1.5">
                      <StarIcon /> {item.rating} <span className="text-gray-400 font-medium">({item.reviews})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusDropdown
                      status={item.status}
                      onStatusChange={(newStatus) => onStatusChange(item.id, newStatus)}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-gray-300 hover:text-gray-600 transition-colors">
                      <MoreIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-50">
        <Pagination currentPage={1} totalPages={10} onPageChange={() => {}} />
      </div>
    </div>
  );
}
