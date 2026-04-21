import React from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/logo.svg";

const InstagramIcon = () =>
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>;

const XIcon = () =>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.126 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>;

const YoutubeIcon = () =>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>;

const footerLinks = {
  Support: [
    "Help Center",
    "Cancellation Policy",
    "Privacy Policy",
    "Terms & Conditions",
    "FAQ's",
    "Report"
  ],
  Hosting: [
    "Funsival your home",
    "Hosting resources",
    "Hosting Responsibility",
    "Community Forum"
  ],
  Funsival: ["Newsroom", "New Features", "Careers", "Investors"]
};

export default function DashboardFooter() {
  return (
    <footer className="bg-[#F3F4F6]">
      {/* Newsletter */}
      <div className="px-6 sm:px-10 lg:px-16 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-[var(--color-border)]">
        <div>
          <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">
            Keep In Touch Through Our Newsletter!
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Lorem ipsum dolor sit amet consectetur.
          </p>
        </div>
        <div className="flex w-full md:w-auto max-w-sm gap-0 rounded-full border border-[var(--color-border)] overflow-hidden shadow-sm">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 min-w-0 px-5 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:outline-none bg-white"
          />
          <button className="shrink-0 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white text-sm font-semibold px-6 py-3 transition-colors">
            Subscribe
          </button>
        </div>
      </div>

      {/* Links grid */}
      <div className="px-6 sm:px-10 lg:px-16 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand column */}
        <div>
          <div className="mb-4">
            <Image
              src={logo}
              alt="Funsival"
              width={110}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </div>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            Lorem ipsum dolor sit amet consectetur. Sit libero ut adipiscing
            condimentum ullamcorper massa nec.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([heading, links]) =>
          <div key={heading}>
            <h4 className="text-sm font-bold text-[var(--color-text)] mb-4">
              {heading}
            </h4>
            <ul className="space-y-2.5">
              {links.map(link =>
                <li key={link}>
                  <Link
                    href="#"
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="bg-[var(--color-primary)] px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white/80 text-sm">
          Copyright © 2023 Funsival| All Rights Reserved
        </p>
        <div className="flex items-center gap-4">
          <button className="text-white/80 hover:text-white transition-colors">
            <InstagramIcon />
          </button>
          <button className="text-white/80 hover:text-white transition-colors">
            <XIcon />
          </button>
          <button className="text-white/80 hover:text-white transition-colors">
            <YoutubeIcon />
          </button>
        </div>
      </div>
    </footer>
  );
}
