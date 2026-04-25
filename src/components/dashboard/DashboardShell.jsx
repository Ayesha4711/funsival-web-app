"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, selectProfileStatus } from "@/store/slices/profileSlice";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import FullPageLoader from "@/components/common/FullPageLoader";

const SIDEBAR_HIDDEN_PATHS = [
  "/dashboard/messages",
  "/dashboard/settings",
  "/dashboard/notifications",
  "/dashboard/earnings/withdraw",
];

export default function DashboardShell({ children }) {
  const dispatch = useDispatch();
  const status = useSelector(selectProfileStatus);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (status === "idle") dispatch(fetchProfile());
  }, [dispatch, status]);

  if (status === "idle" || status === "loading") return <FullPageLoader />;

  const isWizard = pathname === "/dashboard/listings/add";
  const hideSidebarDesktop = isWizard || SIDEBAR_HIDDEN_PATHS.includes(pathname);

  return (
    <div className="flex h-screen bg-[var(--color-bg)]">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        hideOnDesktop={hideSidebarDesktop}
      />
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <div className={`shrink-0 ${isWizard ? "lg:hidden" : ""}`}>
          <DashboardNavbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        </div>
        <main className="flex-1 overflow-y-auto min-h-0">
          {children}
          <DashboardFooter />
        </main>
      </div>
    </div>
  );
}
