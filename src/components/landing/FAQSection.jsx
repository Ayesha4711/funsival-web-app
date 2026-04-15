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
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-10 md:mb-14">
          Frequently Asked Questions
        </h2>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={`bg-[#FFF8E6] rounded-2xl p-6 transition-all duration-200 cursor-pointer ${
                openId === faq.id ? 'ring-2 ring-[#F5C842]' : ''
              }`}
              onClick={() => toggleFAQ(faq.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>

                  {openId === faq.id && (
                    <p className="text-sm text-gray-600 leading-relaxed mt-3">
                      {faq.answer}
                    </p>
                  )}
                </div>

                <button
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label={openId === faq.id ? 'Collapse' : 'Expand'}
                >
                  {openId === faq.id ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
