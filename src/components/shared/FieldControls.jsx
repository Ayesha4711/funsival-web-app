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
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="flex items-stretch rounded-xl border border-gray-200 bg-[#F9FAFB] overflow-hidden shadow-sm focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/15 transition-colors">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className="flex-1 min-w-0 px-3 py-2.5 text-left text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className={selected ? "font-medium" : "text-gray-400"}>
            {selected?.label || placeholder}
          </span>
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
          className={`absolute left-0 right-0 top-full mt-2 z-40 rounded-2xl border border-gray-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] overflow-hidden ${menuClassName}`}
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

export function TagInputField({ tags, placeholder, onAdd, onRemove }) {
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
          className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-[#F9FAFB] text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] focus:bg-white transition-colors"
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
    <div ref={ref} className="relative">
      <div className="flex items-stretch rounded-2xl border border-gray-200 bg-[#F9FAFB] overflow-hidden shadow-sm focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/15 transition-colors">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex-1 min-w-0 px-4 py-3 text-left text-sm text-gray-700"
        >
          <span className={value ? "font-semibold text-gray-800" : "text-gray-400"}>
            {value || placeholder}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="shrink-0 px-4 text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors"
          aria-label="Open calendar"
        >
          <CalendarIcon />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-40">
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
