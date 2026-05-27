"use client";

import React from "react";
import Pagination from "@/components/shared/Pagination";
import { formatListingPrice } from "./listings/listingPrice";
import { StarFilledIcon, ImageIcon } from "@/icons";
import ListingStatusDropdown from "./listings/ListingStatusDropdown";
import ListingActionMenu     from "./listings/ListingActionMenu";

export default function ListingsCards({
  data,
  currentPage = 1,
  totalPages  = 1,
  onPageChange,
  onStatusChange,
  onEdit,
  onDelete,
  onResumeDraft,
}) {
  return (
    <div className="flex flex-col gap-4">
      {data.length === 0 && (
        <p className="text-center text-sm text-gray-400 font-medium py-12">No listings found.</p>
      )}

      {data.map((item) => (
        <div key={item.id} className="bg-white rounded-4xl p-5 border border-border relative">
          <div className="absolute top-5 right-5">
            <ListingActionMenu
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onResumeDraft={onResumeDraft}
            />
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 relative">
              {item.image && (item.image.startsWith("http") || item.image.startsWith("blob:") || item.image.startsWith("data:")) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <ImageIcon size={20} />
                </div>
              )}
            </div>
            <div>
              <p className="text-base font-extrabold text-text">{item.name}</p>
              <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-gray-300" /> {item.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <ListingStatusDropdown
              status={item.status}
              onStatusChange={(newStatus) => onStatusChange(item, newStatus)}
            />
            <div className="px-4 py-1.5 rounded-full bg-[#F3F4F6] text-gray-500 text-[11px] font-bold">
              {item.category}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-6 pt-5 border-t border-gray-50">
            <div>
              <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-1">Price</p>
              <p className="text-xs font-bold text-text">
                {item.priceLabel ?? formatListingPrice(item.category, item.price)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-1">Bookings</p>
              <p className="text-xs font-bold text-text">{item.bookings}</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-1">Availability</p>
              <p className="text-xs font-bold text-text">{item.date} — {item.time}</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-1">Rating</p>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-text">
                <StarFilledIcon size={12} className="text-yellow-400" />
                {item.rating}
                <span className="text-gray-300 font-medium">({item.reviews})</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="py-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
