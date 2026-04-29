"use client";

import React, { useState, useEffect } from "react";

const FONT = "var(--font-sofia-pro), Sofia Pro, sans-serif";

const REASONS = [
  "Schedule conflict",
  "Found a better option",
  "Unexpected circumstances",
  "Customer requested cancellation",
];

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronIcon = ({ up }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {up ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
  </svg>
);

export default function CancelReasonModal({ onClose, onConfirm }) {
  const [selected, setSelected] = useState(null);
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl w-full shadow-2xl"
        style={{ maxWidth: 560 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 pt-7 pb-6">
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: "#111827" }}>
            Select Reason
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-8 pb-8">
          {/* ── Select trigger row ── */}
          <button
            type="button"
            onClick={() => setListOpen((v) => !v)}
            style={{ fontFamily: FONT, fontWeight: 500, fontSize: 14 }}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-gray-200 text-gray-400 bg-white hover:border-gray-300 transition-colors mb-3"
          >
            <span style={{ color: selected ? "#111827" : undefined }}>
              {selected || "Select"}
            </span>
            <ChevronIcon up={listOpen} />
          </button>

          {/* ── Inline reason list — always rendered inside the card ── */}
          {listOpen && (
            <div
              className="rounded-2xl border border-gray-200 overflow-hidden mb-5"
              style={{ backgroundColor: "#fff" }}
            >
              {REASONS.map((reason, idx) => {
                const isSelected = selected === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => { setSelected(reason); setListOpen(false); }}
                    style={{ fontFamily: FONT, fontWeight: 500, fontSize: 14 }}
                    className={[
                      "w-full flex items-center justify-between px-5 py-4 text-left transition-colors",
                      idx < REASONS.length - 1 ? "border-b border-gray-100" : "",
                      isSelected ? "bg-gray-50" : "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <span style={{ color: "#374151" }}>{reason}</span>
                    {/* Radio / check circle */}
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        backgroundColor: isSelected ? "#F5A623" : "transparent",
                        border: isSelected ? "none" : "1.5px solid #D1D5DB",
                      }}
                    >
                      {isSelected && <CheckIcon />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Policy note ── */}
          <p
            style={{ fontFamily: FONT, fontWeight: 400, fontSize: 13, color: "#6B7280" }}
            className="mb-7 leading-relaxed"
          >
            You will be charged 25$ in case of cancel the reservation. See our{" "}
            <a
              href="#"
              style={{ color: "#F5A623", fontWeight: 600 }}
              className="underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              Cancellation Policy
            </a>
          </p>

          {/* ── Submit ── */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => { if (selected) onConfirm(selected); }}
              disabled={!selected}
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 16,
                backgroundColor: selected ? "#1d8c82" : "#D1D5DB",
                minWidth: 200,
              }}
              className="py-4 px-10 rounded-full text-white transition-all hover:opacity-90 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
