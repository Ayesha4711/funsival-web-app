"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBookings,
  cancelBooking,
  selectBookings,
  selectBookingsPagination,
  selectBookingsStatus,
  selectBookingsCancelStatus,
  selectBookingsError,
} from "@/store/slices/bookingsSlice";
import NewsletterSection from "@/components/landing/NewsletterSection";
import LandingFooter from "@/components/landing/LandingFooter";

/* ─── Data helpers ───────────────────────────────────────────────────────────── */
function getTitle(b) {
  const info = b.listing?.basicInformation ?? {};
  return info.activityTitle || info.equipmentName || info.placeName || "Booking";
}
function getImage(b) {
  return b.listing?.photos?.[0] || "https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=400&q=80";
}
function getLocation(b) {
  const loc = b.listing?.placeLocation ?? {};
  return [loc.city, loc.state, loc.country].filter(Boolean).join(", ") || b.listing?.basicInformation?.location || "";
}
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function formatDateRange(s, e) {
  const sd = formatDate(s);
  const ed = formatDate(e);
  return sd === ed ? sd : `${sd} – ${ed}`;
}
function getStatusKey(b) {
  if (b.status === "confirmed") return "in-progress";
  if (b.status === "cancelled") return "cancelled";
  return b.status; // "completed"
}
function canCancel(b) { return b.status === "confirmed"; }
function canReview(b) { return b.status === "completed"; }

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
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
const StarIcon = ({ filled }) => (
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

/* ─── Status badge ───────────────────────────────────────────────────────────── */
const STATUS_CFG = {
  completed:    { label: "Completed",  bg: "bg-green-100",  text: "text-green-700" },
  "in-progress":{ label: "In Progress",bg: "bg-yellow-100", text: "text-yellow-700" },
  cancelled:    { label: "Cancelled",  bg: "bg-red-100",    text: "text-red-600" },
  confirmed:    { label: "Confirmed",  bg: "bg-yellow-100", text: "text-yellow-700" },
};
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.confirmed;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

/* ─── Star rating input ──────────────────────────────────────────────────────── */
function StarRatingInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110">
          <StarIcon filled={s <= (hovered || value)} />
        </button>
      ))}
    </div>
  );
}

/* ─── Leave Review Modal ─────────────────────────────────────────────────────── */
function LeaveReviewModal({ booking, onClose }) {
  const [ratings, setRatings] = useState({ overall: 0, accuracy: 0, quality: 0, communication: 0, value: 0 });
  const [comment, setComment] = useState("");
  const cats = [
    { key: "overall",       label: "Overall Rating",   sub: "Your general experience" },
    { key: "accuracy",      label: "Accuracy",         sub: "How well did it match the description?" },
    { key: "quality",       label: "Quality",          sub: "The condition and standard of service" },
    { key: "communication", label: "Communication",    sub: "Host responsiveness and clarity" },
    { key: "value",         label: "Value",            sub: "Quality relative to price paid" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Leave a Review</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"><CloseIcon /></button>
        </div>
        <div className="p-5 flex flex-col gap-5">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <img src={getImage(booking)} alt={getTitle(booking)} className="w-16 h-12 rounded-lg object-cover shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900">{getTitle(booking)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{formatDateRange(booking.startDate, booking.endDate)} · ${booking.totalAmount}</p>
            </div>
          </div>
          {cats.map(({ key, label, sub }) => (
            <div key={key}>
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-400 mb-2">{sub}</p>
              <StarRatingInput value={ratings[key]} onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))} />
            </div>
          ))}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Additional Comments (Optional)</p>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what stood out about your experience" rows={3}
              className="w-full px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4AA7A7] resize-none" />
          </div>
          <button onClick={onClose} className="w-full py-3.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-bold rounded-full text-sm transition-colors">
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

function CancelBookingModal({ onClose, onConfirm, loading }) {
  const [selected, setSelected] = useState("");
  const [details, setDetails] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Cancel Booking</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"><CloseIcon /></button>
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
          <textarea value={details} onChange={(e) => setDetails(e.target.value)}
            placeholder="Please describe reason for cancelling and include any relevant details"
            rows={3} className="w-full px-3 py-2.5 text-sm text-gray-500 placeholder:text-gray-300 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4AA7A7] resize-none mt-1" />
          <div className="flex gap-3 mt-2">
            <button onClick={onClose} className="flex-1 py-3 border-2 border-[#4AA7A7] text-[#4AA7A7] font-semibold rounded-full text-sm hover:bg-[#4AA7A7]/5 transition-colors">
              Reschedule
            </button>
            <button onClick={() => onConfirm(selected, details)} disabled={loading || !selected}
              className="flex-1 py-3 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-semibold rounded-full text-sm transition-colors disabled:opacity-50">
              {loading ? "Cancelling..." : "Confirm Cancel"}
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
  const [selected, setSelected] = useState(REPORT_LISTING_REASONS[0]);
  const [details, setDetails] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Reporting a Listing</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"><CloseIcon /></button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {REPORT_LISTING_REASONS.map((r) => (
            <label key={r} className={`flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-xl border transition-colors ${selected === r ? "border-[#4AA7A7] bg-teal-50/40" : "border-transparent hover:bg-gray-50"}`}>
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${selected === r ? "border-[#4AA7A7]" : "border-gray-300"}`}>
                {selected === r && <div className="w-2 h-2 rounded-full bg-[#4AA7A7]" />}
              </div>
              <input type="radio" className="sr-only" value={r} checked={selected === r} onChange={() => setSelected(r)} />
              <span className="text-sm text-gray-700">{r}</span>
            </label>
          ))}
          <textarea value={details} onChange={(e) => setDetails(e.target.value)}
            placeholder="Please describe the issue and include any relevant details" rows={3}
            className="w-full px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4AA7A7] resize-none mt-1" />
          <button onClick={onClose} className="w-full py-3.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-bold rounded-full text-sm transition-colors mt-1">
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Dots menu ──────────────────────────────────────────────────────────────── */
function DotsMenu({ onReportListing }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
        <DotsIcon />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-100 py-1.5 z-30">
          <button onClick={() => { setOpen(false); onReportListing(); }}
            className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            Report an issue
          </button>
          <button className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
            Contact Host
          </button>
          <button className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
            Book again
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Booking card row ───────────────────────────────────────────────────────── */
function BookingRow({ booking, onViewDetail, onCancel, onReportListing }) {
  const statusKey = getStatusKey(booking);
  const guests = booking.numberOfGuests ? `${booking.numberOfGuests} Guest${booking.numberOfGuests > 1 ? "s" : ""}` : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 flex flex-col sm:flex-row overflow-hidden">
      {/* Image */}
      <button onClick={() => onViewDetail(booking)} className="sm:w-52 lg:w-60 h-44 sm:h-auto shrink-0 overflow-hidden">
        <img src={getImage(booking)} alt={getTitle(booking)}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
      </button>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-2">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-gray-400">Confirmation No. {booking.id?.slice(-8)?.toUpperCase()}</p>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <button onClick={() => onViewDetail(booking)}
                  className="text-xl font-bold text-gray-900 hover:text-[#4AA7A7] transition-colors text-left">
                  {getTitle(booking)}
                </button>
                <StatusBadge status={statusKey} />
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><HeartIcon /></button>
              <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><ShareIcon /></button>
              <DotsMenu onReportListing={onReportListing} />
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-gray-400 w-36 text-xs shrink-0">Reservation Dates:</span>
              <span className="font-semibold text-gray-800">{formatDateRange(booking.startDate, booking.endDate)}</span>
            </div>
            {guests && (
              <div className="flex items-start gap-2">
                <span className="text-gray-400 w-36 text-xs shrink-0">Guests:</span>
                <span className="font-semibold text-gray-800">{guests}</span>
              </div>
            )}
            {booking.startTime && (
              <div className="flex items-start gap-2">
                <span className="text-gray-400 w-36 text-xs shrink-0">Time:</span>
                <span className="font-semibold text-gray-800">{booking.startTime} – {booking.endTime}</span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <span className="text-gray-400 w-36 text-xs shrink-0">Total Price:</span>
              <span className="font-semibold text-gray-800">$ {booking.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-end justify-end sm:flex-col sm:items-end sm:justify-end gap-2 shrink-0">
          {canReview(booking) && (
            <button onClick={() => onViewDetail(booking)}
              className="px-5 py-2.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-semibold rounded-full text-sm transition-colors whitespace-nowrap">
              Leave a Review
            </button>
          )}
          {canCancel(booking) && (
            <>
              <button onClick={() => onViewDetail(booking)}
                className="px-5 py-2.5 bg-[#4AA7A7] hover:bg-[#3d9090] text-white font-semibold rounded-full text-sm transition-colors whitespace-nowrap">
                Book again
              </button>
              <button onClick={() => onCancel(booking)}
                className="px-5 py-2.5 border-2 border-[#F5C842] text-gray-800 font-semibold rounded-full text-sm hover:bg-[#F5C842]/10 transition-colors whitespace-nowrap">
                Cancel Reservation
              </button>
            </>
          )}
          {booking.status === "cancelled" && (
            <button onClick={() => onViewDetail(booking)}
              className="px-5 py-2.5 bg-[#4AA7A7] hover:bg-[#3d9090] text-white font-semibold rounded-full text-sm transition-colors whitespace-nowrap">
              Book again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Detail view ────────────────────────────────────────────────────────────── */
function BookingDetailView({ booking, onBack, onLeaveReview, onCancel }) {
  const listing = booking.listing ?? {};
  const info = listing.basicInformation ?? {};
  const service = listing.serviceDetails ?? {};
  const loc = listing.placeLocation ?? {};
  const statusKey = getStatusKey(booking);

  return (
    <div className="flex flex-col gap-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <img src={getImage(booking)} alt={getTitle(booking)} className="w-full sm:w-48 h-36 rounded-xl object-cover shrink-0" />
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">Confirmation No: {booking.id?.slice(-8)?.toUpperCase()}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900">{getTitle(booking)}</h2>
                  <StatusBadge status={statusKey} />
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><HeartIcon /></button>
                <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><ShareIcon /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <div><p className="text-gray-400 text-xs">Dates:</p><p className="font-medium text-gray-700">{formatDateRange(booking.startDate, booking.endDate)}</p></div>
              {booking.numberOfGuests && <div><p className="text-gray-400 text-xs">Guests:</p><p className="font-medium text-gray-700">{booking.numberOfGuests}</p></div>}
              {booking.startTime && <div><p className="text-gray-400 text-xs">Time:</p><p className="font-medium text-gray-700">{booking.startTime} – {booking.endTime}</p></div>}
              <div><p className="text-gray-400 text-xs">Total Price:</p><p className="font-medium text-gray-700">${booking.totalAmount} {booking.currency}</p></div>
            </div>
            <div className="flex justify-end gap-2 mt-auto flex-wrap">
              {canReview(booking) && (
                <button onClick={onLeaveReview} className="px-5 py-2.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-semibold rounded-full text-sm transition-colors">
                  Leave a Review
                </button>
              )}
              {canCancel(booking) && (
                <button onClick={onCancel} className="px-5 py-2.5 border-2 border-red-200 text-red-500 hover:bg-red-50 font-semibold rounded-full text-sm transition-colors">
                  Cancel Reservation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-base font-bold text-gray-900 mb-4">Price Breakdown</h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500 capitalize">{booking.bookingType?.replace(/_/g," ")} × {booking.unitsBooked}</span><span className="font-medium">${booking.subtotal}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Service fee</span><span className="font-medium">${booking.serviceFee}</span></div>
          <div className="flex justify-between border-t border-gray-100 pt-2 mt-1">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-[#F5C842]">${booking.totalAmount} {booking.currency}</span>
          </div>
        </div>
      </div>

      {/* Host */}
      {booking.host && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={`https://i.pravatar.cc/60?u=${booking.host.id}`} alt="host" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
            <div>
              <p className="text-sm font-bold text-gray-900">{booking.host.email?.split("@")[0]}</p>
              <p className="text-xs text-gray-400 mt-0.5">{booking.host.city || "Host"}</p>
            </div>
          </div>
          <button className="px-5 py-2.5 border-2 border-[#4AA7A7] text-[#4AA7A7] font-semibold rounded-full text-sm hover:bg-[#4AA7A7]/5 transition-colors whitespace-nowrap">
            Contact Host
          </button>
        </div>
      )}

      {/* Listing details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-base font-bold text-gray-900 mb-4">Details</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {info.location && <div><p className="text-xs text-gray-400 mb-1">Location</p><div className="flex items-center gap-1"><LocationPinIcon /><p className="text-sm font-medium text-gray-800">{info.location}</p></div></div>}
          {listing.category && <div><p className="text-xs text-gray-400 mb-1">Category</p><p className="text-sm font-medium text-gray-800 capitalize">{listing.category}</p></div>}
          {service.difficultyLevel && <div><p className="text-xs text-gray-400 mb-1">Difficulty</p><p className="text-sm font-medium text-gray-800 capitalize">{service.difficultyLevel}</p></div>}
          {service.instructorName && <div><p className="text-xs text-gray-400 mb-1">Instructor</p><p className="text-sm font-medium text-gray-800">{service.instructorName}</p></div>}
        </div>
        {info.description && <p className="text-sm text-gray-600 leading-relaxed mb-4">{info.description}</p>}
        {service.whatsIncluded?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">What&apos;s Included</p>
            <div className="flex gap-2 flex-wrap">
              {service.whatsIncluded.map((item) => (
                <span key={item} className="px-3 py-1 bg-[#F5C842] text-gray-900 text-xs font-medium rounded-full">{item}</span>
              ))}
            </div>
          </div>
        )}
        {service.cancellationPolicy && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Cancellation Policy</p>
            <p className="text-sm text-gray-600">{service.cancellationPolicy}</p>
          </div>
        )}
      </div>

      {/* Location */}
      {(loc.city || info.location) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-3">Location</h3>
          <div className="w-full h-48 rounded-xl bg-gradient-to-br from-green-100 via-blue-50 to-green-200 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 bg-[#4AA7A7] rounded-full flex items-center justify-center mx-auto">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              </div>
              <p className="text-xs text-gray-600 mt-2 font-medium">{getLocation(booking) || info.location}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────────── */
function EmptyState({ onStartBooking }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-6">
      {/* Suitcase illustration — matches screenshot */}
      <div className="w-44 h-44 relative">
        <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
          {/* suitcase body */}
          <rect x="30" y="70" width="140" height="110" rx="12" fill="#F5C842" />
          {/* handle */}
          <rect x="70" y="45" width="60" height="30" rx="8" fill="#F5C842" stroke="#d4a800" strokeWidth="3" />
          <rect x="80" y="55" width="40" height="10" rx="4" fill="#d4a800" />
          {/* center divider */}
          <line x1="100" y1="70" x2="100" y2="180" stroke="#d4a800" strokeWidth="3" />
          <line x1="30" y1="125" x2="170" y2="125" stroke="#d4a800" strokeWidth="3" />
          {/* wheels */}
          <circle cx="60" cy="186" r="8" fill="#9CA3AF" />
          <circle cx="140" cy="186" r="8" fill="#9CA3AF" />
          {/* plant decoration */}
          <rect x="148" y="140" width="20" height="26" rx="3" fill="#6B7280" />
          <ellipse cx="158" cy="125" rx="18" ry="22" fill="#F9A8D4" />
          <ellipse cx="148" cy="120" rx="12" ry="16" fill="#F9A8D4" />
          <ellipse cx="168" cy="118" rx="10" ry="14" fill="#F9A8D4" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">No Reservation Booked...Yet!</h2>
        <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">
          &ldquo;Get ready to pack your curiosity and let&apos;s plot the course for your next great adventure!&rdquo;
        </p>
      </div>
      <button
        onClick={onStartBooking}
        className="flex items-center gap-3 px-8 py-3.5 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-bold rounded-full text-sm transition-colors"
      >
        Start Booking
        <span className="w-7 h-7 rounded-full bg-white/40 flex items-center justify-center">
          <ArrowRightIcon />
        </span>
      </button>
    </div>
  );
}

/* ─── Pagination ─────────────────────────────────────────────────────────────── */
function Pagination({ pagination, onPageChange }) {
  const { page = 1, totalPages = 1 } = pagination;
  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      <button onClick={() => onPageChange(1)} disabled={page <= 1}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-40 text-xs font-medium">
        «
      </button>
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-40 text-xs font-medium">
        ‹
      </button>
      <div className="px-3 py-1 border border-gray-200 rounded-full text-sm text-gray-500 min-w-[80px] text-center">
        {page} of {totalPages || 1}
      </div>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-40 text-xs font-medium">
        ›
      </button>
      <button onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-40 text-xs font-medium">
        »
      </button>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────────── */
export default function MyReservationPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const bookings = useSelector(selectBookings);
  const pagination = useSelector(selectBookingsPagination);
  const status = useSelector(selectBookingsStatus);
  const cancelStatus = useSelector(selectBookingsCancelStatus);
  const error = useSelector(selectBookingsError);

  const [activeTab, setActiveTab] = useState("all");
  const [detailView, setDetailView] = useState(null);
  const [modal, setModal] = useState(null); // 'review' | 'cancel' | 'report-listing'
  const [activeBooking, setActiveBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchBookings({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const TABS = [
    { key: "all",         label: "All" },
    { key: "in-progress", label: "In progress" },
    { key: "completed",   label: "Completed" },
  ];

  const filtered = activeTab === "all"
    ? bookings
    : bookings.filter((b) => getStatusKey(b) === activeTab);

  const openModal = (type, booking = null) => { setActiveBooking(booking); setModal(type); };
  const closeModal = () => { setModal(null); setActiveBooking(null); };

  const handleCancelConfirm = async () => {
    if (!activeBooking?.id) return;
    await dispatch(cancelBooking(activeBooking.id));
    closeModal();
    if (detailView?.id === activeBooking.id) setDetailView(null);
    dispatch(fetchBookings({ page: currentPage, limit: 10 }));
  };

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={detailView ? () => setDetailView(null) : () => router.back()}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <BackIcon />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Reservation</h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setDetailView(null); }}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {status === "failed" && (
          <div className="text-center py-12 text-red-500 text-sm">{error || "Failed to load bookings."}</div>
        )}

        {/* Content */}
        {status === "succeeded" && (
          detailView ? (
            <BookingDetailView
              booking={detailView}
              onBack={() => setDetailView(null)}
              onLeaveReview={() => openModal("review", detailView)}
              onCancel={() => openModal("cancel", detailView)}
            />
          ) : filtered.length === 0 ? (
            <EmptyState onStartBooking={() => router.push("/user-dashboard/explore")} />
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((b) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  onViewDetail={setDetailView}
                  onCancel={(bk) => openModal("cancel", bk)}
                  onReportListing={() => openModal("report-listing", b)}
                />
              ))}
              {pagination.totalPages > 1 && (
                <Pagination pagination={pagination} onPageChange={(p) => setCurrentPage(p)} />
              )}
            </div>
          )
        )}
      </main>

      <NewsletterSection />
      <LandingFooter />

      {/* Modals */}
      {modal === "review" && activeBooking && (
        <LeaveReviewModal booking={activeBooking} onClose={closeModal} />
      )}
      {modal === "cancel" && (
        <CancelBookingModal
          onClose={closeModal}
          onConfirm={handleCancelConfirm}
          loading={cancelStatus === "loading"}
        />
      )}
      {modal === "report-listing" && (
        <ReportListingModal onClose={closeModal} />
      )}
    </div>
  );
}
