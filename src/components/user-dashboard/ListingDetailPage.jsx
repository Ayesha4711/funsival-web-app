"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/store/axiosInstance";
import { bookingClock, canStartBooking } from "@/lib/bookingClock";
import useBookingClock from "@/lib/useBookingClock";
import useViewerTimeZone from "@/lib/useViewerTimeZone";
import {
  fetchBrowseListing,
  selectSelectedActivity,
  selectSelectedActivityStatus,
  selectHostCache,
} from "@/store/slices/activitiesSlice";
import { startOrGetConversation } from "@/store/slices/chatSlice";
import { toggleWishlist, selectWishlistSummaryListingIds } from "@/store/slices/wishlistSlice";
import {
  fetchListingReviews,
  selectListingReviews,
  selectListingReviewsSummary,
  selectListingReviewsPagination,
  selectListingReviewsStatus,
} from "@/store/slices/reviewsSlice";
import AppFooter from "@/components/shared/AppFooter";
import CustomCalendar from "@/components/shared/CustomCalendar";
import { toast } from "sonner";

const parseCalendarDate = (value = "") => {
  const str = String(value).trim();
  let year, month, day;
  if (str.includes("-")) {
    // ISO format: yyyy-mm-dd
    [year, month, day] = str.split("-").map(Number);
  } else if (str.includes("/")) {
    // Legacy mm/dd/yyyy
    [month, day, year] = str.split("/").map(Number);
  } else {
    return null;
  }
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isFinite(date.getTime()) ? date : null;
};

const calculateDaysBetween = (start, end) => {
  const startDate = parseCalendarDate(start);
  const endDate = parseCalendarDate(end);
  if (!startDate || !endDate) return 1;
  const diff = Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
  return diff >= 1 ? diff : 1;
};

import { StarIcon as StarIconBase, ArrowLeftIcon as BackIcon, HeartFilledIcon, HeartIcon, ShareIcon, CalendarIcon, ClockIcon, UserIcon as UserOutlineIcon, CheckIcon, ChevronDownIcon, MapPinIcon } from "@/icons";

const StarIcon = ({ filled }) => (
  <StarIconBase size={16} className={filled ? "text-[#F5C842] fill-current" : "text-gray-300 fill-current"} />
);
const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= Math.floor(rating)} />)}
  </div>
);
const CheckBadge = () => (
  <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#4AA7A7] text-white">
    <CheckIcon size={12} />
  </span>
);
const ChevronDown = () => <ChevronDownIcon size={16} className="text-gray-400 shrink-0" />;

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

function isObjectLike(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function findNestedId(node, seen = new Set()) {
  if (!isObjectLike(node) || seen.has(node)) return null;
  seen.add(node);

  const directId =
    node.id ||
    node._id ||
    node.userId ||
    node.user_id ||
    node.hostId ||
    node.host_id ||
    node.providerId ||
    node.provider_id ||
    node.ownerId ||
    node.owner_id ||
    node.createdById ||
    node.created_by_id ||
    node.postedById ||
    node.posted_by_id ||
    null;
  if (directId) return directId;

  const keys = Object.keys(node);
  const looksLikePerson =
    keys.some((key) => ["name", "firstName", "lastName", "email", "fullName", "profileImage", "avatar"].includes(key));

  const values = Object.values(node);
  if (looksLikePerson) {
    for (const value of values) {
      const nested = findNestedId(value, seen);
      if (nested) return nested;
    }
  }

  for (const value of values) {
    const nested = findNestedId(value, seen);
    if (nested) return nested;
  }

  return null;
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
  // Only set hourlyPrice/dailyPrice when those keys actually exist in the API response.
  // Falling back to `price` would make both truthy even when only one is configured,
  // causing the Daily mode pill to appear and the backend to reject with "no daily price".
  const hourlyPrice = toNum(priceObj?.hourly) ?? toNum(info?.pricePerHour) ?? null;
  const dailyPrice  = toNum(priceObj?.daily)  ?? toNum(info?.dailyRate)    ?? null;

  const priceKeys = priceObj ? Object.keys(priceObj).filter(k => k !== "currency") : [];
  const bookingType = api.bookingType
    || (priceKeys.includes("perPerson") ? "per_person"
      : priceKeys.includes("hourly") ? "per_hour"
      : priceKeys.includes("daily") ? "per_day"
      : "per_hour");

  const isMongoId = (v) => typeof v === "string" && /^[a-f0-9]{24}$/i.test(v);
  const rawHost = api.host ?? api.providerProfile ?? api.provider ?? api.owner ?? api.createdBy ?? api.postedBy ?? api.user;
  const host = (rawHost && typeof rawHost === "object") ? rawHost : {};
  const hostId =
    host.id ||
    host._id ||
    (isMongoId(api.host) ? api.host : null) ||
    (isMongoId(api.createdBy) ? api.createdBy : null) ||
    findNestedId(host) ||
    api.hostId || api.host_id || null;
  const hostFullName  = host.name || host.fullName ||
    [host.firstName, host.lastName].filter(Boolean).join(" ") ||
    host.email || "Host";
  const hostAgency    = host.agencyName || null;
  const hostAvatar    = host.profileImage || host.avatar || null;
  const hostCity      = host.city || host.location?.city || "";
  const hostCountry   = host.country || host.location?.country || "";
  const hostLocation  = [hostCity, hostCountry].filter(Boolean).join(", ")
    || [loc.city, loc.country].filter(Boolean).join(", ")
    || "—";
  const hostRating    = toNum(host.rating) ?? null;
  const hostReviews   = host.reviewCount ?? host.reviews ?? null;

  const description = info.description || service.description || api.description || "";
  const amenities = Array.isArray(info.amenities) ? info.amenities
    : Array.isArray(service.whatsIncluded) ? service.whatsIncluded : [];
  const requirements = service.requirements || info.requirements || api.requirements || "";
  const cancellationPolicy = service.cancellationPolicy || api.cancellationPolicy || "";

  const durationRaw = service.duration;
  const duration = durationRaw && typeof durationRaw === "object"
    ? `${durationRaw.value} ${durationRaw.unit}`
    : durationRaw || "";

  const reviewSummary = api.reviewSummary ?? {};

  return {
    _id: api._id ?? api.id,
    type: category,
    bookingType,
    title,
    location,
    rating: reviewSummary.overallRating ?? api.rating ?? 0,
    reviews: reviewSummary.count ?? api.reviewCount ?? 0,
    reviewSummary,
    price,
    hourlyPrice,
    dailyPrice,
    perPersonPrice: toNum(priceObj?.perPerson),
    images,
    host: { id: hostId, name: hostFullName, agency: hostAgency, avatar: hostAvatar, location: hostLocation, rating: hostRating, reviews: hostReviews },
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
    availability: api.availability || [],
    localAvailabilityDates: api.localAvailabilityDates || {},
    dailyAvailability: api.dailyAvailability || { starts: [], ends: [] },
    activityAvailability: api.activityAvailability || [],
    viewerTimeZone: api.viewerTimeZone,
    timeZone: api.timeZone || "UTC",
    mapLat: toNum(loc.latitude) ?? null,
    mapLng: toNum(loc.longitude) ?? null,
  };
}

/* ─── Image Gallery ──────────────────────────────────────────────────────────── */
function ImageGallery({ images, title }) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-col gap-3 sm:gap-6 h-full">
      {/* Main image */}
      <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-[22px] bg-gray-100" style={{ height: 'clamp(220px, 40vw, 560px)' }}>
        <img src={images[active]} alt={title} className="w-full h-full object-cover" />
      </div>
      {/* Thumbnails */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 shrink-0">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`shrink-0 w-16 h-12 sm:w-28 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all ${i === active ? "border-[#F5C842]" : "border-transparent"}`}
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
    const hour = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "AM" : "PM";
    const label = `${String(hour).padStart(2, "0")}:00 ${ampm}`;
    const value = `${String(h).padStart(2, "0")}:00`;
    opts.push({ label, value });
  }
  return opts;
})();

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function safeParseJSON(value, fallback = {}) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getCurrencySymbol(currency) {
  const code = String(currency || "").trim().toUpperCase();
  if (code === "PKR") return "Rs";
  if (code === "USD") return "$";
  if (code === "EUR") return "€";
  if (code === "GBP") return "£";
  if (code) return code;
  return "$";
}

function formatMoney(amount, currency = "USD", minimumFractionDigits = 2, maximumFractionDigits = 2) {
  const numeric = Number(amount);
  const value = Number.isFinite(numeric) ? numeric : 0;
  const symbol = getCurrencySymbol(currency);
  const fixed = value.toLocaleString("en-US", {
    minimumFractionDigits,
    maximumFractionDigits,
  });
  return `${symbol} ${fixed}`;
}

function formatCompactDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return {
      weekday: "",
      label: "",
      month: "",
      year: "",
      full: dateStr,
    };
  }
  const weekday = WEEKDAY_SHORT[date.getDay()];
  const month = MONTH_SHORT[date.getMonth()];
  return {
    weekday,
    label: `${date.getDate()}`,
    month,
    year: String(date.getFullYear()),
    full: `${month} ${date.getDate()}, ${date.getFullYear()}`,
  };
}

function formatTimeLabel(value) {
  if (!value) return "";
  const parts = String(value).split(":");
  if (parts.length < 2) return value;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const ampm = hours < 12 ? "AM" : "PM";
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

function calculateSlotMinutes(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = String(startTime).split(":").map(Number);
  const [eh, em] = String(endTime).split(":").map(Number);
  if (!Number.isFinite(sh) || !Number.isFinite(sm) || !Number.isFinite(eh) || !Number.isFinite(em)) return 0;
  const startTotal = sh * 60 + sm;
  let endTotal = eh * 60 + em;
  if (endTotal < startTotal) endTotal += 24 * 60;
  const diff = endTotal - startTotal;
  return diff > 0 ? diff : 0;
}

function timeToMinutes(value) {
  if (!value) return Number.NaN;
  const [hours, minutes] = String(value).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return Number.NaN;
  return hours * 60 + minutes;
}

function extractSlotsArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.slots)) return payload.slots;
  if (Array.isArray(payload.availability)) return payload.availability;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && typeof payload.data === "object") {
    if (Array.isArray(payload.data.slots)) return payload.data.slots;
    if (Array.isArray(payload.data.availability)) return payload.data.availability;
    if (Array.isArray(payload.data.data)) return payload.data.data;
  }
  return [];
}

function slotKey(slot) {
  return `${slot.sourceDate || ""}|${slot.startTime ?? ""}-${slot.endTime ?? ""}`;
}

function normalizeSlotsResponse(payload) {
  const rawSlots = extractSlotsArray(payload);
  const data = payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)
    ? payload.data
    : (payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {});
  return {
    slots: rawSlots.map((slot) => {
      const startTime = slot.startTime ?? slot.start_time ?? "";
      const endTime = slot.endTime ?? slot.end_time ?? "";
      const calcDuration = calculateSlotMinutes(startTime, endTime);
      const durationMinutes = Number(slot.durationMinutes ?? slot.duration_minutes) || calcDuration || null;
      return {
        startTime,
        endTime,
        sourceDate: slot.sourceDate,
        localSchedule: slot.localSchedule,
        durationMinutes,
        price: Number(slot.price) || null,
        available: slot.available ?? slot.isAvailable ?? slot.is_available ?? true,
        date: slot.date ?? "",
      };
    }),
    slotDurationMinutes: Number(data.slotDurationMinutes ?? data.slot_duration_minutes) || null,
    hourlyPrice: Number(data.hourlyPrice ?? data.hourly_price) || null,
    currency: data.currency || "USD",
    viewerTimeZone: data.viewerTimeZone,
    date: data.date || "",
  };
}

/* ─── Custom Time Dropdown ───────────────────────────────────────────────────── */
function TimeDropdown({ value, onChange, placeholder = "Select time", options }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const finalOptions = options || TIME_OPTIONS;

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open && value && listRef.current) {
      const idx = finalOptions.findIndex(t => t.value === value);
      if (idx >= 0) {
        const el = listRef.current.children[idx];
        if (el) el.scrollIntoView({ block: "center" });
      }
    }
  }, [open, value, finalOptions]);

  const selected = finalOptions.find(t => t.value === value);

  return (
    <div ref={containerRef} className="relative w-full" style={open ? { zIndex: 10 } : undefined}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-1 text-xs sm:text-sm font-medium text-left focus:outline-none"
      >
        <span className={`truncate ${selected ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="shrink-0"><ChevronDown /></span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-[200] bg-white rounded-2xl border border-gray-200 shadow-xl overflow-y-auto w-full min-w-[120px]" style={{ maxHeight: 280 }}>
          <div ref={listRef}>
            {finalOptions.length > 0 ? (
              finalOptions.map(t => (
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
              ))
            ) : (
              <p className="px-5 py-3 text-xs text-gray-400">No times available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


/* ─── Calendar Dropdown ──────────────────────────────────────────────────────── */
function CalendarDropdown({ value, onChange, placeholder = "mm/dd/yyyy", align = "left", availableDates, minDate }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-left text-xs sm:text-sm font-medium focus:outline-none"
      >
        <span className={value ? "text-gray-900 font-semibold" : "text-gray-400"}>
          {value || placeholder}
        </span>
      </button>

      {open && (
        <div className={`absolute top-full mt-1 z-[200] ${align === "right" ? "right-0" : "left-0"}`}>
          <CustomCalendar
            value={value}
            onChange={(v) => { onChange(v); setOpen(false); }}
            onClose={() => setOpen(false)}
            availableDates={availableDates}
            minDate={minDate}
          />
        </div>
      )}
    </div>
  );
}


/* ─── Booking field (no label) ───────────────────────────────────────────────── */
function BookingField({ icon, children, error, errorMessage, onClick }) {
  return (
    <div onClick={onClick} className={onClick ? "cursor-pointer" : ""}>
      <div className={`flex items-center gap-2 sm:gap-3 rounded-full border bg-white px-3 sm:px-4 py-3 sm:py-3.5 text-sm text-gray-500 focus-within:border-[#4AA7A7] transition-colors ${error ? "border-red-400" : "border-gray-200"}`}>
        {icon}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      {error && <p className="text-[10px] text-red-500 mt-1 pl-3">{errorMessage || "Required"}</p>}
    </div>
  );
}

/* ─── Split time field (Start time | End time in one row) ────────────────────── */
function TimeRangeField({ startTime, setStartTime, endTime, setEndTime, startError, endError, startOptions, endOptions }) {
  return (
    <div>
      <div className={`flex items-center gap-0 rounded-full border bg-white overflow-visible ${(startError || endError) ? "border-red-400" : "border-gray-200"}`}>
        {/* Start time */}
        <div className="flex items-center gap-1 sm:gap-2 flex-1 px-2 sm:px-4 py-2.5 sm:py-3.5 min-w-0">
          <span className="hidden sm:block shrink-0"><ClockIcon /></span>
          <span className="text-[9px] sm:text-xs text-gray-400 shrink-0 whitespace-nowrap">Start</span>
          <div className="flex-1 min-w-0">
            <TimeDropdown value={startTime} onChange={setStartTime} placeholder="09:41 AM" options={startOptions} />
          </div>
        </div>
        <div className="w-px h-8 bg-gray-200 shrink-0" />
        {/* End time */}
        <div className="flex items-center gap-1 sm:gap-2 flex-1 px-2 sm:px-4 py-2.5 sm:py-3.5 min-w-0">
          <span className="text-[9px] sm:text-xs text-gray-400 shrink-0 whitespace-nowrap">End</span>
          <div className="flex-1 min-w-0">
            <TimeDropdown value={endTime} onChange={setEndTime} placeholder="09:41 AM" options={endOptions} />
          </div>
        </div>
      </div>
      {(startError || endError) && (
        <div className="flex mt-1 pl-3 gap-4">
          {startError && <p className="text-[10px] text-red-500 flex-1">Start time required</p>}
          {endError && <p className="text-[10px] text-red-500 flex-1">End time required</p>}
        </div>
      )}
    </div>
  );
}

/* ─── Split date field (Check-in | Check-out in one row) ─────────────────────── */
function DateRangeField({ checkIn, setCheckIn, checkOut, setCheckOut, checkInError, checkOutError }) {
  return (
    <div className="flex gap-3">
      {/* Check-in */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-1 pl-1">Check-in</p>
        <div className={`flex items-center gap-2 rounded-full border bg-white px-3 py-2.5 ${checkInError ? "border-red-400" : "border-gray-200"}`}>
          <span className="shrink-0"><CalendarIcon /></span>
          <CalendarDropdown value={checkIn} onChange={setCheckIn} placeholder="mm/dd/yyyy" />
        </div>
        {checkInError && <p className="text-[10px] text-red-500 mt-1 pl-1">Check-in required</p>}
      </div>
      {/* Check-out */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-1 pl-1">Check-out</p>
        <div className={`flex items-center gap-2 rounded-full border bg-white px-3 py-2.5 ${checkOutError ? "border-red-400" : "border-gray-200"}`}>
          <span className="shrink-0"><CalendarIcon /></span>
          <CalendarDropdown value={checkOut} onChange={setCheckOut} placeholder="mm/dd/yyyy" align="right" />
        </div>
        {checkOutError && <p className="text-[10px] text-red-500 mt-1 pl-1">Check-out required</p>}
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

/* ─── Booking Shell ──────────────────────────────────────────────────────────── */
function BookingShell({ children, topSlot, reserveButton, title, price, priceUnit, rating, reviews, timeZone }) {
  const ratingNum = Number(rating);
  const ratingText = Number.isFinite(ratingNum) ? ratingNum.toFixed(1) : "0.0";
  return (
    <div className="w-full bg-white flex flex-col h-auto xl:h-full rounded-[20px] border border-gray-200 p-4 sm:p-7">

      {/* Pill / mode selector — above everything */}
      {topSlot && <div className="shrink-0 mb-5">{topSlot}</div>}

      {/* Title + price */}
      <div className="flex items-start justify-between gap-2 shrink-0 mb-5 min-w-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">{title}</h2>
          {timeZone && <p className="mt-1 text-xs text-gray-500">Dates and times in {timeZone}</p>}
          <div className="mt-1.5 flex items-center flex-wrap gap-x-1 gap-y-0.5 text-sm text-gray-600">
            <StarRating rating={ratingNum} />
            <span className="font-semibold">{ratingText}</span>
            <span className="text-gray-400 text-xs whitespace-nowrap">({reviews} Reviews)</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xl sm:text-2xl font-bold text-gray-900">${price}</span>
          <span className="text-xs sm:text-sm text-gray-400">{priceUnit}</span>
        </div>
      </div>

      {/* Scrollable middle content */}
      <div className="flex flex-col gap-5 xl:flex-1">
        {children}
      </div>

      {/* Reserve button — full width at bottom */}
      <div className="shrink-0 mt-5">
        {reserveButton}
      </div>
    </div>
  );
}

function HourlySlotBookingCard(props) {
  const viewerTimeZone = useViewerTimeZone();
  if (!viewerTimeZone) return <div className="p-6 text-sm text-gray-500">Loading booking slots…</div>;
  return <HourlySlotBookingCardContent {...props} viewerTimeZone={viewerTimeZone} key={viewerTimeZone} />;
}

function HourlySlotBookingCardContent({
  viewerTimeZone,
  listing,
  listingId,
  bookingTitle,
  bannerIcon,
  bannerLabel,
  reserveLabel = "Continue to Payment",
  slotRefresh = "",
  modeToggle = null,
}) {
  const router = useRouter();
  const SKEY = `booking_hourly_${listingId}`;
  const saved = React.useMemo(() => {
    if (typeof window === "undefined") return {};
    return safeParseJSON(sessionStorage.getItem(SKEY), {});
  }, [SKEY]);

  const clock = useBookingClock(listing.timeZone);
  const viewerClock = useBookingClock(viewerTimeZone);
  const listingDates = React.useMemo(() => listing.viewerTimeZone === viewerTimeZone
    ? Object.keys(listing.localAvailabilityDates).filter(date => date >= viewerClock.date).sort() : [],
  [listing.viewerTimeZone, listing.localAvailabilityDates, viewerTimeZone, viewerClock.date]);

  const savedSourceDate = saved.startDate || saved.selectedDate;
  const savedDate = saved.viewerTimeZone === viewerTimeZone ? saved.selectedDate : "";
  const initialDate = listingDates.includes(savedDate) ? savedDate : listingDates[0] || "";
  const initialSlots = savedDate === initialDate ? (saved.selectionByDate?.[initialDate] || saved.slots || []).map(slot => ({ ...slot, sourceDate: slot.sourceDate || savedSourceDate })) : [];
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedSlots, setSelectedSlots] = useState(initialSlots);
  // Tracks which date `selectedSlots` currently belongs to, so the "clear on date change"
  // effect below only fires for genuine user-driven date changes — never for the restored
  // initial selection, regardless of how many renders it takes to settle.
  const selectionDateRef = React.useRef(initialDate);
  const [grid, setGrid] = useState({ slots: [], slotDurationMinutes: null, hourlyPrice: null, currency: "USD" });
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [gridError, setGridError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const activeSlots = (grid.date === selectedDate && grid.viewerTimeZone === viewerTimeZone ? grid.slots : []).map(slot => ({
    ...slot,
    available: slot.available !== false && canStartBooking(slot.sourceDate, slot.startTime, clock),
  }));
  const effectiveSlotDurationMinutes = grid.slotDurationMinutes;

  const currentSelection = selectedSlots.filter(slot =>
    activeSlots.some(active => active.available && slotKey(active) === slotKey(slot)));
  const hourlyPrice = Number(grid.hourlyPrice || listing.hourlyPrice || listing.price || 0);
  const currency = grid.currency || listing.currency || "USD";
  const selectedHours = React.useMemo(() => currentSelection.reduce((sum, slot) => {
    const minutes = slot.durationMinutes || effectiveSlotDurationMinutes || calculateSlotMinutes(slot.startTime, slot.endTime) || 0;
    return sum + (minutes / 60);
  }, 0), [currentSelection, effectiveSlotDurationMinutes]);

  const selectedPrice = React.useMemo(() => currentSelection.reduce((sum, slot) => {
    const raw = Number(slot.price);
    if (Number.isFinite(raw) && raw > 0) return sum + raw;
    const minutes = slot.durationMinutes || effectiveSlotDurationMinutes || calculateSlotMinutes(slot.startTime, slot.endTime) || 0;
    return sum + ((hourlyPrice * minutes) / 60);
  }, 0), [currentSelection, effectiveSlotDurationMinutes, hourlyPrice]);

  const availableCount = activeSlots.filter((slot) => slot.available !== false).length;

  useEffect(() => {
    if (!listingDates.includes(selectedDate) && listingDates[0]) {
      setSelectedDate(listingDates[0]);
    }
  }, [listingDates, selectedDate]);

  useEffect(() => {
    if (selectionDateRef.current === selectedDate) return;
    selectionDateRef.current = selectedDate;
    setSelectedSlots([]);
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate) return;

    let cancelled = false;
    const load = async () => {
      setLoadingGrid(true);
      setGridError("");
      try {
        const { data } = await axiosInstance.get(`/listings/browse/${listingId}/slots`, {
          params: { date: selectedDate, dateZone: "viewer" },
        });
        if (cancelled) return;
        setGrid(normalizeSlotsResponse(data));
      } catch (error) {
        if (cancelled) return;
        setGrid({ slots: [], slotDurationMinutes: null, hourlyPrice: null, currency: "USD" });
        setGridError(error?.response?.data?.message || "Unable to load slots right now.");
      } finally {
        if (!cancelled) setLoadingGrid(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [listingId, selectedDate, refreshTick, viewerTimeZone]);

  useEffect(() => {
    if (!slotRefresh) return;
    setSelectedSlots([]);
    setRefreshTick((tick) => tick + 1);
  }, [slotRefresh]);

  const selectedCount = currentSelection.length;
  const selectedRanges = currentSelection
    .slice()
    .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));

  const handleRefresh = () => {
    setSelectedSlots([]);
    setRefreshTick((tick) => tick + 1);
  };

  const toggleSlot = (slot) => {
    if (slot.available === false) return;
    const key = slotKey(slot);
    setSelectedSlots((previous) => {
      const existing = previous.filter(item => activeSlots.some(active => active.available && slotKey(active) === slotKey(item)));
      return existing.some((item) => slotKey(item) === key)
        ? existing.filter((item) => slotKey(item) !== key)
        : [...existing, {
          sourceDate: slot.sourceDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          durationMinutes: slot.durationMinutes || effectiveSlotDurationMinutes || calculateSlotMinutes(slot.startTime, slot.endTime) || null,
          price: slot.price || null,
        }];
    });
  };

  const handleContinue = () => {
    if (!selectedDate) {
      toast.error("Please pick a date first.");
      return;
    }
    if (!currentSelection.length || currentSelection.some(slot => !canStartBooking(slot.sourceDate, slot.startTime, bookingClock(listing.timeZone)))) {
      toast.error("Please select at least one slot.");
      return;
    }

    const sourceDates = currentSelection.map(slot => slot.sourceDate).sort();
    const sourceDate = sourceDates[0];
    const endDate = sourceDates.at(-1);
    const serializedSlots = currentSelection.map((slot) => ({
      sourceDate: slot.sourceDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));

    const sessionState = {
      selectedDate,
      startDate: sourceDate,
      endDate,
      timeZone: listing.timeZone,
      viewerTimeZone,
      slots: serializedSlots,
      slotDurationMinutes: effectiveSlotDurationMinutes,
      hourlyPrice,
      currency,
      listingId,
      title: listing.title,
      description: listing.details?.description || "",
      image: listing.images?.[0] || "",
      pricingMode: "hourly",
      bookingType: listing.bookingType,
      selectionByDate: { [selectedDate]: currentSelection },
      totalHours: selectedHours,
      totalPrice: selectedPrice,
      listingType: listing.type,
    };
    sessionStorage.setItem(SKEY, JSON.stringify(sessionState));

    const params = new URLSearchParams({
      listingId,
      title: listing.title,
      description: listing.details?.description || "",
      image: listing.images?.[0] || "",
      bookingType: listing.bookingType || "hourly",
      listingType: listing.type,
      pricingMode: "hourly",
      startDate: sourceDate,
      endDate,
      timeZone: listing.timeZone,
      pricePerUnit: String(hourlyPrice),
      units: String(selectedHours),
      _skey: SKEY,
    });

    router.push(`/user-dashboard/confirm-and-pay?${params.toString()}`);
  };

  return (
    <BookingShell
      timeZone={viewerTimeZone}
      title={bookingTitle}
      price={hourlyPrice || listing.price}
      priceUnit="/Hr"
      rating={listing.rating}
      reviews={listing.reviews}
      topSlot={modeToggle}
      reserveButton={(
        <button
          onClick={handleContinue}
          disabled={!currentSelection.length || loadingGrid}
          className={`w-full rounded-full px-5 py-4 text-sm font-bold transition-all ${
            currentSelection.length && !loadingGrid
              ? "bg-[#FEB538] text-gray-900 hover:opacity-90 shadow-md"
              : "cursor-not-allowed bg-gray-300 text-white"
          }`}
        >
          {reserveLabel}
        </button>
      )}
    >
      <div className="space-y-4">
        <div className="rounded-[22px] bg-[#228E8A] bg-gradient-to-r from-[#228E8A] to-[#1D8C82] px-4 py-4 text-white shadow-[0_10px_24px_rgba(34,142,138,0.18)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white">
              {bannerIcon}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{bannerLabel}</p>
              <p className="text-xs text-white/80">
                {selectedDate ? formatCompactDate(selectedDate).full : "Select a date"}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-[22px] border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {selectedDate ? `Available Slots for ${formatCompactDate(selectedDate).weekday}, ${formatCompactDate(selectedDate).full}` : "Select a date"}
              </p>
              <p className="text-xs text-gray-500">
                {availableCount} slots available{selectedCount ? ` · ${selectedCount} selected` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-[#228E8A] hover:text-[#228E8A]"
            >
              <span className={loadingGrid ? "animate-spin" : ""}>↻</span>
              Refresh
            </button>
          </div>

          <div className="mt-4 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-3">
              {listingDates.map((date) => {
                const meta = formatCompactDate(date);
                const active = date === selectedDate;
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border px-2 py-3 transition-colors ${
                      active
                        ? "border-[#228E8A] bg-[#EBF6F6] text-[#228E8A] font-bold"
                        : "border-transparent bg-white text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wide">{meta.weekday}</span>
                    <span className="text-lg font-bold leading-none">{meta.label}</span>
                    <span className="mt-0.5 text-[10px] font-medium">{meta.month}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#CBE6E5] bg-[#EBF6F6] px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#228E8A] shadow-sm">
              {bannerIcon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#228E8A]">
                {hourlyPrice ? `${formatMoney(hourlyPrice, currency)} per hour` : "Hourly booking"}
              </p>
              <p className="text-xs text-gray-600">
                {grid.slotDurationMinutes ? `${grid.slotDurationMinutes} minutes per slot` : "Server-defined slot length"}{" "}
                {selectedCount ? `· ${selectedCount} selected` : ""}
              </p>
            </div>
          </div>
        </div>

        {gridError && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {gridError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {loadingGrid && !activeSlots.length ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl border border-gray-100 bg-gray-50" />
            ))
          ) : activeSlots.length === 0 ? (
            <div className="col-span-full py-8 text-center text-sm text-gray-400">
              No slots available for this date.
            </div>
          ) : (
            activeSlots.map((slot) => {
              const selected = currentSelection.some((item) => slotKey(item) === slotKey(slot));
              const disabled = slot.available === false;
              const expired = !canStartBooking(slot.sourceDate, slot.startTime, clock);
              const slotDuration = slot.durationMinutes || grid.slotDurationMinutes || calculateSlotMinutes(slot.startTime, slot.endTime) || 0;
              const slotPrice = slot.price ?? ((hourlyPrice * slotDuration) / 60);
              return (
                <button
                  key={slotKey(slot)}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleSlot(slot)}
                  className={`relative rounded-2xl border p-4 text-left transition-all ${
                    disabled
                      ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
                      : selected
                        ? "border-[#228E8A] bg-white shadow-[0_10px_24px_rgba(34,142,138,0.12)] ring-1 ring-[#228E8A]"
                        : "border-gray-100 bg-white hover:border-[#228E8A]/40 hover:shadow-[0_10px_24px_rgba(34,142,138,0.06)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base font-bold text-gray-900">
                        {slot.localSchedule?.ranges[0]?.label}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {slotDuration} minutes
                      </p>
                    </div>
                    <div className={`mt-0.5 rounded-full px-2 py-1 text-[10px] font-semibold ${
                      disabled
                        ? "bg-gray-100 text-gray-400"
                        : selected
                          ? "bg-[#228E8A] text-white"
                          : "bg-[#EBF6F6] text-[#228E8A]"
                    }`}>
                      {disabled ? expired ? "Past" : "Booked" : selected ? "Selected" : "Available"}
                    </div>
                  </div>
                  <p className={`mt-3 text-lg font-bold ${disabled ? "text-gray-300" : "text-[#228E8A]"}`}>
                    {formatMoney(slotPrice, currency)}
                  </p>
                </button>
              );
            })
          )}
        </div>

        <div className="rounded-[22px] border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-900">
                {selectedRanges.length ? activeSlots.find(slot => slotKey(slot) === slotKey(selectedRanges[0]))?.localSchedule?.ranges[0]?.label : "Select at least one slot"}
              </p>
              <p className="text-xs text-gray-500">
                {selectedCount ? `${selectedCount} slot${selectedCount > 1 ? "s" : ""} selected` : "Pick one or more non-contiguous slots"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-400">Total</p>
              <p className="text-xl font-bold text-[#228E8A]">{formatMoney(selectedPrice, currency)}</p>
            </div>
          </div>
        </div>
      </div>
    </BookingShell>
  );
}

/* ─── Navigate to confirm-and-pay ────────────────────────────────────────────── */
function useNavigateToConfirm(listing, listingId) {
  const router = useRouter();
  return (fields, sessionKey) => {
    if (!canStartBooking(fields.startDate, fields.startTime, bookingClock(listing.timeZone))) {
      toast.error(`Choose an upcoming date and time (${listing.timeZone}).`);
      return;
    }
    const categoryMap = { activities: "activity", places: "place", equipment: "equipment" };
    const listingType = categoryMap[listing.type] ?? listing.type ?? "";
    const p = new URLSearchParams({
      listingId,
      title: listing.title,
      description: listing.details.description || "",
      image: listing.images[0] || "",
      bookingType: listing.bookingType,
      listingType,
      pricePerUnit: String(listing.price),
      timeZone: listing.timeZone,
      ...(sessionKey ? { _skey: sessionKey } : {}),
      ...fields,
    });
    router.push(`/user-dashboard/confirm-and-pay?${p.toString()}`);
  };
}

/* ─── Activity Booking Card ──────────────────────────────────────────────────── */
function ActivityBookingCard(props) {
  return <RentalBookingCard {...props} kind="activity" title="Book Your Activity" />;
}

function ActivityPerPersonBookingCard(props) {
  const viewerTimeZone = useViewerTimeZone();
  if (!viewerTimeZone) return <div className="p-6 text-sm text-gray-500">Loading activity times…</div>;
  return <ActivityPerPersonBookingCardContent {...props} viewerTimeZone={viewerTimeZone} key={viewerTimeZone} />;
}

function ActivityPerPersonBookingCardContent({ listing, listingId, viewerTimeZone, title = "Book Your Activity", modeToggle = null, sessionKey }) {
  const SKEY = sessionKey || `booking_activity_${listingId}`;
  const saved = React.useMemo(() => safeParseJSON(sessionStorage.getItem(SKEY), {}), [SKEY]);
  const restored = saved.viewerTimeZone === viewerTimeZone ? saved : {};
  const [date, setDate] = useState(restored.date || "");
  const [optionKey, setOptionKey] = useState(restored.optionKey || "");
  const [persons, setPersons] = useState(saved.persons || "");
  const [errors, setErrors] = useState({});
  const navigateToConfirm = useNavigateToConfirm(listing, listingId);
  const clock = useBookingClock(viewerTimeZone);
  const options = listing.viewerTimeZone === viewerTimeZone
    ? listing.activityAvailability.filter(option => Date.parse(option.startAt) > clock.now) : [];
  const keyFor = option => `${option.sourceDate}|${option.startTime}|${option.endTime}`;
  const selected = options.find(option => keyFor(option) === optionKey && option.localDate === date);
  const availableDates = [...new Set(options.map(option => option.localDate))].sort();
  const startTimeOptions = options.filter(option => option.localDate === date).map(option => ({ label: option.label, value: keyFor(option) }));
  const today = clock.date;

  useEffect(() => {
    sessionStorage.setItem(SKEY, JSON.stringify({ mode: "per_person", date, optionKey, persons, viewerTimeZone,
      ...(selected ? { startDate: selected.sourceDate, startTime: selected.startTime, endTime: selected.endTime } : {}),
    }));
  }, [date, optionKey, persons, viewerTimeZone, selected, SKEY]);

  const units = Number(persons) || 1;
  const personPrice = listing.perPersonPrice ?? listing.price;
  const subtotal = personPrice * units;
  const fee = Number((subtotal * 0.1).toFixed(2));
  const total = subtotal + fee;

  const pillLabel = "Per Person";
  const priceUnit = "/Person";
  const summaryLabel = `$${personPrice}/person × ${units} person${units > 1 ? "s" : ""}`;

  const handleReserve = () => {
    const newErrors = {};
    if (!date) { toast.error("Date is required."); newErrors.date = true; }
    if (!selected) { toast.error("Start time is required."); newErrors.startTime = true; }
    if (!persons) { toast.error("Number of guests is required."); newErrors.persons = true; }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    const fields = {
      startDate: selected.sourceDate, endDate: selected.sourceDate, startTime: selected.startTime, endTime: selected.endTime, dateFrom: selected.sourceDate, dateTo: selected.sourceDate,
      pricingMode: "per_person", bookingType: "per_person", pricePerUnit: String(personPrice),
      numberOfGuests: Number(persons), units, guests: `${Number(persons)} guest${Number(persons) !== 1 ? "s" : ""}`,
    };
    navigateToConfirm(fields, SKEY);
  };

  return (
    <BookingShell
      timeZone={viewerTimeZone}
      title={title} price={personPrice} priceUnit={priceUnit} rating={listing.rating} reviews={listing.reviews}
      topSlot={modeToggle || (
        <div className="rounded-[18px] border border-[#4AA7A7] bg-[#D7ECEB] px-4 py-5 text-center relative">
          <CheckBadge />
          <div className="flex flex-col items-center gap-2">
            <span className="text-[#4AA7A7]"><UserOutlineIcon /></span>
            <p className="text-sm font-semibold text-gray-700">{pillLabel}</p>
          </div>
        </div>
      )}
      reserveButton={
        <button
          onClick={handleReserve}
          className="w-full py-4 rounded-full bg-[#FEB538] hover:bg-[#e0b430] text-sm font-bold text-gray-900 transition-colors"
        >
          Reserve
        </button>
      }
    >
      {/* Single date */}
      <BookingField icon={<CalendarIcon />} error={errors.date} errorMessage="Date is required">
        <CalendarDropdown
          value={date}
          onChange={value => { setDate(value); setOptionKey(""); setErrors(current => ({ ...current, date: false })); }}
          placeholder="mm/dd/yyyy"
          availableDates={availableDates}
          minDate={today}
        />
      </BookingField>

      {/* Start time only */}
      <BookingField icon={<ClockIcon />} error={errors.startTime} errorMessage="Start time is required">
        <TimeDropdown
          value={selected ? optionKey : ""}
          onChange={value => { setOptionKey(value); setErrors(current => ({ ...current, startTime: false })); }}
          placeholder="Start time"
          options={startTimeOptions}
        />
      </BookingField>


      {/* Guests */}
      <BookingField icon={<UserOutlineIcon />} error={errors.persons} errorMessage="Number of guests is required">
        <input
          type="number"
          min="1"
          value={persons}
          placeholder="Select guest number"
          onChange={e => { setPersons(e.target.value); setErrors(err => ({ ...err, persons: false })); }}
          className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 focus:outline-none placeholder:text-gray-400 min-w-0"
        />
      </BookingField>

      {/* Summary */}
      <div className="space-y-2 border-t border-gray-100 pt-4">
        <SummaryLine label={summaryLabel} value={`$${subtotal}`} />
        <SummaryLine label="Service fee" value={`$${fee}`} />
        <SummaryLine label="Total" value={`$${total}`} bold />
      </div>
    </BookingShell>
  );
}

/* ─── Place/equipment booking modes ───────────────────────────────────────── */
function PlacesBookingCard(props) {
  return <RentalBookingCard {...props} kind="places" title="Book Your Place" />;
}

function EquipmentBookingCard(props) {
  return <RentalBookingCard {...props} kind="equipment" title="Book Your Equipment" />;
}

function RentalBookingCard({ listing, listingId, slotRefresh = "", kind, title }) {
  const sessionKey = `booking_${kind}_${listingId}`;
  const configuredModes = [
    { mode: "per_person", price: listing.perPersonPrice, label: "Per Person", icon: <UserOutlineIcon /> },
    { mode: "hourly", price: listing.hourlyPrice, label: "Hourly", icon: <ClockIcon /> },
    { mode: "daily", price: listing.dailyPrice, label: "Daily", icon: <CalendarIcon /> },
  ].filter(option => option.price !== null && option.price !== undefined);
  const [selectedMode, setMode] = useState(() => {
    const saved = typeof window === "undefined" ? {} : safeParseJSON(sessionStorage.getItem(sessionKey), {});
    return saved.mode || "";
  });
  const mode = configuredModes.some(option => option.mode === selectedMode) ? selectedMode : configuredModes[0]?.mode || "hourly";
  useEffect(() => {
    const previous = safeParseJSON(sessionStorage.getItem(sessionKey), {});
    sessionStorage.setItem(sessionKey, JSON.stringify({ ...previous, mode }));
  }, [sessionKey, mode]);
  const modeToggle = configuredModes.length > 1 ? (
    <div className={`grid gap-3 ${configuredModes.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
      {configuredModes.map(option => <ModePill key={option.mode} active={mode === option.mode} label={option.label} icon={option.icon} onClick={() => setMode(option.mode)} />)}
    </div>
  ) : null;
  if (mode === "per_person") return <ActivityPerPersonBookingCard listing={listing} listingId={listingId} title={title} sessionKey={sessionKey} modeToggle={modeToggle} />;
  if (mode === "hourly") return (
    <HourlySlotBookingCard listing={listing} listingId={listingId} bookingTitle={title}
      bannerLabel={listing.title} bannerIcon={kind === "places" ? <CalendarIcon size={18} /> : <ClockIcon size={18} />}
      reserveLabel="Continue to Payment" slotRefresh={slotRefresh} modeToggle={modeToggle} />
  );
  return <DailyBookingCard listing={listing} listingId={listingId} title={title} sessionKey={sessionKey} modeToggle={modeToggle} />;
}

function DailyBookingCard(props) {
  const viewerTimeZone = useViewerTimeZone();
  if (!viewerTimeZone) return <div className="p-6 text-sm text-gray-500">Loading booking dates…</div>;
  return <DailyBookingCardContent {...props} viewerTimeZone={viewerTimeZone} key={viewerTimeZone} />;
}

function DailyBookingCardContent({ listing, listingId, title, sessionKey, modeToggle, viewerTimeZone }) {
  const saved = React.useMemo(() => safeParseJSON(sessionStorage.getItem(sessionKey), {}), [sessionKey]);
  const restored = saved.viewerTimeZone === viewerTimeZone ? saved : {};
  const [checkIn, setCheckIn] = useState(restored.checkIn || "");
  const [checkOut, setCheckOut] = useState(restored.checkOut || "");
  const [startKey, setStartKey] = useState(restored.startKey || "");
  const [guests, setGuests] = useState(saved.guests || "");
  const [errors, setErrors] = useState({});
  const viewerClock = useBookingClock(viewerTimeZone);
  const navigateToConfirm = useNavigateToConfirm(listing, listingId);
  const options = listing.viewerTimeZone === viewerTimeZone ? listing.dailyAvailability : { starts: [], ends: [] };
  const starts = options.starts.filter(option => Date.parse(option.startAt) > viewerClock.now);
  const keyFor = option => `${option.sourceDate}|${option.startTime}`;
  const start = starts.find(option => keyFor(option) === startKey && option.localDate === checkIn);
  const endOptions = start ? options.ends.filter(option => option.startTime === start.startTime && option.sourceDate >= start.sourceDate) : [];
  const end = endOptions.find(option => option.localDate === checkOut);
  const startDates = [...new Set(starts.map(option => option.localDate))].sort();
  const endDates = [...new Set((start ? endOptions : options.ends.filter(option => option.localDate >= (checkIn || viewerClock.date))).map(option => option.localDate))].sort();
  const timeOptions = starts.filter(option => option.localDate === checkIn).map(option => ({ label: option.label, value: keyFor(option) }));
  // Day rates follow the original listing calendar, including DST transitions.
  const days = start && end ? Math.max(1, Math.round((Date.parse(end.sourceDate) - Date.parse(start.sourceDate)) / 86400000)) : 1;
  const subtotal = Number((listing.dailyPrice * days).toFixed(2));
  const fee = Number((subtotal * 0.1).toFixed(2));

  useEffect(() => {
    sessionStorage.setItem(sessionKey, JSON.stringify({ mode: "daily", viewerTimeZone, checkIn, checkOut, startKey, guests }));
  }, [sessionKey, viewerTimeZone, checkIn, checkOut, startKey, guests]);

  const handleReserve = () => {
    const nextErrors = { checkIn: !checkIn, startTime: !start, checkOut: !end };
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      toast.error("Select an available start date, time and end date.");
      return;
    }
    navigateToConfirm({
      pricingMode: "daily", startDate: start.sourceDate, endDate: end.sourceDate,
      startTime: start.startTime, endTime: end.startTime,
      dateFrom: start.sourceDate, dateTo: end.sourceDate, units: days,
      pricePerUnit: String(listing.dailyPrice),
      ...(guests ? { numberOfGuests: Number(guests), guests: `${Number(guests)} guest${Number(guests) !== 1 ? "s" : ""}` } : {}),
    }, sessionKey);
  };

  return (
    <BookingShell timeZone={viewerTimeZone} title={title} price={listing.dailyPrice} priceUnit="/Day"
      rating={listing.rating} reviews={listing.reviews} topSlot={modeToggle}
      reserveButton={<button onClick={handleReserve} className="w-full py-4 rounded-full bg-[#FEB538] hover:bg-[#e0b430] text-sm font-bold text-gray-900 transition-colors">Reserve</button>}>
      <div className="grid grid-cols-2 gap-3">
        <BookingField icon={<CalendarIcon />} error={errors.checkIn} errorMessage="Start date is required">
          <CalendarDropdown value={checkIn} onChange={value => { setCheckIn(value); setStartKey(""); setCheckOut(""); setErrors({}); }}
            placeholder="Start date" availableDates={startDates} minDate={viewerClock.date} />
        </BookingField>
        <BookingField icon={<CalendarIcon />} error={errors.checkOut} errorMessage="Select an end date after choosing a start time">
          <CalendarDropdown value={checkOut} onChange={value => { setCheckOut(value); setErrors(current => ({ ...current, checkOut: false })); }}
            placeholder="End date" availableDates={endDates} minDate={checkIn || viewerClock.date} align="right" />
        </BookingField>
      </div>
      <BookingField icon={<ClockIcon />} error={errors.startTime} errorMessage="Start time is required">
        <TimeDropdown value={start ? startKey : ""} onChange={value => {
          setStartKey(value);
          const selected = starts.find(option => keyFor(option) === value);
          if (!options.ends.some(option => option.localDate === checkOut && option.startTime === selected?.startTime && option.sourceDate >= selected.sourceDate)) setCheckOut("");
          setErrors(current => ({ ...current, startTime: false }));
        }}
          placeholder="Start time" options={timeOptions} />
      </BookingField>
      {start && <div className="rounded-2xl border border-[#CBE6E5] bg-[#EBF6F6] px-4 py-3 text-sm text-gray-900">
        <p>{checkIn} · {start.label}{end ? ` – ${checkOut} · ${end.label}` : ""}</p>
        <p className="mt-1 text-xs text-gray-500">Daily slot preview</p>
      </div>}
      <BookingField icon={<UserOutlineIcon />}>
        <input type="number" min="1" value={guests} placeholder="Select guest number" onChange={event => setGuests(event.target.value)}
          className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 focus:outline-none placeholder:text-gray-400 min-w-0" />
      </BookingField>
      <div className="space-y-2 border-t border-gray-100 pt-4">
        <SummaryLine label={`${formatMoney(listing.dailyPrice, listing.currency)}/day × ${days} day${days > 1 ? "s" : ""}`} value={formatMoney(subtotal, listing.currency)} />
        <SummaryLine label="Service fee" value={formatMoney(fee, listing.currency)} />
        <SummaryLine label="Total" value={formatMoney(subtotal + fee, listing.currency)} bold />
      </div>
    </BookingShell>
  );
}

const REVIEWS_PER_PAGE_DESKTOP = 3;
const REVIEWS_PER_PAGE_MOBILE = 1;

function formatReviewDate(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function RatingDistributionBars({ distribution }) {
  if (!Array.isArray(distribution) || distribution.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5 mb-6 max-w-sm">
      {distribution.map((d) => (
        <div key={d.stars} className="flex items-center gap-2">
          <span className="w-3 text-xs font-semibold text-gray-500">{d.stars}</span>
          <StarIconBase size={12} className="text-[#F5C842] fill-current shrink-0" />
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-[#F5C842] rounded-full"
              style={{ width: `${d.percentage ?? 0}%` }}
            />
          </div>
          <span className="w-8 text-right text-xs text-gray-400">{d.count ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

function ReviewsSection({ listingId }) {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [apiPage, setApiPage] = useState(1);
  const [slideDir, setSlideDir] = useState(1); // 1 = forward (next), -1 = backward (prev)
  const [animKey, setAnimKey] = useState(0);
  const [autoTick, setAutoTick] = useState(0); // bumped on manual navigation to reset the auto-advance timer

  const reviews = useSelector(selectListingReviews);
  const summary = useSelector(selectListingReviewsSummary);
  const pagination = useSelector(selectListingReviewsPagination);
  const status = useSelector(selectListingReviewsStatus);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (listingId) dispatch(fetchListingReviews({ listingId, page: apiPage, limit: 5 }));
  }, [dispatch, listingId, apiPage]);

  const reviewsWithText = reviews.filter((r) => r.comment && r.comment.trim());
  const perPage = isMobile ? REVIEWS_PER_PAGE_MOBILE : REVIEWS_PER_PAGE_DESKTOP;
  const totalPages = Math.max(1, Math.ceil(reviewsWithText.length / perPage));
  const visible = reviewsWithText.slice(page * perPage, page * perPage + perPage);

  const prev = () => {
    setSlideDir(-1);
    setAnimKey((k) => k + 1);
    setAutoTick((t) => t + 1);
    if (page === 0) {
      if (apiPage > 1) setApiPage((p) => p - 1);
      return;
    }
    setPage((p) => Math.max(0, p - 1));
  };
  const next = () => {
    setSlideDir(1);
    setAnimKey((k) => k + 1);
    setAutoTick((t) => t + 1);
    if (page >= totalPages - 1) {
      if (apiPage < (pagination?.totalPages ?? 1)) { setApiPage((p) => p + 1); setPage(0); }
      return;
    }
    setPage((p) => Math.min(totalPages - 1, p + 1));
  };
  const goToPage = (i) => {
    setSlideDir(i > page ? 1 : -1);
    setAnimKey((k) => k + 1);
    setAutoTick((t) => t + 1);
    setPage(i);
  };

  const hasPrev = page > 0 || apiPage > 1;
  const hasNext = page < totalPages - 1 || apiPage < (pagination?.totalPages ?? 1);
  const isLoading = status === "loading" && reviews.length === 0;

  // Auto-advance every 30s; loops back to the first slide after the last one.
  // Manual navigation (prev/next/dot) bumps autoTick to restart the countdown.
  useEffect(() => {
    if (totalPages <= 1) return;
    const timer = setInterval(() => {
      setSlideDir(1);
      setAnimKey((k) => k + 1);
      if (hasNext) {
        if (page >= totalPages - 1) {
          setApiPage((p) => p + 1);
          setPage(0);
        } else {
          setPage((p) => Math.min(totalPages - 1, p + 1));
        }
      } else {
        setApiPage(1);
        setPage(0);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [totalPages, hasNext, page, apiPage, autoTick]);

  return (
    <div
      className="mt-6 rounded-xl border border-gray-200 bg-white p-6 flex flex-col w-full max-w-336"
      style={{ gap: 24 }}
    >
      {/* Row 1: heading */}
      <h2 className="text-xl font-bold text-gray-900">Reviews</h2>

      {/* Row 2: prev/next controls */}
      {!isLoading && reviewsWithText.length > 0 && (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={prev}
            disabled={!hasPrev}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${!hasPrev ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-500 hover:border-[#4AA7A7] hover:text-[#4AA7A7]"}`}
          >
            <ChevronDownIcon size={16} className="rotate-90" />
          </button>
          <button
            onClick={next}
            disabled={!hasNext}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${!hasNext ? "border border-gray-200 text-gray-300" : "bg-[#4AA7A7] text-white hover:bg-[#3d9090]"}`}
          >
            <ChevronDownIcon size={16} className="-rotate-90" />
          </button>
        </div>
      )}

      {isLoading ? (
        <>
          <RatingDistributionBars distribution={summary?.distribution} />
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
          </div>
        </>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No reviews yet.</p>
      ) : reviewsWithText.length === 0 ? (
        // No review text to show — fall back to the rating breakdown instead of an empty section.
        <RatingDistributionBars distribution={summary?.distribution} />
      ) : (
        <>
          {/* Review cards */}
          <div className="overflow-hidden">
            <div
              key={animKey}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
              style={{ animation: `reviews-slide-in-${slideDir > 0 ? "right" : "left"} 0.35s ease` }}
            >
              {visible.map((r) => (
                <div key={r.id ?? r._id} className="flex flex-col gap-4">
                  <p className="text-sm text-gray-500 leading-7">{r.comment}</p>
                  <div className="flex items-center gap-3">
                    {r.reviewer?.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.reviewer.profileImage} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#228E8A] flex items-center justify-center shrink-0 text-white font-bold text-sm">
                        {r.reviewer?.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-900">{r.reviewer?.name ?? "Guest"}</p>
                      <p className="text-xs text-gray-400">{r.reviewer?.city ? `${r.reviewer.city} · ` : ""}{formatReviewDate(r.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <style jsx>{`
            @keyframes reviews-slide-in-right {
              from { opacity: 0; transform: translateX(40px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes reviews-slide-in-left {
              from { opacity: 0; transform: translateX(-40px); }
              to { opacity: 1; transform: translateX(0); }
            }
          `}</style>

          {/* Dot pagination */}
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                disabled={totalPages <= 1}
                className={`rounded-full transition-all ${i === page ? "w-6 h-2.5 bg-[#F5C842]" : "w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Location Map ───────────────────────────────────────────────────────────── */
function ListingLocationMap({ listing }) {
  const hasRealCoords =
    listing.mapLat != null &&
    listing.mapLng != null &&
    Number.isFinite(listing.mapLat) &&
    Number.isFinite(listing.mapLng);

  const [geocodedCoords, setGeocodedCoords] = useState(null);

  // Only geocode when we don't already have real coordinates from the API
  useEffect(() => {
    if (hasRealCoords) return;
    const q = listing.location && listing.location !== "—" ? listing.location : null;
    if (!q) return;

    let cancelled = false;
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`, {
      headers: { "Accept-Language": "en" },
    })
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data?.[0]) {
          setGeocodedCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [listing.location, hasRealCoords]);

  const coords = hasRealCoords
    ? { lat: listing.mapLat, lon: listing.mapLng }
    : geocodedCoords;

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
      <iframe title="Listing location" width="100%" height="105%" frameBorder="0" scrolling="no" src={mapSrc} style={{ marginBottom: '-5%' }} />
      {/* OpenStreetMap attribution */}
      <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
        <span className="text-[10px] text-gray-600 bg-white/80 px-1.5 py-0.5 rounded">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline pointer-events-auto">OpenStreetMap</a> contributors
        </span>
      </div>
    </div>
  );
}

/* ─── Details typography ─────────────────────────────────────────────────────── */
const DETAIL_LABEL_STYLE = {
  fontFamily: "var(--font-sofia-pro), 'Sofia Pro', sans-serif",
  fontWeight: 500,
  fontSize: "14px",
  lineHeight: "100%",
  letterSpacing: "0%",
  color: "#212121",
};
const DETAIL_VALUE_STYLE = {
  fontFamily: "var(--font-sofia-pro), 'Sofia Pro', sans-serif",
  fontWeight: 400,
  fontSize: "13px",
  lineHeight: "100%",
  letterSpacing: "0%",
  color: "#4A4A4A",
};

/* ─── Details section ────────────────────────────────────────────────────────── */
function DetailsSection({ listing }) {
  const d = listing.details;
  const rows = [
    { label: "Place Name", value: d.activityTitle },
    { label: "Location", value: d.location, pin: true },
    { label: "Place Type", value: d.serviceCategory },
  ].filter(r => r.value);

  const meta = [
    { label: "Capacity Per Person", value: d.maxParticipants, icon: "users" },
    { label: "Parking Space", value: d.difficultyLevel },
    { label: "Minimum Rental Time", value: d.duration, icon: "clock" },
    { label: "Maximum Rental Time", value: d.instructorGuideName },
  ].filter(r => r.value);

  return (
    <div className="rounded-[22px] border border-gray-200 bg-white p-6">
      <h2 className="mb-5 text-xl font-bold text-gray-900">Details</h2>

      {/* Top row: Name / Location / Type */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
        {rows.map(r => (
          <div key={r.label}>
            <p style={DETAIL_LABEL_STYLE} className="mb-1.5">{r.label}</p>
            {r.pin ? (
              <div className="flex items-center gap-1">
                <MapPinIcon size={14} className="text-gray-400 shrink-0" />
                <p style={DETAIL_VALUE_STYLE}>{r.value}</p>
              </div>
            ) : (
              <p style={DETAIL_VALUE_STYLE}>{r.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Description */}
      {d.description && (
        <div className="mb-5">
          <p style={DETAIL_LABEL_STYLE} className="mb-1.5">Description</p>
          <p style={{ ...DETAIL_VALUE_STYLE, lineHeight: "1.6" }}>{d.description}</p>
        </div>
      )}

      <div className="border-t border-gray-100 my-5" />

      {/* Meta row */}
      {meta.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {meta.map(m => (
            <div key={m.label}>
              <p style={DETAIL_LABEL_STYLE} className="mb-1.5">{m.label}</p>
              <div className="flex items-center gap-1">
                {m.icon === "clock" && <ClockIcon size={14} className="text-gray-400 shrink-0" />}
                {m.icon === "users" && <UserOutlineIcon size={14} className="text-gray-400 shrink-0" />}
                <p style={DETAIL_VALUE_STYLE}>{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* What's Included */}
      {listing.amenities.length > 0 && (
        <div className="mt-5">
          <p style={DETAIL_LABEL_STYLE} className="mb-2">What&apos;s Included</p>
          <div className="flex flex-wrap gap-2">
            {listing.amenities.map(item => (
              <span key={item} className="rounded-xl bg-[#F5C842] px-4 py-1.5 text-sm font-semibold text-gray-900">{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* Requirements + Cancellation Policy */}
      {(listing.requirements || listing.cancellationPolicy) && (
        <div className="mt-5 pt-5 border-t border-gray-300 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {listing.requirements && (
            <div>
              <p style={DETAIL_LABEL_STYLE} className="mb-1.5">Requirements</p>
              <p style={{ ...DETAIL_VALUE_STYLE, lineHeight: "1.6" }}>{listing.requirements}</p>
            </div>
          )}
          {listing.cancellationPolicy && (
            <div>
              <p style={DETAIL_LABEL_STYLE} className="mb-1.5">Cancellation Policy</p>
              <p style={{ ...DETAIL_VALUE_STYLE, lineHeight: "1.6" }}>{listing.cancellationPolicy}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
export default function ListingDetailPage({ params: paramsPromise }) {
  const viewerTimeZone = useViewerTimeZone();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const params = React.use(paramsPromise);
  const rawId = params?.id;
  const urlType = searchParams.get("type");
  const slotRefresh = searchParams.get("slotRefresh") || "";

  const rawActivity = useSelector(selectSelectedActivity);
  const hostCache = useSelector(selectHostCache);
  const selectedStatus = useSelector(selectSelectedActivityStatus);

  // Merge cached host (from browse list) if single-listing endpoint returned incomplete host data
  const selectedActivity = React.useMemo(() => {
    if (!rawActivity) return rawActivity;
    const id = rawActivity.id ?? rawActivity._id;
    const cachedHost = id ? hostCache[id] : null;
    const currentHost = rawActivity.host;
    // Check if host data is complete (has profileImage and name differs from agencyName)
    const hasCompleteHost = currentHost &&
                            typeof currentHost === "object" &&
                            currentHost.id &&
                            currentHost.profileImage &&
                            currentHost.name !== currentHost.agencyName;
    // Use cached host if current is incomplete and cached has profileImage
    if (!hasCompleteHost && cachedHost && cachedHost.profileImage) {
      return { ...rawActivity, host: cachedHost };
    }
    return rawActivity;
  }, [rawActivity, hostCache]);
  const wishlistedIds = useSelector(selectWishlistSummaryListingIds);
  const wishlisted = wishlistedIds.includes(rawId);
  const [contactingHost, setContactingHost] = useState(false);

  useEffect(() => {
    if (rawId && viewerTimeZone) dispatch(fetchBrowseListing(rawId));
  }, [dispatch, rawId, viewerTimeZone]);

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
  const handleContactHost = async () => {
    const hostId = listing?.host?.id || findNestedId(selectedActivity?.host);
    const listingId = listing?._id || rawId;
    if (!hostId) {
      toast.error("Host information is not available. Please try again later.");
      return;
    }

    try {
      setContactingHost(true);
      await dispatch(
        startOrGetConversation({
          recipientId: hostId,
          listingId,
          initialMessage: `Hi, I'm interested in "${listing.title}".`,
        })
      ).unwrap();
      router.push(`/user-dashboard/messages?startChat=${hostId}${listingId ? `&listingId=${listingId}` : ""}`);
    } catch {
      toast.error("Could not start a chat with the host. Please try again.");
    } finally {
      setContactingHost(false);
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">

      {/* ── Full-width title bar: flush below navbar, white, tall ── */}
      <div className="w-full bg-white border-b border-gray-100">
        <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8 h-14 sm:h-16">
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
              onClick={() => dispatch(toggleWishlist(rawId))}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              {wishlisted ? <HeartFilledIcon size={20} className="text-red-500" /> : <HeartIcon size={20} />}
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
              <ShareIcon />
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 xl:px-16 py-3 sm:py-6 lg:py-10">

        {/* ── Two-column: image left + booking right ── */}
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 items-stretch">
          {/* Left – image section */}
          <div className="w-full xl:flex-1 min-w-0">
            <ImageGallery images={listing.images} title={listing.title} />
          </div>

          {/* Right – booking section */}
          <div className="w-full xl:w-[440px] shrink-0 xl:self-stretch">
            {(listing.type === "places"    || listing.type === "place")     && <PlacesBookingCard    listing={listing} listingId={rawId} slotRefresh={slotRefresh} />}
            {listing.type === "equipment"  && <EquipmentBookingCard listing={listing} listingId={rawId} slotRefresh={slotRefresh} />}
            {(listing.type === "activities" || listing.type === "activity") && <ActivityBookingCard listing={listing} listingId={rawId} slotRefresh={slotRefresh} />}
          </div>
        </div>

        {/* Hosted By */}
        <div className="mt-4 sm:mt-6 rounded-2xl sm:rounded-[22px] border border-gray-200 bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-3 sm:gap-4">
              {listing.host.avatar && listing.host.avatar.trim() !== "" ? (
                <img src={listing.host.avatar} alt={listing.host.name} className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover shrink-0" />
              ) : (
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#228E8A] flex items-center justify-center shrink-0 text-white font-bold text-lg">
                  {listing.host.agency?.[0]?.toUpperCase() || listing.host.name?.[0]?.toUpperCase() || "H"}
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-[#F5C842]">Hosted By</p>
                <div className="flex items-center gap-2">
                  {listing.host.agency ? (
                    <p className="text-base font-bold text-gray-900">{listing.host.agency}</p>
                  ) : (
                    <p className="text-base font-bold text-gray-900">{listing.host.name}</p>
                  )}
                  {selectedActivity?.host?.role && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF6F6] text-[#4AA7A7] font-medium capitalize">
                      {selectedActivity.host.role}
                    </span>
                  )}
                </div>
                {listing.host.agency && listing.host.name !== listing.host.agency && (
                  <p className="text-xs text-gray-500">{listing.host.name}</p>
                )}
                {(listing.host.rating !== null || listing.host.reviews !== null) && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <StarIconBase size={14} className="text-[#F5C842] fill-current" />
                    {listing.host.rating !== null && <span className="text-xs text-gray-600 font-medium">{Number(listing.host.rating).toFixed(1)}</span>}
                    {listing.host.reviews !== null && <span className="text-xs text-gray-400">( {listing.host.reviews} reviews )</span>}
                  </div>
                )}
                {listing.host.location && listing.host.location !== "—" && (
                  <p className="text-xs text-gray-400 mt-0.5">{listing.host.location}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleContactHost}
              disabled={contactingHost}
              className="rounded-full border border-[#4AA7A7] px-5 py-2.5 text-sm font-medium text-[#4AA7A7] hover:bg-[#4AA7A7] hover:text-white transition-colors shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {contactingHost ? "Connecting..." : "Contact Host"}
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
            <p style={{ fontFamily: "var(--font-sofia-pro), 'Sofia Pro', sans-serif", fontWeight: 300, fontSize: 16, lineHeight: "170%", letterSpacing: 0, color: "#A1A1A1" }} className="whitespace-pre-line">{listing.description}</p>
          </div>
        )}

        {/* Location map */}
        <div className="mt-6 rounded-[22px] border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Location</h2>
          <ListingLocationMap listing={listing} />
        </div>

        {/* Reviews */}
        <ReviewsSection listingId={listing._id} />

      </main>

      <AppFooter />
    </div>
  );
}
