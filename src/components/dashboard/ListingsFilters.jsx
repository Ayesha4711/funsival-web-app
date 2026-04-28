"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const SearchIcon = () =>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>;

const FilterIcon = () =>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </svg>;

const TableIcon = () =>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="9" x2="9" y2="21" />
  </svg>;

const GridIcon = () =>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>;

const PlusIcon = () =>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>;

const ChevronDown = () =>
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>;

const CATEGORIES = ["All Categories", "Equipment", "Service", "Place"];

export default function ListingsFilters({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  tabCounts = { active: 0, inactive: 0, draft: 0 },
  hasDraft = false,
}) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const searchRef = useRef(null);
  const categoryRef = useRef(null);

  const tabs = [
    { id: "all", label: "All" },
    { id: "active", label: tabCounts.active > 0 ? `Active (${tabCounts.active})` : "Active" },
    { id: "inactive", label: tabCounts.inactive > 0 ? `Inactive (${tabCounts.inactive})` : "Inactive" },
    { id: "draft", label: tabCounts.draft > 0 ? `Draft (${tabCounts.draft})` : "Draft" },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus input when search expands
  useEffect(
    () => {
      if (searchOpen && searchRef.current) searchRef.current.focus();
    },
    [searchOpen]
  );

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Header Row — wraps on mobile */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[var(--color-text)]">Listings</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* View mode toggle — hidden on mobile (card view forced) */}
          <div className="hidden sm:flex items-center gap-1 bg-[#EDF6F6] p-1 rounded-xl">
            <button
              onClick={() => onViewModeChange("table")}
              className={`p-2 rounded-lg transition-all ${viewMode === "table"
                ? "bg-white text-[var(--color-primary)]"
                : "text-gray-400 hover:text-gray-600"}`}
              title="Table view"
            >
              <TableIcon />
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid"
                ? "bg-white text-[var(--color-primary)]"
                : "text-gray-400 hover:text-gray-600"}`}
              title="Grid view"
            >
              <GridIcon />
            </button>
          </div>

          <button
            onClick={() => router.push("/dashboard/listings/add?mode=new")}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white rounded-full text-xs sm:text-sm font-bold transition-colors"
          >
            <PlusIcon />
            <span>Add New Listing</span>
          </button>

          {hasDraft && (
            <button
              onClick={() => router.push("/dashboard/listings/add?mode=resume")}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white border border-[var(--color-primary)] text-[var(--color-primary)] rounded-full text-xs sm:text-sm font-bold transition-colors hover:bg-[var(--color-primary-light)]"
            >
              <span>Resume Draft</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs + Filters Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Tabs — scrollable on mobile */}
        <div className="flex p-1 bg-[#EDF6F6] rounded-full w-fit max-w-full overflow-x-auto">
          {tabs.map(tab =>
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 sm:px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                ? "bg-white text-[var(--color-primary)] font-extrabold"
                : "text-gray-400 hover:text-[var(--color-text-muted)]"}`}
            >
              {tab.label}
            </button>
          )}
        </div>

        {/* Right filters */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search — expands on click */}
          <div className="relative flex items-center">
            {searchOpen
              ? <div className="flex items-center gap-2 pl-3 pr-1 h-9 sm:h-10 bg-[#EDF6F6] rounded-full border border-[var(--color-primary)] transition-all">
                  <SearchIcon />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="Search listings..."
                    className="w-32 sm:w-44 bg-transparent text-xs font-medium text-[var(--color-text)] placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    onClick={() => { setSearchOpen(false); onSearchChange(""); }}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              : <button
                  onClick={() => setSearchOpen(true)}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-[#EDF6F6] rounded-full flex items-center justify-center text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                >
                  <SearchIcon />
                </button>}
          </div>

          {/* Category dropdown */}
          <div className="relative" ref={categoryRef}>
            <button
              onClick={() => setCategoryOpen(o => !o)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-9 sm:h-10 bg-[#EDF6F6] rounded-full text-xs font-bold text-gray-500 min-w-max hover:text-[var(--color-primary)] transition-colors"
            >
              <FilterIcon />
              <span className="hidden sm:inline">{category}</span>
              <ChevronDown />
            </button>
            {categoryOpen &&
              <div className="absolute right-0 top-12 z-20 bg-white rounded-2xl border border-[var(--color-border)] py-2 min-w-[160px]">
                {CATEGORIES.map(cat =>
                  <button
                    key={cat}
                    onClick={() => { onCategoryChange(cat); setCategoryOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] ${category === cat
                      ? "text-[var(--color-primary)] bg-[var(--color-primary-light)]"
                      : "text-gray-500"}`}
                  >
                    {cat}
                  </button>
                )}
              </div>}
          </div>
        </div>
      </div>
    </div>
  );
}
