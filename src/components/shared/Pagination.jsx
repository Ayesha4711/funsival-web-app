"use client";

import React from "react";

const FirstIcon = () => (
  <span className="text-[11px] leading-none">«</span>
);

const PrevIcon = () => (
  <span className="text-[11px] leading-none">‹</span>
);

const NextIcon = () => (
  <span className="text-[11px] leading-none">›</span>
);

const LastIcon = () => (
  <span className="text-[11px] leading-none">»</span>
);

function PageButton({ children, disabled, active = false, onClick, ariaLabel }) {
  const base =
    "inline-flex items-center justify-center min-w-8 h-8 rounded-full border text-xs font-semibold transition-colors";
  const styles = active
    ? "border-[#F4B84E] bg-white text-[#D89A16] shadow-sm"
    : "border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-700";

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${styles} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  className = "",
}) {
  if (totalPages <= 1) return null;

  const goTo = (page) => {
    const next = Math.min(totalPages, Math.max(1, page));
    onPageChange(next);
  };

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      <PageButton
        ariaLabel="First page"
        disabled={currentPage === 1}
        onClick={() => goTo(1)}
      >
        <FirstIcon />
      </PageButton>
      <PageButton
        ariaLabel="Previous page"
        disabled={currentPage === 1}
        onClick={() => goTo(currentPage - 1)}
      >
        <PrevIcon />
      </PageButton>

      <div className="inline-flex items-center gap-2 px-3 h-8 rounded-full border border-[#F4B84E]/60 bg-white shadow-sm text-xs font-semibold text-[var(--color-text)]">
        <span className="min-w-[1ch] text-center text-[#D89A16]">{currentPage}</span>
        <span className="text-gray-400 font-medium">of {totalPages}</span>
      </div>

      <PageButton
        ariaLabel="Next page"
        disabled={currentPage === totalPages}
        onClick={() => goTo(currentPage + 1)}
      >
        <NextIcon />
      </PageButton>
      <PageButton
        ariaLabel="Last page"
        disabled={currentPage === totalPages}
        onClick={() => goTo(totalPages)}
      >
        <LastIcon />
      </PageButton>
    </div>
  );
}
