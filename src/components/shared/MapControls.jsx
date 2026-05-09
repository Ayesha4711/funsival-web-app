"use client";

import React, { useState, useEffect } from "react";

export function LocationMap({ coords, searchValue, onSearchChange, onSelect, onUseCurrentLocation, searchLoading, suggestions }) {
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.05}%2C${coords.lat - 0.05}%2C${coords.lon + 0.05}%2C${coords.lat + 0.05}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`;

  return (
    <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
      {/* Real OSM Map Iframe */}
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          key={`${coords.lat}-${coords.lon}`}
          src={mapSrc}
          className="w-full border-0 grayscale-[10%] contrast-[1.1]"
          style={{ height: '105%', marginBottom: '-5%' }}
          title="Location map"
          loading="lazy"
        />
      </div>

      {/* Search overlay — centered in middle of map */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 pointer-events-none">
        <div className="relative pointer-events-auto w-full max-w-md">
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-3 border border-gray-200 transition-all focus-within:ring-2 focus-within:ring-[var(--color-primary)]">
            {/* Location pin icon */}
            {searchLoading ? (
              <svg className="animate-spin h-4 w-4 text-[var(--color-primary)] shrink-0" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" strokeDasharray="2 2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
              </svg>
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
      <iframe
        title="Map location"
        width="100%"
        frameBorder="0"
        scrolling="no"
        src={mapSrc}
        className="grayscale-[15%] contrast-[1.05]"
        style={{ height: '105%', marginBottom: '-5%' }}
      />
    </div>
  );
}
