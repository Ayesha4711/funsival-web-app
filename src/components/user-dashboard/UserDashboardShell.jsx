"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import logo from "@/assets/images/logo.svg";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, selectUser, selectProfileStatus } from "@/store/slices/profileSlice";
import { fetchConversations, selectTotalUnreadCount } from "@/store/slices/chatSlice";
import NotificationPopover from "@/components/shared/NotificationPopover";
import FullPageLoader from "@/components/common/FullPageLoader";
import axiosInstance from "@/store/axiosInstance";
import { getStoredFcmToken } from "@/hooks/useFCM";
import { firebaseAuth } from "@/lib/firebase";

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
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const BookingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const WatchlistIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── Navbar ─────────────────────────────────────────────────────────────────── */
function UserNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const profile = useSelector(selectUser);
  const currentUserId = profile?.id || profile?._id || null;
  const totalUnread = useSelector((state) => selectTotalUnreadCount(state, currentUserId));
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const roleRef = useRef(null);
  const searchDebounce = useRef(null);

  const isExplorePage = pathname === "/user-dashboard/explore";

  const handleSearchChange = (e) => {
    if (!isExplorePage) return;
    const value = e.target.value;
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      router.replace(`/user-dashboard/explore?${params.toString()}`);
    }, 400);
  };

  const displayFirstName = profile?.firstName || profile?.providerProfile?.firstName || "";
  const displayLastName  = profile?.lastName  || profile?.providerProfile?.lastName  || "";
  const displayFullName  = [displayFirstName, displayLastName].filter(Boolean).join(" ");
  const avatarLetter = (displayFirstName[0] || displayLastName[0] || profile?.email?.[0] || "U").toUpperCase();
  const profileImage = profile?.profileImage ?? profile?.providerProfile?.profileImage ?? null;

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

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

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    const fcmToken = getStoredFcmToken();
    if (fcmToken) {
      await axiosInstance
        .delete(`/notifications/device-tokens/${encodeURIComponent(fcmToken)}`)
        .catch(() => {});
    }
    await firebaseAuth.signOut().catch(() => {});
    localStorage.removeItem("auth-token");
    router.push("/logout");
  };

  const navigate = (path) => {
    setProfileOpen(false);
    setMobileOpen(false);
    router.push(path);
  };

  return (
    <>
      <header className="h-16 bg-[#228E8A] flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-4 shrink-0 sticky top-0 z-50">
        {/* Logo */}
        <Link href="/user-dashboard/explore" className="flex items-center shrink-0">
          <Image src={logo} alt="Funsival" width={110} height={32} className="h-7 sm:h-8 w-auto object-contain" />
        </Link>

        {/* Search — hidden on mobile */}
        <div className="hidden sm:flex flex-1 justify-center px-4">
          <div className="relative w-full max-w-65">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
            <input type="text" placeholder="Search here" onChange={handleSearchChange} className="w-full h-9 pl-10 pr-4 rounded-full bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none" />
          </div>
        </div>

        {/* Desktop right actions */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Role switcher */}
          <div className="relative" ref={roleRef}>
            <button onClick={() => setRoleOpen((v) => !v)} className="flex items-center gap-1 text-white text-sm font-medium hover:text-white/80 transition-colors cursor-pointer">
              User <ChevronDownIcon />
            </button>
            {roleOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl py-1 z-50 shadow-lg">
                <button onClick={() => { setRoleOpen(false); router.push("/dashboard"); }} className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 cursor-pointer transition-colors">Provider</button>
                <button onClick={() => { setRoleOpen(false); router.push("/user-dashboard/explore"); }} className="block w-full text-left px-4 py-2 text-sm font-semibold text-[#228E8A] bg-gray-50 cursor-pointer">User</button>
              </div>
            )}
          </div>

          <span className="w-px h-5 bg-white/40 shrink-0" />

          {/* Bell */}
          <div className="relative" ref={notifRef}>
            <button onClick={handleBellClick} className="relative w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors cursor-pointer">
              <BellIcon />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F5C842] rounded-full border border-[#228E8A]" />
            </button>
            {notifOpen && <NotificationPopover viewAllHref="/user-dashboard/notifications" onClose={() => setNotifOpen(false)} />}
          </div>

          {/* Messages */}
          <button onClick={() => router.push("/user-dashboard/messages")} className="relative w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors cursor-pointer" aria-label="Messages">
            <MessageIcon />
            {totalUnread > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 bg-[#F5C842] rounded-full text-[8px] flex items-center justify-center text-gray-900 font-bold border border-[#228E8A] px-0.5">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
          </button>

          {/* Avatar + profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }} className="w-9 h-9 rounded-full bg-[#F5C842] flex items-center justify-center text-gray-900 font-bold text-sm border-2 border-white/40 hover:border-white/70 transition-colors cursor-pointer overflow-hidden" aria-label="Profile menu">
              {profileImage ? <img src={profileImage} alt="avatar" className="w-full h-full object-cover" /> : avatarLetter}
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl py-1.5 z-50 border border-gray-100">
                {profile && (
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#F5C842] flex items-center justify-center text-gray-900 font-bold text-xs shrink-0 overflow-hidden">
                      {profileImage ? <img src={profileImage} alt="avatar" className="w-full h-full object-cover" /> : avatarLetter}
                    </div>
                    <div className="min-w-0">
                      {displayFullName && (
                        <p className="text-xs font-bold text-[var(--color-text)] truncate">{displayFullName}</p>
                      )}
                      <p className="text-[10px] text-gray-400 truncate">{profile.email}</p>
                    </div>
                  </div>
                )}
                <div className="py-1">
                  <button onClick={() => navigate("/user-dashboard/settings?tab=profile")} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-gray-400"><UserIcon /></span> My Profile
                  </button>
                  <button onClick={() => navigate("/user-dashboard/bookings")} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-gray-400"><BookingIcon /></span> My Reservations
                  </button>
                  <button onClick={() => navigate("/user-dashboard/watchlist")} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-gray-400"><WatchlistIcon /></span> My Wishlist
                  </button>
                  <button onClick={() => navigate("/user-dashboard/settings")} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-gray-400"><SettingsIcon /></span> Settings
                  </button>
                </div>
                <div className="border-t border-gray-100">
                  <button type="button" onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                    <LogoutIcon /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile right: search icon + bell + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <button onClick={handleBellClick} className="relative w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors">
            <BellIcon />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F5C842] rounded-full border border-[#228E8A]" />
          </button>
          <button onClick={() => router.push("/user-dashboard/messages")} className="relative w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors">
            <MessageIcon />
            {totalUnread > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 bg-[#F5C842] rounded-full text-[8px] flex items-center justify-center text-gray-900 font-bold border border-[#228E8A] px-0.5">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
          </button>
          <button onClick={() => setMobileOpen((v) => !v)} className="w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors" aria-label="Menu">
            {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-40 flex" onClick={() => setMobileOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Drawer panel */}
          <div className="relative ml-auto w-72 max-w-full h-full bg-white flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#228E8A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F5C842] flex items-center justify-center text-gray-900 font-bold text-base overflow-hidden">
                  {profileImage ? <img src={profileImage} alt="avatar" className="w-full h-full object-cover" /> : avatarLetter}
                </div>
                <div>
                  {displayFullName && (
                    <p className="text-xs font-semibold text-white truncate max-w-40">{displayFullName}</p>
                  )}
                  {profile?.email && <p className="text-[11px] text-white/70 truncate max-w-40">{profile.email}</p>}
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white/80 hover:text-white">
                <CloseIcon />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></span>
                <input type="text" placeholder="Search here" className="w-full h-9 pl-9 pr-4 rounded-full bg-gray-100 text-sm text-gray-800 placeholder-gray-400 focus:outline-none" />
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto py-2">
              <button onClick={() => navigate("/user-dashboard/settings?tab=profile")} className="flex items-center gap-3 w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-gray-400"><UserIcon /></span> My Profile
              </button>
              <button onClick={() => navigate("/user-dashboard/bookings")} className="flex items-center gap-3 w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-gray-400"><BookingIcon /></span> My Reservations
              </button>
              <button onClick={() => navigate("/user-dashboard/watchlist")} className="flex items-center gap-3 w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-gray-400"><WatchlistIcon /></span> My Wishlist
              </button>
              <button onClick={() => navigate("/user-dashboard/settings")} className="flex items-center gap-3 w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="text-gray-400"><SettingsIcon /></span> Settings
              </button>

              <div className="my-2 border-t border-gray-100" />

              {/* Role switcher in mobile */}
              <div className="px-5 py-3">
                <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Switch role</p>
                <div className="flex gap-2">
                  <button onClick={() => navigate("/dashboard")} className="flex-1 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#228E8A] hover:text-[#228E8A] transition-colors">Provider</button>
                  <button className="flex-1 py-2 rounded-full bg-[#228E8A] text-white text-sm font-medium">User</button>
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

/* ─── Shell ──────────────────────────────────────────────────────────────────── */
export default function UserDashboardShell({ children }) {
  const dispatch = useDispatch();
  const status = useSelector(selectProfileStatus);

  useEffect(() => {
    if (status === "idle") dispatch(fetchProfile());
  }, [dispatch, status]);

  if (status === "idle" || status === "loading") return <FullPageLoader />;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <UserNavbar />
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  );
}
