"use client";

import React from "react";
import Image from "next/image";
import heroImg from "@/assets/images/HeroImg.jpg";

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

export default function ListingsTable({ data }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Active": return "bg-green-50 text-green-500 border-green-100";
      case "Inactive": return "bg-red-50 text-red-500 border-red-100 italic";
      case "Draft": return "bg-orange-50 text-orange-400 border-orange-100";
      default: return "bg-gray-100 text-gray-400";
    }
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-[var(--color-border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[10px] uppercase font-extrabold text-[#111827]">
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
            {data.map((item) => (
              <tr key={item.id} className="text-[11px] font-bold text-[var(--color-text)] hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative">
                      <Image src={heroImg} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-extrabold mb-0.5">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-gray-300" /> {item.location}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-500">{item.category}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{item.price}</td>
                <td className="px-6 py-4">{item.bookings}</td>
                <td className="px-6 py-4 min-w-[124px]">
                   {item.status === "Draft" ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-[var(--color-text)] w-fit">
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                         <span>8 slots</span>
                         <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                   ) : (
                      <>
                        <p className="mb-0.5">{item.date || "N/A"}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{item.time || "N/A"}</p>
                      </>
                   )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-extrabold">
                  <div className="flex items-center gap-1.5">
                    <StarIcon /> {item.rating} <span className="text-gray-400 font-medium">({item.reviews})</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] whitespace-nowrap font-bold ${getStatusStyle(item.status)}`}>
                    {item.status}
                    {item.status === "Inactive" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="text-gray-300 hover:text-gray-600 transition-colors">
                    <MoreIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Container */}
      <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-center gap-2">
        <button className="text-[11px] text-gray-400 flex items-center hover:text-[var(--color-primary)]">‹ Previous</button>
        <div className="flex items-center gap-1 mx-4">
          {[1, 2, 3].map((p) => (
            <button key={p} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${p === 2 ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary-light)]' : 'text-gray-400 hover:bg-gray-50'}`}>
              {p}
            </button>
          ))}
        </div>
        <button className="text-[11px] text-gray-400 flex items-center hover:text-[var(--color-primary)]">Next ›</button>
      </div>
    </div>
  );
}
