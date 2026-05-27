"use client";

import React from "react";

const MAX_PRICE = 5000;

export { MAX_PRICE };

export default function PriceSlider({ min, max, onMinChange, onMaxChange }) {
  const minPct = (min / MAX_PRICE) * 100;
  const maxPct = (max / MAX_PRICE) * 100;

  return (
    <div className="px-1">
      <div className="flex justify-between text-[10px] text-gray-400 mb-2">
        <span>$0</span>
        <span>${MAX_PRICE.toLocaleString()}</span>
      </div>
      <div className="relative h-1.5 bg-gray-200 rounded-full mb-5">
        <div
          className="absolute h-full bg-[var(--color-secondary)] rounded-full"
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
        />
        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          step={10}
          value={min}
          onChange={(e) => onMinChange(Math.min(Number(e.target.value), max - 10))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: min > MAX_PRICE - 100 ? 5 : 3 }}
        />
        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          step={10}
          value={max}
          onChange={(e) => onMaxChange(Math.max(Number(e.target.value), min + 10))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
        />
        <div
          className="absolute w-4 h-4 bg-gray-900 rounded-full -top-1.5 -translate-x-1/2 pointer-events-none"
          style={{ left: `${minPct}%` }}
        />
        <div
          className="absolute w-4 h-4 bg-gray-900 rounded-full -top-1.5 -translate-x-1/2 pointer-events-none"
          style={{ left: `${maxPct}%` }}
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <p className="text-[10px] text-gray-400 mb-1">Minimum</p>
          <div className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-2">
            <span className="text-sm text-gray-400">$</span>
            <input
              type="number"
              min={0}
              max={max - 10}
              value={min}
              onChange={(e) => onMinChange(Math.min(Number(e.target.value), max - 10))}
              className="flex-1 w-full text-sm font-medium text-gray-800 focus:outline-none bg-transparent"
            />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-gray-400 mb-1">Maximum</p>
          <div className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-2">
            <span className="text-sm text-gray-400">$</span>
            <input
              type="number"
              min={min + 10}
              max={MAX_PRICE}
              value={max}
              onChange={(e) => onMaxChange(Math.max(Number(e.target.value), min + 10))}
              className="flex-1 w-full text-sm font-medium text-gray-800 focus:outline-none bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
