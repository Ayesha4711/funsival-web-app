'use client';

import React, { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Subscribe with email:', email);
    // Add your newsletter subscription logic here
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-[#E3F5F5] to-[#C8EBEB]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Keep In Touch Through Our Newsletter!
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest adventures, exclusive deals, and travel tips
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-6 py-4 rounded-xl border-2 border-transparent bg-white focus:border-[#4AA7A7] focus:outline-none text-gray-900 placeholder:text-gray-400 shadow-sm"
          />
          <button
            type="submit"
            className="px-8 py-4 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-semibold rounded-xl transition-colors duration-200 whitespace-nowrap shadow-sm"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
