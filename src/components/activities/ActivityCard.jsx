'use client';

import React from 'react';
import Image from 'next/image';

export default function ActivityCard({ activity }) {
  const { image, title, rating = 4.8, reviewCount = '24K Reviews', location, price, duration, difficulty, badge } = activity;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group">
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#4AA7A7] to-[#2d7a7a]" />
        )}
        {badge && (
          <span className="absolute top-3 left-3 bg-[#F5C842] text-gray-900 text-[10px] font-bold px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Rating row */}
        <div className="flex items-center gap-1 mb-1">
          <svg className="w-3.5 h-3.5 text-[#F5C842] fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-semibold text-gray-700">{rating}</span>
          <span className="text-xs text-gray-400">({reviewCount})</span>
        </div>

        {/* Title + arrow */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-[#4AA7A7] leading-snug line-clamp-2">{title}</h3>
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {duration && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{duration}</span>}
          {difficulty && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{difficulty}</span>}
        </div>

        {/* Location + price + button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-[#4AA7A7] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate max-w-[80px]">{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">${price}</span>
            <button className="text-[10px] font-semibold text-[#4AA7A7] border border-[#4AA7A7] rounded-full px-3 py-1 hover:bg-[#4AA7A7] hover:text-white transition-colors">
              View Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
