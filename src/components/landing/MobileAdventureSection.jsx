'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
              <Link
                href="/login"
                className="absolute left-[61.59%] top-[87.4%] -translate-y-1/2 w-[32.06%] h-[8.94%] min-h-11 rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#228E8A]"
              >
                <span className="sr-only">Become a Provider</span>
              </Link>
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
              <Link
                href="/login"
                className="absolute left-[54.13%] top-[87.4%] -translate-y-1/2 w-[39.52%] h-[8.94%] min-h-11 rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#228E8A]"
              >
                <span className="sr-only">Book your next adventure</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
