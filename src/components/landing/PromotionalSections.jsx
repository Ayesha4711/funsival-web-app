'use client';

import React from 'react';
import Image from 'next/image';
import ProviderImg1 from '@/assets/images/1 1.svg';
import ProviderImg2 from '@/assets/images/2 1.svg';
import ProviderImg3 from '@/assets/images/3 1.svg';

function OptImg({ name, alt }) {
  return (
    <>
      <source srcSet={`/images/optimized/${name}.webp`} type="image/webp" />
      <img src={`/images/optimized/${name}.jpg`} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
    </>
  );
}

export default function PromotionalSections() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

          {/* Equipment Provider Section */}
          <div className="bg-[#FEF3C7] rounded-3xl p-8 md:p-10 overflow-hidden relative flex flex-col justify-between min-h-[420px]">
            <div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#B78B00] leading-snug max-w-xs">
                Become an equipment provider on our fast growing platform.
              </h3>
            </div>

            {/* Phone Mockup Card */}
            <div className="mt-8 flex items-end justify-between gap-4">
              <div className="bg-white rounded-3xl p-5 w-52 flex-shrink-0">
                {/* App header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#4AA7A7] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">funsival</span>
                </div>

                <p className="text-sm font-bold text-gray-900 mb-1">Now, Set Your Price</p>
                <p className="text-xs text-gray-400 mb-4">You can change it anytime</p>

                {/* Provider images row */}
                <div className="flex gap-1 mb-3">
                  <Image src={ProviderImg1} alt="Provider 1" width={32} height={32} className="rounded-lg object-cover" />
                  <Image src={ProviderImg2} alt="Provider 2" width={32} height={32} className="rounded-lg object-cover" />
                  <Image src={ProviderImg3} alt="Provider 3" width={32} height={32} className="rounded-lg object-cover" />
                </div>

                <div className="text-2xl font-extrabold text-[#F5C842] mb-1">$280</div>
                <p className="text-[10px] text-gray-400 mb-1">Funsival fee: 45 user see the</p>
                <p className="text-[10px] text-gray-400 mb-4">$32/day total cost</p>

                <button className="w-full bg-[#4AA7A7] text-white text-xs font-semibold py-2 rounded-xl">
                  Next
                </button>
              </div>

              {/* Become a Provider button */}
              <div className="flex-1 flex justify-end pb-2">
                <button className="bg-[#4AA7A7] hover:bg-[#3d8f8f] text-white font-semibold py-3 px-6 rounded-2xl transition-colors duration-200 text-sm whitespace-nowrap">
                  Become a Provider
                </button>
              </div>
            </div>
          </div>

          {/* Booking Discount Section */}
          <div className="bg-[#D6EEEE] rounded-3xl p-8 md:p-10 overflow-hidden relative flex flex-col justify-between min-h-[420px]">
            <div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1C1F2E] leading-snug max-w-sm">
                Book your next adventure through our platform and get 10% off.
              </h3>
            </div>

            {/* Scattered images + button */}
            <div className="mt-8 relative">
              {/* Scattered image collage */}
              <div className="relative h-52">
                {/* Top-left: jeep / offroad */}
                <picture className="absolute -left-4 top-0 w-32 h-28 rounded-2xl overflow-hidden block">
                  <OptImg name="img4" alt="Jeep adventure" />
                </picture>
                {/* Bottom-left: scuba diver */}
                <picture className="absolute left-20 bottom-0 w-28 h-28 rounded-2xl overflow-hidden block">
                  <OptImg name="img5" alt="Scuba diving" />
                </picture>
                {/* Center: ATV rider */}
                <picture className="absolute left-[43%] -translate-x-1/2 top-4 w-28 h-32 rounded-2xl overflow-hidden block">
                  <OptImg name="img2" alt="ATV adventure" />
                </picture>
                {/* Top-right: paragliding */}
                <picture className="absolute right-20 top-0 w-32 h-24 rounded-2xl overflow-hidden block">
                  <OptImg name="img1" alt="Paragliding" />
                </picture>
                {/* Far right: beach (partially cut) */}
                <picture className="absolute -right-4 bottom-0 w-24 h-32 rounded-2xl overflow-hidden block">
                  <OptImg name="img3" alt="Beach adventure" />
                </picture>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="bg-[#1C1F2E] hover:bg-[#2d3147] text-white font-semibold py-3 px-6 rounded-2xl transition-colors duration-200 text-sm">
                  Book your next adventure
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
