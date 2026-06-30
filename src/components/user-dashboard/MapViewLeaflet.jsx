"use client";

import React, { useEffect, useRef } from "react";
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

function FlyToCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 0.8 });
  }, [center, map]);
  return null;
}

function PinMarker({ pin, isActive, setActivePin, cardContent }) {
  const markerRef = useRef(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    if (isActive) {
      marker.openPopup();
    } else {
      marker.closePopup();
    }
  }, [isActive]);

  return (
    <Marker
      ref={markerRef}
      position={[pin.lat, pin.lon]}
      icon={makePinIcon(pin.price, isActive)}
      zIndexOffset={isActive ? 1000 : 0}
      eventHandlers={{
        click: () => setActivePin(isActive ? null : pin.id),
      }}
    >
      <Popup
        closeButton={false}
        className="leaflet-price-popup"
        eventHandlers={{ remove: () => setActivePin(null) }}
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
  cardContent,
}) {
  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToCenter center={center} />

      {pins.map((pin) => (
        <PinMarker
          key={pin.id}
          pin={pin}
          isActive={activePin === pin.id}
          setActivePin={setActivePin}
          cardContent={cardContent}
        />
      ))}
    </MapContainer>
  );
}
