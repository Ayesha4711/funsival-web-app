'use client';

import React from 'react';
import Image from 'next/image';

export default function PromotionalSections() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Equipment Provider Section */}
          <div className="bg-gradient-to-br from-[#FFF8E6] to-[#FFE8B8] rounded-3xl p-8 md:p-10 lg:p-12 flex flex-col justify-between min-h-[400px] md:min-h-[500px]">
            <div>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Become an equipment provided on our fast growing platform.
              </h3>
            </div>

            <div className="mt-8">
              {/* Price Card */}
              <div className="bg-white rounded-2xl p-6 mb-6 max-w-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#F5C842] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Equipment</p>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  How Set Your Price
                </h4>

                <div className="text-center py-4">
                  <div className="text-4xl font-bold text-gray-900 mb-1">$260</div>
                  <p className="text-sm text-gray-500">per day</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-[#4AA7A7]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Flexible pricing options</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-[#4AA7A7]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Competitive rates</span>
                  </div>
                </div>

                <button className="w-full bg-[#4AA7A7] hover:bg-[#3d8f8f] text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200">
                  Start
                </button>
              </div>

              <button className="bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-semibold py-3 px-8 rounded-xl transition-colors duration-200">
                Become a Provider
              </button>
            </div>
          </div>

          {/* Booking Discount Section */}
          <div className="bg-gradient-to-br from-[#E3F5F5] to-[#C8EBEB] rounded-3xl p-8 md:p-10 lg:p-12 flex flex-col justify-between min-h-[400px] md:min-h-[500px]">
            <div>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Book your next adventure through our platform and get 10% off.
              </h3>
            </div>

            <div className="mt-8">
              {/* Image Gallery */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-2xl overflow-hidden h-32 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500" />
                  {/* Placeholder for image */}
                </div>
                <div className="bg-white rounded-2xl overflow-hidden h-32 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500" />
                  {/* Placeholder for image */}
                </div>
                <div className="bg-white rounded-2xl overflow-hidden h-32 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500" />
                  {/* Placeholder for image */}
                </div>
                <div className="bg-white rounded-2xl overflow-hidden h-32 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-500" />
                  {/* Placeholder for image */}
                </div>
              </div>

              <button className="bg-[#4AA7A7] hover:bg-[#3d8f8f] text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-200">
                Book your next adventure
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
