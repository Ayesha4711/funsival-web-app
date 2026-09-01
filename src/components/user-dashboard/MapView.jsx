"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { HeartFilledIcon, StarIcon, LocationIcon } from "@/icons";

// Leaflet must be loaded client-side only
const LeafletMap = dynamic(() => import("./MapViewLeaflet"), { ssr: false });

const CARD_WIDTH = 220;

export default function MapView({ listings }) {
  const router = useRouter();
  const [pins, setPins] = useState([]);
  const [center, setCenter] = useState(null);
  const [activePin, setActivePin] = useState(null);

  const toNum = (v) => { const n = Number(v); return !isNaN(n) && n > 0 ? n : null; };

  const extractPrice = (l) => {
    const p = l.price;
    if (typeof p === "number") return toNum(p);
    if (p && typeof p === "object") {
      return toNum(p.amount) ?? toNum(p.hourly) ?? toNum(p.daily) ?? toNum(p.perPerson) ?? 50;
    }
    return toNum(l.basicInformation?.pricePerHour) ?? toNum(l.basicInformation?.pricePerPerson) ?? 50;
  };

  const extractPriceLabel = (l) => {
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
    const cat = l?.category;
    if (cat === "places") return "Swimming";
    if (cat === "equipment") return "Equipment";
    return l?.basicInformation?.category || "Diving";
  };

  const getRating = (l) => {
    const r = Number(l?.reviewSummary?.overallRating ?? l?.rating);
    return !isNaN(r) && r > 0 ? r.toFixed(1) : "0.0";
  };

  const getReviews = (l) => l?.reviewSummary?.count ?? l?.reviewCount ?? l?.reviews ?? 0;

  async function geocodeCity(query) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data?.[0]) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } catch (_) {}
    return null;
  }

  useEffect(() => {
    let cancelled = false;

    async function buildPins() {
      const targets = listings.slice(0, 6);

      const resolved = await Promise.all(
        targets.map(async (l) => {
          const storedLat = toNum(l.placeLocation?.lat) ?? toNum(l.lat);
          const storedLon = toNum(l.placeLocation?.lon ?? l.placeLocation?.lng) ?? toNum(l.lon ?? l.lng);
          if (storedLat && storedLon) return { lat: storedLat, lon: storedLon, listing: l };

          const query = getLocation(l);
          if (!query) return null;
          const coords = await geocodeCity(query);
          if (!coords) return null;
          return { ...coords, listing: l };
        })
      );

      if (cancelled) return;

      const valid = resolved.filter(Boolean);
      if (valid.length === 0) return;

      const avgLat = valid.reduce((s, p) => s + p.lat, 0) / valid.length;
      const avgLon = valid.reduce((s, p) => s + p.lon, 0) / valid.length;

      const resolvedPins = valid.map((p) => ({
        id: p.listing._id || p.listing.id,
        lat: p.lat,
        lon: p.lon,
        price: extractPrice(p.listing),
        listing: p.listing,
      }));

      setPins(resolvedPins);
      setCenter([avgLat, avgLon]);
    }

    buildPins();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings]);

  const activePinObj = pins.find((p) => p.id === activePin);
  const activeListing = activePinObj?.listing;

  const cardContent = activeListing ? (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-xl cursor-pointer"
      style={{ width: CARD_WIDTH }}
      onClick={() => {
        const id = activeListing._id || activeListing.id;
        const cat = activeListing.category ?? "activity";
        router.push(`/user-dashboard/listing/${id}?type=${cat}`);
      }}
    >
      <div className="relative h-36">
        <img
          src={getImage(activeListing)}
          alt={getTitle(activeListing)}
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
        <div className="flex items-start justify-between gap-1.5">
          <p className="text-[13px] font-bold text-[#3DAA8A] leading-tight line-clamp-1 flex-1">
            {getTitle(activeListing)}
          </p>
          <span className="shrink-0 text-[10px] font-medium text-[#F5823A] border border-[#F5823A] rounded-full px-2 py-0.5 whitespace-nowrap">
            {getCategoryLabel(activeListing)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-gray-800">{getRating(activeListing)}</span>
          <StarIcon size={14} className="text-[#F5C842] fill-current" />
          <span className="text-[11px] text-gray-400">({getReviews(activeListing)} Reviews)</span>
        </div>

        {(() => {
          const { label, value } = extractPriceLabel(activeListing);
          return (
            <div className="flex items-center rounded-full border border-[#F5C842] overflow-hidden text-xs font-medium w-full">
              <span className="px-3 py-1.5 text-gray-400 bg-[#FFF9EC] whitespace-nowrap">{label}</span>
              <span className="flex-1 text-right px-3 py-1.5 text-[#F5823A] font-bold bg-[#FFF9EC]">${value}</span>
            </div>
          );
        })()}

        <div className="flex items-center gap-1.5">
          <LocationIcon size={16} className="shrink-0 text-[#F5823A] fill-current" />
          <span className="text-xs text-gray-500 line-clamp-1">{getLocation(activeListing)}</span>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-100"
      style={{ height: "calc(100vh - 140px)", minHeight: 700 }}
    >
      {center ? (
        <LeafletMap
          center={center}
          pins={pins}
          activePin={activePin}
          setActivePin={setActivePin}
          cardContent={cardContent}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-sm text-gray-400 animate-pulse">Loading map…</span>
        </div>
      )}
    </div>
  );
}
