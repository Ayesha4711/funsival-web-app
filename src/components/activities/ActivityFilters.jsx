'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const ACTIVITY_TABS = [
  {
    id: 'skydiving',
    label: 'Sky Diving',
    href: '/activities/skydiving',
    icon: (active) => (
      <svg className={`w-5 h-5 ${active ? 'text-[#F5A623]' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v5M7 10c1.5 1 3 1.5 5 1.5S16.5 11 18 10" />
        <path d="M9 20l3-8 3 8" />
        <path d="M7 20h10" />
      </svg>
    ),
  },
  {
    id: 'jet-skiing',
    label: 'Jet Skiing',
    href: '/activities/jet-skiing',
    icon: (active) => (
      <svg className={`w-5 h-5 ${active ? 'text-[#F5A623]' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17c2-2 4-3 6-3s4 2 6 2 4-1 6-3" />
        <path d="M5 14l3-5h4l3 3" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'scuba-diving',
    label: 'Scuba Diving',
    href: '/activities/scuba-diving',
    icon: (active) => (
      <svg className={`w-5 h-5 ${active ? 'text-[#F5A623]' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M9 12a3 3 0 0 0 3 3" />
        <path d="M7 8c-1 1-2 3-2 4s1 3 2 4" />
        <path d="M17 8c1 1 2 3 2 4s-1 3-2 4" />
        <path d="M12 5v2M12 17v2" />
        <rect x="14" y="3" width="3" height="6" rx="1" />
      </svg>
    ),
  },
  {
    id: 'jeep-rally',
    label: 'Jeep Rally',
    href: '/activities/jeep-rally',
    icon: (active) => (
      <svg className={`w-5 h-5 ${active ? 'text-[#F5A623]' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="8" width="20" height="9" rx="2" />
        <path d="M5 8V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="17" cy="19" r="2" />
        <path d="M9 8h6" />
      </svg>
    ),
  },
];

export default function ActivityFilters({ filters, activeFilter, onFilterChange }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeTab = ACTIVITY_TABS.find(t => pathname?.includes(t.id)) || ACTIVITY_TABS[0];

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between">

          {/* Activity type tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {ACTIVITY_TABS.map(tab => {
              const isActive = pathname?.includes(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => router.push(tab.href)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 rounded-full my-2 ${
                    isActive
                      ? 'bg-[#FFF4E5] text-[#F5A623]'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {tab.icon(isActive)}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search + Filter icons */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {showSearch && (
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search activities..."
                className="text-sm border border-gray-200 rounded-full px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#4AA7A7] w-48"
              />
            )}
            <button
              onClick={() => setShowSearch(s => !s)}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#4AA7A7] transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#4AA7A7] transition-colors">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 8h12M9 12h6M11 16h2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
