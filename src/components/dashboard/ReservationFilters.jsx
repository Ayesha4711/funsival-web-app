"use client";

import React, { useState, useRef, useEffect } from "react";
import CustomCalendar from "@/components/shared/CustomCalendar";
import { SearchIcon, CalendarIcon, CloseIcon, ExportIcon } from "@/icons";

/* ─── Component ──────────────────────────────────────────────────────────────── */
export default function ReservationFilters({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  dateValue,
  onDateChange,
  onExportCSV,
  counts = {},
}) {
  const tabs = [
    { id: "all",       label: "All" },
    { id: "upcoming",  label: "Upcoming" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const [searchOpen, setSearchOpen] = useState(false);
  const [calOpen, setCalOpen]       = useState(false);

  const calRef    = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (calRef.current && !calRef.current.contains(e.target)) setCalOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const clearDate = (e) => {
    e.stopPropagation();
    onDateChange("");
    setCalOpen(false);
  };

  return (
    <div className="flex flex-col gap-0">
      {/* ── Row 1: Title + Export CSV ── */}
      <div className="flex items-center justify-between pb-4">
        <h1
          style={{
            fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif",
            fontWeight: 600,
            fontSize: 20,
            lineHeight: "100%",
            letterSpacing: 0,
            color: "var(--color-text)",
          }}
        >
          Reservations
        </h1>
       

        <button
  onClick={onExportCSV}
  style={{
    fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif",
    fontWeight: 600,
    backgroundColor: "rgba(255, 114, 1, 0.1)" // light bg
  }}
  className="flex items-center gap-2 px-5 py-2 border border-[#FF7201] text-[#FF7201] rounded-full text-sm hover:bg-[#FF7201]/20 transition-colors"
>
  <ExportIcon />
  <span>Export CSV</span>
</button>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-border mb-4" />

      {/* ── Row 2: Tabs + Search + Calendar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center p-1 bg-[#EDF6F6] rounded-full overflow-x-auto no-scrollbar w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-pressed={activeTab === tab.id}
              style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}
              className={`px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none ${
                activeTab === tab.id
                  ? "bg-white text-[var(--color-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {tab.id === "all" || !counts[tab.id] ? tab.label : `${tab.label} (${counts[tab.id]})`}
            </button>
          ))}
        </div>

        {/* Search + Calendar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search — expands on click */}
          <div className="relative flex items-center">
            {searchOpen ? (
              <div className="flex items-center gap-2 pl-3 pr-1 h-10 bg-[#EDF6F6] rounded-full border border-[var(--color-primary)] transition-all">
                <SearchIcon />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search..."
                  aria-label="Search reservations"
                  style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}
                  className="w-28 sm:w-36 bg-transparent text-xs font-medium text-[var(--color-text)] placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); onSearchChange(""); }}
                  aria-label="Clear search"
                  className="p-1.5 text-gray-400 hover:text-gray-600"
                >
                  <CloseIcon />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="w-10 h-10 bg-[#EDF6F6] rounded-full flex items-center justify-center text-[#1d8c82] hover:opacity-80 transition-opacity"
              >
                <SearchIcon />
              </button>
            )}
          </div>

          {/* Calendar picker */}
          <div className="relative" ref={calRef}>
            <button
              type="button"
              onClick={() => setCalOpen((v) => !v)}
              aria-label={dateValue ? `Date filter: ${dateValue}` : "Filter by date"}
              style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}
              className={`flex items-center gap-2 h-10 px-3 sm:px-4 bg-[#EDF6F6] rounded-full text-xs font-medium transition-colors min-w-[110px] sm:min-w-[130px] ${
                calOpen
                  ? "border border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className={`flex-1 text-left ${dateValue ? "text-gray-800 font-semibold" : ""}`}>
                {dateValue || "mm/dd/yy"}
              </span>
              {dateValue ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={clearDate}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") clearDate(e); }}
                  aria-label="Clear date filter"
                  className="cursor-pointer text-gray-400 hover:text-red-400 transition-colors"
                >
                  <CloseIcon />
                </span>
              ) : (
                <CalendarIcon />
              )}
            </button>

            {calOpen && (
              <div className="absolute z-50 mt-2 right-0">
                <CustomCalendar
                  value={dateValue}
                  onChange={(v) => { onDateChange(v); setCalOpen(false); }}
                  onClose={() => setCalOpen(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Divider below filters row ── */}
      <div className="h-px bg-border mt-4" />
    </div>
  );
}
