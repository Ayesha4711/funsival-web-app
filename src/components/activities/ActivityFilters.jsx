'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  SkydivingIcon,
  JetSkiingIcon,
  ScubaDivingIcon,
  JeepRallyIcon,
  SearchIcon,
  SortFilterIcon,
} from '@/icons';

const ACTIVITY_TABS = [
  { id: 'skydiving',    label: 'Sky Diving',    href: '/activities/skydiving',    Icon: SkydivingIcon  },
  { id: 'jet-skiing',   label: 'Jet Skiing',    href: '/activities/jet-skiing',   Icon: JetSkiingIcon  },
  { id: 'scuba-diving', label: 'Scuba Diving',  href: '/activities/scuba-diving', Icon: ScubaDivingIcon },
  { id: 'jeep-rally',   label: 'Jeep Rally',    href: '/activities/jeep-rally',   Icon: JeepRallyIcon  },
];

export default function ActivityFilters({ filters, activeFilter, onFilterChange }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [showSearch,   setShowSearch]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between">

          {/* Activity-type tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {ACTIVITY_TABS.map((tab) => {
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
                  <tab.Icon
                    size={20}
                    className={isActive ? 'text-[#F5A623]' : 'text-gray-400'}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search + filter */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {showSearch && (
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities..."
                className="text-sm border border-gray-200 rounded-full px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#4AA7A7] w-48"
              />
            )}
            <button
              onClick={() => setShowSearch((s) => !s)}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#4AA7A7] transition-colors"
            >
              <SearchIcon size={16} className="text-gray-500" />
            </button>
            <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-[#4AA7A7] transition-colors">
              <SortFilterIcon size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
