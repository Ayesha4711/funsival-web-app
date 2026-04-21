"use client";

import React, { useState } from "react";
import ReservationStats from "@/components/dashboard/ReservationStats";
import ReservationFilters from "@/components/dashboard/ReservationFilters";
import ReservationTable from "@/components/dashboard/ReservationTable";
import ReservationCards from "@/components/dashboard/ReservationCards";
import ReservationDetailView from "@/components/dashboard/ReservationDetailView";

const mockReservations = [
  { id: 1,  name: "Jet Ski",         location: "Blue Sky Adventure Center", category: "Equipment", invoice: "Paid",     reservedBy: "Mike Rodriguez", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Upcoming"  },
  { id: 2,  name: "Paragliding",      location: "Rapids River Canyon",       category: "Service",   invoice: "Overdue",  reservedBy: "Sarah Martinez", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Upcoming"  },
  { id: 3,  name: "Laser tag arenas", location: "Forest Canopy Park",        category: "Equipment", invoice: "Paid",     reservedBy: "Michael Brown",  date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Upcoming"  },
  { id: 4,  name: "Rock Adventure",   location: "Golden Radiology Center",   category: "Service",   invoice: "Paid",     reservedBy: "Emily Chen",     date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Upcoming"  },
  { id: 5,  name: "Rock Adventure",   location: "Golden Radiology Center",   category: "Place",     invoice: "Paid",     reservedBy: "Robert Davis",   date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Upcoming"  },
  { id: 6,  name: "Rock Adventure",   location: "Golden Radiology Center",   category: "Place",     invoice: "Paid",     reservedBy: "Mike Rodriguez", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Upcoming"  },
  { id: 7,  name: "Rock Adventure",   location: "Golden Radiology Center",   category: "Place",     invoice: "Paid",     reservedBy: "Mike Rodriguez", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Upcoming"  },
  { id: 8,  name: "Jet Ski",         location: "Blue Sky Adventure Center", category: "Equipment", invoice: "Paid",     reservedBy: "Mike Rodriguez", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Completed" },
  { id: 9,  name: "Paragliding",      location: "Rapids River Canyon",       category: "Service",   invoice: "Paid",     reservedBy: "Sarah Martinez", date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Completed" },
  { id: 10, name: "Rock Adventure",   location: "Golden Radiology Center",   category: "Service",   invoice: "Refunded", reservedBy: "Emily Chen",     date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Cancelled" },
  { id: 11, name: "Rock Adventure",   location: "Golden Radiology Center",   category: "Place",     invoice: "Refunded", reservedBy: "Robert Davis",   date: "Sep 24, 2025", time: "9:30 to 10:30", status: "Cancelled" },
];

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedReservation, setSelectedReservation] = useState(null);

  // When a reservation is selected, show the detail view instead of the list
  if (selectedReservation) {
    return (
      <ReservationDetailView
        reservation={selectedReservation}
        onBack={() => setSelectedReservation(null)}
        onCancel={(item) => {
          // Placeholder: wire to cancel API when ready
          console.log("Cancel reservation:", item.id);
        }}
      />
    );
  }

  const filteredReservations = activeTab === "all"
    ? mockReservations
    : mockReservations.filter(item => item.status.toLowerCase() === activeTab.toLowerCase());

  const handleViewDetails = (item) => setSelectedReservation(item);
  const handleCancel = (item) => {
    console.log("Cancel reservation:", item.id);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-400 mx-auto flex-1 flex flex-col">
      {/* Stats */}
      <ReservationStats />

      {/* Main container */}
      <div className="bg-white rounded-4xl p-4 sm:p-6 lg:p-8 shadow-sm border border-border">
        <ReservationFilters activeTab={activeTab} onTabChange={setActiveTab} />

        {/*
          Responsive:
          - mobile  (<md)  → table (scrollable)
          - tablet  (md–xl) → cards
          - laptop+ (xl+)  → table
        */}
        <div className="block md:hidden xl:block">
          <ReservationTable
            data={filteredReservations}
            onViewDetails={handleViewDetails}
            onCancel={handleCancel}
          />
        </div>

        <div className="hidden md:block xl:hidden">
          <ReservationCards
            data={filteredReservations}
            onViewDetails={handleViewDetails}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
