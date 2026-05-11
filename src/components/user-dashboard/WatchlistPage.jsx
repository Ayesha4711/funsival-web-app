"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AppFooter from "@/components/shared/AppFooter";

const ITEMS_PER_PAGE = 8;

const HeartIcon = ({ filled }) => (
  <svg className={`w-5 h-5 ${filled ? "fill-[#F5823A] text-[#F5823A]" : "text-gray-300"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-4 h-4 shrink-0 text-[#F5823A] fill-current" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-4 h-4 text-[#F5C842] fill-current" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const MOCK_WATCHLIST = [
  {
    id: "1",
    title: "Skydiving Adventures",
    category: "Activities",
    categoryLabel: "Diving",
    image: "https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=600&q=80",
    rating: 4.4,
    reviews: "21K",
    location: "Tokyo, Japan",
    price: { perPerson: 26 },
  },
  {
    id: "2",
    title: "Swimming Pool Resort",
    category: "Places",
    categoryLabel: "Swimming",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80",
    rating: 4.7,
    reviews: "14K",
    location: "Bali, Indonesia",
    price: { hourly: 28 },
  },
  {
    id: "3",
    title: "Mountain Bike Trail",
    category: "Equipment",
    categoryLabel: "Bikes",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80",
    rating: 4.2,
    reviews: "8K",
    location: "Lahore, Pakistan",
    price: { daily: 45 },
  },
  {
    id: "4",
    title: "Paragliding Experience",
    category: "Activities",
    categoryLabel: "Paragliding",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    rating: 4.9,
    reviews: "5K",
    location: "Islamabad, Pakistan",
    price: { perPerson: 85 },
  },
];

function WatchlistCard({ item, onRemove }) {
  const router = useRouter();

  const priceLabel = item.price.hourly
    ? { label: "Hourly", value: item.price.hourly }
    : item.price.daily
    ? { label: "Daily", value: item.price.daily }
    : { label: "Per Person", value: item.price.perPerson };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer group"
      onClick={() => router.push(`/user-dashboard/listing/${item.id}`)}
    >
      {/* Image */}
      <div className="relative h-48 sm:h-52 overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Remove from watchlist */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
          className="absolute top-3 right-3 w-8 h-8 bg-[#F5823A] hover:bg-[#e06d2a] rounded-full flex items-center justify-center transition-colors shadow"
          title="Remove from watchlist"
        >
          <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-3 pt-3 pb-4 sm:px-4">
        {/* Title + tag */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3 className="text-[15px] font-bold text-[#3DAA8A] leading-tight line-clamp-1">{item.title}</h3>
          <span className="shrink-0 text-[11px] font-medium text-[#F5823A] border border-[#F5823A] rounded-full px-2.5 py-0.5 whitespace-nowrap">
            {item.categoryLabel}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm font-semibold text-gray-800">{item.rating.toFixed(1)}</span>
          <StarIcon />
          <span className="text-xs text-gray-400">({item.reviews} Reviews)</span>
        </div>

        {/* Price pill */}
        <div className="flex items-center rounded-full border border-[#F5C842] overflow-hidden text-xs font-medium w-full mb-3">
          <span className="px-3 py-1.5 text-gray-400 bg-[#FFF9EC] whitespace-nowrap">{priceLabel.label}</span>
          <span className="flex-1 text-right px-3 py-1.5 text-[#F5823A] font-bold bg-[#FFF9EC]">${priceLabel.value}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5">
          <LocationIcon />
          <span className="text-xs text-gray-500">{item.location}</span>
        </div>
      </div>
    </div>
  );
}

const BackIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs font-bold"
      >
        {"<<"}
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 text-sm"
      >
        {"<"}
      </button>
      <div className="flex items-center gap-1.5 px-2">
        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#228E8A] text-white text-sm font-semibold">
          {currentPage}
        </span>
        <span className="text-sm text-gray-500">of {totalPages}</span>
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 text-sm"
      >
        {">"}
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs font-bold"
      >
        {">>"}
      </button>
    </div>
  );
}

export default function WatchlistPage() {
  const router = useRouter();
  const [items, setItems] = useState(MOCK_WATCHLIST);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleRemove = (id) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      const newTotal = Math.max(1, Math.ceil(next.length / ITEMS_PER_PAGE));
      if (currentPage > newTotal) setCurrentPage(newTotal);
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 w-full">
        <div className="px-4 sm:px-6 lg:px-10 py-5 flex items-center gap-3">
          <button
            onClick={() => router.push("/user-dashboard/explore")}
            className="text-gray-900 hover:text-gray-600 transition-colors shrink-0"
          >
            <BackIcon />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Wishlist</h1>
        </div>
      </div>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6">
        {paginatedItems.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {paginatedItems.map((item) => (
                <WatchlistCard key={item.id} item={item} onRemove={handleRemove} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-[#F5823A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-1">Your wishlist is empty</p>
            <p className="text-sm text-gray-400 mb-6">Save listings you love and find them here anytime</p>
            <button
              onClick={() => router.push("/user-dashboard/explore")}
              className="px-6 py-2.5 bg-[#228E8A] text-white rounded-full text-sm font-semibold hover:bg-[#1d7a77] transition-colors"
            >
              Start Exploring
            </button>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}
