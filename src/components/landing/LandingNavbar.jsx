"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "@/assets/images/logo.svg";
import { SettingsIcon, StarIcon, CreditCardIcon, MenuIcon, CloseIcon, UserIcon } from "@/icons";

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

const profileMenuItems = [
  { Icon: SettingsIcon,   label: "Log In",               href: "/login" },
  { Icon: SettingsIcon,   label: "Sign Up",               href: "/signup/role-selection" },
  { Icon: StarIcon,       label: "Become a Host",         href: "/signup/host" },
  null,
  { Icon: CreditCardIcon, label: "Ask Funsival",          href: "#" },
  { Icon: StarIcon,       label: "How Funsival Works",    href: "#" },
  { Icon: StarIcon,       label: "Gift Cards",            href: "#" },
  { Icon: StarIcon,       label: "Contact Support",       href: "#" },
  { Icon: StarIcon,       label: "Legal",                 href: "#" },
  { Icon: StarIcon,       label: "Insurance & Protection",href: "#" },
  { Icon: StarIcon,       label: "Host Tools",            href: "#" },
  { Icon: StarIcon,       label: "Calculator",            href: "#" },
];

export default function LandingNavbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoHref, setLogoHref] = useState("/");
  const profileRef = useRef(null);
  const router = useRouter();

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px]">
        <div className="flex items-center justify-between h-16 md:h-20 gap-2">
          {/* Logo */}
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
            {/* Book Now — desktop only */}
            <Link href="/signup/role-selection" className="hidden md:block shrink-0">
              <button className="px-5 py-2 bg-[#FEB538] hover:bg-[#e0b430] text-gray-900  rounded-full text-sm transition-colors duration-200 whitespace-nowrap">
                Book Your Jump
              </button>
            </Link>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              {menuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
            </button>

            {/* Profile icon + dropdown — desktop only */}
            <div className="relative hidden md:block" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <UserIcon size={20} />
              </button>

              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-2xl border border-[#F0E8D8] z-50 py-3 overflow-hidden">
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
                        <span className="text-gray-500 shrink-0"><item.Icon size={18} /></span>
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

      {/* Mobile menu dropdown — compact, anchored to right */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-full right-4 w-52 max-h-[60vh] overflow-y-auto bg-white z-50 md:hidden rounded-2xl border border-gray-100 py-1">
            {profileMenuItems.map((item, i) =>
              item === null ? (
                <div key={i} className="mx-3 my-1 border-t border-gray-100" />
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-800 hover:bg-gray-50 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-gray-400 shrink-0"><item.Icon size={14} /></span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            )}
          </div>
        </>
      )}
    </header>
  );
}
