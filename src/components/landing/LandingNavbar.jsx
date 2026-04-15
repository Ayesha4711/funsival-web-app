'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-[#F5C842]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span className="text-xl md:text-2xl font-bold text-[#4AA7A7]">
                funsival
              </span>
            </div>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-6 py-2.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-semibold rounded-full transition-colors duration-200">
              Book Now
            </button>

            <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <button className="w-full px-6 py-3 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-semibold rounded-xl transition-colors duration-200">
                Book Now
              </button>
              <button className="w-full px-6 py-3 border-2 border-gray-200 hover:border-[#4AA7A7] text-gray-700 font-semibold rounded-xl transition-colors duration-200">
                Search
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
