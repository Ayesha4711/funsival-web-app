"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "@/store/slices/profileSlice";
import { fetchConversations, selectTotalUnreadCount } from "@/store/slices/chatSlice";
import axiosInstance from "@/store/axiosInstance";
import { resetStore } from "@/store/store";
import { getStoredFcmToken, useFCM } from "@/hooks/useFCM";
import { firebaseAuth } from "@/lib/firebase";
import logo from "@/assets/images/logo.svg";
import NotificationPopover from "@/components/shared/NotificationPopover";
import {
  SearchIcon,
  ChevronDownIcon,
  BellIcon,
  MessageIcon,
  UserIcon,
  SettingsIcon,
  LogoutIcon,
} from "@/icons";

/* ─── Wizard navbar ─────────────────────────────────────────────────────────── */
export default function WizardNavbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const profile  = useSelector(selectUser);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  const currentUserId = profile?.id || profile?._id || null;
  const totalUnread   = useSelector((state) => selectTotalUnreadCount(state, currentUserId));

  const displayFirstName = profile?.firstName || profile?.providerProfile?.firstName || "";
  const displayLastName  = profile?.lastName  || profile?.providerProfile?.lastName  || "";
  const avatarLetter  = (displayFirstName[0] || displayLastName[0] || profile?.email?.[0] || "P").toUpperCase();
  const profileImage  = profile?.providerProfile?.profileImage ?? profile?.profileImage ?? null;
  const displayFullName = [displayFirstName, displayLastName].filter(Boolean).join(" ");

  // Live unread-message badge
  useFCM();
  useEffect(() => {
    if (!currentUserId) return;
    if (pathname?.includes("/messages")) return;
    dispatch(fetchConversations());
    const timer = setInterval(() => {
      if (document.visibilityState !== "hidden" && !pathname?.includes("/messages")) {
        dispatch(fetchConversations());
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [dispatch, pathname, currentUserId]);

  // Close popovers on outside click
  useEffect(() => {
    function handle(e) {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleNotifClick = () => {
    if (window.innerWidth < 1024) {
      router.push("/dashboard/notifications");
    } else {
      setNotifOpen(v => !v);
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
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
    window.location.href = "/logout";
  };

  return (
    <header className="flex h-14 sm:h-16 bg-[#228E8A] items-center justify-between px-3 sm:px-8 gap-2 sm:gap-4 shrink-0 sticky top-0 z-50">
      {/* Logo */}
      <Image src={logo} alt="Funsival" width={110} height={32} className="h-7 sm:h-8 w-auto object-contain shrink-0" />

      {/* Search — sm and up only */}
      <div className="hidden sm:flex flex-1 justify-center px-4">
        <div className="relative w-full max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            placeholder="Search here"
            className="w-full h-9 pl-10 pr-4 rounded-full bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">

        {/* Provider / User switcher — sm and up only */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-1.5 text-white text-sm font-medium hover:text-white/80 transition-colors"
          >
            Provider <ChevronDownIcon size={14} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl py-1 z-50 shadow-lg">
              <button
                onClick={() => { setDropdownOpen(false); router.push("/dashboard"); }}
                className="block w-full text-left px-4 py-2 text-sm font-semibold text-[#228E8A] bg-[#EBF6F6] hover:bg-[#d5efee] transition-colors"
              >
                Provider
              </button>
              <button
                onClick={() => { setDropdownOpen(false); router.push("/user-dashboard/explore"); }}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                User
              </button>
            </div>
          )}
        </div>

        <span className="hidden sm:block w-px h-5 bg-white/40 shrink-0" />

        {/* Notification bell — sm and up only */}
        <div className="relative hidden sm:block" ref={notifRef}>
          <button
            onClick={handleNotifClick}
            className="text-white/90 hover:text-white transition-colors relative p-1"
            aria-label="Notifications"
          >
            <BellIcon size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#FEB538] rounded-full border border-[#228E8A]" />
          </button>
          {notifOpen && <NotificationPopover onClose={() => setNotifOpen(false)} />}
        </div>

        {/* Messages — sm and up only */}
        <button
          onClick={() => router.push("/dashboard/messages")}
          className="hidden sm:flex relative text-white/90 hover:text-white transition-colors p-1"
          aria-label="Messages"
        >
          <MessageIcon size={20} />
          {totalUnread > 0 && (
            <span className="absolute top-0 right-0 min-w-3.5 h-3.5 bg-[#FEB538] rounded-full text-[8px] flex items-center justify-center text-white font-bold border border-[#228E8A] px-0.5">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>

        {/* Avatar + profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(v => !v)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FEB538] flex items-center justify-center text-white font-bold text-sm border-2 border-white/30 overflow-hidden hover:border-white/60 transition-colors"
            aria-label="Profile menu"
          >
            {profileImage
              ? <img src={profileImage} alt="avatar" className="w-full h-full object-cover" />
              : avatarLetter}
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl py-1.5 z-50 border border-gray-100 shadow-lg">
              {profile && (
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FEB538] flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
                    {profileImage
                      ? <img src={profileImage} alt="avatar" className="w-full h-full object-cover" />
                      : avatarLetter}
                  </div>
                  <div className="min-w-0">
                    {displayFullName && (
                      <p className="text-xs font-bold text-gray-900 truncate">{displayFullName}</p>
                    )}
                    <p className="text-[10px] text-gray-400 truncate">{profile.email}</p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => { setProfileOpen(false); router.push("/dashboard/settings?tab=profile"); }}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-400"><UserIcon /></span> My Profile
              </button>
              <button
                type="button"
                onClick={() => { setProfileOpen(false); router.push("/dashboard/settings"); }}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-400"><SettingsIcon /></span> Settings
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
