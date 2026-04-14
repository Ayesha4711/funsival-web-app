"use client";

import React from "react";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function ReservationFilters({ activeTab, onTabChange }) {
  const tabs = [
    { id: "all", label: "All" },
    { id: "upcoming", label: "Upcoming (2)" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled (2)" },
  ];

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Header with Title and Export */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--color-text)]">Reservations</h1>
        <button className="flex items-center gap-2 px-4 py-2 border border-[var(--color-secondary)] text-[var(--color-secondary)] rounded-full text-sm font-semibold hover:bg-[var(--color-secondary-light)] transition-colors">
          <ExportIcon />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Tabs and Search Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center p-1 bg-gray-100 rounded-full w-fit overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-[var(--color-primary)] shadow-sm font-extrabold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Date */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 lg:w-10 h-10 lg:w-48">
             <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
               <SearchIcon />
             </div>
             {/* Simple search container for now */}
             <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center lg:hidden">
               <SearchIcon />
             </div>
             <input 
               type="text" 
               placeholder="Search..." 
               className="hidden lg:block w-full h-full pl-4 pr-10 bg-gray-100 rounded-full text-sm focus:outline-none"
             />
          </div>
          <div className="relative h-10 flex-1 lg:w-36">
            <input 
              type="text" 
              placeholder="mm/dd/yy" 
              className="w-full h-full pl-4 pr-10 bg-gray-100 rounded-full text-sm focus:outline-none"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
              <CalendarIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
