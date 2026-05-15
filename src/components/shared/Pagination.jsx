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
    if (next !== currentPage) onPageChange(next);
  };

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {/* First */}
      <button
        onClick={() => goTo(1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 text-xs hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="First page"
      >
        «
      </button>

      {/* Prev */}
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 text-xs hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        ‹
      </button>

      {/* Current page indicator */}
      <div className="flex items-center gap-1.5 mx-1">
        <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#F5C842] text-sm font-bold text-gray-800">
          {currentPage}
        </div>
        <span className="text-sm text-gray-500 font-medium">of {totalPages}</span>
      </div>

      {/* Next */}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 text-xs hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        ›
      </button>

      {/* Last */}
      <button
        onClick={() => goTo(totalPages)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 text-xs hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Last page"
      >
        »
      </button>
    </div>
  );
}
