"use client";

import React, { useState, useRef, useEffect } from "react";
import CustomCalendar from "@/components/shared/CustomCalendar";

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/* ─── Component ──────────────────────────────────────────────────────────────── */
export default function ReservationFilters({ activeTab, onTabChange }) {
  const tabs = [
    { id: "all",       label: "All" },
    { id: "upcoming",  label: "Upcoming (2)" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled (2)" },
  ];

  const [searchOpen, setSearchOpen]   = useState(false);
  const [search, setSearch]           = useState("");
  const [calOpen, setCalOpen]         = useState(false);
  const [dateValue, setDateValue]     = useState("");

  const calRef    = useRef(null);
  const searchRef = useRef(null);

  /* close calendar on outside click */
  useEffect(() => {
    function handle(e) {
      if (calRef.current && !calRef.current.contains(e.target)) setCalOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  /* focus search input when expanded */
  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const clearDate = (e) => {
    e.stopPropagation();
    setDateValue("");
    setCalOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--color-text)]">Reservations</h1>
        <button className="flex items-center gap-2 px-4 py-2 border border-[var(--color-secondary)] text-[var(--color-secondary)] rounded-full text-sm font-semibold hover:bg-[var(--color-secondary-light)] transition-colors">
          <ExportIcon />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Tabs + filters row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center p-1 bg-gray-100 rounded-full w-fit overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-[var(--color-primary)] shadow-sm font-extrabold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + Calendar */}
        <div className="flex items-center gap-3">

          {/* Search — expands on click */}
          <div className="relative flex items-center">
            {searchOpen ? (
              <div className="flex items-center gap-2 pl-3 pr-1 h-10 bg-[#F3F4F6] rounded-full border border-[var(--color-primary)] transition-all">
                <SearchIcon />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-36 bg-transparent text-xs font-medium text-[var(--color-text)] placeholder-gray-400 focus:outline-none"
                />
                <button
                  onClick={() => { setSearchOpen(false); setSearch(""); }}
                  className="p-1.5 text-gray-400 hover:text-gray-600"
                >
                  <CloseIcon />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 bg-[#F3F4F6] rounded-full flex items-center justify-center text-gray-400 hover:text-[var(--color-primary)] transition-colors"
              >
                <SearchIcon />
              </button>
            )}
          </div>

          {/* Calendar picker */}
          <div className="relative" ref={calRef}>
            {/* Trigger input */}
            <button
              onClick={() => setCalOpen((v) => !v)}
              className={`flex items-center gap-2 h-10 px-4 bg-[#F3F4F6] rounded-full text-xs font-medium transition-colors min-w-[130px] ${
                calOpen
                  ? "border border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className={`flex-1 text-left ${dateValue ? "text-gray-800 font-semibold" : ""}`}>
                {dateValue || "mm/dd/yy"}
              </span>
              {dateValue ? (
                <span onClick={clearDate} className="cursor-pointer text-gray-400 hover:text-red-400 transition-colors">
                  <CloseIcon />
                </span>
              ) : (
                <CalendarIcon />
              )}
            </button>

            {/* Calendar dropdown — smart position */}
            {calOpen && (
              <div className="
                absolute z-50 mt-2
                right-0
                sm:right-0
              ">
                {/* On very small screens, center it relative to viewport */}
                <div className="
                  max-sm:fixed max-sm:left-1/2 max-sm:-translate-x-1/2
                  max-sm:top-auto max-sm:bottom-4
                  sm:relative sm:left-auto sm:translate-x-0 sm:top-auto sm:bottom-auto
                ">
                  <CustomCalendar
                    value={dateValue}
                    onChange={(v) => { setDateValue(v); setCalOpen(false); }}
                    onClose={() => setCalOpen(false)}
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
