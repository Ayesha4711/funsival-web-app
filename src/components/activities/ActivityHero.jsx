'use client';

import React from 'react';

export default function ActivityHero({ title, subtitle, backgroundImage, backgroundColor = 'bg-[#4AA7A7]' }) {
  return (
    <section className={`relative w-full h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden ${backgroundColor}`}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: backgroundImage ? `url('${backgroundImage}')` : 'none',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center max-w-7xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight max-w-3xl">
          {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-xl">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
