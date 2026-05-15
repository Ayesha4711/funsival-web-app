"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import reservationImg from "@/assets/images/reservationImg.png";
import {
  fetchBookings,
  cancelBooking,
  selectBookings,
  selectBookingsPagination,
  selectBookingsStatus,
  selectBookingsCancelStatus,
  selectBookingsError,
} from "@/store/slices/bookingsSlice";
import { startOrGetConversation } from "@/store/slices/chatSlice";
import AppFooter from "@/components/shared/AppFooter";
import SharedPagination from "@/components/shared/Pagination";

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
  return b.status;
}
function canCancel(b) { return b.status === "confirmed"; }
function canReview(b) { return b.status === "completed"; }

import { ArrowLeftIcon as BackIcon, HeartFilledIcon, HeartIcon as HeartIconBase, ShareIcon, MoreHorizIcon as DotsIcon, CloseIcon, StarIcon as StarIconBase, MapPinIcon as LocationPinIcon, ArrowRightIcon, CircleAlertIcon, UserIcon as UserIconBase, ReservationsIcon } from "@/icons";

const HeartIcon = ({ filled }) => filled
  ? <HeartFilledIcon size={16} className="text-red-500" />
  : <HeartIconBase size={16} />;

const StarIcon = ({ filled }) => (
  <StarIconBase size={24} className={filled ? "text-[#F5C842] fill-current" : "text-gray-300 fill-current"} />
);

/* ─── Status badge ───────────────────────────────────────────────────────────── */
const STATUS_CFG = {
  completed:    { label: "Completed",   bg: "bg-[#29A329]",  text: "text-white" },
  "in-progress":{ label: "In-progress", bg: "bg-[#F9C234]",  text: "text-white" },
  cancelled:    { label: "Cancelled",   bg: "bg-red-500",    text: "text-white" },
  confirmed:    { label: "In-progress", bg: "bg-[#F9C234]",  text: "text-white" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-xl font-bold text-gray-900">Leave a Review</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"><CloseIcon /></button>
        </div>
        <div className="px-6 pb-6 flex flex-col gap-5">
          {/* Booking summary strip */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <img src={getImage(booking)} alt={getTitle(booking)} className="w-16 h-12 rounded-lg object-cover shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900">{getTitle(booking)}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Confirmation No: {booking.id?.slice(-8)?.toUpperCase()}
              </p>
              <p className="text-xs text-gray-400">
                {formatDateRange(booking.startDate, booking.endDate)}
                {booking.numberOfGuests ? ` · ${booking.numberOfGuests} guest(s)` : ""}
                {booking.totalAmount ? ` · $${booking.totalAmount}` : ""}
              </p>
            </div>
          </div>
          {cats.map(({ key, label, sub }) => (
            <div key={key}>
              <p className="text-sm font-bold text-gray-900">{label}</p>
              <p className="text-xs text-gray-400 mb-2">{sub}</p>
              <StarRatingInput value={ratings[key]} onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))} />
            </div>
          ))}
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">Additional Comments (Optional)</p>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what stood out about your experience" rows={4}
              className="w-full px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4AA7A7] resize-none" />
          </div>
          <button onClick={onClose} className="w-full py-4 bg-[#F5C842] hover:bg-[#e0b430] text-gray-900 font-bold rounded-full text-sm transition-colors">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-y-auto max-h-[92vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Cancel Booking</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"><CloseIcon /></button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
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
            placeholder="Please describe reason for canceling and include any relevant details"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="bg-white rounded-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Reporting a Listing</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"><CloseIcon /></button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {REPORT_LISTING_REASONS.map((r) => (
            <label key={r} className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-xl border transition-colors ${selected === r ? "border-[#4AA7A7] bg-teal-50/40" : "border-transparent hover:bg-gray-50"}`}>
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${selected === r ? "border-[#4AA7A7]" : "border-gray-300"}`}>
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
function DotsMenu({ onReportListing, onContactHost }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
        <DotsIcon />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 z-30">
          <button onClick={() => { setOpen(false); onReportListing(); }}
            className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
            <CircleAlertIcon size={16} className="text-gray-400" />
            Report an issue
          </button>
          {onContactHost && (
            <button onClick={() => { setOpen(false); onContactHost(); }}
              className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              <UserIconBase size={16} className="text-gray-400" />
              Contact Host
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Booking card row ───────────────────────────────────────────────────────── */
function BookingRow({ booking, onViewDetail, onCancel, onLeaveReview, onReportListing, onContactHost, wishlisted, onToggleWishlist, onShare }) {
  const statusKey = getStatusKey(booking);
  const guests = booking.numberOfGuests ? `${booking.numberOfGuests} Adult${booking.numberOfGuests > 1 ? "s" : ""}` : null;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 flex flex-col sm:flex-row overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onViewDetail(booking)}
    >
      {/* Image */}
      <div className="sm:w-52 lg:w-56 h-44 sm:h-auto shrink-0 overflow-hidden">
        <img src={getImage(booking)} alt={getTitle(booking)}
          className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col gap-3">
        {/* Top row: confirmation + title + badge + icons */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">Confirmation No. {booking.id?.slice(-8)?.toUpperCase()}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-gray-900">{getTitle(booking)}</h3>
              <StatusBadge status={statusKey} />
            </div>
          </div>
          {/* Heart / Share / Dots — stop propagation so card click doesn't fire */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onToggleWishlist}
              title={wishlisted ? "Remove from Wishlists" : "Add to Wishlists"}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${wishlisted ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-100 text-gray-400"}`}
            >
              <HeartIcon filled={wishlisted} />
            </button>
            <button
              onClick={onShare}
              title="Share"
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
            >
              <ShareIcon />
            </button>
            <DotsMenu onReportListing={onReportListing} onContactHost={onContactHost} />
          </div>
        </div>

        {/* Reservation details */}
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-36 text-xs shrink-0">Reservation Dates:</span>
            <span className="font-bold text-gray-900">{formatDateRange(booking.startDate, booking.endDate)}</span>
          </div>
          {guests && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 w-36 text-xs shrink-0">Guests:</span>
              <span className="font-bold text-gray-900">{guests}</span>
            </div>
          )}
          {booking.startTime && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 w-36 text-xs shrink-0">Time:</span>
              <span className="font-bold text-gray-900">{booking.startTime} – {booking.endTime}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-36 text-xs shrink-0">Total Price:</span>
            <span className="font-bold text-gray-900">$ {booking.totalAmount?.toLocaleString()}</span>
          </div>
        </div>

        {/* Action button — bottom right */}
        <div className="flex justify-end mt-auto" onClick={(e) => e.stopPropagation()}>
          {canReview(booking) && (
            <button
              onClick={() => onLeaveReview(booking)}
              className="flex items-center justify-between pl-8 pr-2 py-2 bg-[#FEB538] hover:bg-[#e09d2a] text-gray-900 font-bold rounded-full text-sm transition-colors w-44"
            >
              <span className="flex-1 text-center">Leave a Review</span>
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 text-gray-800">
                <ArrowRightIcon />
              </span>
            </button>
          )}
          {canCancel(booking) && (
            <button
              onClick={() => onCancel(booking)}
              className="px-6 py-2.5 border-2 border-[#FEB538] text-gray-800 font-semibold rounded-full text-sm hover:bg-[#FEB538]/10 transition-colors whitespace-nowrap"
            >
              Cancel Reservation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Detail view ────────────────────────────────────────────────────────────── */
/* ─── Location map using OpenStreetMap embed ─────────────────────────────────── */
function LocationMap({ location, booking }) {
  const encoded = encodeURIComponent(location);
  const searchSrc = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
  const [coords, setCoords] = React.useState(null);

  React.useEffect(() => {
    fetch(searchSrc)
      .then((r) => r.json())
      .then((data) => {
        if (data?.[0]) setCoords({ lat: data[0].lat, lon: data[0].lon });
      })
      .catch(() => {});
  }, [location]);

  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(coords.lon)-0.05},${Number(coords.lat)-0.03},${Number(coords.lon)+0.05},${Number(coords.lat)+0.03}&layer=mapnik&marker=${coords.lat},${coords.lon}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=-74.05,40.68,-73.85,40.78&layer=mapnik`;


  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-gray-100" style={{ height: 420 }}>
      <iframe
        src={mapSrc}
        className="w-full"
        style={{ border: 0, height: '105%', marginBottom: '-5%' }}
        loading="lazy"
        title={`Map of ${location}`}
      />

      {/* OpenStreetMap attribution */}
      <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
        <span className="text-[10px] text-gray-600 bg-white/80 px-1.5 py-0.5 rounded">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline pointer-events-auto">OpenStreetMap</a> contributors
        </span>
      </div>

    </div>
  );
}

function BookingDetailView({ booking, onLeaveReview, onCancel, onContactHost, wishlisted, onToggleWishlist, onShare }) {
  const listing = booking.listing ?? {};
  const info = listing.basicInformation ?? {};
  const service = listing.serviceDetails ?? {};
  const equipment = listing.equipmentDetails ?? {};
  const statusKey = getStatusKey(booking);
  const guests = booking.numberOfGuests ? `${booking.numberOfGuests} Adult${booking.numberOfGuests > 1 ? "s" : ""}` : null;

  return (
    <div className="flex flex-col gap-6">

      {/* Header card — matches img4 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-0">
          <img src={getImage(booking)} alt={getTitle(booking)}
            className="w-full sm:w-56 h-44 sm:h-auto object-cover shrink-0" />
          <div className="flex-1 p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">Confirmation No: {booking.id?.slice(-8)?.toUpperCase()}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900">{getTitle(booking)}</h2>
                  <StatusBadge status={statusKey} />
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={onToggleWishlist}
                  title={wishlisted ? "Remove from Wishlists" : "Add to Wishlists"}
                  className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${wishlisted ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-100 text-gray-400"}`}
                >
                  <HeartIcon filled={wishlisted} />
                </button>
                <button
                  onClick={onShare}
                  title="Share"
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
                >
                  <ShareIcon />
                </button>
                <DotsMenu onReportListing={() => {}} onContactHost={onContactHost} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-36 text-xs shrink-0">Reservation Dates:</span>
                <span className="font-bold text-gray-900">{formatDateRange(booking.startDate, booking.endDate)}</span>
              </div>
              {guests && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-36 text-xs shrink-0">Guests:</span>
                  <span className="font-bold text-gray-900">{guests}</span>
                </div>
              )}
              {booking.startTime && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-36 text-xs shrink-0">Time:</span>
                  <span className="font-bold text-gray-900">{booking.startTime} – {booking.endTime}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-36 text-xs shrink-0">Total Price:</span>
                <span className="font-bold text-gray-900">$ {booking.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end mt-auto">
              {canReview(booking) && (
                <button onClick={onLeaveReview}
                  className="flex items-center justify-between pl-8 pr-2 py-2 bg-[#FEB538] hover:bg-[#e09d2a] text-gray-900 font-bold rounded-full text-sm transition-colors w-44">
                  <span className="flex-1 text-center">Leave a Review</span>
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 text-gray-800">
                    <ArrowRightIcon />
                  </span>
                </button>
              )}
              {canCancel(booking) && (
                <button onClick={onCancel}
                  className="px-6 py-2.5 border-2 border-[#FEB538] text-gray-800 font-semibold rounded-full text-sm hover:bg-[#FEB538]/10 transition-colors">
                  Cancel Reservation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Host */}
      {booking.host && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={`https://i.pravatar.cc/60?u=${booking.host.id}`} alt="host"
              className="w-12 h-12 rounded-full object-cover border border-gray-200" />
            <div>
              <p className="text-sm font-bold text-gray-900">{booking.host.name || booking.host.email?.split("@")[0] || "Host"}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <StarIconBase size={12} className="text-[#F5C842] fill-current" />
                <span className="text-xs text-gray-500">4.4 ( 9 reviews )</span>
              </div>
              <p className="text-xs text-gray-400">{booking.host.city || getLocation(booking) || "—"}</p>
            </div>
          </div>
          <button
            onClick={onContactHost}
            className="px-5 py-2.5 border border-[#4AA7A7] text-[#4AA7A7] font-semibold rounded-full text-sm hover:bg-[#4AA7A7]/5 transition-colors whitespace-nowrap"
          >
            Contact Host
          </button>
        </div>
      )}

      {/* Details card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Details</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 mb-4">
          {(info.equipmentName || info.activityTitle || info.placeName) && (
            <div>
              <p className="text-xs text-gray-400 mb-1">{listing.category === "equipment" ? "Equipment Name" : listing.category === "activities" ? "Activity Name" : "Place Name"}</p>
              <p className="text-sm font-medium text-gray-800">{info.equipmentName || info.activityTitle || info.placeName}</p>
            </div>
          )}
          {info.location && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Location</p>
              <div className="flex items-center gap-1"><LocationPinIcon /><p className="text-sm font-medium text-gray-800">{info.location}</p></div>
            </div>
          )}
          {listing.category && (
            <div>
              <p className="text-xs text-gray-400 mb-1">{listing.category === "equipment" ? "Equipment Category" : "Category"}</p>
              <p className="text-sm font-medium text-gray-800 capitalize">{listing.category}...</p>
            </div>
          )}
          {(info.description || service.description) && (
            <div className="col-span-full">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">{info.description || service.description}</p>
            </div>
          )}
          {(equipment.brand || service.brand) && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Brand</p>
              <p className="text-sm font-medium text-gray-800">{equipment.brand || service.brand}</p>
            </div>
          )}
          {(equipment.model || service.model) && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Model</p>
              <p className="text-sm font-medium text-gray-800">{equipment.model || service.model}</p>
            </div>
          )}
        </div>

        {/* What's Included */}
        {service.whatsIncluded?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">What&apos;s Included</p>
            <div className="flex gap-2 flex-wrap">
              {service.whatsIncluded.map((item) => (
                <span key={item} className="px-4 py-1.5 bg-[#F5C842] text-gray-900 text-sm font-semibold rounded-xl">{item}</span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-300 pt-4">
          {service.requirements && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Requirements</p>
              <p className="text-sm text-gray-600 leading-relaxed">{service.requirements}</p>
            </div>
          )}
          {service.cancellationPolicy && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Cancellation Policy</p>
              <p className="text-sm text-gray-600 leading-relaxed">{service.cancellationPolicy}</p>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {(info.description || service.description) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
          <p style={{ fontFamily: "var(--font-sofia-pro), 'Sofia Pro', sans-serif", fontWeight: 300, fontSize: 16, lineHeight: "170%", letterSpacing: 0, color: "#A1A1A1" }}>{info.description || service.description}</p>
        </div>
      )}

      {/* Location */}
      {(getLocation(booking) || info.location) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Location</h3>
          <LocationMap location={getLocation(booking) || info.location} booking={booking} />
        </div>
      )}
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────────── */
function EmptyState({ onStartBooking }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-6 2xl:min-h-[600px]">
      <div className="relative flex items-end justify-center w-72 h-64 2xl:w-96 2xl:h-80">
        <Image src={reservationImg} alt="No reservations" width={280} height={256} className="relative z-10 object-contain 2xl:scale-125" />
      </div>
      <div className="text-center 2xl:mt-8">
        <h2 className="text-2xl font-bold text-gray-900 2xl:text-3xl">No Reservation Booked...Yet!</h2>
        <p className="text-sm text-gray-400 mt-2 max-w-sm leading-relaxed 2xl:text-base 2xl:max-w-md">
          &ldquo;Get ready to pack your curiosity and let&apos;s plot the course for your next great adventure!&rdquo;
        </p>
      </div>
      <button
        onClick={onStartBooking}
        className="flex items-center justify-between bg-[#FEB538] hover:bg-[#e0b430] text-gray-900 font-bold rounded-full text-sm transition-colors pl-8 pr-2 py-2 w-56 2xl:w-64 2xl:text-base 2xl:mt-4"
      >
        <span className="flex-1 text-center">Start Booking</span>
        <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 text-gray-800 2xl:w-12 2xl:h-12">
          <ArrowRightIcon />
        </span>
      </button>
    </div>
  );
}


/* ─── Tab filter ─────────────────────────────────────────────────────────────── */
const TABS = [
  { key: "all",        label: "All" },
  { key: "in-progress", label: "Inprogress" },
  { key: "cancelled",  label: "Cancelled" },
];

/* ─── Main page ──────────────────────────────────────────────────────────────── */
export default function MyReservationPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const bookings = useSelector(selectBookings);
  const pagination = useSelector(selectBookingsPagination);
  const status = useSelector(selectBookingsStatus);
  const cancelStatus = useSelector(selectBookingsCancelStatus);
  const error = useSelector(selectBookingsError);

  const [detailView, setDetailView] = useState(null);
  const [modal, setModal] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [wishlistIds, setWishlistIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("reservation_wishlists") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    dispatch(fetchBookings({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const toggleWishlist = (id) => {
    setWishlistIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("reservation_wishlists", JSON.stringify(next));
      toast.success(prev.includes(id) ? "Removed from Wishlists" : "Added to Wishlists");
      return next;
    });
  };

  const handleShare = (booking) => {
    const title = getTitle(booking);
    const url = `${window.location.origin}/user-dashboard/listing/${booking.listingId || booking.listing?._id || booking.listing?.id}`;
    const text = `Check out "${title}" on Funsival!`;
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${url}`).then(() => toast.success("Link copied to clipboard!")).catch(() => toast.error("Could not copy link."));
    }
  };

  const hasData = bookings.length > 0;

  const filtered = activeTab === "wishlists"
    ? bookings.filter((b) => wishlistIds.includes(b.id))
    : activeTab === "all"
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

  const handleContactHost = async (booking) => {
    const hostId = booking?.host?.id || booking?.host?._id;
    const listingId = booking?.listingId || booking?.listing?.id;
    if (!hostId) {
      toast.error("Host information not available.");
      return;
    }
    try {
      const result = await dispatch(
        startOrGetConversation({ recipientId: hostId, listingId })
      ).unwrap();
      const convId = result?.data?.conversation?.id;
      if (convId) {
        router.push(`/user-dashboard/messages?startChat=${hostId}${listingId ? `&listingId=${listingId}` : ""}`);
      }
    } catch {
      toast.error("Could not start conversation. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 w-full">
        <div className="px-4 sm:px-6 lg:px-10 py-5 flex items-center gap-3">
          <button
            onClick={detailView ? () => setDetailView(null) : () => router.push("/user-dashboard/explore")}
            className="text-gray-900 hover:text-gray-600 transition-colors shrink-0"
          >
            <BackIcon />
          </button>
          <h1 className="text-xl font-bold text-gray-900">My Reservation</h1>
        </div>
      </div>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6">

        {/* Tabs — only when there is data and not in detail view */}
        {hasData && !detailView && status === "succeeded" && (
          <div className="flex items-center gap-2 mb-6 bg-[#EDF6F6] rounded-full p-1 w-fit">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === key
                    ? "bg-white text-[#228E8A] shadow-sm font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

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
              onLeaveReview={() => openModal("review", detailView)}
              onCancel={() => openModal("cancel", detailView)}
              onContactHost={() => handleContactHost(detailView)}
              wishlisted={wishlistIds.includes(detailView.id)}
              onToggleWishlist={() => toggleWishlist(detailView.id)}
              onShare={() => handleShare(detailView)}
            />
          ) : !hasData ? (
            <EmptyState onStartBooking={() => router.push("/user-dashboard/explore")} />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                {activeTab === "cancelled"
                  ? <CloseIcon size={32} className="text-gray-400" />
                  : <ReservationsIcon size={32} className="text-gray-400" />
                }
              </div>
              <div>
                <p className="text-base font-semibold text-gray-700 mb-1">
                  {activeTab === "cancelled" ? "No Cancelled Reservations" : "Nothing Here Yet"}
                </p>
                <p className="text-sm text-gray-400 max-w-xs">
                  {activeTab === "cancelled"
                    ? "You haven't cancelled any reservations. Your active bookings are doing great!"
                    : "No reservations match this filter."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((b) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  onViewDetail={setDetailView}
                  onCancel={(bk) => openModal("cancel", bk)}
                  onLeaveReview={(bk) => openModal("review", bk)}
                  onReportListing={() => openModal("report-listing", b)}
                  onContactHost={() => handleContactHost(b)}
                  wishlisted={wishlistIds.includes(b.id)}
                  onToggleWishlist={() => toggleWishlist(b.id)}
                  onShare={() => handleShare(b)}
                />
              ))}
              <SharedPagination
                currentPage={pagination.page ?? 1}
                totalPages={pagination.totalPages ?? 1}
                onPageChange={(p) => setCurrentPage(p)}
                className="py-4"
              />
            </div>
          )
        )}
      </main>

      <AppFooter />

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
