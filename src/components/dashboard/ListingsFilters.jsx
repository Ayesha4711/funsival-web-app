"use client";

import React from "react";
import { useRouter } from "next/navigation";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </svg>
);

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function ListingsFilters({ activeTab, onTabChange }) {
  const router = useRouter();
  const tabs = [
    { id: "all", label: "All" },
    { id: "active", label: "Active (12)" },
    { id: "inactive", label: "Inactive (2)" },
    { id: "draft", label: "Draft (2)" },
  ];

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--color-text)]">Listings</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
             <button className="p-2 text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded-lg">
               <GridIcon />
             </button>
             <button className="p-2 text-gray-400 hover:text-[var(--color-primary)] rounded-lg">
               <ListIcon />
             </button>
          </div>
          <button
            onClick={() => router.push("/dashboard/listings/add")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white rounded-full text-sm font-bold shadow-sm transition-colors"
          >
            <PlusIcon />
            <span>Add New Listing</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-full w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[var(--color-primary)] shadow-sm font-extrabold"
                  : "text-gray-400 hover:text-[var(--color-text-muted)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 lg:w-10">
             <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
               <SearchIcon />
             </div>
          </div>
          <div className="flex items-center gap-2 px-4 h-10 bg-gray-100 rounded-full text-xs font-bold text-gray-500 min-w-max">
            <FilterIcon />
            <span>All Categories</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
