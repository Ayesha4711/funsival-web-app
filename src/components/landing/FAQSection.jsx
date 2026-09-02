'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlusIcon, MinusIcon } from '@/icons';
import { fetchFaqs, selectFaqs, selectFaqsStatus } from '@/store/slices/faqsSlice';

export default function FAQSection() {
  const dispatch = useDispatch();
  const faqs = useSelector(selectFaqs);
  const status = useSelector(selectFaqsStatus);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    dispatch(fetchFaqs());
  }, [dispatch]);

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };

  if (status !== 'loading' && faqs.length === 0) return null;

  return (
    <section className="py-12 md:py-16 lg:py-20 2xl:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px]">
        {/* Header */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1C1F2E] text-center mb-8 md:mb-14 px-2">
          Frequently Asked Questions
        </h2>

        {status === 'loading' && faqs.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-2xl p-5 md:p-6 bg-gray-50 animate-pulse h-16" />
            ))}
          </div>
        ) : (
          /* FAQ Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-start">
            {faqs.map((faq) => {
              const id = faq.id ?? faq._id;
              const isOpen = openId === id;
              return (
                <div
                  key={id}
                  className={`rounded-2xl p-5 md:p-6 transition-all duration-200 cursor-pointer ${
                    isOpen ? 'bg-[#FFF8E6]' : 'bg-white border border-gray-100'
                  }`}
                  onClick={() => toggleFAQ(id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-base md:text-lg font-medium text-[#1C1F2E]">
                      {faq.question}
                    </h3>

                    <button
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        isOpen
                          ? 'bg-[#F5C842] text-white'
                          : 'bg-transparent text-[#1C1F2E]'
                      }`}
                      aria-label={isOpen ? 'Collapse' : 'Expand'}
                    >
                      {isOpen ? (
                        <MinusIcon size={16} />
                      ) : (
                        <PlusIcon size={16} />
                      )}
                    </button>
                  </div>

                  {isOpen && (
                    <p className="text-sm text-gray-600 leading-relaxed mt-3">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
