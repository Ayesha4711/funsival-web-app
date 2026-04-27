"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const StarIcon = () => (
  <svg className="w-3.5 h-3.5 text-[#F5C842] fill-current" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const LocationPinIcon = () => (
  <svg className="w-3.5 h-3.5 text-[#4AA7A7] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 18" />
  </svg>
);

/* Price pins scattered across the fake map */
const PRICE_PINS = [
  { id: 1, price: 30,  top: "42%", left: "18%", listingId: 1 },
  { id: 2, price: 485, top: "35%", left: "52%", listingId: 2 },
  { id: 3, price: 17,  top: "62%", left: "28%", listingId: 3 },
];

export default function MapView({ listings }) {
  const router = useRouter();
  const [activePin, setActivePin] = useState(null);

  // For demo, we use a fixed center (e.g., New York) since listings don't have real coordinates yet
  const center = { lat: 40.7128, lon: -74.0060 };
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${center.lon - 0.1}%2C${center.lat - 0.1}%2C${center.lon + 0.1}%2C${center.lat + 0.1}&layer=mapnik`;

  // Map real listings to pins if they have IDs, or fallback to mock
  const pins = listings.length > 0 
    ? listings.slice(0, 5).map((l, i) => ({
        id: l._id || l.id,
        price: l.price?.amount || l.price || 50,
        // Spread them out mock-style over the map
        top: `${20 + (i * 15) % 60}%`,
        left: `${20 + (i * 25) % 60}%`,
        listing: l
      }))
    : PRICE_PINS.map(p => ({ ...p, listing: listings.find(l => l.id === p.listingId) }));

  const activePinObj = pins.find(p => p.id === activePin);
  const activeListing = activePinObj?.listing;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-100"
      style={{ height: "clamp(420px, 60vh, 680px)" }}
    >
      {/* ── Real Map Background ── */}
      <div className="absolute inset-0">
        <iframe
          title="Explore Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={mapSrc}
          className="grayscale-[20%] contrast-[1.1] opacity-80"
        />
        <div className="absolute inset-0 bg-blue-50/10 pointer-events-none" />
      </div>

      {/* ── Price pins ── */}
      {pins.map((pin) => {
        const isActive = activePin === pin.id;
        return (
          <button
            key={pin.id}
            onClick={() => setActivePin(isActive ? null : pin.id)}
            className={`absolute z-10 px-3 py-1.5 rounded-full font-bold text-sm shadow-md transition-all duration-200 ${
              isActive
                ? "bg-[#4AA7A7] text-white scale-110 shadow-lg border-2 border-white"
                : "bg-white text-gray-900 hover:bg-[#4AA7A7] hover:text-white hover:scale-105 border border-gray-200"
            }`}
            style={{ top: pin.top, left: pin.left, transform: "translate(-50%, -50%)" }}
          >
            ${pin.price}
          </button>
        );
      })}

      {/* ── Popup card when pin is active ── */}
      {activeListing && activePinObj && (
        <div
          className="absolute z-20 bg-white rounded-2xl shadow-xl overflow-hidden w-48 sm:w-56"
          style={{
            top: `calc(${activePinObj.top} - 130px)`,
            left: activePinObj.left,
            transform: "translateX(-50%)",
          }}
        >
          {/* Close */}
          <button
            onClick={() => setActivePin(null)}
            className="absolute top-2 right-2 z-10 w-5 h-5 bg-[#F5C842] rounded-full flex items-center justify-center text-gray-900"
          >
            <CloseIcon />
          </button>
          {/* Image */}
          <div className="relative h-24 sm:h-28">
            <img 
              src={(Array.isArray(activeListing.photos) ? activeListing.photos[0] : activeListing.image) || 'https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=400&q=80'} 
              alt="" 
              className="w-full h-full object-cover" 
            />
          </div>
          {/* Info */}
          <div className="p-3 flex flex-col gap-1">
            <div className="flex items-start justify-between gap-1">
              <p className="text-xs font-bold text-gray-900 leading-tight line-clamp-2">
                {activeListing.basicInformation?.activityTitle || activeListing.title || "Listing"}
              </p>
              <span className="shrink-0 px-1.5 py-0.5 bg-green-100 text-green-600 text-[9px] font-bold rounded-full">Active</span>
            </div>
            <div className="flex items-center gap-1">
              <StarIcon />
              <span className="text-[10px] font-bold text-gray-700">{activeListing.rating ?? 4.5}</span>
              <span className="text-[10px] text-gray-400">({activeListing.reviewCount ?? 0})</span>
            </div>
            <div className="flex items-center gap-1">
              <LocationPinIcon />
              <span className="text-[10px] text-gray-500 line-clamp-1">
                {activeListing.placeLocation?.city || activeListing.location || "—"}
              </span>
            </div>
            <button
              onClick={() => router.push(`/user-dashboard/listing/${activeListing._id || activeListing.id}`)}
              className="mt-1.5 w-full py-1.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-bold text-[11px] rounded-lg transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* ── Map attribution ── */}
      <div className="absolute bottom-2 right-3 text-[9px] text-gray-400 bg-white/80 backdrop-blur-sm rounded px-1.5 py-0.5 border border-gray-100 shadow-sm">
        Map data © OpenStreetMap
      </div>
    </div>
  );
}
