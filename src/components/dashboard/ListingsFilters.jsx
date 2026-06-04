"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, FilterIcon, TableIcon, GridIcon, PlusIcon, ChevronDownIcon, CloseIcon } from "@/icons";
import FilterDrawer from "./listings/FilterDrawer";

export const MAX_PRICE = 5000;

export const DEFAULT_FILTERS = {
  priceType: "Hourly",
  minPrice:  0,
  maxPrice:  MAX_PRICE,
  city:      "",
  sort:      "",
  category:  "All Categories",
};

const QUICK_CATEGORIES = ["All", "Activities", "Equipment", "Places"];

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
  filters = DEFAULT_FILTERS,
  onFiltersChange,
}) {
  const router      = useRouter();
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [catDropOpen, setCatDropOpen] = useState(false);
  const [quickCat,    setQuickCat]    = useState("All");
  const catDropRef = useRef(null);
  const searchRef  = useRef(null);

  const tabs = [
    { id: "all",      label: "All" },
    { id: "active",   label: tabCounts.active   > 0 ? `Active (${tabCounts.active})`     : "Active"   },
    { id: "inactive", label: tabCounts.inactive > 0 ? `Inactive (${tabCounts.inactive})` : "Inactive" },
    { id: "draft",    label: tabCounts.draft    > 0 ? `Draft (${tabCounts.draft})`        : "Draft"    },
  ];

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!filters.category || filters.category === "All Categories") setQuickCat("All");
    else if (filters.category === "Activity") setQuickCat("Activities");
    else if (filters.category === "Place")    setQuickCat("Places");
    else setQuickCat(filters.category);
  }, [filters.category]);

  useEffect(() => {
    function handleOutside(e) {
      if (catDropRef.current && !catDropRef.current.contains(e.target)) setCatDropOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

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

      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-text">Listings</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1 bg-[#EDF6F6] p-1 rounded-xl">
              <button
                onClick={() => onViewModeChange("table")}
                className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-primary" : "text-gray-400 hover:text-gray-600"}`}
                title="Table view"
              >
                <TableIcon />
              </button>
              <button
                onClick={() => onViewModeChange("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-primary" : "text-gray-400 hover:text-gray-600"}`}
                title="Grid view"
              >
                <GridIcon />
              </button>
            </div>
            <button
              onClick={() => router.push("/dashboard/listings/add?mode=new")}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-secondary hover:opacity-90 rounded-full transition-opacity text-sm font-semibold text-[#4A4A4A]"
            >
              <PlusIcon /><span>Add New Listing</span>
            </button>
          </div>
        </div>

        {/* Tabs + search + filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex p-1 bg-[#EDF6F6] rounded-full w-fit max-w-full overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 sm:px-5 py-2 rounded-full transition-all whitespace-nowrap font-semibold text-sm ${
                  activeTab === tab.id
                    ? "bg-white text-primary"
                    : "text-gray-400 hover:text-text-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative flex items-center">
              {searchOpen ? (
                <div className="flex items-center gap-2 pl-3 pr-1 h-9 sm:h-10 bg-[#EDF6F6] rounded-full border border-primary">
                  <SearchIcon />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search listings..."
                    className="w-32 sm:w-44 bg-transparent text-xs font-medium text-text placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    onClick={() => { setSearchOpen(false); onSearchChange(""); }}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <CloseIcon size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-[#EDF6F6] rounded-full flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                >
                  <SearchIcon />
                </button>
              )}
            </div>

            {/* Category dropdown */}
            <div className="relative" ref={catDropRef}>
              <button
                onClick={() => setCatDropOpen((o) => !o)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-9 sm:h-10 bg-[#EDF6F6] rounded-full hover:text-primary transition-colors text-sm font-medium text-[#4A4A4A]"
              >
                <FilterIcon />
                <span className="hidden sm:inline">
                  {quickCat === "All" ? "All Categories" : quickCat}
                </span>
                <ChevronDownIcon size={14} className={`transition-transform ${catDropOpen ? "rotate-180" : ""}`} />
              </button>
              {catDropOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 z-50 min-w-35">
                  {QUICK_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setQuickCat(cat);
                        setCatDropOpen(false);
                        const mapped =
                          cat === "All"        ? "All Categories" :
                          cat === "Activities" ? "Activity" :
                          cat === "Places"     ? "Place" : cat;
                        onCategoryChange(mapped);
                        onFiltersChange({ ...filters, category: mapped });
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                        quickCat === cat
                          ? "text-primary bg-primary-light"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
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
