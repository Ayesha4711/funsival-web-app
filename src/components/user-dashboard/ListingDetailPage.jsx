"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import NewsletterSection from "@/components/landing/NewsletterSection";
import LandingFooter from "@/components/landing/LandingFooter";

/* ─── Mock data keyed by listing id ─────────────────────────────────────────── */
const LISTINGS_DATA = {
  1: {
    type: "places",
    title: "Private Hot Tub, Zion Canyon Views",
    location: "New York, Japan",
    rating: 4.8,
    reviews: 279,
    price: 450,
    priceUnit: "/night",
    images: [
      "https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=800&q=80",
      "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=400&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
      "https://images.unsplash.com/photo-1542382257-80dedb977b0d?w=400&q=80",
    ],
    host: { name: "Sarah Brown", avatar: "https://i.pravatar.cc/60?img=47", joinDate: "January 2021", responseRate: "98%", responseTime: "within an hour" },
    details: { placeType: "Entire Pool", location: "New York", floorType: "Tile" },
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
    amenities: ["Pool", "WiFi", "Parking", "Hot Tub", "Air Conditioning", "Kitchen"],
    cancellationPolicy: "Free cancellation within 48 hours of booking.",
    requirements: "Minimum age 18. Valid ID required.",
    mapLat: 40.7128,
    mapLng: -74.0060,
    reviews_list: [
      { name: "Amy", avatar: "https://i.pravatar.cc/40?img=1", rating: 5, text: "Amazing place! Absolutely loved the views and the hot tub was perfect. Host was super responsive and helpful." },
      { name: "Alejandro Pro", avatar: "https://i.pravatar.cc/40?img=3", rating: 4, text: "Great experience overall. The pool area was clean and well maintained. Would definitely come back!" },
      { name: "Ana Mo", avatar: "https://i.pravatar.cc/40?img=5", rating: 5, text: "Stunning views and a beautiful pool. Perfect weekend getaway. Highly recommend!" },
    ],
  },
  2: {
    type: "activities",
    title: "Scuba Diving",
    location: "Tokyo, Japan",
    rating: 4.5,
    reviews: 74,
    price: 299,
    priceUnit: "/person",
    images: [
      "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=800&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80",
    ],
    host: { name: "Kevin Brown", avatar: "https://i.pravatar.cc/60?img=12", joinDate: "March 2020", responseRate: "95%", responseTime: "within 2 hours" },
    details: { activityTitle: "Scuba Diving", location: "Tokyo Bay", duration: "3 Hours", maxParticipants: "10" },
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scuba diving adventure in the crystal clear waters of Tokyo Bay. Our certified instructors ensure maximum safety and enjoyment. All equipment provided. Suitable for beginners and experienced divers alike.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
    includes: ["All diving equipment", "Certified instructor", "Underwater photos", "Safety briefing", "Light refreshments"],
    cancellationPolicy: "Full refund if cancelled 72 hours before activity.",
    requirements: "Must be able to swim. Minimum age 16.",
    mapLat: 35.6762,
    mapLng: 139.6503,
    reviews_list: [
      { name: "Amy", avatar: "https://i.pravatar.cc/40?img=1", rating: 5, text: "Incredible experience! The instructor was amazing and the underwater views were breathtaking." },
      { name: "Alex", avatar: "https://i.pravatar.cc/40?img=7", rating: 4, text: "Very well organized. Safety was prioritized throughout. Great for beginners!" },
    ],
  },
  3: {
    type: "equipment",
    title: "Dirt Bike",
    location: "Tokyo, Japan",
    rating: 4.5,
    reviews: 74,
    price: 150,
    priceUnit: "/day",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    ],
    host: { name: "Kevin Brown", avatar: "https://i.pravatar.cc/60?img=12", joinDate: "June 2019", responseRate: "92%", responseTime: "within 3 hours" },
    details: { equipmentType: "Dirt Bike", location: "Tokyo", availableQty: "3 Units" },
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. High-performance dirt bikes available for rent by the day or week. All bikes are regularly maintained and serviced. Helmets and protective gear included.\n\nPerfect for off-road adventures and trail riding. Suitable for experienced riders. Delivery available within 20km radius.",
    includes: ["Helmet", "Gloves", "Knee pads", "Trail map", "24/7 roadside support"],
    cancellationPolicy: "50% refund if cancelled 24 hours before rental start.",
    requirements: "Valid motorcycle license required. Minimum age 21.",
    mapLat: 35.6762,
    mapLng: 139.6503,
    reviews_list: [
      { name: "Amy", avatar: "https://i.pravatar.cc/40?img=1", rating: 5, text: "Excellent bikes in perfect condition. The trail recommendations were spot on!" },
      { name: "Mark", avatar: "https://i.pravatar.cc/40?img=8", rating: 4, text: "Great rental experience. Bike was powerful and well-maintained." },
    ],
  },
};

/* fallback for any id not in the map */
const FALLBACK = LISTINGS_DATA[1];

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const StarIcon = ({ filled }) => (
  <svg className={`w-4 h-4 ${filled ? "text-[#F5C842] fill-current" : "text-gray-300 fill-current"}`} viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const StarRating = ({ rating, size = "sm" }) => (
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

const CheckIcon = () => (
  <svg className="w-4 h-4 text-[#4AA7A7]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

/* ─── Navbar (same as explore) ───────────────────────────────────────────────── */
function DetailNavbar() {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 w-full bg-[#4AA7A7] shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          <Link href="/user-dashboard/explore" className="flex items-center gap-2 shrink-0">
            <svg className="w-7 h-7 text-[#F5C842]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-xl font-bold text-white hidden sm:inline">funsival</span>
          </Link>
          <div className="flex-1 max-w-xl mx-2 sm:mx-4">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search here" className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none w-full" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 text-white text-sm font-medium">
              User <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </div>
            <button className="w-9 h-9 rounded-full bg-[#F5C842] flex items-center justify-center text-gray-900 font-bold text-sm border-2 border-white/40">U</button>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ─── Image Gallery ──────────────────────────────────────────────────────────── */
function ImageGallery({ images, title }) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {/* Main image */}
      <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: "clamp(200px, 40vw, 420px)" }}>
        <img src={images[active]} alt={title} className="w-full h-full object-cover" />
      </div>
      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border-2 transition-all ${i === active ? "border-[#4AA7A7]" : "border-transparent"}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Booking Card (Places) ──────────────────────────────────────────────────── */
function PlacesBookingCard({ listing }) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 1;
  const subtotal = listing.price * nights;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-2xl font-extrabold text-gray-900">${listing.price}</span>
          <span className="text-sm text-gray-400 ml-1">{listing.priceUnit}</span>
        </div>
        <div className="flex items-center gap-1">
          <StarRating rating={listing.rating} />
          <span className="text-xs text-gray-500 ml-1">{listing.reviews} Reviews</span>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <div className="p-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Check-In</p>
            <input type="date" className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
          </div>
          <div className="p-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Check-Out</p>
            <input type="date" className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
          </div>
        </div>
        <div className="p-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Guests</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setGuests(g => Math.max(1, g - 1))} className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 font-bold text-lg flex items-center justify-center hover:border-[#4AA7A7]">-</button>
            <span className="text-sm font-bold text-gray-900 w-4 text-center">{guests}</span>
            <button onClick={() => setGuests(g => g + 1)} className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 font-bold text-lg flex items-center justify-center hover:border-[#4AA7A7]">+</button>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push(`/user-dashboard/confirm-and-pay?title=${encodeURIComponent(listing.title)}&image=${encodeURIComponent(listing.images[0])}&dateFrom=${encodeURIComponent(checkIn || "Nov 26")}&dateTo=${encodeURIComponent(checkOut || "Dec 01")}&guests=${encodeURIComponent(guests + " guest")}&pricePerUnit=${listing.price}&hours=${nights * 24}&funsivalFee=30`)}
        className="w-full py-3.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-bold rounded-xl text-sm transition-colors"
      >Reserve</button>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">${listing.price} × {nights} night{nights > 1 ? "s" : ""}</span><span className="font-semibold">${subtotal}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Service fee</span><span className="font-semibold">${serviceFee}</span></div>
        <div className="flex justify-between pt-2 border-t border-gray-100 font-bold"><span>Total</span><span>${total}</span></div>
      </div>
    </div>
  );
}

/* ─── Booking Card (Equipment) ───────────────────────────────────────────────── */
function EquipmentBookingCard({ listing }) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [qty, setQty] = useState(1);
  const days = startDate && endDate
    ? Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / 86400000))
    : 1;
  const subtotal = listing.price * days * qty;
  const fee = Math.round(subtotal * 0.08);
  const total = subtotal + fee;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-2xl font-extrabold text-gray-900">${listing.price}</span>
          <span className="text-sm text-gray-400 ml-1">{listing.priceUnit}</span>
        </div>
        <div className="flex items-center gap-1">
          <StarRating rating={listing.rating} />
          <span className="text-xs text-gray-500 ml-1">{listing.reviews} Reviews</span>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <div className="p-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Start Date</p>
            <input type="date" className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="p-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">End Date</p>
            <input type="date" className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="p-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Quantity</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 font-bold text-lg flex items-center justify-center hover:border-[#4AA7A7]">-</button>
            <span className="text-sm font-bold text-gray-900 w-4 text-center">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 font-bold text-lg flex items-center justify-center hover:border-[#4AA7A7]">+</button>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push(`/user-dashboard/confirm-and-pay?title=${encodeURIComponent(listing.title)}&image=${encodeURIComponent(listing.images[0])}&dateFrom=${encodeURIComponent(startDate || "Nov 26")}&dateTo=${encodeURIComponent(endDate || "Dec 01")}&guests=${encodeURIComponent(qty + " unit")}&pricePerUnit=${listing.price}&hours=${days * 24}&funsivalFee=30`)}
        className="w-full py-3.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-bold rounded-xl text-sm transition-colors"
      >Reserve</button>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">${listing.price} × {days} day{days > 1 ? "s" : ""} × {qty}</span><span className="font-semibold">${subtotal}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Processing fee</span><span className="font-semibold">${fee}</span></div>
        <div className="flex justify-between pt-2 border-t border-gray-100 font-bold"><span>Total</span><span>${total}</span></div>
      </div>
    </div>
  );
}

/* ─── Booking Card (Activities) ──────────────────────────────────────────────── */
function ActivityBookingCard({ listing }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [persons, setPersons] = useState(1);
  const subtotal = listing.price * persons;
  const fee = Math.round(subtotal * 0.1);
  const total = subtotal + fee;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-2xl font-extrabold text-gray-900">${listing.price}</span>
          <span className="text-sm text-gray-400 ml-1">{listing.priceUnit}</span>
        </div>
        <div className="flex items-center gap-1">
          <StarRating rating={listing.rating} />
          <span className="text-xs text-gray-500 ml-1">{listing.reviews} Reviews</span>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
        <div className="p-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Date</p>
          <input type="date" className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="p-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Persons</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setPersons(p => Math.max(1, p - 1))} className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 font-bold text-lg flex items-center justify-center hover:border-[#4AA7A7]">-</button>
            <span className="text-sm font-bold text-gray-900 w-4 text-center">{persons}</span>
            <button onClick={() => setPersons(p => p + 1)} className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 font-bold text-lg flex items-center justify-center hover:border-[#4AA7A7]">+</button>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push(`/user-dashboard/confirm-and-pay?title=${encodeURIComponent(listing.title)}&image=${encodeURIComponent(listing.images[0])}&dateFrom=${encodeURIComponent(date || "Nov 26")}&dateTo=${encodeURIComponent(date || "Nov 26")}&guests=${encodeURIComponent(persons + " person")}&pricePerUnit=${listing.price}&hours=${persons}&funsivalFee=30`)}
        className="w-full py-3.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-bold rounded-xl text-sm transition-colors"
      >Reserve</button>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">${listing.price} × {persons} person{persons > 1 ? "s" : ""}</span><span className="font-semibold">${subtotal}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Service fee</span><span className="font-semibold">${fee}</span></div>
        <div className="flex justify-between pt-2 border-t border-gray-100 font-bold"><span>Total</span><span>${total}</span></div>
      </div>
    </div>
  );
}

/* ─── Static Map Placeholder ─────────────────────────────────────────────────── */
function StaticMap({ listing }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100" style={{ height: "clamp(200px, 30vw, 340px)" }}>
      <img
        src={`https://maps.googleapis.com/maps/api/staticmap?center=${listing.mapLat},${listing.mapLng}&zoom=12&size=800x340&markers=color:red%7C${listing.mapLat},${listing.mapLng}&key=DEMO`}
        alt="Map"
        className="w-full h-full object-cover"
        onError={e => { e.target.style.display = "none"; }}
      />
      {/* Fallback visual map */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-50 to-green-200 flex items-center justify-center">
        <div className="relative">
          {/* Grid lines for map feel */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "linear-gradient(#4AA7A7 1px, transparent 1px), linear-gradient(90deg, #4AA7A7 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            width: "800px", height: "340px", left: "-400px", top: "-170px"
          }} />
          {/* Pin */}
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white z-10 relative">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          {/* Popup card on map */}
          <div className="absolute -top-24 left-6 bg-white rounded-xl shadow-lg p-3 w-40 z-20">
            <img src={listing.images[0]} alt="" className="w-full h-16 object-cover rounded-lg mb-2" />
            <p className="text-xs font-bold text-gray-900 line-clamp-1">{listing.title}</p>
            <div className="flex items-center gap-1 mt-1">
              <LocationPinIcon />
              <span className="text-[10px] text-gray-500">{listing.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
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

/* ─── Mobile sticky booking bar ──────────────────────────────────────────────── */
function MobileStickyBar({ listing }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-xl font-extrabold text-gray-900">${listing.price}</span>
          <span className="text-sm text-gray-400 ml-1">{listing.priceUnit}</span>
        </div>
        <button onClick={() => setOpen(true)} className="px-6 py-2.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-bold rounded-xl text-sm transition-colors">
          Book Your {listing.type === "places" ? "Place" : listing.type === "equipment" ? "Equipment" : "Activity"}
        </button>
      </div>

      {/* Mobile booking sheet */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setOpen(false)}>
          <div className="bg-black/40 absolute inset-0" />
          <div className="relative bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            {listing.type === "places" && <PlacesBookingCard listing={listing} />}
            {listing.type === "equipment" && <EquipmentBookingCard listing={listing} />}
            {listing.type === "activities" && <ActivityBookingCard listing={listing} />}
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
export default function ListingDetailPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = parseInt(params?.id) || 1;

  // Use URL type param to override listing type so any card navigates correctly
  const urlType = searchParams.get("type"); // 'places' | 'equipment' | 'activities'
  const baseListing = LISTINGS_DATA[id] || FALLBACK;

  // Map correct mock data by type when the id doesn't match exactly
  const typeToId = { places: 1, equipment: 3, activities: 2 };
  const resolvedId = urlType && !LISTINGS_DATA[id] ? (typeToId[urlType] || id) : id;
  const resolvedListing = LISTINGS_DATA[resolvedId] || FALLBACK;
  const listing = urlType ? { ...resolvedListing, type: urlType } : resolvedListing;

  const bookingTitle = listing.type === "places" ? "Book Your Place" : listing.type === "equipment" ? "Book Your Equipment" : "Book Your Activity";

  return (
    <div className="flex flex-col bg-gray-50 pb-20 lg:pb-0">

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-[#4AA7A7] transition-colors">
            <BackIcon /> Back
          </button>
          <span>/</span>
          <span className="capitalize">{listing.type}</span>
          <span>/</span>
          <span className="text-gray-700 font-medium line-clamp-1">{listing.title}</span>
        </div>

        {/* Title row (mobile + tablet) */}
        <div className="lg:hidden mb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1">{listing.title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <StarRating rating={listing.rating} />
              <span className="text-sm text-gray-500 ml-1">{listing.reviews} Reviews</span>
            </div>
            <div className="flex items-center gap-1">
              <LocationPinIcon />
              <span className="text-sm text-gray-500">{listing.location}</span>
            </div>
          </div>
        </div>

        {/* Two-column layout on desktop */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── Left column ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Gallery */}
            <ImageGallery images={listing.images} title={listing.title} />

            {/* Title row (desktop only) */}
            <div className="hidden lg:block">
              <h1 className="text-2xl xl:text-3xl font-extrabold text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <StarRating rating={listing.rating} />
                  <span className="text-sm text-gray-500 ml-1">{listing.reviews} Reviews</span>
                </div>
                <div className="flex items-center gap-1">
                  <LocationPinIcon />
                  <span className="text-sm text-gray-500">{listing.location}</span>
                </div>
              </div>
            </div>

            {/* Host row */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <img src={listing.host.avatar} alt={listing.host.name} className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold text-gray-900">{listing.host.name}</p>
                  <p className="text-xs text-gray-400">Host since {listing.host.joinDate}</p>
                </div>
              </div>
              <button className="px-4 py-2 border border-[#4AA7A7] text-[#4AA7A7] rounded-full text-xs font-bold hover:bg-[#4AA7A7] hover:text-white transition-colors">
                Contact Host
              </button>
            </div>

            {/* Details section */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 flex flex-col gap-4">
              <h2 className="text-base font-extrabold text-gray-900">Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.entries(listing.details).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                    <p className="text-sm font-bold text-gray-900">{val}</p>
                  </div>
                ))}
              </div>

              {/* Amenities / Includes tags */}
              {(listing.amenities || listing.includes) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
                  {(listing.amenities || listing.includes).map((item) => (
                    <span key={item} className="px-3 py-1.5 bg-[#F5C842]/20 text-yellow-700 text-xs font-semibold rounded-full">{item}</span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="pt-2 border-t border-gray-50">
                <h3 className="text-sm font-extrabold text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>

              {/* Cancellation */}
              <div className="pt-2 border-t border-gray-50">
                <h3 className="text-sm font-extrabold text-gray-900 mb-1">Cancellation Policy</h3>
                <p className="text-sm text-gray-500">{listing.cancellationPolicy}</p>
              </div>

              {/* Requirements */}
              <div className="pt-2 border-t border-gray-50">
                <h3 className="text-sm font-extrabold text-gray-900 mb-1">Requirements</h3>
                <p className="text-sm text-gray-500">{listing.requirements}</p>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 flex flex-col gap-3">
              <h2 className="text-base font-extrabold text-gray-900">Location</h2>
              <StaticMap listing={listing} />
              <div className="flex items-center gap-2">
                <LocationPinIcon />
                <span className="text-sm text-gray-600 font-medium">{listing.location}</span>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-gray-900">Reviews</h2>
                <div className="flex items-center gap-1.5">
                  <StarRating rating={listing.rating} />
                  <span className="text-sm font-bold text-gray-700">{listing.rating}</span>
                  <span className="text-sm text-gray-400">({listing.reviews})</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                {listing.reviews_list.map((r, i) => <ReviewCard key={i} review={r} />)}
              </div>
              <button className="text-[#4AA7A7] text-sm font-bold hover:underline self-start">Show all reviews</button>
            </div>

          </div>

          {/* ── Right column: booking card (desktop only) ── */}
          <div className="hidden lg:block w-80 xl:w-96 shrink-0">
            <div className="sticky top-24">
              <h3 className="text-base font-extrabold text-gray-900 mb-3">{bookingTitle}</h3>
              {listing.type === "places" && <PlacesBookingCard listing={listing} />}
              {listing.type === "equipment" && <EquipmentBookingCard listing={listing} />}
              {listing.type === "activities" && <ActivityBookingCard listing={listing} />}
            </div>
          </div>

        </div>
      </main>

      <NewsletterSection />
      <LandingFooter />

      {/* Mobile sticky CTA */}
      <MobileStickyBar listing={listing} />
    </div>
  );
}
