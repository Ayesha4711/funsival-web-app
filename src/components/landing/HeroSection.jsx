'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function HeroSection() {
  const [searchData, setSearchData] = useState({
    location: '',
    activity: '',
    date: '',
    participants: ''
  });

  const handleSearch = () => {
    console.log('Search with:', searchData);
  };

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center bg-no-repeat"
             style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center max-w-7xl">
        {/* Hero Text */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
            All the fun, none of the commitment.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-md">
            Find new fun. Leave the hassle.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {/* Location Input */}
            <div className="lg:col-span-1 relative">
              <div className="flex items-center gap-3 p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-[#4AA7A7] transition-colors">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs text-gray-500 mb-1">Where?</label>
                  <input
                    type="text"
                    placeholder="Add location, state"
                    value={searchData.location}
                    onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                    className="w-full text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Activity Input */}
            <div className="lg:col-span-1 relative">
              <div className="flex items-center gap-3 p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-[#4AA7A7] transition-colors">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs text-gray-500 mb-1">Activity Type</label>
                  <input
                    type="text"
                    placeholder="Skydiving, jet skiing"
                    value={searchData.activity}
                    onChange={(e) => setSearchData({...searchData, activity: e.target.value})}
                    className="w-full text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Date Input */}
            <div className="lg:col-span-1 relative">
              <div className="flex items-center gap-3 p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-[#4AA7A7] transition-colors">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  <input
                    type="text"
                    placeholder="Add range"
                    value={searchData.date}
                    onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                    className="w-full text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Participants Input */}
            <div className="lg:col-span-1 relative">
              <div className="flex items-center gap-3 p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-[#4AA7A7] transition-colors">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs text-gray-500 mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="Participants"
                    value={searchData.participants}
                    onChange={(e) => setSearchData({...searchData, participants: e.target.value})}
                    className="w-full text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-1">
              <button
                onClick={handleSearch}
                className="w-full h-full bg-[#4AA7A7] hover:bg-[#3d8f8f] text-white font-semibold rounded-xl lg:rounded-full transition-all duration-200 px-6 py-4 lg:py-0 flex items-center justify-center gap-2"
              >
                <span className="hidden lg:inline">Search</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
