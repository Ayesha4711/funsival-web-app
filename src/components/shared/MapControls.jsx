"use client";

import React, { useState, useEffect } from "react";
import { SpinnerIcon, MapPinIcon, CompassIcon } from "@/icons";

export function LocationMap({ coords, searchValue, onSearchChange, onSelect, onUseCurrentLocation, searchLoading, suggestions }) {
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.05}%2C${coords.lat - 0.05}%2C${coords.lon + 0.05}%2C${coords.lat + 0.05}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`;

  return (
    <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
      {/* Real OSM Map Iframe — extra height hides attribution bar */}
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          key={`${coords.lat}-${coords.lon}`}
          src={mapSrc}
          className="w-full border-0 grayscale-[10%] contrast-[1.1]"
          style={{ height: 'calc(100% + 30px)', marginBottom: '-30px' }}
          title="Location map"
          loading="lazy"
        />
      </div>
      {/* Attribution overlay */}
      <div className="absolute bottom-1 left-2 z-10 pointer-events-none">
        <span className="text-[10px] text-gray-600 bg-white/80 rounded px-1 py-0.5">© OpenStreetMap contributors</span>
      </div>

      {/* Search overlay — centered in middle of map */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 pointer-events-none">
        <div className="relative pointer-events-auto w-full max-w-md">
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-3 border border-gray-200 transition-all focus-within:ring-2 focus-within:ring-[var(--color-primary)]">
            {/* Location pin icon */}
            {searchLoading ? (
              <SpinnerIcon size={16} className="text-[var(--color-primary)] shrink-0" />
            ) : (
              <MapPinIcon size={18} className="shrink-0 text-[var(--color-primary)]" />
            )}
            <input
              type="text"
              placeholder="Enter exact address"
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none min-w-0"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 shrink-0" />
            {/* Use my current location */}
            <button
              type="button"
              onClick={onUseCurrentLocation}
              className="shrink-0 flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              <span className="hidden sm:inline">Use my current location</span>
              <CompassIcon size={18} className="text-[var(--color-primary)]" />
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s.place_id}
                  onClick={() => onSelect(s)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0 flex flex-col gap-0.5"
                >
                  <span className="font-bold text-gray-900 line-clamp-1">{s.display_name.split(',')[0]}</span>
                  <span className="text-[10px] text-gray-400 line-clamp-1">{s.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SimpleMap({ location, lat: latProp, lng: lngProp, height = 200 }) {
  const hasCoords = Number.isFinite(latProp) && Number.isFinite(lngProp);
  const [coords, setCoords] = useState(hasCoords ? { lat: latProp, lon: lngProp } : null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // If coordinates were passed directly, skip geocoding
    if (Number.isFinite(latProp) && Number.isFinite(lngProp)) { setCoords({ lat: latProp, lon: lngProp }); return; }
    if (!location) { setFailed(true); return; }

    let cancelled = false;
    const timeout = setTimeout(() => { if (!cancelled) setFailed(true); }, 8000);

    async function geocode() {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        if (!cancelled) {
          if (data && data[0]) {
            setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
          } else {
            setFailed(true);
          }
        }
      } catch { if (!cancelled) setFailed(true); }
      clearTimeout(timeout);
    }
    geocode();
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [location, latProp, lngProp]);

  if (!coords) {
    return (
      <div className="w-full flex items-center justify-center bg-gray-50 rounded-xl" style={{ height }}>
        {failed ? (
          <span className="text-xs text-gray-400 font-medium">Map unavailable for this location.</span>
        ) : (
          <span className="text-xs text-gray-400 font-medium animate-pulse">Locating on map…</span>
        )}
      </div>
    );
  }

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.05}%2C${coords.lat - 0.05}%2C${coords.lon + 0.05}%2C${coords.lat + 0.05}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-100" style={{ height }}>
      {/* Extra height hides OSM attribution bar */}
      <iframe
        title="Map location"
        width="100%"
        frameBorder="0"
        scrolling="no"
        src={mapSrc}
        className="absolute inset-0 w-full grayscale-[15%] contrast-[1.05]"
        style={{ height: 'calc(100% + 30px)' }}
      />
      {/* Attribution overlay */}
      <div className="absolute bottom-1 left-2 z-10 pointer-events-none">
        <span className="text-[10px] text-gray-600 bg-white/80 rounded px-1 py-0.5">© OpenStreetMap contributors</span>
      </div>
    </div>
  );
}
