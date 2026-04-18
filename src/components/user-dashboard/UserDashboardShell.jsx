"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NotificationPopover from "@/components/shared/NotificationPopover";

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/* ─── Navbar ─────────────────────────────────────────────────────────────────── */
function UserNavbar() {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const roleRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target)) setRoleOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleBellClick = () => {
    if (window.innerWidth < 1024) {
      router.push("/user-dashboard/notifications");
    } else {
      setNotifOpen((v) => !v);
      setProfileOpen(false);
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    localStorage.removeItem("auth-token");
    router.push("/logout");
  };

  return (
    <header className="h-16 bg-[#4AA7A7] flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-4 shrink-0 z-40 sticky top-0">
      {/* Logo */}
      <Link href="/user-dashboard/explore" className="flex items-center gap-2 shrink-0">
        <svg className="w-7 h-7 text-[#F5C842]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span className="text-xl font-bold text-white hidden sm:inline">funsival</span>
      </Link>

      {/* Search - hidden on mobile */}
      <div className="hidden sm:flex flex-1 justify-center px-4">
        <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
          <input
            type="text"
            placeholder="Search here"
            className="w-full h-9 pl-10 pr-4 rounded-full bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Role switcher */}
        <div className="relative hidden sm:block" ref={roleRef}>
          <button
            onClick={() => setRoleOpen((v) => !v)}
            className="flex items-center gap-1 text-white text-sm font-medium hover:text-white/80 transition-colors"
          >
            User <ChevronDownIcon />
          </button>
          {roleOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg py-1 z-50">
              <button
                onClick={() => { setRoleOpen(false); router.push("/dashboard"); }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
              >
                Provider
              </button>
              <button
                onClick={() => { setRoleOpen(false); router.push("/user-dashboard/explore"); }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
              >
                User
              </button>
            </div>
          )}
        </div>

        {/* Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleBellClick}
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <BellIcon />
            <span className="absolute top-1 right-1 w-3 h-3 bg-[#F5C842] rounded-full text-[8px] flex items-center justify-center text-gray-900 font-bold border border-[#4AA7A7]">3</span>
          </button>
          {notifOpen && (
            <NotificationPopover
              viewAllHref="/user-dashboard/notifications"
              onClose={() => setNotifOpen(false)}
            />
          )}
        </div>

        {/* Messages */}
        <button
          onClick={() => router.push("/user-dashboard/messages")}
          className="w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"
          aria-label="Messages"
        >
          <MessageIcon />
        </button>

        {/* Avatar + Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
            className="w-9 h-9 rounded-full bg-[#F5C842] flex items-center justify-center text-gray-900 font-bold text-sm border-2 border-white/40 hover:border-white/70 transition-colors"
            aria-label="Profile menu"
          >
            U
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg py-1.5 z-50 border border-gray-100">
              <button
                onClick={() => { setProfileOpen(false); router.push("/user-dashboard/profile"); }}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-500"><UserIcon /></span> View Profile
              </button>
              <button
                onClick={() => { setProfileOpen(false); router.push("/user-dashboard/bookings"); }}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-500">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </span> My Reservation
              </button>
              <button
                onClick={() => { setProfileOpen(false); router.push("/user-dashboard/settings"); }}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-500"><SettingsIcon /></span> Settings
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogoutIcon /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── Shell ──────────────────────────────────────────────────────────────────── */
/**
 * Shared layout shell for all user-dashboard pages (messages, settings, notifications, etc.).
 * Renders the teal navbar + children.
 */
export default function UserDashboardShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <UserNavbar />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
