"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserDashboardShell from "@/components/user-dashboard/UserDashboardShell";
import NewsletterSection from "@/components/landing/NewsletterSection";
import LandingFooter from "@/components/landing/LandingFooter";

/* ─── Mock Data ──────────────────────────────────────────────────────────────── */
const RESERVATIONS = [
  {
    id: 1,
    confirmationNo: "24533263",
    title: "Swimming Pool",
    status: "completed",
    image: "https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=400&q=80",
    dates: "Jul 31",
    guests: "2 Adults, 1 Child",
    totalPrice: "$1,300",
    action: "review",
  },
  {
    id: 2,
    confirmationNo: "87433341",
    title: "ATV's",
    status: "in-progress",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    dates: "Jul 31 - Aug 5",
    guests: null,
    totalPrice: "$5,000",
    action: "cancel",
  },
  {
    id: 3,
    confirmationNo: "24533263",
    title: "Paragliding",
    status: "cancelled",
    image: "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=400&q=80",
    dates: "Jul 31",
    guests: null,
    totalPrice: "$1,300",
    action: null,
  },
];

const RESERVATION_DETAIL = {
  confirmationNo: "24533263",
  title: "Swimming Pool",
  status: "in-progress",
  image: "https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=400&q=80",
  dates: "Jul 31",
  guests: "2 Adults, 1 Child",
  totalPrice: "$1,300",
  host: { name: "Martin Rosser", avatar: "https://i.pravatar.cc/60?img=12", rating: 4.4, reviews: 11 },
  equipment: {
    name: "Sports Bike",
    location: "Queenstown, New",
    category: "Adventure...",
    description: "Lorem ipsum dolor sit amet consectetur. Aenean tempus pulvinar elit praesent. Dictum praesent dictum facilisis elementum lacus amet enim ques. Malesuada est consequat est nunc. Wisi id consequat blandit posuere vestibulum amet Nulla. Lorem ipsum dolor sit amet consectetur. Aenean tempus pulvinar elit praesent. Fuce amet et lacus turpis molestie. Eleifend pharetra est volutpat blandit purus magna oc.",
    brand: "Yamaha",
    model: "2025",
    whatsIncluded: ["Free Fuel", "Helmet"],
    requirements: "Lorem ipsum dolor sit amet consectetur. Aenean tempus pulvinar elit praesent. Dictum praesent dictum facilisis elementum lacus amet enim nunc. Malesuada est consequat est nunc. Nulla nulla nulla eu quistos nisi nulla. Fuce amet et lacus turpis molestie.",
    cancellationPolicy: "Lorem ipsum dolor sit amet consectetur. Aenean tempus pulvinar elit praesent. Dictum praesent dictum facilisis elementum lacus amet enim nunc. Malesuada.",
  },
  description: "Lorem ipsum dolor sit amet consectetur. Dui ante cursus ultrices fusce facilisis commodo sagittis. Ultrices lectus viverra eu auctor massa massa. Gravida diam nulla adipiscing mi viverra amet feugiat feam diam consectetur amet. Diam nunc molestie integer. Dellern integer turpis duis zwei volontato condimentum scelerisque cras metos egestas lorem aliounpur. Nisi enim non fermentum arcu semper eim magna. Sit augue sed nunc magna lorem ipsum.\n\nAugue bibendum et bibendum turpis facilisis sed tristique semper. Eius eget cursus et purus whem in. In facifeli pellentesque pulvinar suspoendisse lorem augue. Sed turtur felis lorem ipsum dolor amet ipsum. Lorem ipsum dolor sit amet consectetur. Scelerisque adipiscing condimentum scelerisque cras metas egestas lorem metu aliounpur. Nisi enim non fermentum arcu semper eim magna. Sit augue sed nunc magna lorem ipsum.",
};

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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

const DotsIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const StarIcon = ({ filled, half }) => (
  <svg className={`w-5 h-5 ${filled ? "text-[#F5C842] fill-current" : "text-gray-300 fill-current"}`} viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const LocationPinIcon = () => (
  <svg className="w-4 h-4 text-[#4AA7A7]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

/* ─── Status Badge ───────────────────────────────────────────────────────────── */
const statusConfig = {
  completed: { label: "Completed", bg: "bg-green-100", text: "text-green-700" },
  "in-progress": { label: "In Progress", bg: "bg-yellow-100", text: "text-yellow-700" },
  cancelled: { label: "Cancelled", bg: "bg-red-100", text: "text-red-600" },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.completed;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

/* ─── Star Rating Input ──────────────────────────────────────────────────────── */
function StarRatingInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <StarIcon filled={s <= (hovered || value)} />
        </button>
      ))}
    </div>
  );
}

/* ─── Leave a Review Modal ───────────────────────────────────────────────────── */
function LeaveReviewModal({ reservation, onClose }) {
  const [ratings, setRatings] = useState({ overall: 0, accuracy: 0, quality: 0, communication: 0, value: 0 });
  const [comment, setComment] = useState("");

  const categories = [
    { key: "overall", label: "Overall Rating", subtitle: "Your general experience" },
    { key: "accuracy", label: "Accuracy", subtitle: "How well did it match the description?" },
    { key: "quality", label: "Quality", subtitle: "The condition and standard of service" },
    { key: "communication", label: "Communication", subtitle: "Host responsiveness and clarity" },
    { key: "value", label: "Value", subtitle: "Quality relative to price paid" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Leave a Review</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"><CloseIcon /></button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Listing summary */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <img src={reservation.image} alt={reservation.title} className="w-16 h-12 rounded-lg object-cover shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900">{reservation.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Confirmation No: {reservation.confirmationNo} &nbsp;·&nbsp; {reservation.dates}
                {reservation.guests && <> &nbsp;·&nbsp; {reservation.guests}</>}
                &nbsp;·&nbsp; {reservation.totalPrice}
              </p>
            </div>
          </div>

          {/* Rating categories */}
          {categories.map(({ key, label, subtitle }) => (
            <div key={key}>
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-400 mb-2">{subtitle}</p>
              <StarRatingInput value={ratings[key]} onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))} />
            </div>
          ))}

          {/* Additional comments */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Additional Comments (Optional)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what stood out about your experience"
              rows={3}
              className="w-full px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4AA7A7] resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-bold rounded-full text-sm transition-colors"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Cancel Booking Modal ───────────────────────────────────────────────────── */
const CANCEL_REASONS = [
  "My plans changed",
  "Scheduling conflict",
  "Booking was made by mistake",
  "Unexpected fees or charges",
  "Listing details were unclear",
  "Host was unresponsive",
  "Technical issue",
  "Safety concerns",
  "Other (please specify)",
];

function CancelBookingModal({ onClose }) {
  const [selected, setSelected] = useState("");
  const [details, setDetails] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Cancel Booking</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"><CloseIcon /></button>
        </div>

        <div className="p-5 flex flex-col gap-3">
          {CANCEL_REASONS.map((reason) => (
            <label key={reason} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${selected === reason ? "border-[#4AA7A7]" : "border-gray-300 group-hover:border-gray-400"}`}>
                {selected === reason && <div className="w-2 h-2 rounded-full bg-[#4AA7A7]" />}
              </div>
              <input type="radio" className="sr-only" value={reason} checked={selected === reason} onChange={() => setSelected(reason)} />
              <span className="text-sm text-gray-700">{reason}</span>
            </label>
          ))}

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Please describe reason for cancelling and include any relevant details"
            rows={3}
            className="w-full px-3 py-2.5 text-sm text-gray-500 placeholder:text-gray-300 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4AA7A7] resize-none mt-1"
          />

          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-[#4AA7A7] text-[#4AA7A7] font-semibold rounded-full text-sm hover:bg-[#4AA7A7]/5 transition-colors"
            >
              Reschedule
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-semibold rounded-full text-sm transition-colors"
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Report Listing Modal ───────────────────────────────────────────────────── */
const REPORT_LISTING_REASONS = [
  "Misleading or inaccurate information",
  "Photos do not match the listing",
  "Pricing or fees are misleading",
  "Important details are missing or unclear",
  "Prohibited or restricted item/service",
  "Spam, fake, or duplicate listing",
  "Scam or fraudulent activity",
  "Safety concerns",
  "Technical issue or broken listing",
  "Other (please specify)",
];

function ReportListingModal({ onClose }) {
  const [selected, setSelected] = useState("Misleading or inaccurate information");
  const [details, setDetails] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Reporting a Listing</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"><CloseIcon /></button>
        </div>

        <div className="p-5 flex flex-col gap-3">
          {REPORT_LISTING_REASONS.map((reason) => (
            <label
              key={reason}
              className={`flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-xl border transition-colors ${selected === reason ? "border-[#4AA7A7] bg-teal-50/40" : "border-transparent hover:bg-gray-50"}`}
            >
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${selected === reason ? "border-[#4AA7A7]" : "border-gray-300"}`}>
                {selected === reason && <div className="w-2 h-2 rounded-full bg-[#4AA7A7]" />}
              </div>
              <input type="radio" className="sr-only" value={reason} checked={selected === reason} onChange={() => setSelected(reason)} />
              <span className="text-sm text-gray-700">{reason}</span>
            </label>
          ))}

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Please describe the issue and include any relevant details"
            rows={3}
            className="w-full px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4AA7A7] resize-none mt-1"
          />

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-bold rounded-full text-sm transition-colors mt-1"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Report User Modal ──────────────────────────────────────────────────────── */
const REPORT_USER_REASONS = [
  "1. Unprofessional behavior",
  "2. Harassment or abusive language",
  "3. Suspicious or deceptive behavior",
  "4. Scam or fraudulent activity",
  "5. Safety concerns",
  "6. Violation of platform rules",
  "7. Failure to communicate or respond",
  "8. Inappropriate content or messages",
  "9. Impersonation or false identity",
  "10. Other (please specify)",
];

function ReportUserModal({ onClose }) {
  const [selected, setSelected] = useState("");
  const [details, setDetails] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Reporting a User</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"><CloseIcon /></button>
        </div>

        <div className="p-5 flex flex-col gap-2.5">
          {REPORT_USER_REASONS.map((reason) => (
            <label key={reason} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${selected === reason ? "border-[#4AA7A7]" : "border-gray-300 group-hover:border-gray-400"}`}>
                {selected === reason && <div className="w-2 h-2 rounded-full bg-[#4AA7A7]" />}
              </div>
              <input type="radio" className="sr-only" value={reason} checked={selected === reason} onChange={() => setSelected(reason)} />
              <span className="text-sm text-gray-700">{reason}</span>
            </label>
          ))}

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Share more about your experience..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4AA7A7] resize-none mt-2"
          />

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-bold rounded-full text-sm transition-colors mt-1"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Host Profile Slide-over ────────────────────────────────────────────────── */
function HostProfilePanel({ host, onClose, onReportUser }) {
  const listings = [
    { id: 1, title: "Dirt Bike", price: "$150", reviews: "230 Reviews", rating: 4.4, type: "View more", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80", tags: ["Sports", "Off-road", "Bike"] },
    { id: 2, title: "Skydiving Adventure", price: "$100", reviews: "230 Reviews", rating: 4.7, type: "View more", img: "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=200&q=80", tags: [] },
    { id: 3, title: "Swimming pool", price: "$150", reviews: "230 Reviews", rating: 4.4, type: "View more", img: "https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=200&q=80", tags: [] },
    { id: 4, title: "Dirt Bike", price: "$150", reviews: "230 Reviews", rating: 4.4, type: "View more", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80", tags: [] },
  ];

  const reviews = [
    { name: "Alex", avatar: "https://i.pravatar.cc/40?img=1", text: "Lorem ipsum dolor sit amet consectetur. Dictum praesent dictum facilisis elementum. Wisi id consequat blandit posuere vestibulum amet. Fuce amet et lacus turpis molestie. Eleifend pharetra est volutpat blandit purus. Aenean tempus pulvinar elit praesent. Dictum praesent dictum facilisis elementum." },
    { name: "Alexandra Meyer", avatar: "https://i.pravatar.cc/40?img=5", text: "Lorem ipsum dolor sit amet consectetur. Dictum praesent dictum facilisis elementum. Wisi id consequat blandit posuere vestibulum amet. Fuce amet et lacus turpis molestie." },
    { name: "Ariel Ma", avatar: "https://i.pravatar.cc/40?img=9", text: "Lorem ipsum dolor sit amet consectetur. Dictum praesent dictum facilisis elementum. Wisi id consequat blandit posuere vestibulum amet. Fuce amet et lacus turpis molestie." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-y-auto max-h-[85vh] relative">
        {/* Report button top-right */}
        <button
          onClick={onReportUser}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5C842] text-gray-900 font-bold text-sm z-10"
          title="Report user"
        >
          R
        </button>

        {/* Host info */}
        <div className="p-5 flex items-center gap-3 border-b border-gray-100">
          <img src={host.avatar} alt={host.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100" />
          <div>
            <p className="text-sm font-bold text-gray-900">{host.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <StarIcon filled />
              <span className="text-xs font-semibold text-gray-700">{host.rating}</span>
              <span className="text-xs text-gray-400">({host.reviews} reviews)</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Host since Jan 03</p>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-6">
          {/* About */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">About {host.name}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Lorem ipsum dolor sit amet consectetur. Dictum praesent dictum facilisis elementum lacus amet enim nunc. Malesuada est consequat est nunc. Wisi id consequat blandit posuere vestibulum amet Nulla.</p>
          </div>

          {/* Listings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Listings</h3>
              <button className="w-6 h-6 rounded-full bg-[#4AA7A7] flex items-center justify-center text-white">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {listings.map((l) => (
                <div key={l.id} className="rounded-xl overflow-hidden border border-gray-100">
                  <img src={l.img} alt={l.title} className="w-full h-20 object-cover" />
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-800 truncate">{l.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <StarIcon filled />
                      <span className="text-[10px] text-gray-500">{l.rating} · {l.reviews}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">{l.price}</p>
                    {l.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {l.tags.map((t) => <span key={t} className="text-[9px] bg-[#4AA7A7]/10 text-[#4AA7A7] px-1.5 py-0.5 rounded-full font-medium">{t}</span>)}
                      </div>
                    )}
                    <button className="text-[10px] text-[#4AA7A7] font-medium mt-1">View more</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Reviews</h3>
              <button className="w-6 h-6 rounded-full bg-[#4AA7A7] flex items-center justify-center text-white">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {reviews.map((r) => (
                <div key={r.name} className="flex gap-2">
                  <img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{r.name}</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">{r.text}</p>
                    <button className="text-[10px] text-[#4AA7A7] font-medium mt-1">more</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Dots Menu Popover ──────────────────────────────────────────────────────── */
function DotsMenu({ reservation, onReview, onCancel, onReportListing }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
      >
        <DotsIcon />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30">
          <button
            onClick={() => { setOpen(false); onReportListing(); }}
            className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
            Report an issue
          </button>
          <button
            className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            Contact Host
          </button>
          <button
            className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
            Book again
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Cancel Reservation Button ──────────────────────────────────────────────── */
function CancelReservationButton({ onCancel }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowConfirm(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative flex flex-col items-end gap-2" ref={ref}>
      <button
        onClick={() => setShowConfirm((v) => !v)}
        className="px-5 py-2.5 border-2 border-[#F5C842] text-gray-800 font-semibold rounded-full text-sm hover:bg-[#F5C842]/10 transition-colors whitespace-nowrap"
      >
        Cancel Reservation
      </button>
      {showConfirm && (
        <div className="absolute top-full right-0 mt-1 z-20">
          <button
            onClick={() => { setShowConfirm(false); onCancel(); }}
            className="px-5 py-2.5 bg-[#F5C842] text-gray-900 font-semibold rounded-full text-sm shadow-lg whitespace-nowrap hover:bg-[#e0b430] transition-colors"
          >
            Cancel Reservation
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Reservation Detail View ────────────────────────────────────────────────── */
function ReservationDetailView({ reservation, onBack, onLeaveReview, onContactHost, onReportListing }) {
  const d = RESERVATION_DETAIL;

  return (
    <div className="flex flex-col gap-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <img src={reservation.image} alt={reservation.title} className="w-full sm:w-48 h-36 rounded-xl object-cover shrink-0" />
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">Confirmation No: {reservation.confirmationNo}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900">{reservation.title}</h2>
                  <StatusBadge status={reservation.status} />
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"><HeartIcon /></button>
                <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"><ShareIcon /></button>
                <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"><DotsIcon /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <div><p className="text-gray-400 text-xs">Reservation Dates:</p><p className="font-medium text-gray-700">{reservation.dates}</p></div>
              {reservation.guests && <div><p className="text-gray-400 text-xs">Guests:</p><p className="font-medium text-gray-700">{reservation.guests}</p></div>}
              <div><p className="text-gray-400 text-xs">Total Price:</p><p className="font-medium text-gray-700">{reservation.totalPrice}</p></div>
            </div>
            <div className="flex justify-end mt-auto">
              {reservation.action === "review" && (
                <button
                  onClick={onLeaveReview}
                  className="px-5 py-2.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-semibold rounded-full text-sm transition-colors"
                >
                  Leave a Review
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Host row */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={d.host.avatar} alt={d.host.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
          <div>
            <p className="text-sm font-bold text-gray-900">{d.host.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <StarIcon filled />
              <span className="text-xs text-gray-600">{d.host.rating}</span>
              <span className="text-xs text-gray-400">({d.host.reviews} reviews)</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Host since Jan 03</p>
          </div>
        </div>
        <button
          onClick={onContactHost}
          className="px-5 py-2.5 border-2 border-[#4AA7A7] text-[#4AA7A7] font-semibold rounded-full text-sm hover:bg-[#4AA7A7]/5 transition-colors whitespace-nowrap"
        >
          Contact Host
        </button>
      </div>

      {/* Details card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-base font-bold text-gray-900 mb-4">Details</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div><p className="text-xs text-gray-400 mb-1">Equipment Name</p><p className="text-sm font-medium text-gray-800">{d.equipment.name}</p></div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Location</p>
            <div className="flex items-center gap-1"><LocationPinIcon /><p className="text-sm font-medium text-gray-800">{d.equipment.location}</p></div>
          </div>
          <div><p className="text-xs text-gray-400 mb-1">Equipment Category</p><p className="text-sm font-medium text-gray-800">{d.equipment.category}</p></div>
        </div>
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-1">Description</p>
          <p className="text-sm text-gray-600 leading-relaxed">{d.equipment.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><p className="text-xs text-gray-400 mb-1">Brand</p><p className="text-sm font-medium text-gray-800">{d.equipment.brand}</p></div>
          <div><p className="text-xs text-gray-400 mb-1">Model</p><p className="text-sm font-medium text-gray-800">{d.equipment.model}</p></div>
        </div>
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">What's Included</p>
          <div className="flex gap-2 flex-wrap">
            {d.equipment.whatsIncluded.map((item) => (
              <span key={item} className="px-3 py-1 bg-[#F5C842] text-gray-900 text-xs font-medium rounded-full">{item}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Requirements</p>
            <p className="text-sm text-gray-600 leading-relaxed">{d.equipment.requirements}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Cancellation Policy</p>
            <p className="text-sm text-gray-600 leading-relaxed">{d.equipment.cancellationPolicy}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-base font-bold text-gray-900 mb-3">Description</h3>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{d.description}</p>
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-base font-bold text-gray-900 mb-3">Location</h3>
        <div className="w-full h-64 rounded-xl overflow-hidden bg-gray-100 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-50 to-green-200 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 bg-[#4AA7A7] rounded-full flex items-center justify-center mx-auto shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              </div>
              <p className="text-xs text-gray-500 mt-2">Tokyo, Japan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-32 h-32 flex items-center justify-center">
        {/* Suitcase illustration */}
        <svg viewBox="0 0 120 100" className="w-full h-full" fill="none">
          <rect x="25" y="35" width="70" height="52" rx="6" fill="#F5C842" />
          <rect x="43" y="25" width="34" height="14" rx="4" fill="#F5C842" stroke="#e0b430" strokeWidth="2" />
          <rect x="48" y="30" width="24" height="4" rx="2" fill="#e0b430" />
          <line x1="60" y1="35" x2="60" y2="87" stroke="#e0b430" strokeWidth="2" />
          <line x1="25" y1="61" x2="95" y2="61" stroke="#e0b430" strokeWidth="2" />
          <circle cx="90" cy="50" r="8" fill="#FDE68A" />
          <path d="M87 50 Q90 46 93 50 Q90 54 87 50Z" fill="#F5C842" />
          <rect x="82" y="82" width="10" height="6" rx="2" fill="#9CA3AF" />
          <rect x="28" y="82" width="10" height="6" rx="2" fill="#9CA3AF" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">No Reservation Booked...Yet!</h2>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">"Get ready to pack your suitcase and let's plot the course for your next great adventure!"</p>
      </div>
      <button className="mt-2 px-8 py-3 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-bold rounded-full text-sm transition-colors shadow-md">
        Start Booking
      </button>
    </div>
  );
}

/* ─── Reservation Row ────────────────────────────────────────────────────────── */
function ReservationRow({ reservation, onViewDetail, onReview, onCancel, onReportListing }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row overflow-hidden">
      {/* Image */}
      <button
        onClick={() => onViewDetail(reservation)}
        className="sm:w-56 lg:w-64 h-44 sm:h-auto shrink-0 overflow-hidden"
      >
        <img
          src={reservation.image}
          alt={reservation.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </button>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-gray-400">Confirmation No. {reservation.confirmationNo}</p>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <button
                  onClick={() => onViewDetail(reservation)}
                  className="text-xl font-bold text-gray-900 hover:text-[#4AA7A7] transition-colors text-left"
                >
                  {reservation.title}
                </button>
                <StatusBadge status={reservation.status} />
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"><HeartIcon /></button>
              <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"><ShareIcon /></button>
              <DotsMenu
                reservation={reservation}
                onReview={onReview}
                onCancel={onCancel}
                onReportListing={onReportListing}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-6">
              <span className="text-gray-400 w-32 text-xs">Reservation Dates:</span>
              <span className="font-medium text-gray-700">{reservation.dates}</span>
            </div>
            {reservation.guests && (
              <div className="flex items-center gap-6">
                <span className="text-gray-400 w-32 text-xs">Guests:</span>
                <span className="font-medium text-gray-700">{reservation.guests}</span>
              </div>
            )}
            <div className="flex items-center gap-6">
              <span className="text-gray-400 w-32 text-xs">Total Price:</span>
              <span className="font-medium text-gray-700">{reservation.totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-end justify-end sm:justify-start sm:items-end shrink-0">
          {reservation.action === "review" && (
            <button
              onClick={() => onReview(reservation)}
              className="px-5 py-2.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-semibold rounded-full text-sm transition-colors whitespace-nowrap"
            >
              Leave a Review
            </button>
          )}
          {reservation.action === "cancel" && (
            <CancelReservationButton onCancel={onCancel} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Pagination ─────────────────────────────────────────────────────────────── */
function Pagination({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-gray-300 disabled:opacity-40" disabled>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7" /></svg>
      </button>
      <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-gray-300 disabled:opacity-40" disabled>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <span className="text-sm text-gray-500 px-2">{current} of {total}</span>
      <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-gray-300">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>
      <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-gray-300">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
export default function MyReservationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [detailView, setDetailView] = useState(null);
  const [modal, setModal] = useState(null); // 'review' | 'cancel' | 'report-listing' | 'report-user' | 'host-profile'
  const [activeReservation, setActiveReservation] = useState(null);

  const tabs = [
    { key: "all", label: "All" },
    { key: "in-progress", label: "In progress" },
    { key: "completed", label: "Completed" },
  ];

  const filteredReservations = activeTab === "all"
    ? RESERVATIONS
    : RESERVATIONS.filter((r) => r.status === activeTab);

  const openModal = (type, reservation = null) => {
    setActiveReservation(reservation);
    setModal(type);
  };
  const closeModal = () => { setModal(null); setActiveReservation(null); };

  return (
    <UserDashboardShell>
      <div className="flex-1 flex flex-col">
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-16 py-8">

          {/* Page header */}
          <div className="flex items-center gap-3 mb-6">
            {detailView ? (
              <button onClick={() => setDetailView(null)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <BackIcon />
              </button>
            ) : (
              <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <BackIcon />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Reservation</h1>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setDetailView(null); }}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {detailView ? (
            <ReservationDetailView
              reservation={detailView}
              onBack={() => setDetailView(null)}
              onLeaveReview={() => openModal("review", detailView)}
              onContactHost={() => openModal("host-profile", detailView)}
              onReportListing={() => openModal("report-listing", detailView)}
            />
          ) : filteredReservations.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-4">
              {filteredReservations.map((r) => (
                <ReservationRow
                  key={r.id}
                  reservation={r}
                  onViewDetail={setDetailView}
                  onReview={(res) => openModal("review", res)}
                  onCancel={() => openModal("cancel")}
                  onReportListing={() => openModal("report-listing", r)}
                />
              ))}
              <Pagination current={1} total={10} />
            </div>
          )}
        </main>

        <NewsletterSection />
        <LandingFooter />
      </div>

      {/* Modals */}
      {modal === "review" && (
        <LeaveReviewModal reservation={activeReservation || RESERVATIONS[0]} onClose={closeModal} />
      )}
      {modal === "cancel" && (
        <CancelBookingModal onClose={closeModal} />
      )}
      {modal === "report-listing" && (
        <ReportListingModal onClose={closeModal} />
      )}
      {modal === "host-profile" && (
        <HostProfilePanel
          host={RESERVATION_DETAIL.host}
          onClose={closeModal}
          onReportUser={() => { closeModal(); setTimeout(() => openModal("report-user"), 50); }}
        />
      )}
      {modal === "report-user" && (
        <ReportUserModal onClose={closeModal} />
      )}
    </UserDashboardShell>
  );
}
