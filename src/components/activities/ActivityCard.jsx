'use client';

import React from 'react';
import Image from 'next/image';

export default function ActivityCard({ activity }) {
  const {
    image,
    title,
    rating = 4.8,
    reviewCount = '24K Reviews',
    location,
    price,
    duration,
    groupSize,
    difficulty,
    badge
  } = activity;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
      {/* Image */}
      <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
          style={{
            backgroundImage: image ? `url('${image}')` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        />

        {/* Badge */}
        {badge && (
          <div className="absolute top-4 right-4 bg-[#F5C842] text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full">
            {badge}
          </div>
        )}

        {/* Favorite Button */}
        <button className="absolute top-4 left-4 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5">
        {/* Title and Rating */}
        <div className="mb-3">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-[#F5C842] fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">{rating}</span>
            </div>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-4 text-gray-600">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm">{location}</span>
        </div>

        {/* Details */}
        {(duration || groupSize || difficulty) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {duration && (
              <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                ⏱ {duration}
              </span>
            )}
            {groupSize && (
              <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                👥 {groupSize}
              </span>
            )}
            {difficulty && (
              <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                📊 {difficulty}
              </span>
            )}
          </div>
        )}

        {/* Price and Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-500">From</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">${price}</span>
              <span className="text-sm text-gray-500">/person</span>
            </div>
          </div>
          <button className="bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-semibold px-6 py-2.5 rounded-full transition-colors duration-200 text-sm">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
