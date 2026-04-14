"use client";

import React from "react";
import Image from "next/image";
import heroImg from "@/assets/images/HeroImg.jpg";

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

export default function ReservationTable({ data }) {
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
                  <button className="text-gray-400 hover:text-[var(--color-text)] transition-colors">
                    <MoreIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Container (Simple Placeholder) */}
      <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-center gap-2">
        <button className="text-xs text-gray-500 hover:text-[var(--color-text)]">Previous</button>
        <div className="flex gap-1 mx-4">
          {[1, 2, 3, 4, 5].map((p) => (
            <button key={p} className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${p === 1 ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'text-gray-400 hover:bg-gray-100'}`}>
              {p}
            </button>
          ))}
        </div>
        <button className="text-xs text-gray-500 hover:text-[var(--color-text)]">Next</button>
      </div>
    </div>
  );
}
