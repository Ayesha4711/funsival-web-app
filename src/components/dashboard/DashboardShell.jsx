"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, selectProfileStatus, selectUser } from "@/store/slices/profileSlice";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AppFooter from "@/components/shared/AppFooter";
import FullPageLoader from "@/components/common/FullPageLoader";

const SIDEBAR_HIDDEN_PATHS = [
  "/dashboard/messages",
  "/dashboard/settings",
  "/dashboard/notifications",
  "/dashboard/earnings/withdraw"
];

const FOOTER_HIDDEN_PATHS = ["/dashboard/messages"];

export default function DashboardShell({ children }) {
  const dispatch = useDispatch();
  const status = useSelector(selectProfileStatus);
  const profile = useSelector(selectUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(
    () => {
      if (status === "idle") dispatch(fetchProfile());
    },
    [dispatch, status]
  );

  const role = profile?.role ?? profile?.data?.role ?? profile?.data?.user?.role ?? null;
  const isProvider = role === "host" || role === "admin";

  useEffect(() => {
    if (status === "succeeded" && role && !isProvider) {
      router.replace("/user-dashboard/explore");
    }
  }, [status, role, isProvider, router]);

  if (status === "idle" || status === "loading") return <FullPageLoader />;
  if (status === "failed") { window.location.replace("/"); return null; }
  if (role && !isProvider) return <FullPageLoader />;

  const isWizard = pathname === "/dashboard/listings/add";
  const hideSidebarDesktop = isWizard || SIDEBAR_HIDDEN_PATHS.includes(pathname);
  const hideFooter = FOOTER_HIDDEN_PATHS.includes(pathname);

  return (
    <div className="flex h-screen bg-[#F3F4F6]">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        hideOnDesktop={hideSidebarDesktop}
      />
      <div className="flex flex-col flex-1 min-w-0">
        {!isWizard && (
          <div className="shrink-0">
            <DashboardNavbar onMenuToggle={() => setSidebarOpen(o => !o)} noSidebar={hideSidebarDesktop} />
          </div>
        )}
        <main className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          <div className="flex-1 flex flex-col">{children}</div>
          {!hideFooter && <AppFooter />}
        </main>
      </div>
    </div>
  );
}
