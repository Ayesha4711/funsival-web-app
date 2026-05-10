'use client';

import React from 'react';
import Link from 'next/link';

function resolvePrice(price) {
  if (!price) return null;
  return price.perPerson ?? price.hourly ?? price.amount ?? price.daily ?? null;
}

function isValidPhoto(url) {
  return url && !url.startsWith('blob:');
}

const LocationPinIcon = () => (
  <svg className="w-3.5 h-3.5 text-[#4AA7A7] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m5-2a8 8 0 11-16 0 8 8 0 0116 0z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-3 h-3 text-[#F5C842] fill-current" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

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
  const rating = listing.rating ?? null;

  /* price label based on listing type */
  const priceUnit =
    listing.price?.perPerson != null ? '/person'
    : listing.price?.hourly != null ? '/hr'
    : listing.price?.daily != null ? '/day'
    : '';

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="bg-white rounded-2xl overflow-hidden duration-200 cursor-pointer group hover:shadow-lg transition-shadow block border border-gray-100"
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-[#4AA7A7] to-[#2d7a7a]" />
        )}

        {/* Category badge top-left */}
        {listing.category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize shadow-sm">
            {listing.category.replace(/_/g, ' ')}
          </span>
        )}

        {/* Type badge top-right (Activities / Places / Equipment) */}
        {listing.type && (
          <span className="absolute top-3 right-3 bg-[#F5C842] text-gray-900 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize shadow-sm">
            {listing.type.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        {/* Title + arrow */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-[#4AA7A7] leading-snug line-clamp-2 flex-1">{title}</h3>
          <ArrowIcon />
        </div>

        {/* Tags row: duration, difficulty */}
        {(duration || difficulty) && (
          <div className="flex items-center gap-2 flex-wrap">
            {duration && (
              <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                <ClockIcon />
                {duration}
              </span>
            )}
            {difficulty && (
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                {difficulty}
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Bottom: location | rating + price + CTA */}
        <div className="flex items-center justify-between gap-2">
          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0">
            <LocationPinIcon />
            <span className="truncate max-w-22.5">{city || '—'}</span>
          </div>

          {/* Rating + price + button */}
          <div className="flex items-center gap-2 shrink-0">
            {rating != null && (
              <div className="flex items-center gap-0.5">
                <StarIcon />
                <span className="text-[10px] font-semibold text-gray-600">{Number(rating).toFixed(1)}</span>
              </div>
            )}
            {price != null && (
              <span className="text-sm font-bold text-gray-900">
                {currency === 'USD' ? '$' : currency}{price}
                <span className="text-[10px] font-normal text-gray-400">{priceUnit}</span>
              </span>
            )}
            <span className="text-[10px] font-semibold text-[#4AA7A7] border border-[#4AA7A7] rounded-full px-3 py-1 group-hover:bg-[#4AA7A7] group-hover:text-white transition-colors whitespace-nowrap">
              View Now
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
