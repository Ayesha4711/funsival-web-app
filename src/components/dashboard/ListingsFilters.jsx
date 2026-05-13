"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </svg>
);

const TableIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="9" x2="9" y2="21" />
  </svg>
);

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className={`transition-transform ${open ? "rotate-180" : ""}`}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CATEGORIES = ["All Categories", "Equipment", "Activity", "Place"];
const QUICK_CATEGORIES = ["All", "Activities", "Equipment", "Places"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-asc", label: "Price: Low→High" },
  { value: "price-desc", label: "Price: High→Low" },
];
const MAX_PRICE = 5000;

export const DEFAULT_FILTERS = {
  priceType: "Hourly",
  minPrice: 0,
  maxPrice: MAX_PRICE,
  city: "",
  sort: "",
  category: "All Categories",
};

/* ── Price range slider ───────────────────────────────────────────────────── */
function PriceSlider({ min, max, onMinChange, onMaxChange }) {
  const minPct = (min / MAX_PRICE) * 100;
  const maxPct = (max / MAX_PRICE) * 100;

  return (
    <div className="px-1">
      <div className="flex justify-between text-[10px] text-gray-400 mb-2">
        <span>$0</span><span>${MAX_PRICE.toLocaleString()}</span>
      </div>
      <div className="relative h-1.5 bg-gray-200 rounded-full mb-5">
        <div className="absolute h-full bg-[var(--color-secondary)] rounded-full" style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
        <input type="range" min={0} max={MAX_PRICE} step={10} value={min}
          onChange={(e) => onMinChange(Math.min(Number(e.target.value), max - 10))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: min > MAX_PRICE - 100 ? 5 : 3 }}
        />
        <input type="range" min={0} max={MAX_PRICE} step={10} value={max}
          onChange={(e) => onMaxChange(Math.max(Number(e.target.value), min + 10))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
        />
        <div className="absolute w-4 h-4 bg-gray-900 rounded-full -top-1.5 -translate-x-1/2 pointer-events-none" style={{ left: `${minPct}%` }} />
        <div className="absolute w-4 h-4 bg-gray-900 rounded-full -top-1.5 -translate-x-1/2 pointer-events-none" style={{ left: `${maxPct}%` }} />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <p className="text-[10px] text-gray-400 mb-1">Minimum</p>
          <div className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-2">
            <span className="text-sm text-gray-400">$</span>
            <input type="number" min={0} max={max - 10} value={min}
              onChange={(e) => onMinChange(Math.min(Number(e.target.value), max - 10))}
              className="flex-1 w-full text-sm font-medium text-gray-800 focus:outline-none bg-transparent" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-gray-400 mb-1">Maximum</p>
          <div className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-2">
            <span className="text-sm text-gray-400">$</span>
            <input type="number" min={min + 10} max={MAX_PRICE} value={max}
              onChange={(e) => onMaxChange(Math.max(Number(e.target.value), min + 10))}
              className="flex-1 w-full text-sm font-medium text-gray-800 focus:outline-none bg-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Collapsible section ──────────────────────────────────────────────────── */
function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-sm font-bold text-gray-800">
        {title}<ChevronIcon open={open} />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

/* ── Filter drawer ────────────────────────────────────────────────────────── */
function FilterDrawer({ open, onClose, filters, onApply }) {
  const [local, setLocal] = useState({ ...DEFAULT_FILTERS, ...filters });

  useEffect(() => { setLocal({ ...DEFAULT_FILTERS, ...filters }); }, [filters, open]);

  const set = (key, val) => setLocal(prev => ({ ...prev, [key]: val }));

  const handleApply = () => { onApply(local); onClose(); };
  const handleReset = () => { onApply(DEFAULT_FILTERS); onClose(); };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[var(--color-secondary)]">
          <span className="text-base font-bold text-gray-900">Filters</span>
          <button type="button" onClick={onClose} className="text-gray-700 hover:text-gray-900">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5">
          {/* Price */}
          <Section title="Price" defaultOpen>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-4">
              {["Hourly", "Daily", "Per Person"].map(pt => (
                <button key={pt} type="button" onClick={() => set("priceType", pt)}
                  className={`flex-1 py-2 text-xs font-bold transition-colors ${local.priceType === pt ? "bg-[var(--color-secondary)] text-gray-900" : "text-gray-400 hover:bg-gray-50"}`}>
                  {pt}
                </button>
              ))}
            </div>
            <PriceSlider
              min={local.minPrice} max={local.maxPrice}
              onMinChange={v => set("minPrice", v)}
              onMaxChange={v => set("maxPrice", v)}
            />
          </Section>

          {/* City */}
          <Section title="City" defaultOpen>
            <input type="text" placeholder="Enter city name" value={local.city}
              onChange={e => set("city", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20"
            />
          </Section>

          {/* Sort By */}
          <Section title="Sort By" defaultOpen>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => set("sort", local.sort === opt.value ? "" : opt.value)}
                  className={`py-2.5 rounded-xl border text-xs font-semibold transition-colors ${local.sort === opt.value ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Category */}
          <Section title="Category">
            <div className="flex flex-col gap-1">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => set("category", cat)}
                  className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${local.category === cat ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]" : "text-gray-600 hover:bg-gray-50"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button type="button" onClick={handleReset}
            className="flex-1 py-3 rounded-full border-2 border-[var(--color-secondary)] text-sm font-bold text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 transition-colors">
            Reset Filter
          </button>
          <button type="button" onClick={handleApply}
            className="flex-1 py-3 rounded-full bg-[var(--color-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity">
            Show Results
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Main export ──────────────────────────────────────────────────────────── */
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
  filters = DEFAULT_FILTERS,
  onFiltersChange,
}) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catDropOpen, setCatDropOpen] = useState(false);
  const [quickCat, setQuickCat] = useState("All");
  const catDropRef = useRef(null);
  const searchRef = useRef(null);

  const tabs = [
    { id: "all", label: "All" },
    { id: "active", label: tabCounts.active > 0 ? `Active (${tabCounts.active})` : "Active" },
    { id: "inactive", label: tabCounts.inactive > 0 ? `Inactive (${tabCounts.inactive})` : "Inactive" },
    { id: "draft", label: tabCounts.draft > 0 ? `Draft (${tabCounts.draft})` : "Draft" },
  ];

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!filters.category || filters.category === "All Categories") {
      setQuickCat("All");
    } else if (filters.category === "Activity") {
      setQuickCat("Activities");
    } else if (filters.category === "Place") {
      setQuickCat("Places");
    } else {
      setQuickCat(filters.category);
    }
  }, [filters.category]);

  useEffect(() => {
    function handleOutside(e) {
      if (catDropRef.current && !catDropRef.current.contains(e.target)) setCatDropOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const activeFilterCount = [
    filters.city && filters.city.trim(),
    filters.sort,
    filters.category && filters.category !== "All Categories",
    filters.minPrice > 0,
    filters.maxPrice < MAX_PRICE,
  ].filter(Boolean).length;

  return (
    <>
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onApply={(f) => {
          onFiltersChange(f);
          if (f.category !== category) onCategoryChange(f.category);
          if (f.category === "All Categories") setQuickCat("All");
        }}
      />

      <div className="flex flex-col gap-4 mb-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-[var(--color-text)]">Listings</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1 bg-[#EDF6F6] p-1 rounded-xl">
              <button onClick={() => onViewModeChange("table")}
                className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-[var(--color-primary)]" : "text-gray-400 hover:text-gray-600"}`} title="Table view">
                <TableIcon />
              </button>
              <button onClick={() => onViewModeChange("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-[var(--color-primary)]" : "text-gray-400 hover:text-gray-600"}`} title="Grid view">
                <GridIcon />
              </button>
            </div>
            <button onClick={() => router.push("/dashboard/listings/add?mode=new")}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-[var(--color-secondary)] hover:opacity-90 rounded-full transition-opacity text-sm font-semibold text-[#4A4A4A]">
              <PlusIcon /><span>Add New Listing</span>
            </button>
          </div>
        </div>

        {/* Tabs + search + filter button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex p-1 bg-[#EDF6F6] rounded-full w-fit max-w-full overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => onTabChange(tab.id)}
                className={`px-3 sm:px-5 py-2 rounded-full transition-all whitespace-nowrap font-semibold text-sm ${activeTab === tab.id ? "bg-white text-[var(--color-primary)]" : "text-gray-400 hover:text-[var(--color-text-muted)]"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative flex items-center">
              {searchOpen ? (
                <div className="flex items-center gap-2 pl-3 pr-1 h-9 sm:h-10 bg-[#EDF6F6] rounded-full border border-[var(--color-primary)]">
                  <SearchIcon />
                  <input ref={searchRef} type="text" value={search} onChange={e => onSearchChange(e.target.value)}
                    placeholder="Search listings..."
                    className="w-32 sm:w-44 bg-transparent text-xs font-medium text-[var(--color-text)] placeholder-gray-400 focus:outline-none" />
                  <button onClick={() => { setSearchOpen(false); onSearchChange(""); }} className="p-1.5 text-gray-400 hover:text-gray-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button onClick={() => setSearchOpen(true)}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-[#EDF6F6] rounded-full flex items-center justify-center text-gray-400 hover:text-[var(--color-primary)] transition-colors">
                  <SearchIcon />
                </button>
              )}
            </div>

            {/* Category dropdown */}
            <div className="relative" ref={catDropRef}>
              <button
                onClick={() => setCatDropOpen(o => !o)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-9 sm:h-10 bg-[#EDF6F6] rounded-full hover:text-[var(--color-primary)] transition-colors text-sm font-medium text-[#4A4A4A]"
              >
                <FilterIcon />
                <span className="hidden sm:inline">{quickCat === "All" ? "All Categories" : quickCat}</span>
                <ChevronIcon open={catDropOpen} />
              </button>
              {catDropOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 z-50 min-w-[140px]">
                  {QUICK_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setQuickCat(cat);
                        setCatDropOpen(false);
                        const mapped = cat === "All" ? "All Categories" : cat === "Activities" ? "Activity" : cat === "Places" ? "Place" : cat;
                        onCategoryChange(mapped);
                        onFiltersChange({ ...filters, category: mapped });
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors ${quickCat === cat ? "text-[var(--color-primary)] bg-[var(--color-primary-light)]" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
