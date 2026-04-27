"use client";

import React, { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");

  const handleSubscribe = e => {
    e.preventDefault();
    console.log("Subscribe with email:", email);
  };

  return (
    <section className="py-10 md:py-14 bg-[#FBFBFB]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: text */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Keep In Touch Through Our Newsletter!
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Lorem ipsum dolor sit amet consectetur.
            </p>
          </div>

          {/* Right: input + button */}
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl sm:rounded-full shadow-sm border border-gray-200 overflow-hidden p-1.5 sm:pr-1.5 sm:pl-5 w-full md:w-auto lg:min-w-[420px] gap-2 sm:gap-0"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent px-4 sm:px-0 py-2 sm:py-0"
            />
            <button
              type="submit"
              className="flex-shrink-0 px-6 py-2.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-semibold rounded-xl sm:rounded-full text-sm transition-colors duration-200"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
