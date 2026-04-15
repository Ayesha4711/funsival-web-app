'use client';

import React, { useRef } from 'react';
import Image from 'next/image';

const destinations = [
  {
    id: 1,
    name: 'Colorado',
    image: '/images/destinations/colorado.jpg',
    bgColor: 'bg-gradient-to-br from-orange-400 to-red-500'
  },
  {
    id: 2,
    name: 'Hawaii',
    image: '/images/destinations/hawaii.jpg',
    bgColor: 'bg-gradient-to-br from-blue-400 to-cyan-500'
  },
  {
    id: 3,
    name: 'Los Angeles',
    image: '/images/destinations/los-angeles.jpg',
    bgColor: 'bg-gradient-to-br from-purple-400 to-pink-500'
  },
  {
    id: 4,
    name: 'New York',
    image: '/images/destinations/new-york.jpg',
    bgColor: 'bg-gradient-to-br from-yellow-400 to-orange-500'
  }
];

export default function BrowseByDestination() {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350;
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
            Browse by destination
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
            {destinations.map((destination) => (
              <div
                key={destination.id}
                className="relative flex-shrink-0 w-64 sm:w-72 md:w-80 lg:w-96 h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden cursor-pointer group"
              >
                {/* Background with fallback gradient */}
                <div className={`absolute inset-0 ${destination.bgColor}`}>
                  {/* Image overlay - will show when image is available */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundImage: `url('${destination.image}')`,
                      backgroundColor: 'rgba(0,0,0,0.3)'
                    }}
                  />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      {destination.name}
                    </h3>
                    <div className="w-10 h-10 bg-[#F5C842] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
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
