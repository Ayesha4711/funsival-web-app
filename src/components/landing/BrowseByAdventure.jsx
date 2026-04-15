'use client';

import React, { useRef } from 'react';
import Link from 'next/link';

const adventures = [
  {
    id: 1,
    name: 'Skydiving',
    icon: '🪂',
    bgColor: 'bg-[#FFF4E6]',
    iconBg: 'bg-[#F5C842]',
    link: '/activities/skydiving'
  },
  {
    id: 2,
    name: 'Jet Skiing',
    icon: '🚤',
    bgColor: 'bg-[#FFE8E8]',
    iconBg: 'bg-[#FF8A80]',
    link: '/activities/jet-skiing'
  },
  {
    id: 3,
    name: 'Scuba Diving',
    icon: '🤿',
    bgColor: 'bg-[#E3F2FD]',
    iconBg: 'bg-[#64B5F6]',
    link: '/activities/scuba-diving'
  },
  {
    id: 4,
    name: 'Jeep Rally',
    icon: '🚙',
    bgColor: 'bg-[#F3E5F5]',
    iconBg: 'bg-[#BA68C8]',
    link: '/activities/jeep-rally'
  },
  {
    id: 5,
    name: 'Paragliding',
    icon: '🪂',
    bgColor: 'bg-[#E8F5E9]',
    iconBg: 'bg-[#81C784]',
    link: '/activities/skydiving'
  },
  {
    id: 6,
    name: 'Bungee Jumping',
    icon: '🎢',
    bgColor: 'bg-[#FFF3E0]',
    iconBg: 'bg-[#FFB74D]',
    link: '/activities/skydiving'
  }
];

export default function BrowseByAdventure() {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollPosition = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            Browse by adventure
          </h2>

          {/* Navigation Arrows - Hidden on Mobile */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 hover:border-[#4AA7A7] hover:text-[#4AA7A7] flex items-center justify-center transition-all duration-200"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 hover:border-[#4AA7A7] hover:text-[#4AA7A7] flex items-center justify-center transition-all duration-200"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {adventures.map((adventure) => (
              <Link
                key={adventure.id}
                href={adventure.link}
                className={`flex-shrink-0 w-40 sm:w-48 md:w-56 lg:w-64 ${adventure.bgColor} rounded-2xl p-6 cursor-pointer hover:scale-105 transition-transform duration-200`}
              >
                <div className="flex flex-col items-start">
                  <div className={`w-12 h-12 md:w-14 md:h-14 ${adventure.iconBg} rounded-full flex items-center justify-center text-2xl md:text-3xl mb-4`}>
                    {adventure.icon}
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    {adventure.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6">
          <span className="w-8 h-1 bg-[#4AA7A7] rounded-full"></span>
          <span className="w-2 h-1 bg-gray-300 rounded-full"></span>
          <span className="w-2 h-1 bg-gray-300 rounded-full"></span>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
