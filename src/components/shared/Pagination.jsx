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
    ? "border-[#F4B84E] bg-white text-[#D89A16]"
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
  const goTo = (page) => {
    const next = Math.min(totalPages, Math.max(1, page));
    onPageChange(next);
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-3 sm:gap-0 ${className}`}>
      {/* Left: page label — hidden on very small, shown from sm */}
      <p className="text-xs text-gray-400 font-medium sm:flex-1 order-2 sm:order-1">
        Page <span className="font-bold text-[var(--color-text)]">{currentPage}</span> of{" "}
        <span className="font-bold text-[var(--color-text)]">{totalPages}</span>
      </p>

      {/* Center: nav buttons */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2 sm:flex-1 sm:justify-center">
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

        <div className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-[#F4B84E]/60 bg-white text-xs font-semibold">
          <span className="text-[#D89A16]">{currentPage}</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">{totalPages}</span>
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

      {/* Right: spacer to keep nav centered on desktop */}
      <div className="hidden sm:block sm:flex-1 order-3" />
    </div>
  );
}
