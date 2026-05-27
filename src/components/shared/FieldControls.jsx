"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CustomCalendar from "@/components/shared/CustomCalendar";
import { ChevronDownIcon, CalendarIcon, PlusIcon } from "@/icons";
export { ChevronDownIcon, CalendarIcon };

function useOutsideClose(onClose) {
  const ref = useRef(null);

  useEffect(() => {
    function handleMouseDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }

    function handleScroll() {
      onClose();
    }

    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
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
          <PlusIcon size={14} />
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

/* ─── usePopupAnchor — writes position directly to DOM, no React state re-renders ── */
function usePopupAnchor(triggerRef, popupRef, open, { popupWidth = 300, gap = 6, margin = 8 } = {}) {
  const rafRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const sync = () => {
      const trigger = triggerRef.current;
      const popup   = popupRef.current;
      if (!trigger || !popup) { rafRef.current = requestAnimationFrame(sync); return; }
      const rect = trigger.getBoundingClientRect();
      popup.style.position = "fixed";
      popup.style.top      = `${rect.bottom + gap}px`;
      popup.style.left     = `${Math.max(margin, Math.min(rect.left, window.innerWidth - popupWidth - margin))}px`;
      popup.style.width    = `${popupWidth}px`;
      popup.style.zIndex   = "9999";
      rafRef.current = requestAnimationFrame(sync);
    };
    rafRef.current = requestAnimationFrame(sync);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [open, triggerRef, popupRef, popupWidth, gap, margin]);
}

export function CalendarField({ value, placeholder = "Select date", onChange }) {
  const [open, setOpen] = useState(false);
  const triggerRef  = useRef(null);
  const calendarRef = useRef(null);

  usePopupAnchor(triggerRef, calendarRef, open, { popupWidth: 300 });

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e) {
      if (
        triggerRef.current  && !triggerRef.current.contains(e.target) &&
        calendarRef.current && !calendarRef.current.contains(e.target)
      ) setOpen(false);
    }
    function handleScroll() {
      setOpen(false);
    }
    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  return (
    <div ref={triggerRef} className="relative w-full">
      <div className="flex items-center gap-2 w-full">
        <input
          type="text"
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setOpen(true)}
          readOnly
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 cursor-pointer"
        />
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-[var(--color-primary)] hover:bg-gray-50"
          aria-label="Open calendar"
        >
          <CalendarIcon />
        </button>
      </div>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={calendarRef}
          style={{ position: "fixed", top: -9999, left: -9999, zIndex: 9999 }}
        >
          <CustomCalendar
            value={value}
            onChange={(nextValue) => { onChange(nextValue); setOpen(false); }}
            onClose={() => setOpen(false)}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
