'use client';

import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@/icons';
import {
  fetchBrowseDestinations,
  selectBrowseDestinations,
  selectBrowseDestinationsStatus,
  selectLandingSearch,
} from '@/store/slices/activitiesSlice';

function destinationHref(d) {
  return `/destinations/${encodeURIComponent(d.city)}`;
}

export default function BrowseByDestination() {
  const dispatch = useDispatch();
  const destinations = useSelector(selectBrowseDestinations);
  const status = useSelector(selectBrowseDestinationsStatus);
  const landingSearch = useSelector(selectLandingSearch);
  const scrollContainerRef = useRef(null);
  const isSearchActive = Boolean(landingSearch.location || landingSearch.from || landingSearch.until);

  useEffect(() => {
    dispatch(fetchBrowseDestinations({
      limit: 50,
      location: landingSearch.location || undefined,
      from: landingSearch.from || undefined,
      until: landingSearch.until || undefined,
    }));
  }, [dispatch, landingSearch.location, landingSearch.from, landingSearch.until]);

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

  if (status !== 'loading' && destinations.length === 0 && !isSearchActive) return null;

  return (
    <section id="browse-by-destination" className="py-12 md:py-16 lg:py-20 2xl:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px]">
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
              <ChevronLeftIcon size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 hover:border-[#4AA7A7] hover:text-[#4AA7A7] flex items-center justify-center transition-all duration-200"
              aria-label="Scroll right"
            >
              <ChevronRightIcon size={20} />
            </button>
          </div>
        </div>

        {status === 'loading' && destinations.length === 0 ? (
          <div className="flex gap-4 md:gap-6 lg:grid lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex-shrink-0 w-56 sm:w-72 md:w-80 lg:w-auto h-56 sm:h-80 lg:h-96 xl:h-[420px] 2xl:h-[480px] rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No matching destinations found. Try a different search.</p>
        ) : (
          <>
            {/* Carousel */}
            <div className="relative">
              <div
                ref={scrollContainerRef}
                className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {destinations.map((destination) => {
                  const label = [destination.city, destination.state].filter(Boolean).join(', ') || destination.city;
                  return (
                    <Link
                      key={`${destination.city}-${destination.state ?? ''}-${destination.country ?? ''}`}
                      href={destinationHref(destination)}
                      className="relative flex-shrink-0 w-56 sm:w-72 md:w-80 lg:w-auto h-56 sm:h-80 lg:h-96 xl:h-[420px] 2xl:h-[480px] rounded-2xl overflow-hidden cursor-pointer group block bg-gray-100"
                    >
                      {/* Destination Image */}
                      {destination.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={destination.coverImage}
                          alt={label}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl md:text-2xl font-bold text-white">
                            {label}
                          </h3>
                          <div className="w-10 h-10 bg-[#F5C842] rounded-full flex items-center justify-center shrink-0">
                            <ChevronRightIcon size={20} className="text-white" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {destinations.slice(0, 3).map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full ${i === 0 ? 'w-8 bg-[#4AA7A7]' : 'w-2 bg-gray-300'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

    </section>
  );
}
