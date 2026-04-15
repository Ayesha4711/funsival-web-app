'use client';

import React, { useState } from 'react';

export default function ActivityFilters({ filters, activeFilter, onFilterChange }) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 md:top-20 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Desktop Filters */}
        <div className="hidden md:flex items-center gap-3 py-4 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                activeFilter === filter.id
                  ? 'bg-[#4AA7A7] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.icon && <span className="text-base">{filter.icon}</span>}
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden py-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-xl font-medium text-gray-900"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Mobile Filter Dropdown */}
          {showMobileFilters && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    onFilterChange(filter.id);
                    setShowMobileFilters(false);
                  }}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeFilter === filter.id
                      ? 'bg-[#4AA7A7] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {filter.icon && <span className="text-base">{filter.icon}</span>}
                  <span className="truncate">{filter.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
