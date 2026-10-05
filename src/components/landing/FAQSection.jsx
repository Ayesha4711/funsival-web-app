'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlusIcon, MinusIcon } from '@/icons';
import { fetchFaqs, selectFaqs, selectFaqsStatus } from '@/store/slices/faqsSlice';

export default function FAQSection({ items }) {
  const dispatch = useDispatch();
  const storedFaqs = useSelector(selectFaqs);
  const faqs = items ?? storedFaqs;
  const status = useSelector(selectFaqsStatus);
  const [openId, setOpenId] = useState(items?.[0]?.id ?? null);

  useEffect(() => {
    if (!items) dispatch(fetchFaqs());
  }, [dispatch, items]);

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };

  if (status !== 'loading' && faqs.length === 0) return null;

  return (
    <section id="frequently-asked-questions" aria-labelledby="faq-heading" className="py-12 md:py-16 lg:py-20 2xl:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-[1600px]">
        {/* Header */}
        <h2 id="faq-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1C1F2E] text-center mb-8 md:mb-14 px-2">
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
                  className={`rounded-2xl p-5 md:p-6 transition-colors duration-200 ${
                    isOpen ? 'bg-[#FFF0D7]' : 'bg-white border border-gray-100 shadow-sm'
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => toggleFAQ(id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${id}`}
                      className="flex w-full items-center justify-between gap-4 text-left text-base md:text-lg font-medium text-[#1C1F2E] rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#228E8A]"
                    >
                      <span>{faq.question}</span>
                      <span aria-hidden="true" className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${isOpen ? 'bg-white text-[#FEB538]' : 'bg-gray-50 text-[#1C1F2E]'}`}>
                        {isOpen ? <MinusIcon size={16} /> : <PlusIcon size={16} />}
                      </span>
                    </button>
                  </h3>

                  {isOpen && (
                    <p id={`faq-answer-${id}`} className="text-sm text-gray-600 leading-relaxed mt-3">
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
