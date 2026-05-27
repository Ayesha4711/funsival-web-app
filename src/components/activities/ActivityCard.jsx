'use client';

import React from 'react';
import Link from 'next/link';
import { LocationPinIcon, ArrowUpRightIcon, ClockIcon, StarFilledIcon } from '@/icons';

function resolvePrice(price) {
  if (!price) return null;
  return price.perPerson ?? price.hourly ?? price.amount ?? price.daily ?? null;
}

function isValidPhoto(url) {
  return url && !url.startsWith('blob:');
}

export default function ActivityCard({ listing }) {
  if (!listing) return null;

  const title      = listing.basicInformation?.activityTitle ?? 'Untitled';
  const location   = listing.basicInformation?.location ?? '';
  const duration   = listing.serviceDetails?.duration
    ? `${listing.serviceDetails.duration.value} ${listing.serviceDetails.duration.unit}`
    : null;
  const difficulty = listing.serviceDetails?.difficultyLevel ?? null;
  const price      = resolvePrice(listing.price);
  const currency   = listing.price?.currency ?? 'USD';
  const photo      = listing.photos?.find(isValidPhoto) ?? null;
  const city       = listing.placeLocation?.city ?? location.split(',')[0]?.trim() ?? '';
  const rating     = listing.rating ?? null;

  const priceUnit =
    listing.price?.perPerson != null ? '/person' :
    listing.price?.hourly    != null ? '/hr'     :
    listing.price?.daily     != null ? '/day'    : '';

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="bg-white rounded-2xl overflow-hidden duration-200 cursor-pointer group hover:shadow-lg transition-shadow block border border-gray-100"
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-[#4AA7A7] to-[#2d7a7a]" />
        )}

        {/* Category badge — top-left */}
        {listing.category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize shadow-sm">
            {listing.category.replace(/_/g, ' ')}
          </span>
        )}

        {/* Type badge — top-right */}
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
          <h3 className="text-sm font-bold text-[#4AA7A7] leading-snug line-clamp-2 flex-1">
            {title}
          </h3>
          <ArrowUpRightIcon size={16} className="text-gray-400 shrink-0" />
        </div>

        {/* Duration + difficulty tags */}
        {(duration || difficulty) && (
          <div className="flex items-center gap-2 flex-wrap">
            {duration && (
              <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                <ClockIcon size={12} />
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

        {/* Location | rating + price + CTA */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0">
            <LocationPinIcon size={14} className="text-[#4AA7A7] shrink-0" />
            <span className="truncate max-w-22.5">{city || '—'}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {rating != null && (
              <div className="flex items-center gap-0.5">
                <StarFilledIcon size={12} className="text-[#F5C842]" />
                <span className="text-[10px] font-semibold text-gray-600">
                  {Number(rating).toFixed(1)}
                </span>
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
