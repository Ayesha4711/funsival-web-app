'use client';

import React from 'react';
import Image from 'next/image';

export default function ActivityHero({ title, subtitle, backgroundImage }) {
  return (
    <section className="relative w-full h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden bg-[#4AA7A7]">
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt={title}
          fill
          className="object-cover object-center"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-10 max-w-7xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight max-w-3xl">
          {title}
        </h1>
        <p className="text-base sm:text-lg text-white/90 max-w-xl">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
