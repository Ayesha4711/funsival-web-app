"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/assets/images/logo.svg";

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ReservationsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ListingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const EarningsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

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
          fixed top-0 left-0 h-full w-56 bg-[var(--color-primary)] z-40 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${hideOnDesktop ? "" : "lg:relative lg:translate-x-0 lg:z-auto lg:shrink-0"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 shrink-0">
          <Link href="/dashboard" onClick={onClose}>
            <Image src={logo} alt="Funsival" width={120} height={36} className="h-9 w-auto object-contain" />
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-1 px-3 pt-4">
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
                    ? "bg-[var(--color-secondary)] text-white"
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
      </aside>
    </>
  );
}
