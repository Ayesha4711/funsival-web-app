"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { HeartFilledIcon, StarIcon, LocationIcon } from "@/icons";

export default function MapView({ listings }) {
  const router = useRouter();
  const [activePin, setActivePin] = useState(null);
  const containerRef = useRef(null);
  const CARD_WIDTH = 220;

  const center = { lat: 40.7128, lon: -74.0060 };
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${center.lon - 0.1}%2C${center.lat - 0.1}%2C${center.lon + 0.1}%2C${center.lat + 0.1}&layer=mapnik`;

  const toNum = (v) => { const n = Number(v); return !isNaN(n) && n > 0 ? n : null; };

  const extractPrice = (l) => {
    const p = l.price;
    if (typeof p === 'number') return toNum(p);
    if (p && typeof p === 'object') {
      return toNum(p.amount) ?? toNum(p.hourly) ?? toNum(p.daily) ?? toNum(p.perPerson) ?? 50;
    }
    return toNum(l.basicInformation?.pricePerHour) ?? toNum(l.basicInformation?.pricePerPerson) ?? 50;
  };

  const extractPriceLabel = (l) => {
    const p = l.price;
    if (p && typeof p === 'object') {
      if (toNum(p.hourly)) return { label: 'Hourly', value: toNum(p.hourly) };
      if (toNum(p.perPerson)) return { label: 'Per Person', value: toNum(p.perPerson) };
      if (toNum(p.daily)) return { label: 'Daily', value: toNum(p.daily) };
    }
    const fallback = extractPrice(l);
    return { label: 'From', value: fallback };
  };

  const FALLBACK_PINS = [
    { id: 'mock-1', price: 30,  top: '42%', left: '18%', listing: null },
    { id: 'mock-2', price: 485, top: '35%', left: '52%', listing: null },
    { id: 'mock-3', price: 17,  top: '62%', left: '28%', listing: null },
  ];

  const pins = listings.length > 0
    ? listings.slice(0, 6).map((l, i) => ({
        id: l._id || l.id,
        price: extractPrice(l),
        top: `${15 + (i * 13) % 58}%`,
        left: `${12 + (i * 18) % 68}%`,
        listing: l,
      }))
    : FALLBACK_PINS;

  const activePinObj = pins.find(p => p.id === activePin);
  const activeListing = activePinObj?.listing;

  const getTitle = (l) =>
    l?.basicInformation?.activityTitle ||
    l?.basicInformation?.equipmentName ||
    l?.basicInformation?.placeName ||
    l?.title || 'Listing';

  const getImage = (l) =>
    (Array.isArray(l?.photos) ? l.photos[0] : null) ||
    l?.image ||
    'https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=400&q=80';

  const getLocation = (l) =>
    [l?.placeLocation?.city, l?.placeLocation?.country].filter(Boolean).join(', ') ||
    l?.location || 'Tokyo, Japan';

  const getCategoryLabel = (l) => {
    const cat = l?.category;
    if (cat === 'places') return 'Swimming';
    if (cat === 'equipment') return 'Equipment';
    return l?.basicInformation?.category || 'Diving';
  };

  const getRating = (l) => {
    const r = Number(l?.rating);
    return !isNaN(r) && r > 0 ? r.toFixed(1) : '4.4';
  };

  const getReviews = (l) => l?.reviewCount ?? l?.reviews ?? '21K';

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-100"
      style={{ height: 'calc(100vh - 260px)', minHeight: 500 }}
      onClick={() => setActivePin(null)}
    >
      {/* Map iframe */}
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          title="Explore Map"
          width="100%"
          height="105%"
          frameBorder="0"
          scrolling="no"
          src={mapSrc}
          className="opacity-90"
          style={{ marginBottom: '-5%' }}
        />
      </div>

      {/* OpenStreetMap attribution */}
      <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
        <span className="text-[10px] text-gray-600 bg-white/80 px-1.5 py-0.5 rounded">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline pointer-events-auto">OpenStreetMap</a> contributors
        </span>
      </div>

      {/* Price pins */}
      {pins.map((pin) => {
        const isActive = activePin === pin.id;
        return (
          <button
            key={pin.id}
            onClick={(e) => { e.stopPropagation(); setActivePin(isActive ? null : pin.id); }}
            className={`absolute z-10 px-3.5 py-1.5 rounded-full font-bold text-sm shadow-md transition-all duration-200 ${
              isActive
                ? 'bg-[#F5823A] text-white scale-110 shadow-lg'
                : 'bg-white text-gray-900 hover:scale-105'
            }`}
            style={{ top: pin.top, left: pin.left, transform: 'translate(-50%, -50%)' }}
          >
            ${pin.price}
          </button>
        );
      })}

      {/* Popup card — flips above pin when pin is in lower half of map */}
      {activePinObj && activeListing && (() => {
        const pinTopPct = parseFloat(activePinObj.top);
        const pinLeftPct = parseFloat(activePinObj.left);
        const flipUp = pinTopPct > 55;
        const containerW = containerRef.current?.offsetWidth ?? 800;
        const pinPx = (pinLeftPct / 100) * containerW;
        const halfCard = CARD_WIDTH / 2;
        // Better centering for ultra-wide screens (2560px+)
        const clampedPx = containerW > 2000
          ? Math.max(halfCard + 8, Math.min(pinPx, containerW - halfCard - 8))
          : Math.min(Math.max(pinPx, halfCard + 8), containerW - halfCard - 8);
        return (
        <div
          className="absolute z-20 bg-white rounded-2xl overflow-hidden shadow-xl cursor-pointer"
          style={{
            width: CARD_WIDTH,
            ...(flipUp
              ? { bottom: `calc(${100 - pinTopPct}% + 14px)` }
              : { top: `calc(${activePinObj.top} + 14px)` }),
            left: clampedPx,
            transform: 'translateX(-50%)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            const id = activeListing._id || activeListing.id;
            const cat = activeListing.category ?? 'activity';
            router.push(`/user-dashboard/listing/${id}?type=${cat}`);
          }}
        >
          {/* Image */}
          <div className="relative h-36">
            <img
              src={getImage(activeListing)}
              alt={getTitle(activeListing)}
              className="w-full h-full object-cover"
            />
            {/* Orange heart button — top right */}
            <button
              className="absolute top-2 right-2 w-7 h-7 bg-[#F5823A] rounded-full flex items-center justify-center shadow"
              onClick={(e) => e.stopPropagation()}
            >
              <HeartFilledIcon size={14} className="text-white" />
            </button>
          </div>

          {/* Info */}
          <div className="p-3 flex flex-col gap-2">
            {/* Title + category tag */}
            <div className="flex items-start justify-between gap-1.5">
              <p className="text-[13px] font-bold text-[#3DAA8A] leading-tight line-clamp-1 flex-1">
                {getTitle(activeListing)}
              </p>
              <span className="shrink-0 text-[10px] font-medium text-[#F5823A] border border-[#F5823A] rounded-full px-2 py-0.5 whitespace-nowrap">
                {getCategoryLabel(activeListing)}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-800">{getRating(activeListing)}</span>
              <StarIcon size={14} className="text-[#F5C842] fill-current" />
              <span className="text-[11px] text-gray-400">({getReviews(activeListing)} Reviews)</span>
            </div>

            {/* Price pill — full width */}
            {(() => {
              const { label, value } = extractPriceLabel(activeListing);
              return (
                <div className="flex items-center rounded-full border border-[#F5C842] overflow-hidden text-xs font-medium w-full">
                  <span className="px-3 py-1.5 text-gray-400 bg-[#FFF9EC] whitespace-nowrap">{label}</span>
                  <span className="flex-1 text-right px-3 py-1.5 text-[#F5823A] font-bold bg-[#FFF9EC]">${value}</span>
                </div>
              );
            })()}

            {/* Location — orange filled pin */}
            <div className="flex items-center gap-1.5">
              <LocationIcon size={16} className="shrink-0 text-[#F5823A] fill-current" />
              <span className="text-xs text-gray-500 line-clamp-1">{getLocation(activeListing)}</span>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
