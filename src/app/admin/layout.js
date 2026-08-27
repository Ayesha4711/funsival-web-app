"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "@/store/slices/profileSlice";
import { resetStore } from "@/store/store";
import logo from "@/assets/images/logo.svg";

const NAV_ITEMS = [
  {
    label: "Refund Requests",
    href: "/admin/refund-requests",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const profile = useSelector(selectUser);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isLoginPage = pathname?.startsWith("/admin/login");

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const confirmLogout = () => {
    dispatch(resetStore());
    localStorage.removeItem("auth-token");
    document.cookie = "auth-token=; Max-Age=0; path=/";
    router.push("/admin/login");
  };

  const avatarLetter = (profile?.firstName?.[0] || profile?.email?.[0] || "A").toUpperCase();
  const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || profile?.email || "Admin";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navbar */}
      <header className="h-16 bg-[#228E8A] flex items-center px-4 sm:px-6 shrink-0 z-10">

        {/* Logo */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Image src={logo} alt="Funsival" width={120} height={36} className="h-7 w-auto" />
          <span className="text-xs font-semibold text-white/60 bg-white/10 px-2 py-0.5 rounded-full">Admin</span>
        </div>

        {/* Nav links — desktop */}
        <nav className="hidden sm:flex items-center gap-1 flex-1 justify-center">
          {NAV_ITEMS.map(({ label, href, icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {icon}
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right: avatar dropdown */}
        <div className="flex items-center flex-1 justify-end">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-bold border border-white/30 hover:bg-white/30 transition-colors"
            >
              {avatarLetter}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800 truncate">{displayName}</p>
                  {profile?.email && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{profile.email}</p>
                  )}
                </div>
                {/* Logout */}
                <button
                  onClick={() => { setDropdownOpen(false); setShowLogoutModal(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="sm:hidden flex items-center gap-1 bg-[#1a7a77] border-b border-white/10 px-3 py-2 overflow-x-auto shrink-0">
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                active ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Log out of Admin Panel?</p>
                <p className="text-xs text-gray-400 mt-0.5">You'll need to sign in again to access the dashboard.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
