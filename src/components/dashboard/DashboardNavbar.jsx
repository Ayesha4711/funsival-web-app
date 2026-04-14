"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logo from "@/assets/images/logo.svg";
import NotificationPopover from "./NotificationPopover";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

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

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default function DashboardNavbar({ onMenuToggle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const router = useRouter();

  // Close Notif Popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
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

  return (
    <header className="h-16 bg-[var(--color-primary)] flex items-center px-4 sm:px-6 lg:px-8 gap-4 shrink-0 z-40 sticky top-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden text-white/90 hover:text-white transition-colors p-1"
        aria-label="Toggle menu"
      >
        <MenuIcon />
      </button>

      {/* Logo – visible on mobile/tablet, hidden on desktop (sidebar has it) */}
      <Link href="/dashboard" className="lg:hidden flex items-center shrink-0">
        <Image src={logo} alt="Funsival" width={110} height={32} className="h-8 w-auto object-contain" />
      </Link>

      {/* Search bar */}
      <div className="flex-1 flex justify-center">
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
        {/* Provider dropdown */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 text-white text-sm font-medium hover:text-white/80 transition-colors"
          >
            Provider
            <ChevronDownIcon />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg py-1 z-50">
              <button className="block w-full text-left px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-light)]">Provider</button>
              <button className="block w-full text-left px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-light)]">User</button>
            </div>
          )}
        </div>

        {/* Notification */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={handleNotifClick}
            className="text-white/90 hover:text-white transition-colors relative p-1"
          >
            <BellIcon />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[var(--color-secondary)] rounded-full text-[9px] flex items-center justify-center text-white font-bold border border-[var(--color-primary)]">3</span>
          </button>
          
          {notifOpen && <NotificationPopover onClose={() => setNotifOpen(false)} />}
        </div>

        {/* Message */}
        <button className="text-white/90 hover:text-white transition-colors">
          <MessageIcon />
        </button>

        {/* Avatar */}
        <button className="w-9 h-9 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden border-2 border-white/30 hover:border-white/60 transition-colors">
          P
        </button>
      </div>
    </header>
  );
}
