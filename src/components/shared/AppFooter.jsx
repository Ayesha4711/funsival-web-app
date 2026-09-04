"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/logo.svg";
import { InstagramIcon, XTwitterIcon, YoutubeIcon } from "@/icons";

const footerLinks = {
  Support: [
    "Help Center",
    "Cancellation Policy",
    "Privacy Policy",
    "Terms & Conditions",
    "FAQ's",
    "Report",
  ],
  Hosting: [
    "Funsival your home",
    "Hosting resources",
    "Hosting Responsibility",
    "Community Forum",
  ],
  Funsival: ["Newsroom", "New Features", "Careers", "Investors"],
};

export default function AppFooter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
  };

  return (
    <footer className="bg-[#FBFBFB] w-full border-t border-gray-200">
      {/* Newsletter */}
      <div className="px-6 sm:px-10 lg:px-16 py-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-200">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Keep In Touch Through Our Newsletter!
          </h3>
          <p className="text-sm text-gray-500">
            Lorem ipsum dolor sit amet consectetur.
          </p>
        </div>
        <form
          onSubmit={handleSubscribe}
          className="flex items-center bg-white rounded-full border border-gray-200 overflow-hidden p-1 w-full md:w-auto lg:min-w-[400px]"
        >
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 min-w-0 px-5 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent"
          />
          <button
            type="submit"
            className="shrink-0 px-6 py-2.5 bg-[#FEB538] hover:bg-[#e09d2a] text-gray-900 font-semibold text-sm rounded-full transition-colors"
          >
            Subscribe
          </button>
        </form>
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
          <p className="text-sm text-gray-500 leading-relaxed">
            Lorem ipsum dolor sit amet consectetur. Sit libero ut adipiscing
            condimentum ullamcorper massa nec.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="text-sm font-bold text-gray-900 mb-4">{heading}</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="bg-[var(--color-primary)] px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white/80 text-sm">
          Copyright © 2023 Funsival | All Rights Reserved
        </p>
        <div className="flex items-center gap-4">
          <button className="text-white/80 hover:text-white transition-colors">
            <InstagramIcon size={18} />
          </button>
          <button className="text-white/80 hover:text-white transition-colors">
            <XTwitterIcon size={18} />
          </button>
          <button className="text-white/80 hover:text-white transition-colors">
            <YoutubeIcon size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
}
