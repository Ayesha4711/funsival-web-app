"use client";

import React, { useState } from "react";
import ListingsStats from "@/components/dashboard/ListingsStats";
import ListingsFilters from "@/components/dashboard/ListingsFilters";
import ListingsTable from "@/components/dashboard/ListingsTable";
import ListingsCards from "@/components/dashboard/ListingsCards";

const initialListings = [
  { id: 1, name: "Jet Ski", location: "Blue Sky Adventure Center", category: "Equipment", price: "$75 / hr", bookings: 7, date: "1-12 oct", time: "", rating: "4.5", reviews: 120, status: "Draft" },
  { id: 2, name: "Paragliding", location: "Rapids River Canyon", category: "Service", price: "$200 / person", bookings: 4, date: "Sep 24 2023", time: "9:30 to 18:30", rating: "4.8", reviews: 450, status: "Draft" },
  { id: 3, name: "Laser tag arenas", location: "Forest Canopy Park", category: "Place", price: "$150 / hour", bookings: 25, date: "Sep 24, 2023", time: "9:30 to 18:30", rating: "4.8", reviews: 542, status: "Active" },
  { id: 4, name: "Rock Adventure", location: "Golden Radiology Center", category: "Service", price: "$200 / person", bookings: 12, date: "Sep 24, 2023", time: "9:30 to 18:30", rating: "4.5", reviews: 260, status: "Inactive" },
  { id: 5, name: "Paragliding", location: "Rapids River Canyon", category: "Service", price: "$200 / person", bookings: 32, date: "Sep 24, 2023", time: "9:30 to 18:30", rating: "4.8", reviews: 360, status: "Inactive" },
  { id: 6, name: "Rock Adventure", location: "Golden Radiology Center", category: "Equipment", price: "$75 / Day", bookings: 25, date: "Sep 24, 2023", time: "9:30 to 18:30", rating: "4.5", reviews: 120, status: "Inactive" },
  { id: 7, name: "Rock Adventure", location: "Golden Radiology Center", category: "Equipment", price: "$75 / Day", bookings: 10, date: "Sep 24, 2023", time: "9:30 to 18:30", rating: "2.8", reviews: 124, status: "Inactive" },
  { id: 8, name: "Rock Adventure", location: "Golden Radiology Center", category: "Place", price: "$150 / hour", bookings: 25, date: "Sep 24, 2023", time: "9:30 to 18:30", rating: "4.8", reviews: 541, status: "Active" },
  { id: 9, name: "Rock Adventure", location: "Golden Radiology Center", category: "Place", price: "$150 / hour", bookings: 75, date: "Sep 24, 2023", time: "9:30 to 18:30", rating: "4.8", reviews: 320, status: "Active" },
];

export default function ListingsPage() {
  const [listings, setListings] = useState(initialListings);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [viewMode, setViewMode] = useState("table");

  const handleStatusChange = (id, newStatus) => {
    setListings((prev) =>
      prev.map((item) => item.id === id ? { ...item, status: newStatus } : item)
    );
  };

  const filtered = listings.filter((item) => {
    const matchesTab =
      activeTab === "all" || item.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      search === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "All Categories" || item.category === category;
    return matchesTab && matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto flex flex-col gap-6 flex-1">
      <ListingsStats />

      <div className="bg-white rounded-[32px] p-4 sm:p-6 lg:p-8 shadow-sm border border-[var(--color-border)]">
        <ListingsFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {viewMode === "table" ? (
          <ListingsTable data={filtered} onStatusChange={handleStatusChange} />
        ) : (
          <ListingsCards data={filtered} onStatusChange={handleStatusChange} />
        )}
      </div>
    </div>
  );
}
