"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function makePinIcon(price, isActive) {
  const bg = isActive ? "#F5823A" : "#ffffff";
  const color = isActive ? "#ffffff" : "#111827";
  const pinColor = isActive ? "#F5823A" : "#374151";

  // Pill label + downward triangle pointer
  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
      <div style="
        background:${bg};
        color:${color};
        border:2px solid ${pinColor};
        border-radius:999px;
        padding:4px 10px;
        font-size:13px;
        font-weight:700;
        white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.22);
        line-height:1.2;
      ">\$${price}</div>
      <div style="
        width:0;height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:8px solid ${pinColor};
        margin-top:-1px;
      "></div>
    </div>
  `;

  // Anchor at bottom of the triangle pointer
  return L.divIcon({
    html,
    className: "",
    iconAnchor: [price.toString().length * 5 + 14, 40],
    popupAnchor: [0, -44],
  });
}

function MapViewport({ center, pins }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length > 1) {
      map.fitBounds(pins.map(pin => [pin.lat, pin.lon]), { padding: [40, 40], maxZoom: 10 });
    } else {
      map.setView(center, pins.length ? 10 : 2);
    }
  }, [center, pins, map]);
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function PinMarker({ pin, isActive, setActivePin, cardContent }) {
  return (
    <Marker
      position={[pin.lat, pin.lon]}
      icon={makePinIcon(pin.price, isActive)}
      zIndexOffset={isActive ? 1000 : 0}
    >
      <Popup
        closeButton={false}
        className="leaflet-price-popup"
        eventHandlers={{
          add: () => setActivePin(pin.id),
          remove: () => setActivePin(current => current === pin.id ? null : current),
        }}
      >
        {cardContent}
      </Popup>
    </Marker>
  );
}

export default function MapViewLeaflet({
  center,
  pins,
  activePin,
  setActivePin,
  renderCard,
}) {
  const [tileError, setTileError] = useState(false);
  const [tileAttempt, setTileAttempt] = useState(0);
  return (
    <>
    <MapContainer
      center={center}
      zoom={pins.length ? 10 : 2}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        key={tileAttempt}
        attribution='Tiles &copy; <a href="https://www.arcgis.com/home/item.html?id=3b93337983e9436f8db950e38a8629af">Esri</a> &mdash; Sources: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, and the GIS User Community'
        // This basemap renders place labels in English, unlike OSM's local-language tiles.
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        maxZoom={19}
        eventHandlers={{ tileerror: () => setTileError(true) }}
      />

      <MapViewport center={center} pins={pins} />

      {pins.map((pin) => (
        <PinMarker
          key={pin.id}
          pin={pin}
          isActive={activePin === pin.id}
          setActivePin={setActivePin}
          cardContent={renderCard(pin.listing)}
        />
      ))}
    </MapContainer>
    {tileError && (
      <div role="alert" className="absolute top-3 left-16 right-3 z-[1000] flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm shadow">
        <span>Map tiles could not load. Check your connection and retry.</span>
        <button className="font-semibold text-[#228E8A]" onClick={() => {
          setTileError(false);
          setTileAttempt(attempt => attempt + 1);
        }}>Retry</button>
      </div>
    )}
    </>
  );
}
