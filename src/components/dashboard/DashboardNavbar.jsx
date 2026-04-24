"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import logo from "@/assets/images/logo.svg";
import NotificationPopover from "@/components/shared/NotificationPopover";
import { useProfile } from "@/lib/ProfileContext";

const UserIcon = () =>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>;

const SettingsIcon = () =>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>;

const LogoutIcon = () =>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>;

const SearchIcon = () =>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>;

const BellIcon = () =>
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>;

const MessageIcon = () =>
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>;

const ChevronDownIcon = () =>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>;

const MenuIcon = () =>
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>;

export default function DashboardNavbar({ onMenuToggle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useProfile();

  // Derive initial view from pathname, then let selection override it
  const [activeView, setActiveView] = useState(
    pathname?.startsWith("/user-dashboard") ? "user" : "provider"
  );
  const roleLabel = activeView === "user" ? "User" : "Provider";
  const avatarLetter = profile?.email
    ? profile.email[0].toUpperCase()
    : (activeView === "user" ? "U" : "P");

  // Close popovers when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotifClick = () => {
    if (window.innerWidth < 1024) {
      router.push("/dashboard/notifications");
    } else {
      setNotifOpen(!notifOpen);
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    localStorage.removeItem("auth-token");
    router.push("/logout");
  };

  return (
    <header className="h-14 sm:h-16 bg-[var(--color-primary)] flex items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4 shrink-0 z-50 sticky top-0">
      {/* Left: Logo only (mobile) | Desktop: nothing (sidebar has logo) */}
      <Link href="/dashboard" className="lg:hidden flex items-center shrink-0">
        <Image
          src={logo}
          alt="Funsival"
          width={110}
          height={32}
          className="h-7 sm:h-8 w-auto object-contain"
        />
      </Link>

      {/* Search bar — sm and up only */}
      <div className="hidden sm:flex flex-1 justify-center px-4">
        <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search here"
            className="w-full h-9 pl-10 pr-4 rounded-full bg-white text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Search icon — mobile only */}
        <button
          className="sm:hidden text-white/90 hover:text-white transition-colors p-1"
          aria-label="Search"
        >
          <SearchIcon />
        </button>

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="sm:hidden text-white/90 hover:text-white transition-colors p-1"
          aria-label="Toggle menu"
        >
          <MenuIcon />
        </button>

        {/* Provider dropdown — sm and up only */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 text-white text-sm font-medium hover:text-white/80 transition-colors"
          >
            {roleLabel}
            <ChevronDownIcon />
          </button>
          {dropdownOpen &&
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setActiveView("provider");
                  router.push("/dashboard");
                }}
                className="block w-full text-left px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-light)]"
              >
                Provider
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setActiveView("user");
                  router.push("/user-dashboard/explore");
                }}
                className="block w-full text-left px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-light)]"
              >
                User
              </button>
            </div>}
        </div>

        {/* Notification — sm and up only */}
        <div className="relative hidden sm:block" ref={notifRef}>
          <button
            onClick={handleNotifClick}
            className="text-white/90 hover:text-white transition-colors relative p-1"
          >
            <BellIcon />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[var(--color-secondary)] rounded-full text-[9px] flex items-center justify-center text-white font-bold border border-[var(--color-primary)]">
              3
            </span>
          </button>
          {notifOpen &&
            <NotificationPopover onClose={() => setNotifOpen(false)} />}
        </div>

        {/* Message — sm and up only */}
        <button
          onClick={() => router.push("/dashboard/messages")}
          className="hidden sm:flex text-white/90 hover:text-white transition-colors p-1"
          aria-label="Messages"
        >
          <MessageIcon />
        </button>

        {/* Avatar + Profile Dropdown — sm and up only */}
        <div className="relative hidden sm:block" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(o => !o)}
            className="w-9 h-9 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden border-2 border-white/30 hover:border-white/60 transition-colors"
            aria-label="Profile menu"
          >
            {avatarLetter}
          </button>
          {profileOpen &&
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg py-1.5 z-50 border border-gray-100">
              {profile && (
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-[var(--color-text)] truncate">{profile.email}</p>
                  {profile.city && <p className="text-[10px] text-gray-400 mt-0.5">{profile.city}</p>}
                </div>
              )}
              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/dashboard/profile");
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-500">
                  <UserIcon />
                </span>
                View Profile
              </button>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/dashboard/settings");
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-500">
                  <SettingsIcon />
                </span>
                Settings
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogoutIcon />
                Logout
              </button>
            </div>}
        </div>
      </div>
    </header>
  );
}
