'use client';

import React, { useState } from 'react';

const faqs = [
  {
    id: 1,
    question: 'Lorem ipsum dolor sit amet, consectetur',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
  },
  {
    id: 2,
    question: 'Lorem ipsum dolor sit amet, consectetur',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  },
  {
    id: 3,
    question: 'Lorem ipsum dolor sit amet, consectetur',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  },
  {
    id: 4,
    question: 'Lorem ipsum dolor sit amet, consectetur',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  },
  {
    id: 5,
    question: 'Lorem ipsum dolor sit amet, consectetur',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  },
  {
    id: 6,
    question: 'Lorem ipsum dolor sit amet, consectetur',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  }
];

export default function FAQSection() {
  const [openId, setOpenId] = useState(null);

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 2xl:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px]">
        {/* Header */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1C1F2E] text-center mb-8 md:mb-14 px-2">
          Frequently Asked Questions
        </h2>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-start">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={`rounded-2xl p-5 md:p-6 transition-all duration-200 cursor-pointer ${
                openId === faq.id ? 'bg-[#FFF8E6]' : 'bg-white border border-gray-100'
              }`}
              onClick={() => toggleFAQ(faq.id)}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-base md:text-lg font-medium text-[#1C1F2E]">
                  {faq.question}
                </h3>

                <button
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    openId === faq.id
                      ? 'bg-[#F5C842] text-white'
                      : 'bg-transparent text-[#1C1F2E]'
                  }`}
                  aria-label={openId === faq.id ? 'Collapse' : 'Expand'}
                >
                  {openId === faq.id ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </button>
              </div>

              {openId === faq.id && (
                <p className="text-sm text-gray-600 leading-relaxed mt-3">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
