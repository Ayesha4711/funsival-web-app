"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { StarIcon, LocationIcon, CalendarIcon } from "@/icons";
import { navigateToListingOrLogin } from "@/lib/listingNavigation";

// Public-facing listing card for the landing page's activity/destination
// detail pages. Same field parsing as ListingCard in UserExplorePage.jsx
// (which assumes an already-logged-in viewer), but with an auth-gated
// click and no wishlist button, since anonymous visitors can land here.
export default function PublicListingCard({ listing }) {
  const router = useRouter();

  const id = listing._id || listing.id;
  const info = listing.basicInformation ?? {};
  const loc = listing.placeLocation ?? {};
  const category = listing.category ?? "activities";

  const title = info.activityTitle || info.equipmentName || info.placeName || listing.title || "Listing";

  const images = listing.photos || info.images || listing.images || [];
  const image =
    (Array.isArray(images) && images.length > 0 ? images[0] : images) ||
    listing.image ||
    "https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=400&q=80";

  const locationStr =
    [loc.city, loc.state, loc.country].filter(Boolean).join(", ") ||
    info.location ||
    listing.location ||
    "—";

  const priceObj = typeof listing.price === "object" && listing.price !== null ? listing.price : null;

  const toNum = (v) => {
    const n = Number(v);
    return !isNaN(n) && isFinite(n) && n > 0 ? n : null;
  };

  const hourlyPrice = toNum(priceObj?.hourly ?? priceObj?.perHour ?? info.pricePerHour);
  const dailyPrice = toNum(priceObj?.daily ?? priceObj?.dailyRate ?? info.dailyRate);
  const perPersonPrice = toNum(priceObj?.perPerson ?? info.pricePerPerson);
  const fallbackPrice = toNum(priceObj?.amount) ?? (typeof listing.price === "number" ? toNum(listing.price) : null);

  const reviewSummary = listing.reviewSummary ?? {};
  const rating = reviewSummary.overallRating ?? listing.rating ?? 0;
  const reviews = reviewSummary.count ?? listing.reviewCount ?? listing.reviews ?? 0;

  const rawType = listing.type || info.category || listing.categoryLabel;
  const categoryLabel = rawType
    ? rawType.charAt(0).toUpperCase() + rawType.slice(1).replace(/_/g, " ")
    : category === "places"
      ? "Place"
      : category === "equipment"
        ? "Equipment"
        : "Activity";

  const availability = listing.availability || [];
  let dateDisplay = "";

  if (availability.length > 0) {
    const fmtDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const sorted = [...availability]
      .map((a) => ({ ...a, _d: new Date(a.date) }))
      .filter((a) => !isNaN(a._d.getTime()))
      .sort((a, b) => a._d - b._d);

    if (sorted.length > 0) {
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      dateDisplay =
        first._d.toDateString() === last._d.toDateString()
          ? fmtDate(first._d)
          : `${fmtDate(first._d)} – ${fmtDate(last._d)}`;
    }
  }

  const handleClick = () => navigateToListingOrLogin(router, id);

  const hasHourly = hourlyPrice != null;
  const hasDaily = dailyPrice != null;
  const hasPerPerson = perPersonPrice != null;
  const hasFallback = !hasHourly && !hasDaily && !hasPerPerson && fallbackPrice != null;
  const twoCol = hasHourly && hasDaily;

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300 group"
    >
      <div className="relative h-48 sm:h-52 overflow-hidden rounded-2xl">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="px-3 pt-3 pb-4 sm:px-4 sm:pt-3.5 sm:pb-4">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3 className="text-[15px] font-bold text-[#3DAA8A] leading-tight line-clamp-1">{title}</h3>
          <span className="shrink-0 text-[11px] font-medium text-[#F5823A] border border-[#F5823A] rounded-full px-2.5 py-0.5 whitespace-nowrap bg-white">
            {categoryLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm font-semibold text-gray-800">
            {typeof rating === "number" ? rating.toFixed(1) : rating}
          </span>
          <StarIcon size={16} className="text-[#F5C842] fill-current" />
          <span className="text-xs text-gray-400">({reviews} Reviews)</span>
        </div>

        <div className="flex gap-2 mb-3">
          {hasHourly && (
            <div className={`flex items-center rounded-full border border-[#F5C842] overflow-hidden text-xs font-medium ${twoCol ? "flex-1" : "w-full"}`}>
              <span className="px-3 py-1.5 text-gray-400 bg-[#FFF9EC] whitespace-nowrap">Hourly</span>
              <span className="flex-1 text-right px-3 py-1.5 text-[#F5823A] font-bold bg-[#FFF9EC]">${hourlyPrice}</span>
            </div>
          )}
          {hasDaily && (
            <div className={`flex items-center rounded-full border border-[#4AA7A7] overflow-hidden text-xs font-medium ${twoCol ? "flex-1" : "w-full"}`}>
              <span className="px-3 py-1.5 text-gray-400 bg-[#EDF8F8] whitespace-nowrap">Daily</span>
              <span className="flex-1 text-right px-3 py-1.5 text-[#4AA7A7] font-bold bg-[#EDF8F8]">${dailyPrice}</span>
            </div>
          )}
          {hasPerPerson && !hasHourly && !hasDaily && (
            <div className="flex items-center rounded-full border border-[#F5C842] overflow-hidden text-xs font-medium w-full">
              <span className="px-3 py-1.5 text-gray-400 bg-[#FFF9EC] whitespace-nowrap">Per Person</span>
              <span className="flex-1 text-right px-3 py-1.5 text-[#F5823A] font-bold bg-[#FFF9EC]">${perPersonPrice}</span>
            </div>
          )}
          {hasFallback && (
            <div className="flex items-center rounded-full border border-[#F5C842] overflow-hidden text-xs font-medium w-full">
              <span className="px-3 py-1.5 text-gray-400 bg-[#FFF9EC] whitespace-nowrap">From</span>
              <span className="flex-1 text-right px-3 py-1.5 text-[#F5823A] font-bold bg-[#FFF9EC]">${fallbackPrice}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <LocationIcon size={16} className="shrink-0 text-[#F5823A] fill-current" />
            <span className="text-xs text-gray-500 line-clamp-1">{locationStr}</span>
          </div>
          {dateDisplay && (
            <div className="flex items-center gap-1.5">
              <CalendarIcon size={16} className="shrink-0 text-[#FEB538]" />
              <span className="text-xs font-bold text-[#FEB538]">{dateDisplay}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
