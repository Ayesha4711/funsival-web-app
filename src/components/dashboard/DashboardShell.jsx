"use client";

import React, { useState } from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardFooter from "@/components/dashboard/DashboardFooter";

export default function DashboardShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main column: Navbar + scrollable content + footer */}
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <DashboardNavbar onMenuToggle={() => setSidebarOpen((o) => !o)} />

        <main className="flex-1 flex flex-col">
          {children}
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}
