"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardFooter from "@/components/dashboard/DashboardFooter";

// Pages that hide the sidebar on desktop (full-width layouts)
const SIDEBAR_HIDDEN_PATHS = [
  "/dashboard/messages",
  "/dashboard/settings",
  "/dashboard/notifications",
  "/dashboard/earnings/withdraw",
];

export default function DashboardShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Wizard pages get full-width layout — no sidebar, no desktop navbar
  const isWizard = pathname === "/dashboard/listings/add";
  // Full-width pages hide the sidebar on desktop
  const hideSidebarDesktop = isWizard || SIDEBAR_HIDDEN_PATHS.includes(pathname);

  return (
    <div className="flex h-screen bg-[var(--color-bg)]">
      {/* Sidebar — passes hideOnDesktop so it never pins at lg+ on full-width pages */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        hideOnDesktop={hideSidebarDesktop}
      />

      {/* Right panel */}
      <div className="flex flex-col flex-1 min-w-0 min-h-screen overflow-y-auto">
        {/* On wizard pages hide the dashboard navbar on desktop (wizard has its own top bar) */}
        <div className={isWizard ? "lg:hidden" : ""}>
          <DashboardNavbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        </div>

        <main className="flex-1">
          {children}
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}
