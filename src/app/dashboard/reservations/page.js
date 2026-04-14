"use client";

import React, { useState } from "react";
import ReservationStats from "@/components/dashboard/ReservationStats";
import ReservationFilters from "@/components/dashboard/ReservationFilters";
import ReservationTable from "@/components/dashboard/ReservationTable";
import ReservationCards from "@/components/dashboard/ReservationCards";

const mockReservations = [
  { id: 1, name: "Jet Ski", location: "Blue Sky Adventure Center", category: "Equipment", invoice: "Paid", reservedBy: "Mike Rodriguez", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Upcoming" },
  { id: 2, name: "Paragliding", location: "Rapids River Canyon", category: "Service", invoice: "Overdue", reservedBy: "Sarah Martinez", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Upcoming" },
  { id: 3, name: "Laser tag arenas", location: "Forest Canopy Park", category: "Equipment", invoice: "Paid", reservedBy: "Michael Brown", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Upcoming" },
  { id: 4, name: "Rock Adventure", location: "Golden Radiology Center", category: "Service", invoice: "Paid", reservedBy: "Emily Chen", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Upcoming" },
  { id: 5, name: "Rock Adventure", location: "Golden Radiology Center", category: "Place", invoice: "Paid", reservedBy: "Robert Davis", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Upcoming" },
  { id: 6, name: "Rock Adventure", location: "Golden Radiology Center", category: "Place", invoice: "Paid", reservedBy: "Mike Rodriguez", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Upcoming" },
  { id: 7, name: "Rock Adventure", location: "Golden Radiology Center", category: "Place", invoice: "Paid", reservedBy: "Mike Rodriguez", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Upcoming" },
  { id: 8, name: "Jet Ski", location: "Blue Sky Adventure Center", category: "Equipment", invoice: "Paid", reservedBy: "Mike Rodriguez", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Completed" },
  { id: 9, name: "Paragliding", location: "Rapids River Canyon", category: "Service", invoice: "Paid", reservedBy: "Sarah Martinez", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Completed" },
  { id: 10, name: "Rock Adventure", location: "Golden Radiology Center", category: "Service", invoice: "Refunded", reservedBy: "Emily Chen", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Cancelled" },
  { id: 11, name: "Rock Adventure", location: "Golden Radiology Center", category: "Place", invoice: "Refunded", reservedBy: "Robert Davis", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Cancelled" },
];

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredReservations = activeTab === "all"
    ? mockReservations
    : mockReservations.filter(item => item.status.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto">
      {/* Top Stats Section */}
      <ReservationStats />

      {/* Main Reservations Container */}
      <div className="bg-white rounded-[32px] p-4 sm:p-6 lg:p-8 shadow-sm border border-[var(--color-border)]">
        <ReservationFilters activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Responsive List Rendering */}
        <div className="w-full">
          {/* Laptop (xl) and Mobile (sm/default) as per user request (img1 & img2) */}
          {/* We show table on both small and large screens, but hidden on medium (iPad) */}
          <div className="hidden xl:block md:hidden block">
             <ReservationTable data={filteredReservations} />
          </div>

          <div className="xl:hidden md:block hidden">
             <ReservationCards data={filteredReservations} />
          </div>

          {/* Fallback for very small screens if table is too wide: we handle it in ReservationTable with overflow-x-auto */}
          <div className="xl:hidden md:hidden block">
             <ReservationTable data={filteredReservations} />
          </div>
        </div>
      </div>
    </div>
  );
}
