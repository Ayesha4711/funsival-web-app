"use client";

import React, { useState } from "react";
import { CloseIcon, ChevronDownIcon, ImageIcon, CalendarIcon } from "@/icons";
import {
  ParkingIcon, WasherIcon, DrinkIcon, FridgeIcon, WifiIcon,
  FoodIcon, IronIcon, FirstAidIcon,
} from "@/icons";
import { describeListingPrice, formatListingPrice } from "./listingPrice";

const OFFERING_ICONS = {
  "Free parking on premises":  <ParkingIcon />,
  Washer:                      <WasherIcon />,
  "Non-Alcoholic Drink Service": <DrinkIcon />,
  Refrigerator:                <FridgeIcon />,
  Wifi:                        <WifiIcon />,
  WiFi:                        <WifiIcon />,
  "Food Service":              <FoodIcon />,
  Iron:                        <IronIcon />,
  "First aid kit":             <FirstAidIcon />,
};

const DEFAULT_OFFERINGS = [
  "Free parking on premises", "Washer", "Non-Alcoholic Drink Service",
  "Refrigerator", "Wifi", "Food Service", "Iron", "First aid kit",
];

function formatSlotDay(raw) {
  if (!raw) return "—";
  if (raw.includes("T") || raw.match(/^\d{4}-\d{2}-\d{2}/)) {
    const d = new Date(raw);
    if (!isNaN(d))
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  if (raw.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const d = new Date(raw);
    if (!isNaN(d))
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  if (!raw) return "—";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  const ampm = h < 12 ? "AM" : "PM";
  const hour  = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function cap(str) {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const DESC_LIMIT = 120;

export default function ListingPreviewModal({ item, onClose, onEdit }) {
  const [showSlots, setShowSlots] = useState(false);
  const [readMore,  setReadMore]  = useState(false);

  const priceLines  = item.priceDetails?.length ? item.priceDetails : describeListingPrice(item.category, item.price);
  const offerings   = item.included?.length ? item.included : DEFAULT_OFFERINGS;
  const slots       = item.slots || [];
  const description = item.description || "No description added yet.";
  const isLong      = description.length > DESC_LIMIT;

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
        {/* Header */}
        <div
          className="relative flex items-center justify-center px-6 shrink-0 border-b border-gray-100"
          style={{ height: 58 }}
        >
          <button
            onClick={onClose}
            className="absolute left-4 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <CloseIcon size={10} />
          </button>
          <p className="text-sm font-bold text-[#1A1A2E]">{item.name}</p>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Hero image */}
          <div className="h-48 rounded-xl overflow-hidden bg-gray-100">
            {item.image && (item.image.startsWith("http") || item.image.startsWith("blob:") || item.image.startsWith("data:")) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ImageIcon size={40} />
              </div>
            )}
          </div>

          {/* About Service */}
          <div>
            <p className="text-sm font-bold text-[#1A1A2E] mb-1.5">About Service</p>
            <p className="text-xs leading-5 text-gray-400">
              {isLong && !readMore ? description.slice(0, DESC_LIMIT) + "… " : description + " "}
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
              { label: "Location",  value: item.location },
              { label: "Category",  value: cap(item.category) },
              { label: "Price",     value: formatListingPrice(item.category, item.price) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-gray-400">{label}</span>
                <span className="text-gray-700 font-medium text-right max-w-[60%]">{value || "—"}</span>
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
                  {slots.length > 0 ? (showSlots ? "Hide Slots" : "View Slots") : "No Slots"}
                  {slots.length > 0 && (
                    <ChevronDownIcon size={10} className={`transition-transform ${showSlots ? "rotate-180" : ""}`} />
                  )}
                </button>
              </div>

              {showSlots && slots.length > 0 && (
                <div className="mt-2 rounded-xl border border-gray-100 overflow-hidden">
                  {slots.map((s, i) => {
                    const day  = formatSlotDay(s.day ?? s.date);
                    const time = s.startTime && s.endTime
                      ? `${formatTime(s.startTime)} – ${formatTime(s.endTime)}`
                      : (s.time ?? "—");
                    return (
                      <div key={i} className={`flex items-center gap-3 px-4 py-2.5 text-xs ${i !== slots.length - 1 ? "border-b border-gray-50" : ""}`}>
                        <span className="text-[var(--color-primary)] shrink-0"><CalendarIcon /></span>
                        <span className="font-semibold text-gray-700">{day}</span>
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
                <div key={name} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="shrink-0">{OFFERING_ICONS[name] ?? <FirstAidIcon />}</span>
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex justify-end px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => { onClose(); onEdit(item); }}
            className="px-8 py-2.5 rounded-full bg-[var(--color-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
