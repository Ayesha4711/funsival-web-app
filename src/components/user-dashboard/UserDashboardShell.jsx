"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import logo from "@/assets/images/logo.svg";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, selectUser, selectProfileStatus } from "@/store/slices/profileSlice";
import { fetchConversations, selectTotalUnreadCount } from "@/store/slices/chatSlice";
import { resetStore } from "@/store/store";
import NotificationPopover from "@/components/shared/NotificationPopover";
import FullPageLoader from "@/components/common/FullPageLoader";
import axiosInstance from "@/store/axiosInstance";
import { useFCM, getStoredFcmToken } from "@/hooks/useFCM";
import { firebaseAuth } from "@/lib/firebase";

import { BellIcon, MessageIcon, SearchIcon, ChevronDownIcon, UserIcon, CalendarIcon as BookingIcon, HeartIcon as WatchlistIcon, SettingsIcon, LogoutIcon, MenuIcon as HamburgerIcon, CloseIcon } from "@/icons";

/* ─── Navbar ─────────────────────────────────────────────────────────────────── */
function UserNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const profile = useSelector(selectUser);
  const currentUserId = profile?.id || profile?._id || null;
  const totalUnread = useSelector((state) => selectTotalUnreadCount(state, currentUserId));

  // Start Firebase FCM listener so incoming messages update the badge in real-time
  useFCM();

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

  useEffect(() => {
    const h = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target)) setRoleOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleBellClick = () => {
    setNotifOpen((v) => !v);
    setProfileOpen(false);
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
    localStorage.removeItem("reservation_wishlists");
    localStorage.removeItem("listing_draft_local");
    sessionStorage.clear();
    dispatch(resetStore());
    // replace() removes the current protected route from history so back never returns to it
    window.location.replace("/logout");
  };

  const navigate = (path) => {
    setProfileOpen(false);
    setMobileOpen(false);
    router.push(path);
  };

  return (
    <>
      <header className="h-16 bg-[#228E8A] flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-4 shrink-0 sticky top-0 z-1100">
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
              User <ChevronDownIcon size={14} />
            </button>
            {roleOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl py-3 z-50 shadow-lg border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-4">Switch role</p>
                <div className="flex flex-col gap-1 px-2">
                  <button onClick={() => { setRoleOpen(false); router.push("/dashboard"); }} className="w-full text-left px-4 py-2.5 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">Provider</button>
                  <button onClick={() => { setRoleOpen(false); router.push("/user-dashboard/explore"); }} className="w-full text-left px-4 py-2.5 rounded-full text-sm font-semibold bg-[#2FA39F] text-white cursor-pointer">User</button>
                </div>
              </div>
            )}
          </div>

          <span className="w-px h-5 bg-white/40 shrink-0" />

          {/* Bell */}
          <div className="relative" ref={notifRef}>
            <button onClick={handleBellClick} className={`relative w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors cursor-pointer ${notifOpen ? "bg-white/20" : ""}`}>
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
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl z-50 shadow-lg border border-gray-100 overflow-hidden">
                {profile && (
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#F5C842] flex items-center justify-center text-gray-900 font-bold text-base shrink-0 overflow-hidden">
                      {profileImage ? <img src={profileImage} alt="avatar" className="w-full h-full object-cover" /> : avatarLetter}
                    </div>
                    <div className="min-w-0">
                      {displayFullName && (
                        <p className="text-sm font-bold text-[var(--color-text)] truncate">{displayFullName}</p>
                      )}
                      <p className="text-xs text-gray-400 truncate">{profile.email}</p>
                    </div>
                  </div>
                )}
                <div className="py-2">
                  <button onClick={() => navigate("/user-dashboard/settings?tab=profile")} className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-gray-400"><UserIcon /></span> My Profile
                  </button>
                  <button onClick={() => navigate("/user-dashboard/bookings")} className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-gray-400"><BookingIcon /></span> My Reservations
                  </button>
                  <button onClick={() => navigate("/user-dashboard/watchlist")} className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-gray-400"><WatchlistIcon /></span> My Wishlist
                  </button>
                  <button onClick={() => navigate("/user-dashboard/settings")} className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-gray-400"><SettingsIcon /></span> Settings
                  </button>
                </div>
                <div className="border-t border-gray-100">
                  <button type="button" onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                    <LogoutIcon size={18} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile right: search icon + bell + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <button onClick={handleBellClick} className={`relative w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors ${notifOpen ? "bg-white/20" : ""}`}>
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
                <LogoutIcon size={18} /> Logout
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
  const profile = useSelector(selectUser);
  const router = useRouter();

  useEffect(() => {
    if (status === "idle") dispatch(fetchProfile());
  }, [dispatch, status]);

  const role = profile?.role ?? profile?.data?.role ?? profile?.data?.user?.role ?? null;
  const isProvider = role === "host" || role === "admin";

  useEffect(() => {
    if (status === "succeeded" && isProvider) {
      router.replace("/dashboard");
    }
  }, [status, isProvider, router]);

  if (status === "idle" || status === "loading") return <FullPageLoader />;
  if (status === "failed") { window.location.replace("/"); return null; }
  if (isProvider) return <FullPageLoader />;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <UserNavbar />
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  );
}
