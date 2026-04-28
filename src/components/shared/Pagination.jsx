"use client";

import React from "react";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  className = "",
}) {
  const goTo = (page) => {
    const next = Math.min(totalPages, Math.max(1, page));
    onPageChange(next);
  };

  // Build page numbers to show: always show up to 5 pages around current
  const getPages = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    for (let i = left; i <= right; i++) pages.push(i);
    return pages;
  };

  const pages = getPages();

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      {/* Previous */}
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Previous
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => goTo(page)}
            className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
              page === currentPage
                ? "bg-[#4AA7A7] text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
