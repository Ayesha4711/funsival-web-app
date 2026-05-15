"use client";

import React, { useState, useRef, useEffect } from "react";
import Pagination from "@/components/shared/Pagination";
import {
  describeListingPrice,
  formatListingPrice,
} from "./listings/listingPrice";
import {
  LocationIcon,
  MoreVertIcon,
  ChevronDownIcon,
  CalendarIcon,
  ParkingIcon,
  WasherIcon,
  DrinkIcon,
  FridgeIcon,
  WifiIcon,
  FoodIcon,
  IronIcon,
  FirstAidIcon,
} from "@/icons";

const OFFERING_ICONS = {
  "Free parking on premises": <ParkingIcon />,
  Washer: <WasherIcon />,
  "Non-Alcoholic Drink Service": <DrinkIcon />,
  Refrigerator: <FridgeIcon />,
  Wifi: <WifiIcon />,
  WiFi: <WifiIcon />,
  "Food Service": <FoodIcon />,
  Iron: <IronIcon />,
  "First aid kit": <FirstAidIcon />,
};

const DEFAULT_OFFERINGS = [
  "Free parking on premises",
  "Washer",
  "Non-Alcoholic Drink Service",
  "Refrigerator",
  "Wifi",
  "Food Service",
  "Iron",
  "First aid kit",
];

/* ─── Status config ──────────────────────────────────────────────────────────── */
const STATUS_OPTIONS = ["Draft", "Active", "Inactive"];

const STATUS_STYLES = {
  Active: {
    pill: "bg-[#EAFAF1] text-[#27AE60] border-[#B7EBD0]",
    dot: "bg-[#27AE60]",
  },
  Inactive: {
    pill: "bg-[#FDECEA] text-[#E53935] border-[#F9C9C9]",
    dot: "bg-[#E53935]",
  },
  Draft: {
    pill: "bg-[#FEF9EC] text-[#C9982A] border-[#F5DFA0]",
    dot: "bg-[#C9982A]",
  },
};

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
function cap(str) {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatSlotDay(raw) {
  if (!raw) return "—";
  if (raw.includes("T") || raw.match(/^\d{4}-\d{2}-\d{2}/)) {
    const d = new Date(raw);
    if (!isNaN(d))
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
  }
  if (raw.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const d = new Date(raw);
    if (!isNaN(d))
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
  }
  return cap(raw);
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  const ampm = h < 12 ? "AM" : "PM";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

/* ─── Type badge ─────────────────────────────────────────────────────────────── */
const TYPE_COLORS = {
  adventure: "bg-blue-50 text-blue-600 border-blue-100",
  equipment: "bg-purple-50 text-purple-600 border-purple-100",
  places: "bg-teal-50 text-teal-600 border-teal-100",
  events: "bg-pink-50 text-pink-600 border-pink-100",
};

function TypeBadge({ type }) {
  if (!type || type === "—")
    return <span className="text-gray-300 text-xs">—</span>;
  const color =
    TYPE_COLORS[type.toLowerCase()] ??
    "bg-gray-100 text-gray-500 border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold ${color}`}
    >
      {cap(type)}
    </span>
  );
}

/* ─── Category badge ─────────────────────────────────────────────────────────── */
function CategoryBadge({ category }) {
  if (!category || category === "—")
    return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F3F4F6] border border-gray-200 text-[10px] font-bold text-gray-500">
      {cap(category)}
    </span>
  );
}

/* ─── Availability cell ──────────────────────────────────────────────────────── */
function AvailabilityCell({ slots = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!slots.length) return <span className="text-gray-300 text-xs">—</span>;

  const renderSlotRow = (s, i) => {
    const day = formatSlotDay(s.day ?? s.date);
    const time =
      s.startTime && s.endTime
        ? `${formatTime(s.startTime)} – ${formatTime(s.endTime)}`
        : (s.time ?? "");
    return (
      <div key={i} className="flex items-start gap-2.5 px-4 py-2.5">
        <div className="mt-0.5 w-5 h-5 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center shrink-0 text-[var(--color-primary)]">
          <CalendarIcon />
        </div>
        <div>
          <p className="text-xs font-bold text-[var(--color-text)] leading-tight">
            {day}
          </p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">{time}</p>
        </div>
      </div>
    );
  };

  if (slots.length === 1) {
    const s = slots[0];
    const day = formatSlotDay(s.day ?? s.date);
    const time =
      s.startTime && s.endTime
        ? `${formatTime(s.startTime)} – ${formatTime(s.endTime)}`
        : (s.time ?? "");
    return (
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 text-[var(--color-primary)]">
          <CalendarIcon />
        </span>
        <div>
          <p className="text-xs font-bold text-[var(--color-text)] leading-tight">
            {day}
          </p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">{time}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 rounded-lg text-[10px] font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
      >
        <CalendarIcon />
        {slots.length} slots
        <ChevronDownIcon size={9} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-40 bg-white rounded-2xl border border-gray-100 w-56 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wide">
              {slots.length} Availability Slots
            </p>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {slots.map((slot, i) => renderSlotRow(slot, i))}
          </div>
        </div>
      )}
    </div>
  );
}

function ListingPreviewModal({ item, onClose, onEdit }) {
  const [showSlots, setShowSlots] = useState(false);
  const [readMore, setReadMore] = useState(false);

  const priceLines = item.priceDetails?.length
    ? item.priceDetails
    : describeListingPrice(item.category, item.price);
  const offerings = item.included?.length ? item.included : DEFAULT_OFFERINGS;
  const slots = item.slots || [];
  const description = item.description || "No description added yet.";
  const DESC_LIMIT = 120;
  const isLong = description.length > DESC_LIMIT;

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.35)", paddingTop: 24 }}
      onMouseDown={handleBackdrop}
    >
      <div
        className="bg-white rounded-[20px] overflow-hidden flex flex-col w-full"
        style={{ maxWidth: 648, maxHeight: "calc(100vh - 48px)" }}
      >
        {/* Header — 58px tall, X top-left, title centered */}
        <div
          className="relative flex items-center justify-center px-6 shrink-0 border-b border-gray-100"
          style={{ height: 58 }}
        >
          <button
            onClick={onClose}
            className="absolute left-4 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <p className="text-sm font-bold text-[#1A1A2E]">{item.name}</p>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Hero image */}
          <div className="h-48 rounded-xl overflow-hidden bg-gray-100">
            {item.image &&
            (item.image.startsWith("http") ||
              item.image.startsWith("blob:") ||
              item.image.startsWith("data:")) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>

          {/* About Service */}
          <div>
            <p className="text-sm font-bold text-[#1A1A2E] mb-1.5">
              About Service
            </p>
            <p className="text-xs leading-5 text-gray-400">
              {isLong && !readMore
                ? description.slice(0, DESC_LIMIT) + "… "
                : description + " "}
              {isLong && (
                <button
                  onClick={() => setReadMore((v) => !v)}
                  className="text-[var(--color-primary)] font-semibold hover:underline"
                >
                  {readMore ? "Read Less" : "Read More"}
                </button>
              )}
            </p>
          </div>

          {/* Info rows */}
          <div className="divide-y divide-gray-100">
            {[
              { label: "Amenities", value: cap(item.category) },
              { label: "Location", value: item.location },
              { label: "Category", value: cap(item.category) },
              {
                label: "Price",
                value: formatListingPrice(item.category, item.price),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5 text-xs"
              >
                <span className="text-gray-400">{label}</span>
                <span className="text-gray-700 font-medium text-right max-w-[60%]">
                  {value || "—"}
                </span>
              </div>
            ))}

            {/* Time Slot row */}
            <div className="py-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Time Slot</span>
                <button
                  onClick={() => setShowSlots((v) => !v)}
                  className="text-[#F59E0B] font-semibold hover:underline flex items-center gap-1"
                >
                  {slots.length > 0
                    ? showSlots
                      ? "Hide Slots"
                      : "View Slots"
                    : "No Slots"}
                  {slots.length > 0 && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: showSlots ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </button>
              </div>

              {showSlots && slots.length > 0 && (
                <div className="mt-2 rounded-xl border border-gray-100 overflow-hidden">
                  {slots.map((s, i) => {
                    const day = formatSlotDay(s.day ?? s.date);
                    const time =
                      s.startTime && s.endTime
                        ? `${formatTime(s.startTime)} – ${formatTime(s.endTime)}`
                        : (s.time ?? "—");
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 px-4 py-2.5 text-xs ${i !== slots.length - 1 ? "border-b border-gray-50" : ""}`}
                      >
                        <span className="text-[var(--color-primary)] shrink-0">
                          <CalendarIcon />
                        </span>
                        <span className="font-semibold text-gray-700">
                          {day}
                        </span>
                        <span className="text-gray-400 ml-auto">{time}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Offering */}
          <div>
            <p className="text-sm font-bold text-[#1A1A2E] mb-3">Offering</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {offerings.map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-2 text-xs text-gray-600"
                >
                  <span className="shrink-0">
                    {OFFERING_ICONS[name] ?? <IconFirstAid />}
                  </span>
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer — Edit button pinned bottom-right */}
        <div className="shrink-0 flex justify-end px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => {
              onClose();
              onEdit(item);
            }}
            className="px-8 py-2.5 rounded-full bg-[var(--color-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Status dropdown ────────────────────────────────────────────────────────── */
function StatusDropdown({ status, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const styles = STATUS_STYLES[status] ?? {
    pill: "bg-gray-100 text-gray-400 border-gray-200",
    dot: "bg-gray-400",
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold whitespace-nowrap transition-colors ${styles.pill}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
        {status}
        <ChevronDownIcon size={9} />
      </button>

      {open && (
        <div className="absolute left-0 top-9 z-30 bg-white rounded-xl border border-gray-100 py-1 min-w-[110px]">
          {STATUS_OPTIONS.map((opt) => {
            const s = STATUS_STYLES[opt];
            return (
              <button
                key={opt}
                onClick={() => {
                  onStatusChange(opt);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold transition-colors hover:bg-gray-50 ${opt === status ? "opacity-100" : "opacity-60"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                <span
                  className={s.pill
                    .split(" ")
                    .find((c) => c.startsWith("text-"))}
                >
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Action menu ────────────────────────────────────────────────────────────── */
function ActionMenu({ item, onEdit, onDelete, onResumeDraft, isLast }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isDraft = item.status === "Draft";

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative flex justify-center" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <MoreVertIcon />
      </button>
      {open && (
        <div
          className={`absolute right-0 z-30 bg-white border border-gray-100 rounded-2xl py-1.5 min-w-36 ${isLast ? "bottom-full mb-1" : "top-9"}`}
        >
          {isDraft ? (
            <>
              <button
                onClick={() => {
                  setOpen(false);
                  onResumeDraft(item);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Resume Draft
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onDelete(item);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Discard Draft
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setOpen(false);
                  onEdit(item);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[var(--color-text)] hover:bg-gray-50 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onDelete(item);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Table ──────────────────────────────────────────────────────────────────── */
export default function ListingsTable({
  data,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onStatusChange,
  onEdit,
  onDelete,
  onResumeDraft,
}) {
  const [previewItem, setPreviewItem] = useState(null);

  return (
    <div className="flex flex-col flex-1 justify-between">
      {previewItem && (
        <ListingPreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onEdit={(item) => {
            setPreviewItem(null);
            onEdit(item);
          }}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b-2 border-gray-100 bg-[#F8F9FA]">
              {[
                "Activity",
                "Category",
                "Type",
                "Price",
                "Availability",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  // className="px-5 py-3.5 text-[12px] uppercase font-bold tracking-wider text-gray-400 whitespace-nowrap"
                  //  style={{ fontFamily: "var(--font-sofia-pro)" }}

                  className="px-5 py-3.5 uppercase whitespace-nowrap font-bold"
                  style={{
                    fontFamily: "var(--font-sofia-pro)",
                    fontWeight: "600",
                    fontSize: "12px",
                    lineHeight: "21px",
                    letterSpacing: "0px",
                    color: "#212121",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-16 text-center text-sm text-gray-400 font-medium"
                >
                  No listings found.
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`transition-colors hover:bg-[#F8FFFA] ${idx !== data.length - 1 ? "border-b border-gray-50" : ""}`}
                >
                  {/* Activity — click thumbnail/name to open preview */}
                  <td className="px-5 py-3.5 min-w-[200px] max-w-[260px]">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="flex items-center gap-3 text-left w-full"
                    >
                      <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                        {item.image &&
                        (item.image.startsWith("http") ||
                          item.image.startsWith("blob:") ||
                          item.image.startsWith("data:")) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[var(--color-text)] truncate leading-tight mb-0.5">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 truncate">
                          <LocationIcon />
                          <span className="truncate">{item.location}</span>
                        </p>
                      </div>
                    </button>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <CategoryBadge category={item.category} />
                  </td>

                  {/* Type */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <TypeBadge type={item.type} />
                  </td>

                  {/* Price */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-xs font-extrabold text-[var(--color-text)]">
                      {item.priceLabel ??
                        formatListingPrice(item.category, item.price)}
                    </span>
                  </td>

                  {/* Availability */}
                  <td className="px-5 py-3.5 min-w-[150px]">
                    <AvailabilityCell
                      slots={item.slots || item.availability || []}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <StatusDropdown
                      status={item.status}
                      onStatusChange={(newStatus) =>
                        onStatusChange(item, newStatus)
                      }
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <ActionMenu
                      item={item}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onResumeDraft={onResumeDraft}
                      isLast={idx === data.length - 1}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 sm:px-6 py-4 border-t border-gray-100">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
