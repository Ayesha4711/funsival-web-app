"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "@/assets/images/logo.svg";

function getLogoHref() {
  if (typeof window === "undefined") return "/";
  const token = localStorage.getItem("auth-token") ||
    document.cookie.split(";").find(c => c.trim().startsWith("auth-token="))?.split("=")[1];
  if (!token) return "/";

  // Decode JWT payload to read role
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = payload?.role ?? payload?.data?.role;
    if (role === "host" || role === "provider") return "/dashboard";
    return "/user-dashboard/explore";
  } catch {
    return "/";
  }
}

/* ── SVG icons matching image 2 ─────────────────────────────────────────────── */
function IconGear() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function IconCard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );
}

const profileMenuItems = [
  { Icon: IconGear,  label: "Log In",               href: "/login" },
  { Icon: IconGear,  label: "Sign Up",               href: "/signup/role-selection" },
  { Icon: IconStar,  label: "Become a Host",         href: "/signup/host" },
  null,
  { Icon: IconCard,  label: "Ask Funsival",          href: "#" },
  { Icon: IconStar,  label: "How Funsival Works",    href: "#" },
  { Icon: IconStar,  label: "Gift Cards",            href: "#" },
  { Icon: IconStar,  label: "Contact Support",       href: "#" },
  { Icon: IconStar,  label: "Legal",                 href: "#" },
  { Icon: IconStar,  label: "Insurance & Protection",href: "#" },
  { Icon: IconStar,  label: "Host Tools",            href: "#" },
  { Icon: IconStar,  label: "Calculator",            href: "#" },
];

export default function LandingNavbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoHref, setLogoHref] = useState("/");
  const profileRef = useRef(null);
  const router = useRouter();

  // Resolve logo href client-side after mount (needs localStorage/cookie)
  useEffect(() => {
    setLogoHref(getLogoHref());
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16 md:h-20 gap-2">
          {/* Logo — routes based on auth state */}
          <Link href={logoHref} className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Image
              src={logo}
              alt="Funsival"
              width={120}
              height={36}
              className="h-6 sm:h-7 md:h-8 w-auto"
            />
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Book Now */}
            <Link href="/signup/role-selection" className="shrink-0">
              <button className="px-3 sm:px-5 py-1.5 sm:py-2 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-semibold rounded-full text-[10px] sm:text-xs md:text-sm transition-colors duration-200 whitespace-nowrap">
                Book Your Jump
              </button>
            </Link>

            {/* Hamburger */}
            <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Profile icon + dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-[#F0E8D8] z-50 py-3 overflow-hidden">
                  {profileMenuItems.map((item, i) =>
                    item === null ? (
                      <div key={i} className="my-2 mx-4 border-t border-gray-200" />
                    ) : (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 px-5 py-3 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <span className="text-gray-500 shrink-0">
                          <item.Icon />
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
