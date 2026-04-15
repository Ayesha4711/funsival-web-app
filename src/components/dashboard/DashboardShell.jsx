"use client";

import React, { useState } from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardFooter from "@/components/dashboard/DashboardFooter";

export default function DashboardShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--color-bg)]">
      {/* Sidebar — fixed height, never scrolls */}
      <div className="h-screen sticky top-0 shrink-0">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Right panel — scrolls as one continuous column */}
      <div className="flex flex-col flex-1 min-w-0 min-h-screen overflow-y-auto">
        <DashboardNavbar onMenuToggle={() => setSidebarOpen((o) => !o)} />

        <main className="flex-1">
          {children}
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}
