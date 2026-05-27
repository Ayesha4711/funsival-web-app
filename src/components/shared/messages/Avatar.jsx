"use client";

import React from "react";

const COLOURS = [
  "bg-teal-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-rose-400",
  "bg-amber-500",
  "bg-emerald-500",
];

export default function Avatar({ name = "?", src, size = 10 }) {
  const initials =
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase() || "?";
  const colour = COLOURS[(name.charCodeAt(0) || 0) % COLOURS.length];

  if (src) {
    return (
      <div className={`relative shrink-0 w-${size} h-${size} rounded-full overflow-hidden`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 w-${size} h-${size} rounded-full ${colour} flex items-center justify-center text-white font-bold text-sm`}
    >
      {initials}
    </div>
  );
}
