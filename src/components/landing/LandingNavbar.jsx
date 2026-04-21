"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/images/logo.svg";

const profileMenuItems = [
  { icon: "👤", label: "Log In", href: "/login" },
  { icon: "✍️", label: "Sign Up", href: "/signup" },
  { icon: "🏠", label: "Become a Host", href: "#" },
  null,
  { icon: "❓", label: "Ask Funsival", href: "#" },
  { icon: "⚙️", label: "How Funsival Works", href: "#" },
  { icon: "🎁", label: "Gift Cards", href: "#" },
  { icon: "💬", label: "Contact Support", href: "#" },
  { icon: "⚖️", label: "Legal", href: "#" },
  { icon: "🛡️", label: "Insurance & Protection", href: "#" },
  { icon: "🔧", label: "Host Tools", href: "#" },
  { icon: "🧮", label: "Calculator", href: "#" }
];

export default function LandingNavbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

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
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 sm:gap-2 shrink-0">
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
                Book Now
              </button>
            </Link>

            {/* Hamburger */}
            <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Profile icon + dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>

              {profileOpen &&
                <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-2 overflow-hidden">
                  {profileMenuItems.map(
                    (item, i) =>
                      item === null
                        ? <div
                            key={i}
                            className="my-2 border-t border-gray-100"
                          />
                        : <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setProfileOpen(false)}
                          >
                            <span className="text-base">
                              {item.icon}
                            </span>
                            <span>
                              {item.label}
                            </span>
                          </Link>
                  )}
                </div>}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
