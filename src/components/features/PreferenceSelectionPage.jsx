"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { savePreferences } from "@/lib/api";
import logo from "@/assets/images/logo.svg";

/* ─── Data ─────────────────────────────────────────────────────────────────── */
const CATEGORIES = {
  AMENITIES: [
    "Tree house", "Pool", "Bowling", "Gym", "Mansions", "Igloo", 
    "Caves", "Domes", "Tiny homes", "Beach", "Castle"
  ],
  EQUIPMENT: [
    "ATV's", "Snowboards", "Surfboards", "Bicycle", "Scuba", "jetski", 
    "Bike", "Car", "Laptop", "Watch", "Decoration items", "Toys"
  ],
  SERVICES: [
    "Skydiving", "Horse riding", "Surfing", "Bowling", "Scuba diving", 
    "Paragliding", "Jetski", "Boating", "Fishing", "Bungee", "Zipline"
  ]
};

/* ─── Components ───────────────────────────────────────────────────────────── */
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Tag = ({ label, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 flex items-center gap-2
      ${isSelected 
        ? "bg-[#FFF5D9] border-[#FEB538] text-[#FEB538]" 
        : "bg-white border-[#E5E7EB] text-[var(--color-text-muted)] hover:border-[var(--color-primary-light)]"
      }`}
  >
    {label}
    {isSelected && <CloseIcon />}
  </button>
);

/* ─── Main Page ────────────────────────────────────────────────────────────── */
export default function PreferenceSelectionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState({
    amenities: ["Tree house"], // Initial from mockup
    equipment: ["ATV's"],     // Initial from mockup
    services: []
  });
  const [isPending, setIsPending] = useState(false);

  const toggleSelection = (category, item) => {
    setSelected(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter(i => i !== item)
        : [...prev[category], item]
    }));
  };

  const handleContinue = async () => {
    setIsPending(true);
    try {
      const { data, ok } = await savePreferences(selected);
      if (ok) {
        toast.success("Preferences saved!");
        router.push("/user-dashboard/explore");
      } else {
        toast.error("Failed to save preferences", {
          description: data?.message || "Something went wrong"
        });
      }
    } catch (err) {
      toast.error("Network error", {
        description: "Could not save preferences. Please try again."
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleLater = () => {
    router.push("/user-dashboard/explore");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-primary)]">
      {/* ── Top header bar ── */}
      <header className="px-8 py-4 flex items-center shrink-0">
        <Image src={logo} alt="Funsival Logo" width={140} height={40} className="h-10 w-auto object-contain" />
      </header>

      {/* ── Modal-style Container ── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
          
          {/* Modal Header */}
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              Select Your Preferences
            </h1>
            <button className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
              <CloseIcon />
            </button>
          </div>

          {/* Modal Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {/* Amenities Section */}
            <section className="mb-10">
              <h2 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-6">
                Amenities
              </h2>
              <div className="flex flex-wrap gap-3">
                {CATEGORIES.AMENITIES.map(item => (
                  <Tag 
                    key={item} 
                    label={item} 
                    isSelected={selected.amenities.includes(item)}
                    onClick={() => toggleSelection('amenities', item)}
                  />
                ))}
                <button className="text-sm font-bold text-[var(--color-secondary)] hover:underline ml-2">
                  See 24+ more
                </button>
              </div>
            </section>

            {/* Equipment Section */}
            <section className="mb-10">
              <h2 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-6">
                Equipment's
              </h2>
              <div className="flex flex-wrap gap-3">
                {CATEGORIES.EQUIPMENT.map(item => (
                  <Tag 
                    key={item} 
                    label={item} 
                    isSelected={selected.equipment.includes(item)}
                    onClick={() => toggleSelection('equipment', item)}
                  />
                ))}
                <button className="text-sm font-bold text-[var(--color-secondary)] hover:underline ml-2">
                  See 24+ more
                </button>
              </div>
            </section>

            {/* Services Section */}
            <section className="mb-4">
              <h2 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-6">
                Services
              </h2>
              <div className="flex flex-wrap gap-3">
                {CATEGORIES.SERVICES.map(item => (
                  <Tag 
                    key={item} 
                    label={item} 
                    isSelected={selected.services.includes(item)}
                    onClick={() => toggleSelection('services', item)}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Modal Footer (Fixed) */}
          <div className="px-8 py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-4 shrink-0 bg-gray-50/50">
            <button 
              onClick={handleLater}
              disabled={isPending}
              className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-[var(--color-secondary)] text-[var(--color-secondary)] font-bold text-sm hover:bg-[var(--color-secondary)] hover:text-white transition-all duration-200 disabled:opacity-50"
            >
              I'll do this later
            </button>
            <button 
              onClick={handleContinue}
              disabled={isPending}
              className="w-full sm:w-auto px-12 py-4 rounded-full bg-[var(--color-primary)] text-white font-bold text-sm hover:opacity-90 transition-all duration-200 disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Continue"}
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}
