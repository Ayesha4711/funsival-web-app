"use client";

import React, { useEffect, useRef, useState } from "react";
import CustomCalendar from "@/components/shared/CustomCalendar";

export function ChevronDownIcon({ className = "" }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function CalendarIcon({ className = "" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function useOutsideClose(onClose) {
  const ref = useRef(null);

  useEffect(() => {
    function handleMouseDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onClose]);

  return ref;
}

export function DropdownField({
  value,
  placeholder,
  options,
  onChange,
  className = "",
  menuClassName = "",
  disabled = false,
  error = false,
  splitDisplay = false,
  teal = false,
  iconLeft = null,
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={ref} className={`relative ${className}`} style={{ zIndex: open ? 50 : "auto" }}>
      <div className={[
        "flex items-stretch rounded-xl border overflow-hidden transition-colors",
        teal ? "bg-white" : "bg-[#F5F5F5]",
        open
          ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/15"
          : error
            ? "border-red-400 ring-2 ring-red-200"
            : teal
              ? "border-[#CEE6E5] focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/15"
              : "border-transparent focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/15",
      ].join(" ")}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className="flex-1 min-w-0 px-3 py-2.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
        >
          {iconLeft && <span className="shrink-0 text-gray-400">{iconLeft}</span>}
          {splitDisplay && selected ? (
            <span className="flex-1 flex items-center justify-between min-w-0">
              <span className="text-gray-400 text-sm truncate hidden sm:inline">{placeholder}</span>
              <span className="font-bold text-gray-800 text-sm shrink-0">{selected.label}</span>
            </span>
          ) : (
            <span className={selected ? "font-medium text-gray-700" : "text-gray-400"}>
              {selected?.label || placeholder}
            </span>
          )}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className="shrink-0 px-3 text-gray-400 hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Toggle ${placeholder}`}
        >
          <ChevronDownIcon className={open ? "rotate-180 transition-transform" : "transition-transform"} />
        </button>
      </div>

      {open && !disabled && (
        <div
          className={`absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-gray-100 bg-white  overflow-hidden ${menuClassName}`}
        >
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={[
                    "w-full px-4 py-2.5 text-left text-sm transition-colors",
                    active
                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold"
                      : "text-gray-600 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ComboboxField({
  value,
  placeholder,
  options,
  onChange,
  className = "",
  disabled = false,
  error = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const ref = useOutsideClose(() => { setOpen(false); setQuery(""); });

  const selected = options.find((o) => o.value === value);

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const openDropdown = () => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const selectOption = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={ref} className={`relative ${className}`} style={{ zIndex: open ? 50 : "auto" }}>
      {open ? (
        <div className="flex items-stretch rounded-xl border border-[var(--color-primary)] bg-white ring-2 ring-[var(--color-primary)]/20 overflow-hidden">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${placeholder?.toLowerCase() || ""}…`}
            className="flex-1 min-w-0 px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={() => { setOpen(false); setQuery(""); }}
            className="shrink-0 px-3 text-gray-400 hover:text-gray-600"
          >
            <ChevronDownIcon className="rotate-180 transition-transform" />
          </button>
        </div>
      ) : (
        <div
          className={[
            "flex items-stretch rounded-xl border bg-[#F5F5F5] overflow-hidden transition-colors",
            disabled
              ? "opacity-60 cursor-not-allowed border-transparent"
              : error
                ? "border-red-400 ring-2 ring-red-200 cursor-pointer"
                : "border-transparent hover:border-gray-200 cursor-pointer",
          ].join(" ")}
          onClick={openDropdown}
        >
          <span className="flex-1 min-w-0 px-3 py-2.5 text-sm">
            <span className={selected ? "font-medium text-gray-700" : "text-gray-400"}>
              {selected?.label || placeholder}
            </span>
          </span>
          <span className="shrink-0 px-3 flex items-center text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>
      )}

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-gray-100 bg-white  overflow-hidden">
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-400 text-center">No results found</p>
            ) : (
              filtered.map((opt) => {
                const active = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => selectOption(opt)}
                    className={[
                      "w-full px-4 py-2.5 text-left text-sm transition-colors",
                      active
                        ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold"
                        : "text-gray-600 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TagInputField({ tags, placeholder, onAdd, onRemove, error = false }) {
  const [value, setValue] = useState("");

  const addTag = () => {
    const next = value.trim();
    if (!next) return;
    onAdd(next);
    setValue("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className={[
            "flex-1 px-3 py-2.5 rounded-xl border bg-[#F5F5F5] text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-colors",
            error
              ? "border-red-400 focus:ring-red-200 focus:border-red-500"
              : "border-transparent focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
          ].join(" ")}
        />
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-2.5 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-bold hover:bg-[var(--color-primary)] hover:text-white transition-colors"
          aria-label="Add item"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-semibold"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-[var(--color-primary)]/70 hover:text-red-500 leading-none"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function CalendarField({ value, placeholder = "Select date", onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger — always shows icon + text on every breakpoint */}
      <div
        onClick={() => setOpen((c) => !c)}
        className={[
          "flex items-center w-full rounded-xl border bg-white cursor-pointer transition-colors select-none",
          open
            ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/15"
            : "border-[#CEE6E5] hover:border-[var(--color-primary)]/60",
        ].join(" ")}
      >
        <span className="pl-3 py-2.5 text-[var(--color-primary)] flex items-center shrink-0">
          <CalendarIcon />
        </span>
        <span className={[
          "flex-1 min-w-0 px-2 py-2.5 text-sm truncate",
          value ? "font-semibold text-gray-800" : "text-gray-400",
        ].join(" ")}>
          {value || placeholder}
        </span>
      </div>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-full min-w-[280px]">
          <CustomCalendar
            value={value}
            onChange={(nextValue) => {
              onChange(nextValue);
              setOpen(false);
            }}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
