"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrowseListing,
  selectSelectedActivity,
  selectSelectedActivityStatus,
} from "@/store/slices/activitiesSlice";
import NewsletterSection from "@/components/landing/NewsletterSection";
import LandingFooter from "@/components/landing/LandingFooter";
import CustomCalendar from "@/components/shared/CustomCalendar";

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const StarIcon = ({ filled }) => (
  <svg className={`w-4 h-4 ${filled ? "text-[#F5C842] fill-current" : "text-gray-300 fill-current"}`} viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= Math.floor(rating)} />)}
  </div>
);
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg className="w-5 h-5" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "currentColor"} viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const ShareIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m5-2a8 8 0 11-16 0 8 8 0 0116 0z" />
  </svg>
);
const UserOutlineIcon = () => (
  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A4 4 0 018.94 15h6.12a4 4 0 013.82 2.804M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CheckBadge = () => (
  <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#4AA7A7] text-white">
    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 6.5l2 2 5-5" />
    </svg>
  </span>
);
const ChevronDown = () => (
  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
function toNum(v) { const n = Number(v); return !isNaN(n) && n > 0 ? n : null; }

function extractPrice(priceObj, info) {
  if (!priceObj || typeof priceObj !== "object") return toNum(priceObj) ?? 0;
  return (
    toNum(priceObj.perPerson) ??
    toNum(priceObj.hourly) ??
    toNum(priceObj.daily) ??
    toNum(priceObj.amount) ??
    toNum(info?.pricePerPerson) ??
    toNum(info?.pricePerHour) ??
    toNum(info?.dailyRate) ??
    0
  );
}

function adaptApiListing(api, urlType) {
  const info = api.basicInformation ?? {};
  const loc = api.placeLocation ?? {};
  const service = api.serviceDetails ?? {};
  const category = api.category ?? urlType ?? "activities";

  const title = info.activityTitle || info.equipmentName || info.placeName || api.title || "Listing";
  const location = [loc.city, loc.state, loc.country].filter(Boolean).join(", ") || info.location || "—";
  const images = (Array.isArray(api.photos) && api.photos.length > 0)
    ? api.photos
    : (Array.isArray(info.images) && info.images.length > 0)
      ? info.images
      : ["https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=800&q=80"];

  const priceObj = typeof api.price === "object" && api.price !== null ? api.price : null;
  const price = extractPrice(priceObj, info);

  const priceKeys = priceObj ? Object.keys(priceObj).filter(k => k !== "currency") : [];
  const bookingType = api.bookingType
    || (priceKeys.includes("perPerson") ? "per_person"
      : priceKeys.includes("hourly") ? "per_hour"
      : priceKeys.includes("daily") ? "per_day"
      : category === "activities" ? "per_person"
      : category === "equipment" ? "per_day"
      : "per_hour");

  const host = api.host ?? {};
  const hostName = host.name || host.email || "Host";
  const hostAvatar = host.avatar || "https://i.pravatar.cc/60?img=3";
  const hostLocation = host.location || [loc.city, loc.country].filter(Boolean).join(", ") || "—";
  const hostRating = toNum(host.rating) ?? 4.4;
  const hostReviews = host.reviewCount ?? host.reviews ?? 9;

  const description = info.description || service.description || api.description || "";
  const amenities = Array.isArray(info.amenities) ? info.amenities
    : Array.isArray(service.whatsIncluded) ? service.whatsIncluded : [];
  const requirements = service.requirements || info.requirements || api.requirements || "";
  const cancellationPolicy = service.cancellationPolicy || api.cancellationPolicy || "";

  const durationRaw = service.duration;
  const duration = durationRaw && typeof durationRaw === "object"
    ? `${durationRaw.value} ${durationRaw.unit}`
    : durationRaw || "";

  return {
    _id: api._id,
    type: category,
    bookingType,
    title,
    location,
    rating: api.rating ?? 4.4,
    reviews: api.reviewCount ?? "21K",
    price,
    images,
    host: { name: hostName, avatar: hostAvatar, location: hostLocation, rating: hostRating, reviews: hostReviews },
    details: {
      activityTitle: title,
      location,
      serviceCategory: info.serviceCategory || info.category || category,
      description,
      difficultyLevel: service.difficultyLevel || info.difficultyLevel || "",
      duration,
      maxParticipants: service.maxParticipants || info.maxParticipants || "",
      instructorGuideName: service.instructorGuideName || info.instructorGuideName || "",
    },
    amenities,
    requirements,
    cancellationPolicy,
    description,
    mapLat: toNum(loc.latitude) ?? null,
    mapLng: toNum(loc.longitude) ?? null,
    reviews_list: api.reviews ?? [],
  };
}

/* ─── Image Gallery ──────────────────────────────────────────────────────────── */
function ImageGallery({ images, title }) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Main image */}
      <div className="relative w-full overflow-hidden rounded-[22px] bg-gray-100" style={{ height: 560 }}>
        <img src={images[active]} alt={title} className="w-full h-full object-cover" />
      </div>
      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-1 shrink-0">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`shrink-0 w-28 h-20 rounded-2xl overflow-hidden border-2 transition-all ${i === active ? "border-[#F5C842]" : "border-transparent"}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Time options ───────────────────────────────────────────────────────────── */
const TIME_OPTIONS = (() => {
  const opts = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const hour = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? "AM" : "PM";
      const label = `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      opts.push({ label, value });
    }
  }
  return opts;
})();

/* ─── Custom Time Dropdown ───────────────────────────────────────────────────── */
function TimeDropdown({ value, onChange, placeholder = "Select time" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && value && listRef.current) {
      const idx = TIME_OPTIONS.findIndex(t => t.value === value);
      if (idx >= 0) {
        const el = listRef.current.children[idx];
        if (el) el.scrollIntoView({ block: "center" });
      }
    }
  }, [open, value]);

  const selected = TIME_OPTIONS.find(t => t.value === value);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 text-sm font-medium text-left focus:outline-none"
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown />
      </button>

      {open && (
        <div
          ref={listRef}
          className="absolute z-50 left-0 top-full mt-1 w-44 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-y-auto"
          style={{ maxHeight: 280 }}
        >
          {TIME_OPTIONS.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => { onChange(t.value); setOpen(false); }}
              className={[
                "w-full text-left px-5 py-3 text-sm transition-colors",
                t.value === value
                  ? "bg-[#EBF6F6] text-[#4AA7A7] font-bold border-r-4 border-[#F5C842]"
                  : "text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Custom Calendar Dropdown ───────────────────────────────────────────────── */
function CalendarDropdown({ value, onChange, placeholder = "Select date" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayValue = value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : placeholder;

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 text-sm font-medium text-left focus:outline-none"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>{displayValue}</span>
        <ChevronDown />
      </button>

      {open && (
        <div className="absolute z-50 left-0 top-full mt-2 w-72 shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
          <CustomCalendar
            value={value}
            onChange={(v) => { onChange(v); setOpen(false); }}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Booking field ──────────────────────────────────────────────────────────── */
function BookingField({ icon, label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <p className="text-xs font-semibold text-gray-500 px-1">{label}</p>}
      <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-500 focus-within:border-[#4AA7A7] transition-colors">
        {icon}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

function SummaryLine({ label, value, bold }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${bold ? "font-bold text-gray-900 text-sm" : "text-sm text-gray-500"}`}>
      <span>{label}</span>
      <span className={bold ? "" : "text-gray-900"}>{value}</span>
    </div>
  );
}

/* ─── Mode Pill (Hourly / Daily) ─────────────────────────────────────────────── */
function ModePill({ active, label, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex-1 rounded-2xl border px-4 py-5 text-center transition-colors",
        active ? "border-[#4AA7A7] bg-[#D7ECEB]" : "border-gray-200 bg-white hover:border-[#8bbcbc]",
      ].join(" ")}
    >
      {active && <CheckBadge />}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[#4AA7A7]">{icon}</span>
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
    </button>
  );
}

/* ─── Booking Shell (title + price + rating header) ─────────────────────────── */
function BookingShell({ children, reserveButton, title, price, priceUnit, rating, reviews }) {
  const ratingNum = Number(rating);
  const ratingText = Number.isFinite(ratingNum) ? ratingNum.toFixed(1) : "4.4";
  return (
    <div
      className="w-full bg-white flex flex-col h-full"
      style={{
        borderRadius: 20,
        border: "1px solid #E5E7EB",
        paddingTop: 30,
        paddingRight: 32,
        paddingBottom: 30,
        paddingLeft: 32,
      }}
    >
      {/* Title + price — fixed at top */}
      <div className="flex items-start justify-between gap-4 shrink-0 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <div className="mt-1.5 flex items-center gap-1 text-sm text-gray-600">
            <StarRating rating={ratingNum} />
            <span className="ml-1 font-semibold">{ratingText}</span>
            <span className="text-gray-400">({reviews} Reviews)</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-bold text-gray-900">${price}</span>
          <span className="text-sm text-gray-400">{priceUnit}</span>
        </div>
      </div>

      {/* Scrollable middle content */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-1 -mr-1">
        {children}
      </div>

      {/* Reserve button — pinned at bottom */}
      <div className="shrink-0 mt-5">
        {reserveButton}
      </div>
    </div>
  );
}

/* ─── Navigate to confirm-and-pay ────────────────────────────────────────────── */
function useNavigateToConfirm(listing, listingId) {
  const router = useRouter();
  return (fields) => {
    const p = new URLSearchParams({
      listingId,
      title: listing.title,
      description: listing.details.description || "",
      image: listing.images[0] || "",
      bookingType: listing.bookingType,
      pricePerUnit: String(listing.price),
      funsivalFee: "8",
      ...fields,
    });
    router.push(`/user-dashboard/confirm-and-pay?${p.toString()}`);
  };
}

/* ─── Activity Booking Card ──────────────────────────────────────────────────── */
function ActivityBookingCard({ listing, listingId }) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [persons, setPersons] = useState("");
  const navigateToConfirm = useNavigateToConfirm(listing, listingId);

  const hours = startTime && endTime
    ? Math.max(1, Math.round((new Date(`1970-01-01T${endTime}`) - new Date(`1970-01-01T${startTime}`)) / 3600000))
    : 3;
  const subtotal = listing.price * hours;
  const fee = Math.max(8, Math.round(subtotal * 0.067));
  const total = subtotal + fee;

  return (
    <BookingShell
      title="Book Your Activity" price={listing.price} priceUnit="/Hr" rating={listing.rating} reviews={listing.reviews}
      reserveButton={
        <button
          onClick={() => navigateToConfirm({ startDate: date, endDate: date, startTime, endTime, numberOfGuests: persons || 1, units: hours, dateFrom: date, dateTo: date, guests: `${persons || 1} guest` })}
          className="w-full rounded-full bg-[#F5C842] hover:bg-[#e0b430] py-4 text-sm font-bold text-gray-900 transition-colors"
        >
          Reserve
        </button>
      }
    >
      {/* Per person pill */}
      <div className="rounded-[18px] border border-[#4AA7A7] bg-[#D7ECEB] px-4 py-5 text-center relative">
        <CheckBadge />
        <div className="flex flex-col items-center gap-2">
          <span className="text-[#4AA7A7]"><UserOutlineIcon /></span>
          <p className="text-sm font-semibold text-gray-700">Per Person</p>
        </div>
      </div>

      {/* Date field */}
      <BookingField icon={<CalendarIcon />} label="Date">
        <CalendarDropdown value={date} onChange={setDate} placeholder="Select date" />
      </BookingField>

      {/* Start / End time */}
      <div className="grid grid-cols-2 gap-3">
        <BookingField icon={<ClockIcon />} label="Start time">
          <TimeDropdown value={startTime} onChange={setStartTime} placeholder="09:00 AM" />
        </BookingField>
        <BookingField icon={<ClockIcon />} label="End time">
          <TimeDropdown value={endTime} onChange={setEndTime} placeholder="12:00 PM" />
        </BookingField>
      </div>

      {/* Guests */}
      <BookingField icon={<UserOutlineIcon />} label="Guests">
        <input
          type="number"
          min="1"
          value={persons}
          placeholder="Select guest number"
          onChange={e => setPersons(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none placeholder:text-gray-400"
        />
      </BookingField>

      {/* Summary */}
      <div className="space-y-2 border-t border-gray-100 pt-4">
        <SummaryLine label={`$${listing.price}/hr × ${hours} hour${hours > 1 ? "s" : ""}`} value={`$${subtotal}`} />
        <SummaryLine label="Service fee" value={`$${fee}`} />
        <SummaryLine label="Total" value={`$${total}`} bold />
      </div>
    </BookingShell>
  );
}

/* ─── Places Booking Card ────────────────────────────────────────────────────── */
function PlacesBookingCard({ listing, listingId }) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [guests, setGuests] = useState("");
  const navigateToConfirm = useNavigateToConfirm(listing, listingId);

  const hours = startTime && endTime
    ? Math.max(1, Math.round((new Date(`1970-01-01T${endTime}`) - new Date(`1970-01-01T${startTime}`)) / 3600000))
    : 3;
  const subtotal = listing.price * hours;
  const fee = Math.max(8, Math.round(subtotal * 0.067));
  const total = subtotal + fee;

  return (
    <BookingShell
      title="Book Your Place" price={listing.price} priceUnit="/Hr" rating={listing.rating} reviews={listing.reviews}
      reserveButton={
        <button
          onClick={() => navigateToConfirm({ startDate: date, endDate: date, startTime, endTime, numberOfGuests: guests || 1, units: hours, dateFrom: date, dateTo: date, guests: `${guests || 1} guest` })}
          className="w-full rounded-full bg-[#F5C842] hover:bg-[#e0b430] py-4 text-sm font-bold text-gray-900 transition-colors"
        >
          Reserve
        </button>
      }
    >
      {/* Per hour pill */}
      <div className="rounded-[18px] border border-[#4AA7A7] bg-[#D7ECEB] px-4 py-5 text-center relative">
        <CheckBadge />
        <div className="flex flex-col items-center gap-2">
          <span className="text-[#4AA7A7]"><ClockIcon /></span>
          <p className="text-sm font-semibold text-gray-700">Per Hour</p>
        </div>
      </div>

      {/* Date field */}
      <BookingField icon={<CalendarIcon />} label="Date">
        <CalendarDropdown value={date} onChange={setDate} placeholder="Select date" />
      </BookingField>

      {/* Start / End time */}
      <div className="grid grid-cols-2 gap-3">
        <BookingField icon={<ClockIcon />} label="Start time">
          <TimeDropdown value={startTime} onChange={setStartTime} placeholder="09:00 AM" />
        </BookingField>
        <BookingField icon={<ClockIcon />} label="End time">
          <TimeDropdown value={endTime} onChange={setEndTime} placeholder="12:00 PM" />
        </BookingField>
      </div>

      {/* Guests */}
      <BookingField icon={<UserOutlineIcon />} label="Guests">
        <input
          type="number"
          min="1"
          value={guests}
          placeholder="Select guest number"
          onChange={e => setGuests(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none placeholder:text-gray-400"
        />
      </BookingField>

      {/* Summary */}
      <div className="space-y-2 border-t border-gray-100 pt-4">
        <SummaryLine label={`$${listing.price}/hr × ${hours} hour${hours > 1 ? "s" : ""}`} value={`$${subtotal}`} />
        <SummaryLine label="Service fee" value={`$${fee}`} />
        <SummaryLine label="Total" value={`$${total}`} bold />
      </div>
    </BookingShell>
  );
}

/* ─── Equipment Booking Card ─────────────────────────────────────────────────── */
function EquipmentBookingCard({ listing, listingId }) {
  const [mode, setMode] = useState("hourly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const navigateToConfirm = useNavigateToConfirm(listing, listingId);

  const hours = startTime && endTime
    ? Math.max(1, Math.round((new Date(`1970-01-01T${endTime}`) - new Date(`1970-01-01T${startTime}`)) / 3600000))
    : 3;
  const days = startDate && endDate
    ? Math.max(1, Math.round((new Date(`${endDate}T00:00:00`) - new Date(`${startDate}T00:00:00`)) / 86400000))
    : 1;
  const span = mode === "daily" ? days : hours;
  const subtotal = listing.price * span;
  const fee = Math.max(8, Math.round(subtotal * 0.067));
  const total = subtotal + fee;

  return (
    <BookingShell
      title="Book Your Equipment" price={listing.price} priceUnit={mode === "daily" ? "/Day" : "/Hr"} rating={listing.rating} reviews={listing.reviews}
      reserveButton={
        <button
          onClick={() => navigateToConfirm({ startDate, endDate: endDate || startDate, startTime, endTime, units: span, dateFrom: startDate, dateTo: endDate || startDate })}
          className="w-full rounded-full bg-[#F5C842] hover:bg-[#e0b430] py-4 text-sm font-bold text-gray-900 transition-colors"
        >
          Reserve
        </button>
      }
    >
      {/* Hourly / Daily toggle */}
      <div className="grid grid-cols-2 gap-3">
        <ModePill active={mode === "hourly"} label="Hourly" icon={<ClockIcon />} onClick={() => setMode("hourly")} />
        <ModePill active={mode === "daily"} label="Daily" icon={<CalendarIcon />} onClick={() => setMode("daily")} />
      </div>

      {/* Start date */}
      <BookingField icon={<CalendarIcon />} label="Start date">
        <CalendarDropdown value={startDate} onChange={setStartDate} placeholder="Select date" />
      </BookingField>

      {mode === "daily" ? (
        /* End date for daily mode */
        <BookingField icon={<CalendarIcon />} label="End date">
          <CalendarDropdown value={endDate} onChange={setEndDate} placeholder="Select date" />
        </BookingField>
      ) : (
        /* Start / End time for hourly mode */
        <div className="grid grid-cols-2 gap-3">
          <BookingField icon={<ClockIcon />} label="Start time">
            <TimeDropdown value={startTime} onChange={setStartTime} placeholder="09:00 AM" />
          </BookingField>
          <BookingField icon={<ClockIcon />} label="End time">
            <TimeDropdown value={endTime} onChange={setEndTime} placeholder="12:00 PM" />
          </BookingField>
        </div>
      )}

      {/* Summary */}
      <div className="space-y-2 border-t border-gray-100 pt-4">
        <SummaryLine label={`$${listing.price}/${mode === "daily" ? "day" : "hr"} × ${span} ${mode === "daily" ? "day" : "hour"}${span > 1 ? "s" : ""}`} value={`$${subtotal}`} />
        <SummaryLine label="Service fee" value={`$${fee}`} />
        <SummaryLine label="Total" value={`$${total}`} bold />
      </div>
    </BookingShell>
  );
}

/* ─── Location Map ───────────────────────────────────────────────────────────── */
function ListingLocationMap({ listing }) {
  const [coords, setCoords] = useState(null);
  const [showCard, setShowCard] = useState(true);

  useEffect(() => {
    const hasRealCoords =
      listing.mapLat != null &&
      listing.mapLng != null &&
      Number.isFinite(listing.mapLat) &&
      Number.isFinite(listing.mapLng);

    if (hasRealCoords) {
      setCoords({ lat: listing.mapLat, lon: listing.mapLng });
      return;
    }

    const q = listing.location && listing.location !== "—" ? listing.location : null;
    if (!q) return;

    let cancelled = false;
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`, {
      headers: { "Accept-Language": "en" },
    })
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data?.[0]) {
          setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [listing.location, listing.mapLat, listing.mapLng]);

  if (!coords) {
    return (
      <div className="w-full rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center" style={{ height: 380 }}>
        <span className="text-xs text-gray-400 font-medium animate-pulse">Locating on map…</span>
      </div>
    );
  }

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.05}%2C${coords.lat - 0.05}%2C${coords.lon + 0.05}%2C${coords.lat + 0.05}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-100" style={{ height: 380 }}>
      <iframe title="Listing location" width="100%" height="100%" frameBorder="0" scrolling="no" src={mapSrc} />
      {showCard && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white rounded-2xl overflow-hidden shadow-xl" style={{ width: 240 }}>
          <div className="relative h-32">
            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
            <button onClick={() => setShowCard(false)} className="absolute top-2 right-2 w-7 h-7 bg-[#F5823A] rounded-full flex items-center justify-center shadow">
              <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          <div className="p-3 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-1.5">
              <p className="text-[13px] font-bold text-[#3DAA8A] leading-tight line-clamp-1 flex-1">{listing.title}</p>
              <span className="shrink-0 text-[10px] font-medium text-[#F5823A] border border-[#F5823A] rounded-full px-2 py-0.5 whitespace-nowrap">
                {listing.details.serviceCategory || listing.type}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-800">{Number(listing.rating).toFixed(1)}</span>
              <svg className="w-3.5 h-3.5 text-[#F5C842] fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[11px] text-gray-400">({listing.reviews} Reviews)</span>
            </div>
            <div className="flex items-center rounded-full border border-[#F5C842] overflow-hidden text-xs font-medium w-full">
              <span className="px-3 py-1.5 text-gray-400 bg-[#FFF9EC] whitespace-nowrap">Per Person</span>
              <span className="flex-1 text-right px-3 py-1.5 text-[#F5823A] font-bold bg-[#FFF9EC]">${listing.price}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 shrink-0 text-[#F5823A] fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span className="text-xs text-gray-500 line-clamp-1">{listing.location}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Details section ────────────────────────────────────────────────────────── */
function DetailsSection({ listing }) {
  const d = listing.details;
  const rows = [
    { label: "Activity Title", value: d.activityTitle },
    { label: "Location", value: d.location, pin: true },
    { label: "Service Category", value: d.serviceCategory },
  ].filter(r => r.value);

  const meta = [
    { label: "Difficulty level", value: d.difficultyLevel },
    { label: "Duration", value: d.duration, icon: "clock" },
    { label: "Max Participants", value: d.maxParticipants, icon: "users" },
    { label: "Instructor Guide name", value: d.instructorGuideName },
  ].filter(r => r.value);

  return (
    <div className="rounded-[22px] border border-gray-200 bg-white p-6">
      <h2 className="mb-5 text-xl font-bold text-gray-900">Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
        {rows.map(r => (
          <div key={r.label}>
            <p className="text-xs font-semibold text-gray-400 mb-1">{r.label}</p>
            {r.pin ? (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm text-gray-700">{r.value}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-700">{r.value}</p>
            )}
          </div>
        ))}
      </div>
      {d.description && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 mb-1">Description</p>
          <p className="text-sm text-gray-600 leading-relaxed">{d.description}</p>
        </div>
      )}
      <div className="border-t border-gray-100 pt-5" />
      {meta.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-5">
          {meta.map(m => (
            <div key={m.label}>
              <p className="text-xs font-semibold text-gray-400 mb-1">{m.label}</p>
              <div className="flex items-center gap-1">
                {m.icon === "clock" && <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m5-2a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>}
                {m.icon === "users" && <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-3a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                <p className="text-sm text-gray-700">{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {listing.amenities.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold text-gray-400 mb-2">What's Included</p>
          <div className="flex flex-wrap gap-2">
            {listing.amenities.map(item => (
              <span key={item} className="rounded-full bg-[#F5C842]/20 px-3 py-1.5 text-xs font-semibold text-yellow-700">{item}</span>
            ))}
          </div>
        </div>
      )}
      {(listing.requirements || listing.cancellationPolicy) && (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {listing.requirements && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">Requirements</p>
              <p className="text-sm text-gray-600 leading-relaxed">{listing.requirements}</p>
            </div>
          )}
          {listing.cancellationPolicy && (
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1">Cancellation Policy</p>
              <p className="text-sm text-gray-600 leading-relaxed">{listing.cancellationPolicy}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
export default function ListingDetailPage({ params: paramsPromise }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const params = React.use(paramsPromise);
  const rawId = params?.id;
  const urlType = searchParams.get("type");

  const selectedActivity = useSelector(selectSelectedActivity);
  const selectedStatus = useSelector(selectSelectedActivityStatus);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    if (rawId) dispatch(fetchBrowseListing(rawId));
  }, [dispatch, rawId]);

  if (selectedStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (selectedStatus === "failed") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-gray-500 font-medium">Listing not found.</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-[#4AA7A7] text-white rounded-full text-sm font-bold">Go Back</button>
      </div>
    );
  }

  if (!selectedActivity || (selectedActivity._id ?? selectedActivity.id) !== rawId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const listing = adaptApiListing(selectedActivity, urlType);

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">

      {/* ── Full-width title bar: flush below navbar, white, tall ── */}
      <div className="w-full bg-white border-b border-gray-100">
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => router.back()}
              className="flex shrink-0 items-center justify-center text-gray-700 hover:text-[#4AA7A7] transition-colors"
            >
              <BackIcon />
            </button>
            <h1 className="truncate text-lg font-bold text-gray-900">{listing.title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={() => setWishlisted(w => !w)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <HeartIcon filled={wishlisted} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
              <ShareIcon />
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        {/* ── Two-column: image 748px + booking 548px ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Left – image section: w-748, h-716, gap-24 */}
          <div className="w-full lg:w-[748px] shrink-0" style={{ gap: 24 }}>
            <ImageGallery images={listing.images} title={listing.title} />
          </div>

          {/* Right – booking section: same height as left, no scroll on card */}
          <div className="w-full lg:w-[548px] shrink-0 lg:self-stretch">
            {listing.type === "places"     && <PlacesBookingCard    listing={listing} listingId={rawId} />}
            {listing.type === "equipment"  && <EquipmentBookingCard listing={listing} listingId={rawId} />}
            {(listing.type === "activities" || listing.type === "activity") && <ActivityBookingCard listing={listing} listingId={rawId} />}
          </div>
        </div>

        {/* Hosted By */}
        <div className="mt-6 rounded-[22px] border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={listing.host.avatar} alt={listing.host.name} className="h-14 w-14 rounded-full object-cover shrink-0" />
              <div>
                <p className="text-xs font-medium text-[#F5C842]">Hosted By</p>
                <p className="text-base font-bold text-gray-900">{listing.host.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-[#F5C842] fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs text-gray-600 font-medium">{Number(listing.host.rating).toFixed(1)}</span>
                  <span className="text-xs text-gray-400">( {listing.host.reviews} reviews )</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{listing.host.location}</p>
              </div>
            </div>
            <button className="rounded-full border border-[#4AA7A7] px-5 py-2.5 text-sm font-medium text-[#4AA7A7] hover:bg-[#4AA7A7] hover:text-white transition-colors shrink-0">
              Contact Host
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="mt-6">
          <DetailsSection listing={listing} />
        </div>

        {/* Description */}
        {listing.description && (
          <div className="mt-6 rounded-[22px] border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-xl font-bold text-gray-900">Description</h2>
            <p className="text-sm leading-7 text-gray-500 whitespace-pre-line">{listing.description}</p>
          </div>
        )}

        {/* Location map */}
        <div className="mt-6 rounded-[22px] border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Location</h2>
          <ListingLocationMap listing={listing} />
        </div>

        {/* Reviews */}
        {listing.reviews_list.length > 0 && (
          <div className="mt-6 rounded-[22px] border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
              <div className="flex items-center gap-1.5">
                <StarRating rating={listing.rating} />
                <span className="text-sm font-semibold text-gray-700">{listing.rating}</span>
                <span className="text-sm text-gray-400">({listing.reviews})</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {listing.reviews_list.map((r, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <img src={r.avatar || "https://i.pravatar.cc/40"} alt={r.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{r.name}</p>
                      <StarRating rating={r.rating} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
      <NewsletterSection />
      <LandingFooter />
    </div>
  );
}
