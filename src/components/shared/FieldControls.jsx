"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import CustomCalendar from "@/components/shared/CustomCalendar";
import { ChevronDownIcon, CalendarIcon, PlusIcon } from "@/icons";
export { ChevronDownIcon, CalendarIcon };

// Only one FieldControls dropdown/calendar should be open at a time. Each
// instance registers its own close fn here on open, and any instance opening
// evicts whatever was previously registered — so a panel can never get
// orphaned open behind a newly-opened one.
let activeCloser = null;
function claimActiveDropdown(close) {
  if (activeCloser && activeCloser !== close) activeCloser();
  activeCloser = close;
}
function releaseActiveDropdown(close) {
  if (activeCloser === close) activeCloser = null;
}

function useOutsideClose(onClose) {
  const ref = useRef(null);
  useEffect(() => {
    function handleMouseDown(event) {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onClose]);
  return ref;
}

/**
 * Locks page scroll while open, including the inner scrollable dashboard
 * container (which isn't `body`), so an open menu never has to track scroll
 * movement. `allowRef` lets scrolling continue inside the menu itself
 * (e.g. a long options list).
 *
 * Setting `overflow: hidden` on `body` alone doesn't stop the dashboard's
 * `<main className="overflow-y-auto">` from scrolling — that element owns
 * its own scrollbar. Scrollbar dragging and trackpad momentum scroll are
 * native browser behaviors driven by that `overflow` CSS, not by `wheel`/
 * `touchmove` events, so blocking those events alone leaves a gap. We close
 * it by also hard-locking every scrollable ancestor's `overflow` style.
 */
function useLockBodyScroll(open, allowRef) {
  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const lockedEls = [];

    function lock(el) {
      lockedEls.push([el, el.style.overflow]);
      el.style.overflow = "hidden";
    }
    lock(body);

    // Walk up from the currently-focused element (the trigger that opened
    // this menu) so we catch the real scroll container even if it's nested
    // deeper than `<main>` on some screens.
    let node = document.activeElement;
    while (node && node !== body) {
      const style = window.getComputedStyle(node);
      if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
        lock(node);
      }
      node = node.parentElement;
    }

    function blockScroll(e) {
      if (allowRef?.current && allowRef.current.contains(e.target)) return;
      e.preventDefault();
    }
    const opts = { passive: false };
    document.addEventListener("wheel", blockScroll, opts);
    document.addEventListener("touchmove", blockScroll, opts);

    return () => {
      lockedEls.forEach(([el, prev]) => { el.style.overflow = prev; });
      document.removeEventListener("wheel", blockScroll, opts);
      document.removeEventListener("touchmove", blockScroll, opts);
    };
  }, [open, allowRef]);
}

/**
 * Parse a freeform time string typed by the user into "HH:MM" 24-hour format.
 * Accepts: "2:30 PM", "14:30", "2PM", "02:30PM", "2:30pm", "930", etc.
 * Returns "" if unparseable.
 */
function normalizeTimeInput(raw) {
  if (!raw) return "";
  const s = raw.trim().toUpperCase();

  // Already HH:MM — return as-is
  if (/^\d{2}:\d{2}$/.test(s)) return s;

  // Detect AM/PM
  const hasAM = s.includes("AM");
  const hasPM = s.includes("PM");
  const digits = s.replace(/[^0-9:]/g, "");

  let h, m;
  if (digits.includes(":")) {
    [h, m] = digits.split(":").map(Number);
  } else if (digits.length <= 2) {
    h = Number(digits); m = 0;
  } else if (digits.length === 3) {
    h = Number(digits.slice(0, 1)); m = Number(digits.slice(1));
  } else {
    h = Number(digits.slice(0, 2)); m = Number(digits.slice(2, 4));
  }

  if (isNaN(h) || isNaN(m) || m < 0 || m > 59) return "";

  if (hasAM) {
    if (h === 12) h = 0;
  } else if (hasPM) {
    if (h !== 12) h += 12;
  }

  if (h < 0 || h > 23) return "";
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Format HH:MM value for display: "02:30" → "02:30 AM", "14:00" → "02:00 PM" */
function formatTimeDisplay(val) {
  if (!val) return "";
  const match = val.match(/^(\d{2}):(\d{2})$/);
  if (!match) return val;
  const h = Number(match[1]), m = Number(match[2]);
  const ampm = h < 12 ? "AM" : "PM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
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
  allowTyping = false,
}) {
  const [open, setOpen] = useState(false);
  const [typedValue, setTypedValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  // Only filter once the user has actually typed — the initial value
  // pre-filled into the input on open (so it can be edited) shouldn't
  // narrow the list down to just the already-selected option.
  const filteredOptions = allowTyping && isTyping && typedValue
    ? options.filter(o => o.label.toLowerCase().includes(typedValue.toLowerCase()))
    : options;

  const computeMenuPos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = Math.min(Math.max(filteredOptions.length, 1) * 42 + 8, 248);
    const openUp = spaceBelow < menuHeight + 8 && rect.top > menuHeight + 8;
    setMenuPos({
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      openUp,
    });
  }, [filteredOptions.length]);

  // When closing with a typed value: normalize to HH:MM and commit
  const closeDropdown = useCallback(() => {
    if (allowTyping && typedValue) {
      const normalized = normalizeTimeInput(typedValue);
      if (normalized && normalized !== value) onChange(normalized);
      else if (!normalized && typedValue) {
        // Try matching a label from the list
        const match = options.find(o => o.label.toLowerCase() === typedValue.toLowerCase());
        if (match) onChange(match.value);
      }
    }
    setOpen(false);
  }, [allowTyping, typedValue, value, onChange, options]);

  const closeDropdownRef = useRef(closeDropdown);
  useEffect(() => {
    closeDropdownRef.current = closeDropdown;
  }, [closeDropdown]);

  useEffect(() => {
    if (!open) return;
    const closer = () => closeDropdownRef.current();
    claimActiveDropdown(closer);
    return () => releaseActiveDropdown(closer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(event) {
      const inTrigger = triggerRef.current?.contains(event.target);
      const inMenu = menuRef.current?.contains(event.target);
      if (!inTrigger && !inMenu) closeDropdown();
    }
    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("resize", computeMenuPos);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("resize", computeMenuPos);
    };
  }, [open, computeMenuPos, closeDropdown]);

  // Scroll is locked while open, but anything that can still move the
  // trigger (focus-into-view, layout shifts from sibling fields) should
  // not leave the menu stranded — keep it glued via rAF instead of trying
  // to enumerate every possible cause.
  useEffect(() => {
    if (!open) return;
    let frame;
    function tick() {
      computeMenuPos();
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [open, computeMenuPos]);

  useLockBodyScroll(open, menuRef);

  useEffect(() => {
    if (open && allowTyping) setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
  }, [open, allowTyping]);

  const selected = options.find((option) => option.value === value);

  // For split display: resolve what to show on the right side
  // — from options list OR from a normalized typed HH:MM value
  const displayLabel = selected?.label || (value ? formatTimeDisplay(value) : "");

  const handleTypedChange = (e) => {
    setIsTyping(true);
    setTypedValue(e.target.value);
  };

  const handleTypedKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); closeDropdown(); }
    if (e.key === "Escape") { setIsTyping(false); setTypedValue(""); setOpen(false); }
  };

  const toggle = () => {
    if (open) { closeDropdown(); return; }
    if (allowTyping) setTypedValue(displayLabel || "");
    setIsTyping(false);
    computeMenuPos();
    setOpen(true);
  };

  const portalMenu = open && !disabled && typeof document !== "undefined" && createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: menuPos.top,
        left: menuPos.left,
        width: menuPos.width,
        zIndex: 99999,
      }}
      className={`rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden ${menuClassName}`}
    >
      <div className="max-h-60 overflow-y-auto py-1">
        {filteredOptions.length > 0 ? filteredOptions.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(option.value);
                setTypedValue(option.label);
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
        }) : (
          <p className="px-4 py-3 text-sm text-gray-400">No options found</p>
        )}
      </div>
    </div>,
    document.body
  );

  return (
    <div ref={triggerRef} className={`relative ${className}`}>
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
        {open && allowTyping ? (
          /* Typing mode: input on left, placeholder label on right */
          <div className="flex-1 min-w-0 flex items-center px-3 py-2.5 gap-2">
            {splitDisplay && (
              <span className="text-gray-400 text-sm truncate hidden sm:inline shrink-0">{placeholder}</span>
            )}
            <input
              ref={inputRef}
              type="text"
              value={typedValue}
              onChange={handleTypedChange}
              onKeyDown={handleTypedKeyDown}
              onBlur={(e) => {
                if (menuRef.current?.contains(e.relatedTarget)) return;
                closeDropdown();
              }}
              placeholder={splitDisplay ? "e.g. 2:30 PM" : placeholder}
              className="flex-1 min-w-0 text-sm font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal focus:outline-none bg-transparent text-right"
            />
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={toggle}
            className="flex-1 min-w-0 px-3 py-2.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
          >
            {iconLeft && <span className="shrink-0 text-gray-400">{iconLeft}</span>}
            {splitDisplay ? (
              <span className="flex-1 flex items-center justify-between min-w-0">
                <span className="text-gray-400 text-sm truncate hidden sm:inline">{placeholder}</span>
                <span className={`text-sm shrink-0 ${displayLabel ? "font-bold text-gray-800" : "text-gray-400"}`}>
                  {displayLabel || "—"}
                </span>
              </span>
            ) : (
              <span className={selected || value ? "font-medium text-gray-700" : "text-gray-400"}>
                {displayLabel || placeholder}
              </span>
            )}
          </button>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={toggle}
          className="shrink-0 px-3 text-gray-400 hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Toggle ${placeholder}`}
        >
          <ChevronDownIcon className={open ? "rotate-180 transition-transform" : "transition-transform"} />
        </button>
      </div>

      {portalMenu}
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
  const ref = useOutsideClose(useCallback(() => { setOpen(false); setQuery(""); }, []));

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

  const selectOption = (opt) => { onChange(opt.value); setOpen(false); setQuery(""); };

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
            disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
            error
              ? "border-red-400 ring-2 ring-red-200"
              : disabled ? "border-transparent" : "border-transparent hover:border-gray-200",
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
        <div className="absolute left-0 right-0 top-full mt-2 z-[200] rounded-2xl border border-gray-100 bg-white overflow-hidden">
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
            if (event.key === "Enter") { event.preventDefault(); addTag(); }
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

/**
 * Convert any date value to mm/dd/yyyy for display in the text input.
 * CustomCalendar internally uses yyyy-mm-dd, so we keep two representations:
 *   - displayValue (mm/dd/yyyy) shown in the <input>
 *   - isoValue     (yyyy-mm-dd) passed to CustomCalendar and stored upstream
 */
function toDisplayDate(val) {
  if (!val) return "";
  const s = String(val).trim().split("T")[0];
  // Already mm/dd/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  // ISO yyyy-mm-dd → mm/dd/yyyy
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-");
    return `${m}/${d}/${y}`;
  }
  return s;
}

function toIsoDate(val) {
  if (!val) return "";
  const s = String(val).trim().split("T")[0];
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // mm/dd/yyyy → yyyy-mm-dd
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [m, d, y] = s.split("/");
    return `${y}-${m}-${d}`;
  }
  // Incomplete/invalid (e.g. mid-typing) — no valid ISO date yet
  return "";
}

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Mask free-typed input into a valid, in-progress mm/dd/yyyy string —
// clamps month to 01-12 and day to the valid range for that month as each digit lands.
function maskDateInput(raw) {
  // Backspacing over a "/" (auto-inserted, not typed) should remove the digit before it too
  const trimmed = raw.endsWith("/") ? raw.slice(0, -1) : raw;
  const digits = trimmed.replace(/\D/g, "").slice(0, 8);
  if (digits.length === 0) return "";

  // Work off the raw digit count throughout — padding a field for display must
  // never change how many digits we consumed from `digits`, or later digits
  // (e.g. a typed year) end up parsed as if they belonged to an earlier field.
  let month = digits.slice(0, 2);
  let day = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (month.length === 2) {
    const mNum = parseInt(month, 10);
    if (mNum === 0) month = "01";
    else if (mNum > 12) month = "12";
  }

  if (day.length === 2) {
    const mNum = parseInt(month, 10) || 1;
    const maxDay = DAYS_IN_MONTH[mNum - 1] ?? 31;
    const dNum = parseInt(day, 10);
    if (dNum === 0) day = "01";
    else if (dNum > maxDay) day = String(maxDay);
  }

  let result = month;
  if (digits.length > 2) result += `/${day}`;
  if (digits.length > 4) result += `/${year}`;

  return result;
}

// True once the typed value is a complete mm/dd/yyyy date earlier than minDate (also mm/dd/yyyy or yyyy-mm-dd)
function isBeforeMinDate(displayValue, minDate) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(displayValue)) return false;
  const minIso = toIsoDate(minDate);
  if (!minIso) return false;
  const valueIso = toIsoDate(displayValue);
  return valueIso < minIso;
}

export function CalendarField({ value, placeholder = "Select date", onChange, align = "left", minDate }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useLockBodyScroll(open, containerRef);

  useEffect(() => {
    if (!open) return;
    const closer = () => setOpen(false);
    claimActiveDropdown(closer);
    return () => releaseActiveDropdown(closer);
  }, [open]);

  // Close on outside click — but only if the click is outside the whole container
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  const displayValue = toDisplayDate(value);
  const isoValue = toIsoDate(value);
  const pastDateError = isBeforeMinDate(displayValue, minDate);

  const handleCalendarChange = (isoDate) => {
    // Store as mm/dd/yyyy upstream (consistent with form state)
    onChange(toDisplayDate(isoDate));
    setOpen(false);
  };

  const handleInputChange = (e) => {
    onChange(maskDateInput(e.target.value));
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2 w-full">
        <input
          type="text"
          value={displayValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          aria-invalid={pastDateError}
          className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 ${
            pastDateError
              ? "border-red-300 focus:ring-red-200"
              : "border-gray-200 focus:ring-[var(--color-primary)]/20"
          }`}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-[var(--color-primary)] hover:bg-gray-50"
          aria-label="Open calendar"
        >
          <CalendarIcon />
        </button>
      </div>

      {pastDateError && (
        <p className="mt-1 text-xs text-red-500 font-medium">This date has already passed. Please choose a later date.</p>
      )}

      {open && (
        <div className={`absolute top-full mt-2 z-[9999] ${align === "right" ? "right-0" : "left-0"}`}>
          <CustomCalendar
            value={isoValue}
            onChange={handleCalendarChange}
            onClose={() => setOpen(false)}
            minDate={toIsoDate(minDate)}
          />
        </div>
      )}
    </div>
  );
}
