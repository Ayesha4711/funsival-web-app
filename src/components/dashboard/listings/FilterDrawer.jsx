"use client";

import React, { useState, useEffect } from "react";
import { CloseIcon } from "@/icons";
import { DEFAULT_FILTERS, MAX_PRICE } from "@/components/dashboard/ListingsFilters";
import PriceSlider from "./PriceSlider";
import FilterSection from "./FilterSection";

const CATEGORIES  = ["All Categories", "Equipment", "Activity", "Place"];
const SORT_OPTIONS = [
  { value: "newest",     label: "Newest" },
  { value: "oldest",     label: "Oldest" },
  { value: "price-asc",  label: "Price: Low→High" },
  { value: "price-desc", label: "Price: High→Low" },
];

export default function FilterDrawer({ open, onClose, filters, onApply }) {
  const [local, setLocal] = useState({ ...DEFAULT_FILTERS, ...filters });

  useEffect(() => {
    setLocal({ ...DEFAULT_FILTERS, ...filters });
  }, [filters, open]);

  const set = (key, val) => setLocal((prev) => ({ ...prev, [key]: val }));

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
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5">

          {/* Price */}
          <FilterSection title="Price" defaultOpen>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-4">
              {["Hourly", "Daily", "Per Person"].map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => set("priceType", pt)}
                  className={`flex-1 py-2 text-xs font-bold transition-colors ${
                    local.priceType === pt
                      ? "bg-[var(--color-secondary)] text-gray-900"
                      : "text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {pt}
                </button>
              ))}
            </div>
            <PriceSlider
              min={local.minPrice}
              max={local.maxPrice}
              onMinChange={(v) => set("minPrice", v)}
              onMaxChange={(v) => set("maxPrice", v)}
            />
          </FilterSection>

          {/* City */}
          <FilterSection title="City" defaultOpen>
            <input
              type="text"
              placeholder="Enter city name"
              value={local.city}
              onChange={(e) => set("city", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]/20"
            />
          </FilterSection>

          {/* Sort By */}
          <FilterSection title="Sort By" defaultOpen>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("sort", local.sort === opt.value ? "" : opt.value)}
                  className={`py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                    local.sort === opt.value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Category */}
          <FilterSection title="Category">
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set("category", cat)}
                  className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    local.category === cat
                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-3 rounded-full border-2 border-[var(--color-secondary)] text-sm font-bold text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 transition-colors"
          >
            Reset Filter
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 rounded-full bg-[var(--color-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Show Results
          </button>
        </div>
      </div>
    </>
  );
}
