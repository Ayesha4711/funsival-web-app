'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

function resolvePrice(price) {
  if (!price) return null;
  return price.perPerson ?? price.hourly ?? price.amount ?? price.daily ?? null;
}

function isValidPhoto(url) {
  return url && !url.startsWith('blob:');
}

export default function ActivityCard({ listing }) {
  if (!listing) return null;

  const title = listing.basicInformation?.activityTitle ?? 'Untitled';
  const location = listing.basicInformation?.location ?? '';
  const duration = listing.serviceDetails?.duration
    ? `${listing.serviceDetails.duration.value} ${listing.serviceDetails.duration.unit}`
    : null;
  const difficulty = listing.serviceDetails?.difficultyLevel ?? null;
  const price = resolvePrice(listing.price);
  const currency = listing.price?.currency ?? 'USD';
  const photo = listing.photos?.find(isValidPhoto) ?? null;
  const city = listing.placeLocation?.city ?? location.split(',')[0]?.trim() ?? '';

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="bg-white rounded-2xl overflow-hidden duration-200 cursor-pointer group hover:shadow-md transition-shadow block"
    >
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#4AA7A7] to-[#2d7a7a]" />
        )}
        {listing.type && (
          <span className="absolute top-3 left-3 bg-[#F5C842] text-gray-900 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize">
            {listing.type.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category badge */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs font-semibold text-gray-500 capitalize">{listing.category}</span>
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
          {duration && (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {duration}
            </span>
          )}
          {difficulty && (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
              {difficulty}
            </span>
          )}
        </div>

        {/* Location + price + button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-[#4AA7A7] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate max-w-[80px]">{city}</span>
          </div>
          <div className="flex items-center gap-2">
            {price != null && (
              <span className="text-sm font-bold text-gray-900">
                {currency === 'USD' ? '$' : currency}{price}
              </span>
            )}
            <span className="text-[10px] font-semibold text-[#4AA7A7] border border-[#4AA7A7] rounded-full px-3 py-1 group-hover:bg-[#4AA7A7] group-hover:text-white transition-colors">
              View Now
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
