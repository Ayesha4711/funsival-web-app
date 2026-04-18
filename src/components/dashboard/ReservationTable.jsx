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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const RefundIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="absolute right-0 top-8 z-30 bg-white border border-gray-200 rounded-2xl shadow-lg py-1.5 min-w-[140px]">
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

/* ─── Table ──────────────────────────────────────────────────────────────────── */
export default function ReservationTable({ data, onViewDetails, onCancel }) {
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
      case "Paid": return "text-green-500";
      case "Overdue": return "text-orange-500";
      case "Refunded": return "text-red-400";
      default: return "text-gray-500";
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
    <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-6 py-4 text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">Reservation</th>
              <th className="px-6 py-4 text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-4 text-xs font-bold text-[var(--color-text)] uppercase tracking-wider whitespace-nowrap">Reserved By</th>
              <th className="px-6 py-4 text-xs font-bold text-[var(--color-text)] uppercase tracking-wider whitespace-nowrap">Date & Time</th>
              <th className="px-6 py-4 text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative">
                      <Image src={heroImg} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--color-text)] whitespace-nowrap">{item.name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-gray-300" /> {item.location}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-[var(--color-text)] bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${getInvoiceStyle(item.invoice)}`}>
                    {getInvoiceIcon(item.invoice)}
                    <span>{item.invoice}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-[var(--color-text)] whitespace-nowrap">
                  {item.reservedBy}
                </td>
                <td className="px-6 py-4 text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                  <div className="font-medium text-[var(--color-text)] mb-0.5">{item.date}</div>
                  <div className="text-[10px]">{item.time}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${getStatusStyle(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <ActionMenu item={item} onViewDetails={onViewDetails} onCancel={onCancel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-[var(--color-border)]">
        <Pagination currentPage={1} totalPages={10} onPageChange={() => {}} />
      </div>
    </div>
  );
}
