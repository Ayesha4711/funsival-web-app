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

export default function ListingsCards({ data }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Active": return "bg-green-50 text-green-500 border-green-100";
      case "Inactive": return "bg-red-50 text-red-500 border-red-100";
      case "Draft": return "bg-orange-50 text-orange-400 border-orange-100";
      default: return "bg-gray-100 text-gray-400";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {data.map((item) => (
        <div key={item.id} className="bg-white rounded-[32px] p-5 shadow-sm border border-[var(--color-border)] relative">
          <div className="absolute top-5 right-5 text-gray-300">
            <MoreIcon />
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 relative">
              <Image src={heroImg} alt={item.name} fill className="object-cover" />
            </div>
            <div>
              <p className="text-base font-extrabold text-[var(--color-text)]">{item.name}</p>
              <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-gray-300" /> {item.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className={`px-4 py-1.5 rounded-full border text-[11px] font-bold ${getStatusStyle(item.status)}`}>
               {item.status}
            </div>
            <div className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold">
               {item.category}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-6 pt-5 border-t border-gray-50">
             <div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-1">Price</p>
                <p className="text-xs font-bold text-[var(--color-text)]">{item.price}</p>
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

      {/* Pagination */}
      <div className="py-4 flex items-center justify-center gap-2">
        <button className="text-xs text-gray-400 flex items-center mr-2">‹ Previous</button>
        <div className="flex items-center gap-1 mx-2">
            {[1, 2, 3].map((p) => (
               <button key={p} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${p === 2 ? 'bg-[var(--color-primary)] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
                  {p}
               </button>
            ))}
        </div>
        <button className="text-xs text-gray-400 flex items-center ml-2">Next ›</button>
      </div>
    </div>
  );
}
