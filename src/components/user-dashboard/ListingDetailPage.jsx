"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrowseListing,
  selectSelectedActivity,
  selectSelectedActivityStatus,
  selectHostCache,
} from "@/store/slices/activitiesSlice";
import { startOrGetConversation } from "@/store/slices/chatSlice";
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

  return {
    _id: api._id ?? api.id,
    type: category,
    bookingType,
    title,
    location,
    rating: api.rating ?? 4.4,
    reviews: api.reviewCount ?? "21K",
    price,
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
    mapLat: toNum(loc.latitude) ?? null,
    mapLng: toNum(loc.longitude) ?? null,
    reviews_list: api.reviews ?? [],
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
function CalendarDropdown({ value, onChange, placeholder = "mm/dd/yyyy", align = "left", availableDates }) {
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
function BookingShell({ children, topSlot, reserveButton, title, price, priceUnit, rating, reviews }) {
  const ratingNum = Number(rating);
  const ratingText = Number.isFinite(ratingNum) ? ratingNum.toFixed(1) : "4.4";
  return (
    <div className="w-full bg-white flex flex-col h-auto xl:h-full rounded-[20px] border border-gray-200 p-4 sm:p-7">

      {/* Pill / mode selector — above everything */}
      {topSlot && <div className="shrink-0 mb-5">{topSlot}</div>}

      {/* Title + price */}
      <div className="flex items-start justify-between gap-2 shrink-0 mb-5 min-w-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">{title}</h2>
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

/* ─── Navigate to confirm-and-pay ────────────────────────────────────────────── */
function useNavigateToConfirm(listing, listingId) {
  const router = useRouter();
  return (fields, sessionKey) => {
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
      funsivalFee: "8",
      ...(sessionKey ? { _skey: sessionKey } : {}),
      ...fields,
    });
    router.push(`/user-dashboard/confirm-and-pay?${p.toString()}`);
  };
}

/* ─── Activity Booking Card ──────────────────────────────────────────────────── */
function ActivityBookingCard({ listing, listingId }) {
  const SKEY = `booking_activity_${listingId}`;
  const saved = (() => { try { return JSON.parse(sessionStorage.getItem(SKEY) || "{}"); } catch { return {}; } })();
  const [date, setDate] = useState(saved.date || "");
  const [startTime, setStartTime] = useState(saved.startTime || "");
  const [endTime, setEndTime] = useState(saved.endTime || "");
  const [persons, setPersons] = useState(saved.persons || "");
  const [errors, setErrors] = useState({});
  const navigateToConfirm = useNavigateToConfirm(listing, listingId);

  const availability = listing.availability || [];
  const availableDates = React.useMemo(() => {
    return [...new Set(availability.map(a => a.date.split("T")[0]))];
  }, [availability]);

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const hour = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "AM" : "PM";
    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const startTimeOptions = React.useMemo(() => {
    if (!date) return [];
    return availability
      .filter(a => a.date.split("T")[0] === date && a.isAvailable !== false)
      .map(a => ({ label: formatTime(a.startTime), value: a.startTime }));
  }, [date, availability]);

  useEffect(() => {
    sessionStorage.setItem(SKEY, JSON.stringify({ date, startTime, endTime, persons }));
  }, [date, startTime, endTime, persons, SKEY]);

  const isPerPerson = listing.bookingType === "per_person";
  const units = isPerPerson ? (Number(persons) || 1) : 1;
  const subtotal = listing.price * units;
  const fee = Math.max(8, Math.round(subtotal * 0.067));
  const total = subtotal + fee;

  const pillLabel = isPerPerson ? "Per Person" : "Per Hour";
  const priceUnit = isPerPerson ? "/Person" : "/Hr";
  const summaryLabel = isPerPerson
    ? `$${listing.price}/person × ${units} person${units > 1 ? "s" : ""}`
    : `$${listing.price}/hr`;

  const handleReserve = () => {
    const newErrors = {};
    if (!date) { toast.error("Date is required."); newErrors.date = true; }
    if (!startTime) { toast.error("Start time is required."); newErrors.startTime = true; }
    if (isPerPerson && !persons) { toast.error("Number of guests is required."); newErrors.persons = true; }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    const fields = {
      startDate: date, endDate: date, startTime, endTime, dateFrom: date, dateTo: date,
      ...(isPerPerson ? { numberOfGuests: persons || 1, units, guests: `${persons || 1} guest` } : { units: 1 }),
    };
    navigateToConfirm(fields, SKEY);
  };

  return (
    <BookingShell
      title="Book Your Activity" price={listing.price} priceUnit={priceUnit} rating={listing.rating} reviews={listing.reviews}
      topSlot={
        <div className="rounded-[18px] border border-[#4AA7A7] bg-[#D7ECEB] px-4 py-5 text-center relative">
          <CheckBadge />
          <div className="flex flex-col items-center gap-2">
            <span className="text-[#4AA7A7]"><UserOutlineIcon /></span>
            <p className="text-sm font-semibold text-gray-700">{pillLabel}</p>
          </div>
        </div>
      }
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
          onChange={v => {
            setDate(v);
            setErrors(e => ({ ...e, date: false }));
            const valid = availability.some(a => a.date.split("T")[0] === v && a.startTime === startTime && a.isAvailable !== false);
            if (!valid) {
              setStartTime("");
              setEndTime("");
            }
          }}
          placeholder="mm/dd/yyyy"
          availableDates={availableDates}
        />
      </BookingField>

      {/* Start time only */}
      <BookingField icon={<ClockIcon />} error={errors.startTime} errorMessage="Start time is required">
        <TimeDropdown
          value={startTime}
          onChange={v => {
            setStartTime(v);
            setErrors(e => ({ ...e, startTime: false }));
            const slot = availability.find(a => a.date.split("T")[0] === date && a.startTime === v && a.isAvailable !== false);
            if (slot) setEndTime(slot.endTime);
            else setEndTime("");
          }}
          placeholder="Start time"
          options={startTimeOptions}
        />
      </BookingField>


      {/* Guests — only show for per_person */}
      {isPerPerson && (
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
      )}

      {/* Summary */}
      <div className="space-y-2 border-t border-gray-100 pt-4">
        <SummaryLine label={summaryLabel} value={`$${subtotal}`} />
        <SummaryLine label="Service fee" value={`$${fee}`} />
        <SummaryLine label="Total" value={`$${total}`} bold />
      </div>
    </BookingShell>
  );
}

/* ─── Places Booking Card ────────────────────────────────────────────────────── */
function PlacesBookingCard({ listing, listingId }) {
  const SKEY = `booking_places_${listingId}`;
  const saved = (() => { try { return JSON.parse(sessionStorage.getItem(SKEY) || "{}"); } catch { return {}; } })();
  const [mode, setMode] = useState(saved.mode || "hourly");
  const [date, setDate] = useState(saved.date || "");
  const [checkIn, setCheckIn] = useState(saved.checkIn || "");
  const [checkOut, setCheckOut] = useState(saved.checkOut || "");
  const [startTime, setStartTime] = useState(saved.startTime || "");
  const [endTime, setEndTime] = useState(saved.endTime || "");
  const [guests, setGuests] = useState(saved.guests || "");
  const [errors, setErrors] = useState({});
  const navigateToConfirm = useNavigateToConfirm(listing, listingId);

  const availability = listing.availability || [];
  const availableDates = React.useMemo(() => {
    return [...new Set(availability.map(a => a.date.split("T")[0]))];
  }, [availability]);

  // For hourly mode, options for 'date'. For daily mode, options for 'checkIn'.
  const targetDate = mode === "hourly" ? date : checkIn;

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const hour = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "AM" : "PM";
    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const startTimeOptions = React.useMemo(() => {
    if (!targetDate) return [];
    return availability
      .filter(a => a.date.split("T")[0] === targetDate && a.isAvailable !== false)
      .map(a => ({ label: formatTime(a.startTime), value: a.startTime }));
  }, [targetDate, availability]);

  const endTimeOptions = React.useMemo(() => {
    if (!targetDate || !startTime) return [];
    return availability
      .filter(a => a.date.split("T")[0] === targetDate && a.startTime === startTime && a.isAvailable !== false)
      .map(a => ({ label: formatTime(a.endTime), value: a.endTime }));
  }, [targetDate, startTime, availability]);

  useEffect(() => {
    sessionStorage.setItem(SKEY, JSON.stringify({ mode, date, checkIn, checkOut, startTime, endTime, guests }));
  }, [mode, date, checkIn, checkOut, startTime, endTime, guests, SKEY]);

  const hours = startTime && endTime
    ? Math.max(1, Math.round((new Date(`1970-01-01T${endTime}`) - new Date(`1970-01-01T${startTime}`)) / 3600000))
    : 3;
  const days = checkIn && checkOut ? calculateDaysBetween(checkIn, checkOut) : 1;
  const span = mode === "daily" ? days : hours;
  const subtotal = listing.price * span;
  const fee = Math.max(8, Math.round(subtotal * 0.067));
  const total = subtotal + fee;

  const handleReserve = () => {
    const newErrors = {};
    if (mode === "hourly") {
      if (!date) { toast.error("Date is required."); newErrors.date = true; }
      if (!startTime) { toast.error("Start time is required."); newErrors.startTime = true; }
      if (!endTime) { toast.error("End time is required."); newErrors.endTime = true; }
    } else {
      if (!checkIn) { toast.error("Start date is required."); newErrors.checkIn = true; }
      if (!checkOut) { toast.error("End date is required."); newErrors.checkOut = true; }
      if (!startTime) { toast.error("Start time is required."); newErrors.startTime = true; }
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    const from = mode === "hourly" ? date : checkIn;
    const to = mode === "hourly" ? date : checkOut;
    navigateToConfirm({
      pricingMode: mode,
      startDate: from, endDate: to, startTime,
      endTime,
      numberOfGuests: guests || 1, units: span, dateFrom: from, dateTo: to, guests: `${guests || 1} guest`
    }, SKEY);
  };

  return (
    <BookingShell
      title="Book Your Place" price={listing.price} priceUnit={mode === "daily" ? "/Day" : "/Hr"} rating={listing.rating} reviews={listing.reviews}
      topSlot={
        <div className="grid grid-cols-2 gap-3">
          <ModePill active={mode === "hourly"} label="Hourly" icon={<ClockIcon />} onClick={() => setMode("hourly")} />
          <ModePill active={mode === "daily"} label="Daily" icon={<CalendarIcon />} onClick={() => setMode("daily")} />
        </div>
      }
      reserveButton={
        <button
          onClick={handleReserve}
          className="w-full py-4 rounded-full bg-[#FEB538] hover:bg-[#e0b430] text-sm font-bold text-gray-900 transition-colors"
        >
          Reserve
        </button>
      }
    >
      {mode === "hourly" ? (
        /* Hourly: single date + start/end time */
        <>
          <BookingField icon={<CalendarIcon />} error={errors.date} errorMessage="Date is required">
            <CalendarDropdown
              value={date}
              onChange={v => {
                setDate(v);
                setErrors(e => ({ ...e, date: false }));
                const valid = availability.some(a => a.date.split("T")[0] === v && a.startTime === startTime && a.isAvailable !== false);
                if (!valid) {
                  setStartTime("");
                  setEndTime("");
                }
              }}
              placeholder="Select date"
              availableDates={availableDates}
            />
          </BookingField>
          <TimeRangeField
            startTime={startTime}
            setStartTime={v => {
              setStartTime(v);
              setErrors(e => ({ ...e, startTime: false }));
              const slot = availability.find(a => a.date.split("T")[0] === targetDate && a.startTime === v && a.isAvailable !== false);
              if (slot) setEndTime(slot.endTime);
              else setEndTime("");
            }}
            endTime={endTime} setEndTime={v => { setEndTime(v); setErrors(e => ({ ...e, endTime: false })); }}
            startError={errors.startTime} endError={errors.endTime}
            startOptions={startTimeOptions}
            endOptions={endTimeOptions}
          />
        </>
      ) : (
        /* Daily: start date | end date + start time only */
        <>
          <div className="flex gap-3">
            <div className={`flex-1 flex items-center gap-2 rounded-full border bg-white px-3 py-3 ${errors.checkIn ? "border-red-400" : "border-gray-200"}`}>
              <span className="shrink-0"><CalendarIcon /></span>
              <CalendarDropdown
                value={checkIn}
                onChange={v => {
                  setCheckIn(v);
                  setErrors(e => ({ ...e, checkIn: false }));
                  const valid = availability.some(a => a.date.split("T")[0] === v && a.startTime === startTime && a.isAvailable !== false);
                  if (!valid) {
                    setStartTime("");
                    setEndTime("");
                  }
                }}
                placeholder="Start date"
                availableDates={availableDates}
              />
            </div>
            <div className={`flex-1 flex items-center gap-2 rounded-full border bg-white px-3 py-3 ${errors.checkOut ? "border-red-400" : "border-gray-200"}`}>
              <span className="shrink-0"><CalendarIcon /></span>
              <CalendarDropdown value={checkOut} onChange={v => { setCheckOut(v); setErrors(e => ({ ...e, checkOut: false })); }} placeholder="End date" align="right" availableDates={availableDates} />
            </div>
          </div>
          {(errors.checkIn || errors.checkOut) && (
            <div className="flex gap-3 -mt-3">
              {errors.checkIn && <p className="flex-1 text-[10px] text-red-500 pl-3">Start date required</p>}
              {errors.checkOut && <p className="flex-1 text-[10px] text-red-500 pl-3">End date required</p>}
            </div>
          )}
          <BookingField icon={<ClockIcon />} error={errors.startTime} errorMessage="Start time is required">
            <TimeDropdown
              value={startTime}
              onChange={v => {
                setStartTime(v);
                setErrors(e => ({ ...e, startTime: false }));
                const slot = availability.find(a => a.date.split("T")[0] === targetDate && a.startTime === v && a.isAvailable !== false);
                if (slot) setEndTime(slot.endTime);
                else setEndTime("");
              }}
              placeholder="Start time"
              options={startTimeOptions}
            />
          </BookingField>
        </>
      )}



      {/* Guests */}
      <BookingField icon={<UserOutlineIcon />} error={errors.guests} errorMessage="Number of guests is required">
        <input
          type="number"
          min="1"
          value={guests}
          placeholder="Select guest number"
          onChange={e => { setGuests(e.target.value); setErrors(err => ({ ...err, guests: false })); }}
          className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none placeholder:text-gray-400"
        />
      </BookingField>

      {/* Summary */}
      <div className="space-y-2 border-t border-gray-100 pt-4">
        <SummaryLine label={`$${listing.price}/${mode === "daily" ? "day" : "hr"} × ${span} ${mode === "daily" ? "day" : "hour"}${span > 1 ? "s" : ""}`} value={`$${subtotal}`} />
        <SummaryLine label="Service fee" value={`$${fee}`} />
        <SummaryLine label="Total" value={`$${total}`} bold />
      </div>
    </BookingShell>
  );
}

/* ─── Equipment Booking Card ─────────────────────────────────────────────────── */
function EquipmentBookingCard({ listing, listingId }) {
  const SKEY = `booking_equipment_${listingId}`;
  const saved = (() => { try { return JSON.parse(sessionStorage.getItem(SKEY) || "{}"); } catch { return {}; } })();
  const [mode, setMode] = useState(saved.mode || "hourly");
  const [date, setDate] = useState(saved.date || "");
  const [checkIn, setCheckIn] = useState(saved.checkIn || "");
  const [checkOut, setCheckOut] = useState(saved.checkOut || "");
  const [startTime, setStartTime] = useState(saved.startTime || "");
  const [endTime, setEndTime] = useState(saved.endTime || "");
  const [guests, setGuests] = useState(saved.guests || "");
  const [errors, setErrors] = useState({});
  const navigateToConfirm = useNavigateToConfirm(listing, listingId);

  const availability = listing.availability || [];
  const availableDates = React.useMemo(() => {
    return [...new Set(availability.map(a => a.date.split("T")[0]))];
  }, [availability]);

  // For hourly mode, options for 'date'. For daily mode, options for 'checkIn'.
  const targetDate = mode === "hourly" ? date : checkIn;

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const hour = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "AM" : "PM";
    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const startTimeOptions = React.useMemo(() => {
    if (!targetDate) return [];
    return availability
      .filter(a => a.date.split("T")[0] === targetDate && a.isAvailable !== false)
      .map(a => ({ label: formatTime(a.startTime), value: a.startTime }));
  }, [targetDate, availability]);

  const endTimeOptions = React.useMemo(() => {
    if (!targetDate || !startTime) return [];
    return availability
      .filter(a => a.date.split("T")[0] === targetDate && a.startTime === startTime && a.isAvailable !== false)
      .map(a => ({ label: formatTime(a.endTime), value: a.endTime }));
  }, [targetDate, startTime, availability]);

  useEffect(() => {
    sessionStorage.setItem(SKEY, JSON.stringify({ mode, date, checkIn, checkOut, startTime, endTime, guests }));
  }, [mode, date, checkIn, checkOut, startTime, endTime, guests, SKEY]);

  const hours = startTime && endTime
    ? Math.max(1, Math.round((new Date(`1970-01-01T${endTime}`) - new Date(`1970-01-01T${startTime}`)) / 3600000))
    : 3;
  const days = checkIn && checkOut ? calculateDaysBetween(checkIn, checkOut) : 1;
  const span = mode === "daily" ? days : hours;
  const subtotal = listing.price * span;
  const fee = Math.max(8, Math.round(subtotal * 0.067));
  const total = subtotal + fee;

  const handleReserve = () => {
    const newErrors = {};
    if (mode === "hourly") {
      if (!date) { toast.error("Date is required."); newErrors.date = true; }
      if (!startTime) { toast.error("Start time is required."); newErrors.startTime = true; }
      if (!endTime) { toast.error("End time is required."); newErrors.endTime = true; }
    } else {
      if (!checkIn) { toast.error("Start date is required."); newErrors.checkIn = true; }
      if (!checkOut) { toast.error("End date is required."); newErrors.checkOut = true; }
      if (!startTime) { toast.error("Start time is required."); newErrors.startTime = true; }
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    const from = mode === "hourly" ? date : checkIn;
    const to = mode === "hourly" ? date : checkOut;
    // For daily mode, end time equals start time (billing is per-day, not per-hour)
    const resolvedEndTime = mode === "daily" ? startTime : endTime;
    navigateToConfirm({
      pricingMode: mode,
      startDate: from, endDate: to, startTime,
      endTime: resolvedEndTime,
      numberOfGuests: guests || 1,
      units: span, dateFrom: from, dateTo: to,
      guests: `${guests || 1} guest`,
    }, SKEY);
  };

  return (
    <BookingShell
      title="Book Your Equipment" price={listing.price} priceUnit={mode === "daily" ? "/Day" : "/Hr"} rating={listing.rating} reviews={listing.reviews}
      topSlot={
        <div className="grid grid-cols-2 gap-3">
          <ModePill active={mode === "hourly"} label="Hourly" icon={<ClockIcon />} onClick={() => setMode("hourly")} />
          <ModePill active={mode === "daily"} label="Daily" icon={<CalendarIcon />} onClick={() => setMode("daily")} />
        </div>
      }
      reserveButton={
        <button
          onClick={handleReserve}
          className="w-full py-4 rounded-full bg-[#FEB538] hover:bg-[#e0b430] text-sm font-bold text-gray-900 transition-colors"
        >
          Reserve
        </button>
      }
    >
      {mode === "hourly" ? (
        /* Hourly: single date + start/end time */
        <>
          <BookingField icon={<CalendarIcon />} error={errors.date} errorMessage="Date is required">
            <CalendarDropdown
              value={date}
              onChange={v => {
                setDate(v);
                setErrors(e => ({ ...e, date: false }));
                const valid = availability.some(a => a.date.split("T")[0] === v && a.startTime === startTime && a.isAvailable !== false);
                if (!valid) {
                  setStartTime("");
                  setEndTime("");
                }
              }}
              placeholder="Select date"
              availableDates={availableDates}
            />
          </BookingField>
          <TimeRangeField
            startTime={startTime}
            setStartTime={v => {
              setStartTime(v);
              setErrors(e => ({ ...e, startTime: false }));
              const slot = availability.find(a => a.date.split("T")[0] === targetDate && a.startTime === v && a.isAvailable !== false);
              if (slot) setEndTime(slot.endTime);
              else setEndTime("");
            }}
            endTime={endTime} setEndTime={v => { setEndTime(v); setErrors(e => ({ ...e, endTime: false })); }}
            startError={errors.startTime} endError={errors.endTime}
            startOptions={startTimeOptions}
            endOptions={endTimeOptions}
          />
        </>
      ) : (
        /* Daily: start date | end date + start time only */
        <>
          <div className="flex gap-3">
            <div className={`flex-1 flex items-center gap-2 rounded-full border bg-white px-3 py-3 ${errors.checkIn ? "border-red-400" : "border-gray-200"}`}>
              <span className="shrink-0"><CalendarIcon /></span>
              <CalendarDropdown
                value={checkIn}
                onChange={v => {
                  setCheckIn(v);
                  setErrors(e => ({ ...e, checkIn: false }));
                  const valid = availability.some(a => a.date.split("T")[0] === v && a.startTime === startTime && a.isAvailable !== false);
                  if (!valid) {
                    setStartTime("");
                    setEndTime("");
                  }
                }}
                placeholder="Start date"
                availableDates={availableDates}
              />
            </div>
            <div className={`flex-1 flex items-center gap-2 rounded-full border bg-white px-3 py-3 ${errors.checkOut ? "border-red-400" : "border-gray-200"}`}>
              <span className="shrink-0"><CalendarIcon /></span>
              <CalendarDropdown value={checkOut} onChange={v => { setCheckOut(v); setErrors(e => ({ ...e, checkOut: false })); }} placeholder="End date" align="right" availableDates={availableDates} />
            </div>
          </div>
          {(errors.checkIn || errors.checkOut) && (
            <div className="flex gap-3 -mt-3">
              {errors.checkIn && <p className="flex-1 text-[10px] text-red-500 pl-3">Start date required</p>}
              {errors.checkOut && <p className="flex-1 text-[10px] text-red-500 pl-3">End date required</p>}
            </div>
          )}
          <BookingField icon={<ClockIcon />} error={errors.startTime} errorMessage="Start time is required">
            <TimeDropdown
              value={startTime}
              onChange={v => {
                setStartTime(v);
                setErrors(e => ({ ...e, startTime: false }));
                // Daily mode: end time = start time (same pickup time each day)
                setEndTime(v);
              }}
              placeholder="Start time"
              options={startTimeOptions}
            />
          </BookingField>
        </>
      )}

      {/* Guests */}
      <BookingField icon={<UserOutlineIcon />} error={errors.guests} errorMessage="Number of guests is required">
        <input
          type="number"
          min="1"
          value={guests}
          placeholder="Select guest number"
          onChange={e => { setGuests(e.target.value); setErrors(err => ({ ...err, guests: false })); }}
          className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-900 focus:outline-none placeholder:text-gray-400 min-w-0"
        />
      </BookingField>

      {/* Summary */}
      <div className="space-y-2 border-t border-gray-100 pt-4">
        <SummaryLine label={`$${listing.price}/${mode === "daily" ? "day" : "hr"} × ${span} ${mode === "daily" ? "day" : "hour"}${span > 1 ? "s" : ""}`} value={`$${subtotal}`} />
        <SummaryLine label="Service fee" value={`$${fee}`} />
        <SummaryLine label="Total" value={`$${total}`} bold />
      </div>
    </BookingShell>
  );
}

/* ─── Reviews Section ────────────────────────────────────────────────────────── */
const HARDCODED_REVIEWS = [
  {
    text: "Lorem ipsum dolor sit amet consectetur. Lacinia hendrerit tempus viverra quam. Iaculis nisl sed ipsum augue neque at donec nulla egestas. Etiam rhoncus id et viverra dictum enim leo. Vulputate sit pharetra non cras. In at aenean habitant maecenas. Velit ornare tempus ante leo urna.",
    name: "Alex",
    date: "September 2023",
    avatar: "https://i.pravatar.cc/80?img=11",
  },
  {
    text: "Lorem ipsum dolor sit amet consectetur. Lacinia hendrerit tempus viverra quam. Iaculis nisl sed ipsum augue neque at donec nulla egestas. Etiam rhoncus id et viverra dictum enim leo. Vulputate sit pharetra non cras. In at aenean habitant maecenas. Velit ornare tempus ante leo urna.",
    name: "Alexandrea",
    date: "September 2023",
    avatar: "https://i.pravatar.cc/80?img=5",
  },
  {
    text: "Lorem ipsum dolor sit amet consectetur. Lacinia hendrerit tempus viverra quam. Iaculis nisl sed ipsum augue neque at donec nulla egestas. Etiam rhoncus id et viverra dictum enim leo. Vulputate sit pharetra non cras. In at aenean habitant maecenas. Velit ornare tempus ante leo urna.",
    name: "Ana de",
    date: "September 2023",
    avatar: "https://i.pravatar.cc/80?img=9",
  },
  {
    text: "Lorem ipsum dolor sit amet consectetur. Lacinia hendrerit tempus viverra quam. Iaculis nisl sed ipsum augue neque at donec nulla egestas. Etiam rhoncus id et viverra dictum enim leo. Vulputate sit pharetra non cras. In at aenean habitant maecenas. Velit ornare tempus ante leo urna.",
    name: "James",
    date: "October 2023",
    avatar: "https://i.pravatar.cc/80?img=12",
  },
  {
    text: "Lorem ipsum dolor sit amet consectetur. Lacinia hendrerit tempus viverra quam. Iaculis nisl sed ipsum augue neque at donec nulla egestas. Etiam rhoncus id et viverra dictum enim leo. Vulputate sit pharetra non cras. In at aenean habitant maecenas. Velit ornare tempus ante leo urna.",
    name: "Maria",
    date: "October 2023",
    avatar: "https://i.pravatar.cc/80?img=20",
  },
  {
    text: "Lorem ipsum dolor sit amet consectetur. Lacinia hendrerit tempus viverra quam. Iaculis nisl sed ipsum augue neque at donec nulla egestas. Etiam rhoncus id et viverra dictum enim leo. Vulputate sit pharetra non cras. In at aenean habitant maecenas. Velit ornare tempus ante leo urna.",
    name: "Lucas",
    date: "November 2023",
    avatar: "https://i.pravatar.cc/80?img=7",
  },
];

const REVIEWS_PER_PAGE_DESKTOP = 3;
const REVIEWS_PER_PAGE_MOBILE = 1;

function ReviewsSection() {
  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const perPage = isMobile ? REVIEWS_PER_PAGE_MOBILE : REVIEWS_PER_PAGE_DESKTOP;
  const totalPages = Math.ceil(HARDCODED_REVIEWS.length / perPage);
  const visible = HARDCODED_REVIEWS.slice(page * perPage, page * perPage + perPage);

  const prev = () => setPage(p => Math.max(0, p - 1));
  const next = () => setPage(p => Math.min(totalPages - 1, p + 1));

  return (
    <div className="mt-6 rounded-[22px] border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={page === 0}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${page === 0 ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-500 hover:border-[#4AA7A7] hover:text-[#4AA7A7]"}`}
          >
            <ChevronDownIcon size={16} className="rotate-90" />
          </button>
          <button
            onClick={next}
            disabled={page >= totalPages - 1}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${page >= totalPages - 1 ? "border border-gray-200 text-gray-300" : "bg-[#4AA7A7] text-white hover:bg-[#3d9090]"}`}
          >
            <ChevronDownIcon size={16} className="-rotate-90" />
          </button>
        </div>
      </div>

      {/* Review cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {visible.map((r, i) => (
          <div key={i} className="flex flex-col gap-4">
            <p className="text-sm text-gray-500 leading-7">{r.text}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#228E8A] flex items-center justify-center shrink-0 text-white font-bold text-sm">
                {r.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{r.name}</p>
                <p className="text-xs text-gray-400">{r.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dot pagination */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`rounded-full transition-all ${i === page ? "w-6 h-2.5 bg-[#F5C842]" : "w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300"}`}
          />
        ))}
      </div>
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const params = React.use(paramsPromise);
  const rawId = params?.id;
  const urlType = searchParams.get("type");

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
  const [wishlisted, setWishlisted] = useState(false);
  const [contactingHost, setContactingHost] = useState(false);

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
              onClick={() => setWishlisted(w => !w)}
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
            {(listing.type === "places"    || listing.type === "place")     && <PlacesBookingCard    listing={listing} listingId={rawId} />}
            {listing.type === "equipment"  && <EquipmentBookingCard listing={listing} listingId={rawId} />}
            {(listing.type === "activities" || listing.type === "activity") && <ActivityBookingCard listing={listing} listingId={rawId} />}
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
        <ReviewsSection />

      </main>

      <AppFooter />
    </div>
  );
}
