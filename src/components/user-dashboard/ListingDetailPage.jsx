"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { fetchListing, selectSelectedListing, selectListingsStatus } from "@/store/slices/listingsSlice";
import { SimpleMap } from "@/components/shared/MapControls";
import NewsletterSection from "@/components/landing/NewsletterSection";
import LandingFooter from "@/components/landing/LandingFooter";

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const StarIcon = ({ filled }) => (
  <svg className={`w-4 h-4 ${filled ? "text-[#F5C842] fill-current" : "text-gray-300 fill-current"}`} viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} filled={s <= Math.floor(rating)} />)}
  </div>
);

const LocationPinIcon = () => (
  <svg className="w-4 h-4 text-[#4AA7A7] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m5-2a8 8 0 11-16 0 8 8 0 0116 0z" />
  </svg>
);

const UserOutlineIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A4 4 0 018.94 15h6.12a4 4 0 013.82 2.804M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckBadge = () => (
  <span className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#4AA7A7] text-white">
    <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 6.5l2 2 5-5" />
    </svg>
  </span>
);

function BookingField({ label, children, icon }) {
  return (
    <label className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 focus-within:border-[#4AA7A7]">
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-none mb-1">{label}</p>
        {children}
      </div>
    </label>
  );
}

function BookingSummaryLine({ label, value, bold = false }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${bold ? "font-bold text-gray-900" : "text-sm text-gray-500"}`}>
      <span className={bold ? "text-sm" : ""}>{label}</span>
      <span className={bold ? "text-base" : "text-sm text-gray-900"}>{value}</span>
    </div>
  );
}

function ModePill({ active, label, icon, onClick, compact = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex-1 rounded-2xl border px-4 py-4 text-center transition-colors",
        active ? "border-[#4AA7A7] bg-[#D7ECEB]" : "border-gray-200 bg-white hover:border-[#8bbcbc]",
        compact ? "py-3" : "",
      ].join(" ")}
    >
      {active && <CheckBadge />}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[#4AA7A7]">{icon}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
    </button>
  );
}

function BookingShell({ children, title, price, priceUnit, rating, reviews }) {
  const ratingText = Number.isFinite(Number(rating)) ? Number(rating).toFixed(1).replace(/\.0$/, "") : "4.4";
  return (
    <div className="w-full rounded-[24px] border border-gray-200 bg-white p-4 sm:p-5 ">
      {children}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
            <StarRating rating={rating} />
            <span className="ml-1 whitespace-nowrap">{ratingText}</span>
            <span className="text-gray-400">({reviews} Reviews)</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xl sm:text-2xl font-semibold text-gray-900">${price}<span className="text-base text-gray-500">{priceUnit}</span></div>
        </div>
      </div>
    </div>
  );
}

/* ─── Image Gallery ──────────────────────────────────────────────────────────── */
function ImageGallery({ images, title }) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="relative w-full overflow-hidden rounded-[22px] bg-gray-100 aspect-[16/10]">
        <img src={images[active]} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`shrink-0 w-24 h-16 sm:w-28 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all ${i === active ? "border-[#F5C842]" : "border-transparent"}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Booking Card (Places) ──────────────────────────────────────────────────── */
function PlacesBookingCard({ listing, listingId }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [guests, setGuests] = useState(1);
  const hours = startTime && endTime
    ? Math.max(1, Math.round((new Date(`1970-01-01T${endTime}`) - new Date(`1970-01-01T${startTime}`)) / 3600000))
    : 3;
  const subtotal = listing.price * hours;
  const serviceFee = Math.max(8, Math.round(subtotal * 0.067));
  const total = subtotal + serviceFee;

  return (
    <BookingShell title="Book Your Place" price={listing.price} priceUnit="/Hr" rating={listing.rating} reviews={listing.reviews}>
      <div className="space-y-3">
        <div className="rounded-[22px] border border-[#4AA7A7] bg-[#D7ECEB] px-4 py-4 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full text-[#4AA7A7]">
            <ClockIcon />
          </div>
          <p className="mt-1 text-sm font-medium text-gray-700">Per Hour</p>
        </div>

        <div className="grid gap-3">
          <BookingField label="Date" icon={<CalendarIcon />}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none" />
          </BookingField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <BookingField label="Start time" icon={<ClockIcon />}>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none" />
            </BookingField>
            <BookingField label="End time" icon={<ClockIcon />}>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none" />
            </BookingField>
          </div>

          <BookingField label="Select guest number" icon={<UserOutlineIcon />}>
            <input
              type="number"
              min="1"
              value={guests}
              onChange={(e) => setGuests(Math.max(1, Number(e.target.value || 1)))}
              className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none"
            />
          </BookingField>
        </div>

        <div className="space-y-1 border-t border-gray-100 pt-3 text-sm">
          <BookingSummaryLine label={`$${listing.price}/hr x ${hours} hour${hours > 1 ? "s" : ""}`} value={`$${subtotal}`} />
          <BookingSummaryLine label="Service fee" value={`$${serviceFee}`} />
          <BookingSummaryLine label="Total" value={`$${total}`} bold />
        </div>

        <button
          onClick={() => {
            if (!listingId) { toast.error("Listing not available for booking."); return; }
            router.push(
              `/user-dashboard/confirm-and-pay` +
              `?listingId=${encodeURIComponent(listingId)}` +
              `&bookingType=per_hour` +
              `&title=${encodeURIComponent(listing.title)}` +
              `&image=${encodeURIComponent(listing.images[0])}` +
              `&dateFrom=${encodeURIComponent(date || "")}` +
              `&dateTo=${encodeURIComponent(date || "")}` +
              `&startDate=${encodeURIComponent(date || "")}` +
              `&endDate=${encodeURIComponent(date || "")}` +
              `&startTime=${encodeURIComponent(startTime || "")}` +
              `&endTime=${encodeURIComponent(endTime || "")}` +
              `&guests=${encodeURIComponent(guests + " guest")}` +
              `&numberOfGuests=${guests}` +
              `&pricePerUnit=${listing.price}` +
              `&hours=${hours}` +
              `&funsivalFee=${serviceFee}`
            );
          }}
          className="mt-2 w-full rounded-full bg-[#F5C842] py-3.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-[#e0b430]"
        >
          Reserve
        </button>
      </div>
    </BookingShell>
  );
}

/* ─── Booking Card (Equipment) ───────────────────────────────────────────────── */
function EquipmentBookingCard({ listing, listingId }) {
  const router = useRouter();
  const [mode, setMode] = useState("hourly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const hours = startTime && endTime
    ? Math.max(1, Math.round((new Date(`1970-01-01T${endTime}`) - new Date(`1970-01-01T${startTime}`)) / 3600000))
    : 3;
  const days = startDate && endDate
    ? Math.max(1, Math.round((new Date(`${endDate}T00:00:00`) - new Date(`${startDate}T00:00:00`)) / 86400000))
    : 1;
  const activeSpan = mode === "daily" ? days : hours;
  const subtotal = listing.price * activeSpan;
  const fee = Math.max(8, Math.round(subtotal * 0.067));
  const total = subtotal + fee;

  return (
    <BookingShell title="Book Your Equipment" price={listing.price} priceUnit={mode === "daily" ? "/Day" : "/Hr"} rating={listing.rating} reviews={listing.reviews}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <ModePill
            active={mode === "hourly"}
            label="Hourly"
            icon={<ClockIcon />}
            onClick={() => setMode("hourly")}
          />
          <ModePill
            active={mode === "daily"}
            label="Daily"
            icon={<CalendarIcon />}
            onClick={() => setMode("daily")}
          />
        </div>

        <div className="grid gap-3">
          <BookingField label="Date" icon={<CalendarIcon />}>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none" />
          </BookingField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <BookingField label="Start time" icon={<ClockIcon />}>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none" />
            </BookingField>
            <BookingField label="End time" icon={<ClockIcon />}>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none" />
            </BookingField>
          </div>
          <BookingField label="Return date" icon={<CalendarIcon />}>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none" />
          </BookingField>
        </div>

        <div className="space-y-1 border-t border-gray-100 pt-3 text-sm">
          <BookingSummaryLine label={`$${listing.price}${mode === "daily" ? "/day" : "/hr"} x ${activeSpan} ${mode === "daily" ? "day" : "hour"}${activeSpan > 1 ? "s" : ""}`} value={`$${subtotal}`} />
          <BookingSummaryLine label="Service fee" value={`$${fee}`} />
          <BookingSummaryLine label="Total" value={`$${total}`} bold />
        </div>

        <button
          onClick={() => {
            if (!listingId) { toast.error("Listing not available for booking."); return; }
            router.push(
              `/user-dashboard/confirm-and-pay` +
              `?listingId=${encodeURIComponent(listingId)}` +
              `&bookingType=${mode === "daily" ? "daily" : "per_hour"}` +
              `&title=${encodeURIComponent(listing.title)}` +
              `&image=${encodeURIComponent(listing.images[0])}` +
              `&dateFrom=${encodeURIComponent(startDate || "")}` +
              `&dateTo=${encodeURIComponent(endDate || "")}` +
              `&startDate=${encodeURIComponent(startDate || "")}` +
              `&endDate=${encodeURIComponent(endDate || "")}` +
              `&startTime=${encodeURIComponent(startTime || "")}` +
              `&endTime=${encodeURIComponent(endTime || "")}` +
              `&guests=${encodeURIComponent("1 unit")}` +
              `&pricePerUnit=${listing.price}` +
              `&hours=${activeSpan}` +
              `&funsivalFee=${fee}`
            );
          }}
          className="mt-2 w-full rounded-full bg-[#F5C842] py-3.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-[#e0b430]"
        >
          Reserve
        </button>
      </div>
    </BookingShell>
  );
}

/* ─── Booking Card (Activities) ──────────────────────────────────────────────── */
function ActivityBookingCard({ listing, listingId }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [persons, setPersons] = useState(1);
  const hours = startTime && endTime
    ? Math.max(1, Math.round((new Date(`1970-01-01T${endTime}`) - new Date(`1970-01-01T${startTime}`)) / 3600000))
    : 3;
  const subtotal = listing.price * persons;
  const fee = Math.max(8, Math.round(subtotal * 0.067));
  const total = subtotal + fee;

  return (
    <BookingShell title="Book Your Activity" price={listing.price} priceUnit="/Hr" rating={listing.rating} reviews={listing.reviews}>
      <div className="space-y-3">
        <div className="rounded-[22px] border border-[#4AA7A7] bg-[#D7ECEB] px-4 py-4 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full text-[#4AA7A7]">
            <UserOutlineIcon />
          </div>
          <p className="mt-1 text-sm font-medium text-gray-700">Per Person</p>
        </div>

        <div className="grid gap-3">
          <BookingField label="Date" icon={<CalendarIcon />}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none" />
          </BookingField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <BookingField label="Start time" icon={<ClockIcon />}>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none" />
            </BookingField>
            <BookingField label="End time" icon={<ClockIcon />}>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none" />
            </BookingField>
          </div>
          <BookingField label="Select guest number" icon={<UserOutlineIcon />}>
            <input
              type="number"
              min="1"
              value={persons}
              onChange={(e) => setPersons(Math.max(1, Number(e.target.value || 1)))}
              className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none"
            />
          </BookingField>
        </div>

        <div className="space-y-1 border-t border-gray-100 pt-3 text-sm">
          <BookingSummaryLine label={`$${listing.price}/hr x ${hours} hour${hours > 1 ? "s" : ""}`} value={`$${subtotal}`} />
          <BookingSummaryLine label="Service fee" value={`$${fee}`} />
          <BookingSummaryLine label="Total" value={`$${total}`} bold />
        </div>

        <button
          onClick={() => {
            if (!listingId) { toast.error("Listing not available for booking."); return; }
            router.push(
              `/user-dashboard/confirm-and-pay` +
              `?listingId=${encodeURIComponent(listingId)}` +
              `&bookingType=per_person` +
              `&title=${encodeURIComponent(listing.title)}` +
              `&image=${encodeURIComponent(listing.images[0])}` +
              `&dateFrom=${encodeURIComponent(date || "")}` +
              `&dateTo=${encodeURIComponent(date || "")}` +
              `&startDate=${encodeURIComponent(date || "")}` +
              `&endDate=${encodeURIComponent(date || "")}` +
              `&startTime=${encodeURIComponent(startTime || "")}` +
              `&endTime=${encodeURIComponent(endTime || "")}` +
              `&guests=${encodeURIComponent(persons + " person")}` +
              `&numberOfGuests=${persons}` +
              `&pricePerUnit=${listing.price}` +
              `&hours=${hours}` +
              `&funsivalFee=${fee}`
            );
          }}
          className="mt-2 w-full rounded-full bg-[#F5C842] py-3.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-[#e0b430]"
        >
          Reserve
        </button>
      </div>
    </BookingShell>
  );
}

/* ─── Review Card ────────────────────────────────────────────────────────────── */
function ReviewCard({ review }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <img src={review.avatar} alt={review.name} className="w-9 h-9 rounded-full object-cover" />
        <div>
          <p className="text-sm font-bold text-gray-900">{review.name}</p>
          <StarRating rating={review.rating} />
        </div>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">{review.text}</p>
    </div>
  );
}

/* ─── Adapt real API listing → internal shape ────────────────────────────────── */
function adaptApiListing(apiListing, urlType) {
  const info = apiListing.basicInformation ?? {};
  const loc = apiListing.placeLocation ?? {};
  const category = apiListing.category ?? urlType ?? "places";

  const title = info.activityTitle || info.equipmentName || info.placeName || "Listing";
  const location = [loc.city, loc.state, loc.country].filter(Boolean).join(", ") || info.location || "—";
  
  // Handle price from nested price object
  const price = apiListing.price?.amount || info.pricePerPerson || info.pricePerHour || info.dailyRate || 0;
  const priceUnit = category === "activities" ? "/person" : category === "equipment" ? "/day" : "/night";
  
  // Handle photos from listing.photos (as sent by AddListingWizard)
  const images = (Array.isArray(apiListing.photos) && apiListing.photos.length > 0)
    ? apiListing.photos
    : ((Array.isArray(info.images) && info.images.length > 0)
        ? info.images
        : ["https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=800&q=80"]);

  const host = apiListing.host ?? {};
  const hostName = host.name || host.email || "Host";
  const hostAvatar = host.avatar || `https://i.pravatar.cc/60?img=1`;

  // Merge serviceDetails if available (backend sometimes flattens or nests these)
  const service = apiListing.serviceDetails ?? {};
  const description = info.description || apiListing.description || "No description provided.";
  
  // Extract amenities/includes
  const amenities = info.amenities || service.whatsIncluded || [];
  const includes = info.includes || service.whatsIncluded || [];

  return {
    _id: apiListing._id,
    type: category,
    title,
    location,
    rating: apiListing.rating ?? 4.5,
    reviews: apiListing.reviewCount ?? 0,
    price,
    priceUnit,
    images,
    host: { name: hostName, avatar: hostAvatar, joinDate: "2021", responseRate: "95%", responseTime: "within an hour" },
    details: {
      ...info,
      ...service,
      duration: typeof service.duration === 'object' ? `${service.duration.value} ${service.duration.unit}` : service.duration
    },
    description,
    amenities: Array.isArray(amenities) ? amenities : [],
    includes: Array.isArray(includes) ? includes : [],
    cancellationPolicy: service.cancellationPolicy || apiListing.cancellationPolicy || "Contact host for cancellation policy.",
    requirements: service.requirements || apiListing.requirements || "",
    mapLat: loc.latitude ?? 40.7128,
    mapLng: loc.longitude ?? -74.006,
    reviews_list: apiListing.reviews ?? [],
  };
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
export default function ListingDetailPage({ params: paramsPromise }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  
  // Unwrap params Promise (Next.js 15+ requirement)
  const params = React.use(paramsPromise);
  const rawId = params?.id;
  const urlType = searchParams.get("type"); // 'places' | 'equipment' | 'activities'

  const apiListing = useSelector(selectSelectedListing);
  const allListings = useSelector((state) => state.listings.items);
  const fetchStatus = useSelector(selectListingsStatus);

  // Optimistic listing: find in cache if not yet loaded in selectedListing
  const cachedListing = React.useMemo(() => {
    if (apiListing && (apiListing._id === rawId || apiListing.id === rawId)) return apiListing;
    return allListings.find(l => l._id === rawId || l.id === rawId);
  }, [apiListing, allListings, rawId]);

  useEffect(() => {
    if (rawId) {
      dispatch(fetchListing(rawId));
    }
  }, [dispatch, rawId]);

  // While loading, only show full spinner if we have NO data at all
  if (fetchStatus === "loading" && !cachedListing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If fetch failed and we have no cache, show error
  if (fetchStatus === "failed" && !cachedListing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-gray-500 font-medium">Failed to load listing details.</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-[#4AA7A7] text-white rounded-full text-sm font-bold">
          Go Back
        </button>
      </div>
    );
  }

  // Use cachedListing (which defaults to apiListing if ID matches)
  const displayListing = cachedListing || apiListing;

  if (!displayListing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const listing = adaptApiListing(displayListing, urlType);
  const listingId = displayListing._id || displayListing.id;

  return (
    <div className="flex flex-col bg-gray-50">
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-5 lg:px-6 xl:px-8 py-5 sm:py-6 lg:py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => router.back()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-[#4AA7A7] hover:text-[#4AA7A7]">
              <BackIcon />
            </button>
            <h1 className="truncate text-lg font-semibold text-gray-900 sm:text-xl lg:text-2xl">{listing.title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:border-[#4AA7A7] hover:text-[#4AA7A7]">
              <HeartIcon />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:border-[#4AA7A7] hover:text-[#4AA7A7]">
              <ShareIcon />
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px] lg:gap-6 items-start">
          <div className="min-w-0 space-y-5">
            <ImageGallery images={listing.images} title={listing.title} />
          </div>

          <div className="w-full xl:sticky xl:top-24">
            {listing.type === "places" && <PlacesBookingCard listing={listing} listingId={listingId} />}
            {listing.type === "equipment" && <EquipmentBookingCard listing={listing} listingId={listingId} />}
            {listing.type === "activities" && <ActivityBookingCard listing={listing} listingId={listingId} />}
          </div>
        </div>

        <div className="mt-5 rounded-[22px] border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={listing.host.avatar} alt={listing.host.name} className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="text-xs font-medium text-[#F5C842]">Hosted by</p>
                <p className="text-sm font-semibold text-gray-900">{listing.host.name}</p>
                <p className="text-xs text-gray-400">{listing.location}</p>
              </div>
            </div>
            <button className="rounded-full border border-[#4AA7A7] px-5 py-2.5 text-sm font-medium text-[#4AA7A7] transition-colors hover:bg-[#4AA7A7] hover:text-white">
              Contact Host
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-5">
          <div className="rounded-[22px] border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(listing.details).map(([key, val]) => (
                <div key={key} className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                  <p className="mt-1 text-sm text-gray-700">{val}</p>
                </div>
              ))}
            </div>
            {(listing.amenities || listing.includes) && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                {(listing.amenities || listing.includes).map((item) => (
                  <span key={item} className="rounded-full bg-[#F5C842]/20 px-3 py-1.5 text-xs font-semibold text-yellow-700">{item}</span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[22px] border border-gray-200 bg-white p-4 sm:p-5">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Description</h3>
            <p className="text-sm leading-7 text-gray-500 whitespace-pre-line">{listing.description}</p>
          </div>

          <div className="rounded-[22px] border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Location</h2>
            <SimpleMap location={listing.location} height={360} />
            <div className="mt-3 flex items-center gap-2">
              <LocationPinIcon />
              <span className="text-sm font-medium text-gray-600">{listing.location}</span>
            </div>
          </div>

          <div className="rounded-[22px] border border-gray-200 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
              <div className="flex items-center gap-1.5">
                <StarRating rating={listing.rating} />
                <span className="text-sm font-semibold text-gray-700">{listing.rating}</span>
                <span className="text-sm text-gray-400">({listing.reviews})</span>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {listing.reviews_list.map((r, i) => <ReviewCard key={i} review={r} />)}
            </div>
          </div>
        </div>
      </main>

      <NewsletterSection />
      <LandingFooter />
    </div>
  );
}
