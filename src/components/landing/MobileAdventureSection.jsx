'use client';

import React from 'react';
import Image from 'next/image';
import MobileSection from '@/assets/images/mobilesection.svg';

export default function MobileAdventureSection() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px]">
        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 items-stretch">
          {/* Mobile Section Image — pure SVG, small enough to keep as-is */}
          <div className="w-full xl:w-1/2 flex items-center justify-center">
            <div className="relative w-full">
              <Image
                src={MobileSection}
                alt="Mobile app preview"
                width={0}
                height={0}
                sizes="(max-width: 1280px) 100vw, 50vw"
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>
          </div>

          {/* Adventure Image — optimized WebP */}
          <div className="w-full xl:w-1/2 flex items-center justify-center">
            <div className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/landingpage.png"
                alt="Adventure experiences"
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
