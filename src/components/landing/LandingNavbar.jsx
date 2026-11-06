"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  { Icon: StarIcon,       label: "Become a Provider",     href: "/signup/role-selection" },
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

  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    setLogoHref(getLogoHref());
    if (window.location.hash) {
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
    }
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
    <header className="landing-navbar absolute top-0 left-0 right-0 z-50 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px]">
        <div className="landing-navbar-inner flex items-center justify-between h-16 md:h-20 gap-2">
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

          <nav className="landing-nav-links" aria-label="Main navigation">
            <a href="#browse-by-adventure" onClick={(event) => scrollToSection(event, "browse-by-adventure")}>Explore</a>
            <a href="#how-it-works" onClick={(event) => scrollToSection(event, "how-it-works")}>How it works</a>
            <Link href="/signup/role-selection">Become a provider</Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Login and sign-up actions */}
            <Link href="/login" className="landing-login hidden md:block shrink-0">Login</Link>
            <Link href="/signup/role-selection" className="landing-signup hidden md:block shrink-0 px-5 py-2 bg-[#FEB538] hover:bg-[#e0b430] text-gray-900 rounded-full text-sm transition-colors duration-200 whitespace-nowrap">
              Sign Up
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
                        className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${item.admin ? "text-[#228E8A] hover:bg-[#EBF6F6]" : "text-gray-800 hover:bg-gray-50"}`}
                        onClick={(event) => {
                          if (item.href === "#") event.preventDefault();
                          setProfileOpen(false);
                        }}
                      >
                        <span className={`shrink-0 ${item.admin ? "text-[#228E8A]" : "text-gray-500"}`}><item.Icon size={18} /></span>
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
          <div className="landing-mobile-menu-backdrop fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="landing-mobile-menu absolute left-4 right-4 top-full z-50 md:hidden">
            <div className="landing-mobile-menu-brand">
              <Image src={logo} alt="Funsival" width={120} height={36} />
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><CloseIcon size={22} /></button>
            </div>
            <nav aria-label="Mobile navigation">
              <a href="#browse-by-adventure" onClick={(event) => { scrollToSection(event, "browse-by-adventure"); setMenuOpen(false); }}>Explore</a>
              <a href="#how-it-works" onClick={(event) => { scrollToSection(event, "how-it-works"); setMenuOpen(false); }}>How it works</a>
              <Link href="/signup/role-selection" onClick={() => setMenuOpen(false)}>Become a provider</Link>
            </nav>
            <div className="landing-mobile-menu-actions">
              <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/signup/role-selection" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
