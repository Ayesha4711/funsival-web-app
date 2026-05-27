"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { savePreferences, selectProfileStatus } from "@/store/slices/profileSlice";
import { toast } from "sonner";
import { CloseIcon } from "@/icons";

/* ─── Data ─────────────────────────────────────────────────────────────────── */
const CATEGORIES = {
  amenities: {
    label: "Amenities",
    items: [
      "Tree house", "Pool", "Bowling", "Gym", "Mansions", "Igloo",
      "Caves", "Domes", "Tiny homes", "Beach", "Castle", "Villas",
      "Penthouse", "Cabin", "Yacht", "Farmhouse", "Lighthouse"
    ],
  },
  equipment: {
    label: "Equipment's",
    items: [
      "ATV's", "Snowboards", "Surfboards", "Bicycle", "Scuba", "Jetski",
      "Bike", "Car", "Laptop", "Watch", "Decoration items", "Toys",
      "Camera", "Projector", "Speaker", "Drone", "Camping Gear"
    ],
  },
  services: {
    label: "Services",
    items: [
      "Skydiving", "Horse riding", "Surfing", "Bowling", "Scuba diving",
      "Paragliding", "Jetski", "Boating", "Fishing", "Bungee", "Zipline",
      "Photography", "Catering", "Tour Guide", "Transport"
    ],
  },
};

/* ─── Tag ────────────────────────────────────────────────────────────────────── */
const Tag = ({ label, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap
      ${isSelected
        ? "bg-[#FFF5D9] border-[#FEB538] text-[#FEB538]"
        : "bg-white border-[#E5E7EB] text-gray-500 hover:border-gray-300"
      }`}
  >
    {label}
    {isSelected && <CloseIcon size={12} />}
  </button>
);

/* ─── Modal ──────────────────────────────────────────────────────────────────── */
export default function PreferenceModal({ onClose, role = "user" }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const profileStatus = useSelector(selectProfileStatus);
  const isPending = profileStatus === "loading";

  const [selected, setSelected] = useState({
    amenities: ["Tree house"],
    equipment: ["ATV's"],
    services: [],
  });
  const [expanded, setExpanded] = useState({ amenities: false, equipment: false, services: false });

  const dashboardPath = role === "host" ? "/dashboard" : "/user-dashboard/explore";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const toggle = (category, item) => {
    setSelected((prev) => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter((i) => i !== item)
        : [...prev[category], item],
    }));
  };

  const handleContinue = async () => {
    const result = await dispatch(savePreferences(selected));
    if (savePreferences.rejected.match(result)) {
      toast.error("Failed to save preferences", { description: result.payload || "Something went wrong" });
      return;
    }
    toast.success("Preferences saved!");
    router.push(dashboardPath);
  };

  const handleLater = () => router.push(dashboardPath);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-3xl flex flex-col w-full max-w-[22rem] sm:max-w-lg lg:max-w-2xl max-h-[92vh] sm:max-h-[88vh] lg:max-h-[85vh] overflow-hidden">

        <div className="px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between shrink-0 border-b border-gray-100">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Select Your Preferences</h1>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <CloseIcon size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 sm:py-6 space-y-7 sm:space-y-9">
          {Object.entries(CATEGORIES).map(([key, { label, items }]) => {
            const isExpanded = expanded[key];
            const displayedItems = isExpanded ? items : items.slice(0, 11);
            const hasMore = items.length > 11;

            return (
              <section key={key}>
                <h2 className="text-sm font-semibold text-gray-700 mb-3 sm:mb-4">{label}</h2>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {displayedItems.map((item) => (
                    <Tag key={item} label={item} isSelected={selected[key].includes(item)} onClick={() => toggle(key, item)} />
                  ))}
                  {hasMore && !isExpanded && (
                    <button onClick={() => setExpanded(prev => ({ ...prev, [key]: true }))} className="text-sm font-bold text-[#FEB538] hover:underline px-1">
                      See {items.length - 11}+ more
                    </button>
                  )}
                  {isExpanded && (
                    <button onClick={() => setExpanded(prev => ({ ...prev, [key]: false }))} className="text-sm font-bold text-[#FEB538] hover:underline px-1">
                      Show less
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-gray-100 shrink-0 bg-white">
          <div className="flex flex-col gap-3 sm:hidden">
            <button onClick={handleContinue} disabled={isPending} className="w-full py-3.5 rounded-full bg-[var(--color-primary)] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {isPending ? "Saving..." : "Continue"}
            </button>
            <button onClick={handleLater} disabled={isPending} className="w-full py-3.5 rounded-full border-2 border-[#FEB538] text-[#FEB538] font-bold text-sm hover:bg-[#FFF5D9] transition-colors disabled:opacity-50">
              I&apos;ll do this later
            </button>
          </div>
          <div className="hidden sm:flex items-center justify-end gap-4">
            <button onClick={handleLater} disabled={isPending} className="px-7 py-3 rounded-full border-2 border-[#FEB538] text-[#FEB538] font-bold text-sm hover:bg-[#FFF5D9] transition-colors disabled:opacity-50">
              I&apos;ll do this later
            </button>
            <button onClick={handleContinue} disabled={isPending} className="px-10 py-3 rounded-full bg-[var(--color-primary)] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {isPending ? "Saving..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
