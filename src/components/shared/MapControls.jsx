"use client";

import React, { useState, useEffect } from "react";

export function LocationMap({ coords, searchValue, onSearchChange, onSelect, onUseCurrentLocation, searchLoading, suggestions }) {
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.05}%2C${coords.lat - 0.05}%2C${coords.lon + 0.05}%2C${coords.lat + 0.05}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`;

  return (
    <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
      {/* Real OSM Map Iframe */}
      <div className="absolute inset-0">
        <iframe 
          key={`${coords.lat}-${coords.lon}`} 
          src={mapSrc} 
          className="w-full h-full border-0 grayscale-[10%] contrast-[1.1]" 
          title="Location map" 
          loading="lazy" 
        />
      </div>

      {/* Search overlay — centered vertically over the map */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="relative group max-w-sm mx-auto sm:mx-0">
          <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-xl border border-gray-100 transition-all focus-within:ring-2 focus-within:ring-[var(--color-primary)]">
            {searchLoading ? (
              <svg className="animate-spin h-4 w-4 text-[var(--color-primary)]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            )}
            <input
              type="text"
              placeholder="Search for an address or place…"
              className="flex-1 bg-transparent text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
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

      {/* Map attribution overlay */}
      <div className="absolute bottom-2 left-2 bg-white/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] text-gray-400 pointer-events-none">
        © OpenStreetMap contributors
      </div>

      {/* Use current location button */}
      <button
        type="button"
        onClick={onUseCurrentLocation}
        className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-xl border border-gray-100 text-xs text-[var(--color-primary)] font-bold hover:bg-gray-50 transition-all active:scale-95 z-10"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
        </svg>
        Current Location
      </button>
    </div>
  );
}

export function SimpleMap({ location, height = 200 }) {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!location) return;
    async function geocode() {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`);
        const data = await res.json();
        if (data && data[0]) {
          setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        }
      } catch (err) { console.error("Geocoding error:", err); }
    }
    geocode();
  }, [location]);

  if (!coords) {
    return (
      <div className="w-full flex items-center justify-center bg-gray-50 rounded-xl animate-pulse" style={{ height }}>
        <span className="text-xs text-gray-400 font-medium">Locating on map…</span>
      </div>
    );
  }

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.05}%2C${coords.lat - 0.05}%2C${coords.lon + 0.05}%2C${coords.lat + 0.05}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100" style={{ height }}>
      <iframe
        title="Map location"
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        src={mapSrc}
        className="grayscale-[15%] contrast-[1.05]"
      />
      <div className="absolute bottom-2 right-2 bg-white/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] text-gray-400 pointer-events-none">
        © OpenStreetMap
      </div>
    </div>
  );
}
