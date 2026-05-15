"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AppFooter from "@/components/shared/AppFooter";
import Pagination from "@/components/shared/Pagination";

const ITEMS_PER_PAGE = 8;

import { HeartFilledIcon, HeartIcon, LocationIcon, StarIcon, ArrowLeftIcon as BackIcon } from "@/icons";

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
          <HeartFilledIcon size={16} className="text-white" />
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
          <StarIcon size={16} className="text-[#F5C842] fill-current" />
          <span className="text-xs text-gray-400">({item.reviews} Reviews)</span>
        </div>

        {/* Price pill */}
        <div className="flex items-center rounded-full border border-[#F5C842] overflow-hidden text-xs font-medium w-full mb-3">
          <span className="px-3 py-1.5 text-gray-400 bg-[#FFF9EC] whitespace-nowrap">{priceLabel.label}</span>
          <span className="flex-1 text-right px-3 py-1.5 text-[#F5823A] font-bold bg-[#FFF9EC]">${priceLabel.value}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5">
          <LocationIcon size={16} className="shrink-0 text-[#F5823A] fill-current" />
          <span className="text-xs text-gray-500">{item.location}</span>
        </div>
      </div>
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
              <HeartIcon size={40} className="text-[#F5823A]" />
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
