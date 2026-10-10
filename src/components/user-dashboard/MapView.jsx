"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { HeartFilledIcon, StarIcon, LocationIcon } from "@/icons";
import { getListingCoordinates } from "@/lib/mapCoordinates";
import { getListingRate, PRICE_LABELS } from "@/lib/listingPricing";

// Leaflet must be loaded client-side only
const LeafletMap = dynamic(() => import("./MapViewLeaflet"), { ssr: false });

const CARD_WIDTH = 220;

const toNum = (v) => { const n = Number(v); return !isNaN(n) && n > 0 ? n : null; };

const extractPrice = (l) => {
  const p = l.price;
  if (typeof p === "number") return toNum(p);
  if (p && typeof p === "object") {
    return toNum(p.amount) ?? toNum(p.hourly) ?? toNum(p.daily) ?? toNum(p.perPerson) ?? 50;
  }
  return toNum(l.basicInformation?.pricePerHour) ?? toNum(l.basicInformation?.pricePerPerson) ?? 50;
};

const extractPriceLabel = (l, pricingMode) => {
  if (pricingMode) return { label: PRICE_LABELS[pricingMode], value: getListingRate(l, pricingMode) };
  const p = l.price;
  if (p && typeof p === "object") {
    if (toNum(p.hourly)) return { label: "Hourly", value: toNum(p.hourly) };
    if (toNum(p.perPerson)) return { label: "Per Person", value: toNum(p.perPerson) };
    if (toNum(p.daily)) return { label: "Daily", value: toNum(p.daily) };
  }
  return { label: "From", value: extractPrice(l) };
};

const getTitle = (l) =>
  l?.basicInformation?.activityTitle ||
  l?.basicInformation?.equipmentName ||
  l?.basicInformation?.placeName ||
  l?.title || "Listing";

const getImage = (l) =>
  (Array.isArray(l?.photos) ? l.photos[0] : null) ||
  l?.image ||
  "https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=400&q=80";

const getLocation = (l) =>
  [l?.placeLocation?.city, l?.placeLocation?.country].filter(Boolean).join(", ") ||
  l?.location || "";

const getCategoryLabel = (l) => {
  const type = l?.type || l?.basicInformation?.category;
  if (type) return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  const cat = l?.category;
  if (cat === "place" || cat === "places") return "Place";
  if (cat === "equipment") return "Equipment";
  return "Activity";
};

const getRating = (l) => {
  const r = Number(l?.reviewSummary?.overallRating ?? l?.rating);
  return !isNaN(r) && r > 0 ? r.toFixed(1) : "0.0";
};

const getReviews = (l) => l?.reviewSummary?.count ?? l?.reviewCount ?? l?.reviews ?? 0;

export default function MapView({ listings, pricingMode }) {
  const router = useRouter();
  const [activePin, setActivePin] = useState(null);
  const pins = useMemo(() => listings.flatMap(listing => {
    const coordinates = getListingCoordinates(listing);
    return coordinates ? [{
      id: listing._id || listing.id,
      ...coordinates,
      price: extractPriceLabel(listing, pricingMode).value,
      listing,
    }] : [];
  }), [listings, pricingMode]);
  const center = useMemo(() => pins.length ? [pins[0].lat, pins[0].lon] : [20, 0], [pins]);

  const renderCard = (listing) => (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-xl cursor-pointer"
      style={{ width: CARD_WIDTH }}
      onClick={() => {
        const id = listing._id || listing.id;
        const cat = listing.category ?? "activity";
        router.push(`/user-dashboard/listing/${id}?type=${cat}`);
      }}
    >
      <div className="relative h-36">
        <img
          src={getImage(listing)}
          alt={getTitle(listing)}
          className="w-full h-full object-cover"
        />
        <button
          className="absolute top-2 right-2 w-7 h-7 bg-[#F5823A] rounded-full flex items-center justify-center shadow"
          onClick={(e) => e.stopPropagation()}
        >
          <HeartFilledIcon size={14} className="text-white" />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-1.5">
          <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-[#3DAA8A] leading-tight">
            {getTitle(listing)}
          </span>
          <span className="shrink-0 text-[10px] font-medium text-[#F5823A] border border-[#F5823A] rounded-full px-2 py-0.5 whitespace-nowrap">
            {getCategoryLabel(listing)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-gray-800">{getRating(listing)}</span>
          <StarIcon size={14} className="text-[#F5C842] fill-current" />
          <span className="text-[11px] text-gray-400">({getReviews(listing)} Reviews)</span>
        </div>

        {(() => {
          const { label, value } = extractPriceLabel(listing, pricingMode);
          return (
            <div className="flex items-center rounded-full border border-[#F5C842] overflow-hidden text-xs font-medium w-full">
              <span className="px-3 py-1.5 text-gray-400 bg-[#FFF9EC] whitespace-nowrap">{label}</span>
              <span className="flex-1 text-right px-3 py-1.5 text-[#F5823A] font-bold bg-[#FFF9EC]">${value}</span>
            </div>
          );
        })()}

        <div className="flex items-center gap-1.5">
          <LocationIcon size={16} className="shrink-0 text-[#F5823A] fill-current" />
          <span className="text-xs text-gray-500 line-clamp-1">{getLocation(listing)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="relative isolate w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-100"
      style={{ height: "calc(100vh - 140px)", minHeight: 700 }}
    >
      <LeafletMap
        center={center}
        pins={pins}
        activePin={activePin}
        setActivePin={setActivePin}
        renderCard={renderCard}
      />
      {pins.length < listings.length && (
        <p className="absolute bottom-8 left-3 right-3 z-[1000] rounded-lg bg-white/95 px-3 py-2 text-xs text-gray-600 shadow">
          {listings.length - pins.length} listing location(s) could not be placed on the map.
        </p>
      )}
    </div>
  );
}
