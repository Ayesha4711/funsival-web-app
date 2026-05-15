"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/assets/images/logo.svg";
import { DashboardIcon, ReservationsIcon, ListingsIcon, EarningsIcon } from "@/icons";

const navItems = [
  { href: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
  { href: "/dashboard/reservations", label: "Reservations", Icon: ReservationsIcon },
  { href: "/dashboard/listings", label: "Listings", Icon: ListingsIcon },
  { href: "/dashboard/earnings", label: "Earnings", Icon: EarningsIcon },
];

export default function DashboardSidebar({ isOpen, onClose, hideOnDesktop = false }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar — on hideOnDesktop pages it stays mobile-only (never pins at lg+) */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-56 z-40 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${hideOnDesktop ? "" : "lg:relative lg:translate-x-0 lg:z-auto lg:shrink-0"}
        `}
      >
        {/* Logo — darker teal matching navbar */}
        <div className="h-16 flex items-center px-6 shrink-0 bg-[#228E8A]">
          <Link href="/dashboard" onClick={onClose}>
            <Image src={logo} alt="Funsival" width={120} height={36} className="h-9 w-auto object-contain" style={{ width: "auto" }} />
          </Link>
        </div>

        {/* Nav area — lighter teal */}
        <div className="flex-1 flex flex-col bg-[#2FAE9E] overflow-hidden">

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-1 px-3 pt-8">
          {navItems.map(({ href, label, Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150
                  ${isActive
                    ? "bg-[#FEB538] text-gray-900"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>
        </div>
      </aside>
    </>
  );
}
