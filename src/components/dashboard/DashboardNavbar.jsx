"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import logo from "@/assets/images/logo.svg";
import {
  UserIcon,
  SettingsIcon,
  LogoutIcon,
  SearchIcon,
  BellIcon,
  MessageIcon,
  ChevronDownIcon,
  MenuIcon,
  CloseIcon,
  DashboardIcon,
  ReservationsIcon,
  ListingsIcon,
  EarningsIcon,
} from "@/icons";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "@/store/slices/profileSlice";
import { fetchConversations, selectTotalUnreadCount } from "@/store/slices/chatSlice";
import { resetStore } from "@/store/store";
import NotificationPopover from "@/components/shared/NotificationPopover";
import axiosInstance from "@/store/axiosInstance";
import { useFCM, getStoredFcmToken } from "@/hooks/useFCM";
import { firebaseAuth } from "@/lib/firebase";


export default function DashboardNavbar({ onMenuToggle, noSidebar = false }) {
  // Only one of "role" | "notif" | "profile" can be open at a time.
  const [openMenu, setOpenMenu] = useState(null);
  const dropdownOpen = openMenu === "role";
  const notifOpen = openMenu === "notif";
  const profileOpen = openMenu === "profile";
  const [mobileOpen, setMobileOpen] = useState(false);
  const roleRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const toggleMenu = (key) => setOpenMenu((cur) => (cur === key ? null : key));
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const profile = useSelector(selectUser);
  const currentUserId = profile?.id || profile?._id || null;
  const totalUnread = useSelector((state) => selectTotalUnreadCount(state, currentUserId));

  // Start Firebase FCM listener so incoming messages update the badge in real-time
  useFCM();

  const [activeView, setActiveView] = useState(
    pathname?.startsWith("/user-dashboard") ? "user" : "provider"
  );
  const roleLabel = activeView === "user" ? "User" : "Provider";
  const fallbackLetter = activeView === "user" ? "U" : "P";
  const avatarLetter = (profile?.firstName?.[0] || profile?.lastName?.[0] || profile?.email?.[0] || fallbackLetter).toUpperCase();
  // Provider profile picture lives in providerProfile.profileImage; user picture is at root
  const profileImage = profile?.providerProfile?.profileImage ?? profile?.profileImage ?? null;

  useEffect(() => {
    // Wait for profile to load so selectTotalUnreadCount is scoped to the right user
    if (!currentUserId) return;
    // Skip polling while on the messages page — MessagesPage has its own poll
    if (pathname?.includes("/messages")) return;
    dispatch(fetchConversations());
    const timer = setInterval(() => {
      if (document.visibilityState !== "hidden" && !pathname?.includes("/messages")) {
        dispatch(fetchConversations());
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [dispatch, pathname, currentUserId]);

  // Close any open dropdown when clicking outside it
  useEffect(() => {
    function handleClickOutside(event) {
      if (roleRef.current && !roleRef.current.contains(event.target) &&
          notifRef.current && !notifRef.current.contains(event.target) &&
          profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpenMenu(null);
    const fcmToken = getStoredFcmToken();
    if (fcmToken) {
      await axiosInstance
        .delete(`/notifications/device-tokens/${encodeURIComponent(fcmToken)}`)
        .catch(() => {});
    }
    await firebaseAuth.signOut().catch(() => {});
    localStorage.removeItem("auth-token");
    localStorage.removeItem("reservation_wishlists");
    localStorage.removeItem("listing_draft_local");
    sessionStorage.clear();
    dispatch(resetStore());
    // replace() removes the current protected route from history so back never returns to it
    window.location.replace("/logout");
  };

  const handleMobileNav = (path) => {
    setMobileOpen(false);
    router.push(path);
  };

  return (
    <>
    <header className="h-14 sm:h-16 bg-[#228E8A] flex items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4 shrink-0 z-1100 sticky top-0">
      {/* Left: Logo — hidden on desktop only when sidebar is pinned there */}
      <Link href="/dashboard" className={`${noSidebar ? "flex" : "lg:hidden flex"} items-center shrink-0`}>
        <Image
          src={logo}
          alt="Funsival"
          width={110}
          height={32}
          className="h-7 sm:h-8 w-auto object-contain"
          loading="eager"
          style={{ width: "auto" }}
        />
      </Link>

      {/* Search bar — sm and up only */}
      <div className="hidden sm:flex flex-1 justify-center px-4 lg:px-0">
        <div className="relative w-full max-w-65">
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
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Search icon — mobile only */}
        <button
          className="sm:hidden text-white/90 hover:text-white transition-colors p-1"
          aria-label="Search"
        >
          <SearchIcon />
        </button>

        {/* Hamburger — mobile only (< 640px) */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="sm:hidden text-white/90 hover:text-white transition-colors p-1"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* Provider/User dropdown — sm and up only */}
        <div className="relative hidden sm:block" ref={roleRef}>
          <button
            onClick={() => toggleMenu("role")}
            className={`flex items-center gap-1.5 text-white text-sm font-semibold hover:text-white/80 transition-colors px-2.5 py-1.5 rounded-full ${dropdownOpen ? "bg-white/15" : ""}`}
          >
            {roleLabel}
            <ChevronDownIcon />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl py-3 z-50 shadow-lg border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-4">Switch role</p>
              <div className="flex flex-col gap-1 px-2">
                <button
                  onClick={() => {
                    setOpenMenu(null);
                    setActiveView("provider");
                    router.push("/dashboard");
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                    activeView === "provider"
                      ? "bg-[#2FA39F] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Provider
                </button>
                <button
                  onClick={() => {
                    setOpenMenu(null);
                    setActiveView("user");
                    router.push("/user-dashboard/explore");
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                    activeView === "user"
                      ? "bg-[#2FA39F] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  User
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <span className="hidden sm:block w-px h-5 bg-white/40 shrink-0" />

        {/* Notification — sm and up only */}
        <div className="relative hidden sm:block" ref={notifRef}>
          <button
            onClick={() => toggleMenu("notif")}
            className={`w-11 h-11 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 transition-colors relative rounded-full ${notifOpen ? "bg-white/15 text-white" : ""}`}
          >
            <BellIcon />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-secondary)] rounded-full border border-[var(--color-primary)]" />
          </button>
          {notifOpen &&
            <NotificationPopover viewAllHref="/dashboard/notifications" onClose={() => setOpenMenu(null)} triggerRef={notifRef} />}
        </div>

        {/* Message — sm and up only */}
        <button
          onClick={() => router.push("/dashboard/messages")}
          className={`hidden sm:flex relative items-center justify-center w-11 h-11 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors ${pathname?.includes("/messages") ? "bg-white/15 text-white" : ""}`}
          aria-label="Messages"
        >
          <MessageIcon />
          {totalUnread > 0 && (
            <span className="absolute top-2 right-2 min-w-3.5 h-3.5 bg-[var(--color-secondary)] rounded-full text-[8px] flex items-center justify-center text-white font-bold border border-[#228E8A] px-0.5">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>

        {/* Avatar + Profile Dropdown — sm and up only */}
        <div className="relative hidden sm:block" ref={profileRef}>
          <button
            onClick={() => toggleMenu("profile")}
            className={`w-9 h-9 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden border-2 transition-colors ${profileOpen ? "border-white ring-2 ring-white/40" : "border-white/30 hover:border-white/60"}`}
            aria-label="Profile menu"
          >
            {profileImage ? <img src={profileImage} alt="avatar" className="w-full h-full object-cover" /> : avatarLetter}
          </button>
          {profileOpen &&
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl z-50 shadow-lg border border-gray-100 overflow-hidden">
              {profile && (
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#F5C842] flex items-center justify-center text-gray-900 font-bold text-base shrink-0 overflow-hidden">
                    {profileImage ? <img src={profileImage} alt="avatar" className="w-full h-full object-cover" /> : avatarLetter}
                  </div>
                  <div className="min-w-0">
                    {(profile.providerProfile?.firstName || profile.providerProfile?.lastName || profile.firstName || profile.lastName) && (
                      <p className="text-sm font-bold text-[var(--color-text)] truncate">
                        {[profile.providerProfile?.firstName || profile.firstName, profile.providerProfile?.lastName || profile.lastName].filter(Boolean).join(" ")}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 truncate">{profile.email}</p>
                  </div>
                </div>
              )}
              <div className="py-2">
                <button
                  onClick={() => { setOpenMenu(null); router.push("/dashboard/settings?tab=profile"); }}
                  className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm text-[var(--color-text)] hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-400"><UserIcon /></span>
                  My Profile
                </button>
                <button
                  onClick={() => { setOpenMenu(null); router.push("/dashboard/settings"); }}
                  className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm text-[var(--color-text)] hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-400"><SettingsIcon /></span>
                  Settings
                </button>
                {profile?.role === "admin" && (
                  <button
                    onClick={() => { setOpenMenu(null); router.push("/admin/refund-requests"); }}
                    className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm text-[#228E8A] hover:bg-[#EBF6F6] transition-colors font-semibold"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Admin Panel
                  </button>
                )}
              </div>
              <div className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogoutIcon />
                  Logout
                </button>
              </div>
            </div>}
        </div>

        {/* Hamburger — tablet (640px–1023px) opens the sidebar drawer */}
        <button
          onClick={onMenuToggle}
          className="hidden sm:flex lg:hidden text-white/90 hover:text-white transition-colors p-1"
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>
      </div>
    </header>

    

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-40 flex" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative ml-auto w-72 max-w-full h-full bg-white flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#228E8A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F5C842] flex items-center justify-center text-gray-900 font-bold text-base overflow-hidden">
                  {profileImage ? <img src={profileImage} alt="avatar" className="w-full h-full object-cover" /> : avatarLetter}
                </div>
                <div>
                  {(profile?.providerProfile?.firstName || profile?.providerProfile?.lastName || profile?.firstName || profile?.lastName) && (
                    <p className="text-xs font-semibold text-white truncate max-w-40">
                      {[profile.providerProfile?.firstName || profile.firstName, profile.providerProfile?.lastName || profile.lastName].filter(Boolean).join(" ")}
                    </p>
                  )}
                  {profile?.email && <p className="text-[11px] text-white/70 truncate max-w-40">{profile.email}</p>}
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white/80 hover:text-white">
                <CloseIcon />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto py-2">
              <button onClick={() => handleMobileNav("/dashboard/settings?tab=profile")} className="flex items-center gap-3 w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-gray-400"><UserIcon /></span> My Profile
              </button>
              <button onClick={() => handleMobileNav("/dashboard")} className="flex items-center gap-3 w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-gray-400"><DashboardIcon size={18} /></span> Dashboard
              </button>
              <button onClick={() => handleMobileNav("/dashboard/reservations")} className="flex items-center gap-3 w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-gray-400"><ReservationsIcon size={18} /></span> Reservations
              </button>
              <button onClick={() => handleMobileNav("/dashboard/listings")} className="flex items-center gap-3 w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-gray-400"><ListingsIcon size={18} /></span> Listings
              </button>
              <button onClick={() => handleMobileNav("/dashboard/earnings")} className="flex items-center gap-3 w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-gray-400"><EarningsIcon size={18} /></span> Earnings
              </button>
              <button onClick={() => handleMobileNav("/dashboard/settings")} className="flex items-center gap-3 w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-gray-400"><SettingsIcon /></span> Settings
              </button>

              <div className="my-2 border-t border-gray-100" />

              {/* Switch role */}
              <div className="px-5 py-3">
                <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Switch role</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-full bg-[#228E8A] text-white text-sm font-medium">Provider</button>
                  <button onClick={() => handleMobileNav("/user-dashboard/explore")} className="flex-1 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#228E8A] hover:text-[#228E8A] transition-colors">User</button>
                </div>
              </div>
            </nav>

            {/* Logout */}
            <div className="border-t border-gray-100 px-5 py-4">
              <button type="button" onClick={handleLogout} className="flex items-center gap-3 w-full text-left text-sm text-red-500 hover:text-red-600 transition-colors">
                <LogoutIcon /> Logout
              </button>
            </div>
          </div>
          
        </div>
      )}
    </>
  );
}
