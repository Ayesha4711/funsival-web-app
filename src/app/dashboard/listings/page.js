"use client";

import React, { useState } from "react";
import ListingsStats from "@/components/dashboard/ListingsStats";
import ListingsFilters from "@/components/dashboard/ListingsFilters";
import ListingsTable from "@/components/dashboard/ListingsTable";
import ListingsCards from "@/components/dashboard/ListingsCards";

const mockListings = [
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
  const [activeTab, setActiveTab] = useState("all");

  const filteredListings = activeTab === "all" 
    ? mockListings 
    : mockListings.filter(item => item.status.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto flex flex-col gap-6">
      {/* Top Stats */}
      <ListingsStats />

      {/* Main Content Area */}
      <div className="bg-white rounded-[32px] p-4 sm:p-6 lg:p-8 shadow-sm border border-[var(--color-border)]">
        <ListingsFilters activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Responsive Views */}
        <div className="w-full">
           {/* Laptop (xl) and Mobile (<md/default) - Table view as per user request (img1 & img2) */}
           <div className="hidden xl:block md:hidden block">
              <ListingsTable data={filteredListings} />
           </div>

           {/* iPad (md) - Card view as per user request (img3) */}
           <div className="xl:hidden md:block hidden">
              <ListingsCards data={filteredListings} />
           </div>

           {/* Small Screens Fallback - Table with overflow-x */}
           <div className="xl:hidden md:hidden block">
              <ListingsTable data={filteredListings} />
           </div>
        </div>
      </div>
    </div>
  );
}
