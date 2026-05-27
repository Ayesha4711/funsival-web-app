"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, CheckIcon, SearchIcon } from "@/icons";
import { PHONE_COUNTRY_CODES, countryToFlag } from "@/lib/phone";

// ─── AutoSaveNotice ───────────────────────────────────────────────────────────

import { InfoFilledIcon as InfoIcon } from "@/icons";

export function AutoSaveNotice() {
  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-600">
      <span className="shrink-0 text-primary"><InfoIcon /></span>
      <span>Your settings are automatically saved. Changes will take effect immediately.</span>
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

export function SectionHeader({ emoji, title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-text flex items-center gap-2">
        <span>{emoji}</span>{title}
      </h2>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

export function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ${
        checked ? "bg-primary" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── useOutsideClose ──────────────────────────────────────────────────────────

export function useOutsideClose(onClose) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClose]);
  return ref;
}

// ─── SelectField (language / currency / timezone) ────────────────────────────

export function SelectField({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) || options[0];
  return (
    <div className="mb-5">
      <label className="block text-xs font-semibold text-gray-500 mb-2">{label}</label>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center justify-between w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-text bg-white hover:border-gray-300 transition-colors"
        >
          <span>{selected.label}</span>
          <ChevronDownIcon />
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl z-20 max-h-52 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`flex items-center justify-between w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-gray-50 text-text"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <CheckIcon size={14} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PhoneCountryPicker ───────────────────────────────────────────────────────

export function PhoneCountryPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useOutsideClose(() => { setOpen(false); setQuery(""); });

  const options = PHONE_COUNTRY_CODES.map((o) => ({ ...o, flag: countryToFlag(o.label) }));
  const selected = options.find((o) => o.code === value) || options[0];
  const filtered = query.trim()
    ? options.filter((o) => `${o.label} ${o.code}`.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => { if (!prev) setQuery(""); return !prev; })}
        className="flex h-[42px] min-w-[128px] items-center justify-between gap-2 border-r border-gray-200 rounded-l-xl bg-gray-50 px-3 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-gray-100 focus:outline-none"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-base leading-none">{selected?.flag || "🌐"}</span>
          <span className="truncate">{selected?.code || "+92"}</span>
        </span>
        <span className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-[280px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 p-2">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/15">
              <SearchIcon size={16} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country"
                className="w-full bg-transparent text-sm text-[var(--color-text)] placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((opt) => {
                const active = opt.code === value;
                return (
                  <button
                    key={`${opt.label}-${opt.code}`}
                    type="button"
                    onClick={() => { onChange(opt.code); setOpen(false); setQuery(""); }}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "hover:bg-gray-50 text-[var(--color-text)]"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="text-base leading-none">{opt.flag || "🌐"}</span>
                      <span className="truncate">{opt.label}</span>
                    </span>
                    <span className="ml-3 shrink-0 text-xs font-semibold text-gray-400">{opt.code}</span>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-4 text-sm text-gray-400">No countries found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ModalOverlay ─────────────────────────────────────────────────────────────

export function ModalOverlay({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}
