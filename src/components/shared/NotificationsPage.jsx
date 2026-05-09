"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FEB538" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ALL_TODAY = [
  { id: 1, isNew: true,  title: "Congratulations", text: "Lorem ipsum dolor sit amet consectetur.", time: "1 min" },
  { id: 2, isNew: true,  title: "Congratulations", text: "Lorem ipsum dolor sit amet consectetur.", time: "1 min" },
  { id: 3, isNew: false, title: "Congratulations", text: "Lorem ipsum dolor sit amet consectetur.", time: "1 min" },
  { id: 4, isNew: false, title: "Congratulations", text: "Lorem ipsum dolor sit amet consectetur.", time: "1 min" },
  { id: 5, isNew: false, title: "New Booking",     text: "Someone just reserved your listing.",    time: "30 min" },
  { id: 6, isNew: false, title: "Payment Received", text: "Your payout has been processed.",       time: "2 hrs" },
];

const ALL_YESTERDAY = [
  { id: 7,  isNew: false, title: "Congratulations", text: "Lorem ipsum dolor sit amet consectetur.", time: "1 min" },
  { id: 8,  isNew: false, title: "Booking Confirmed", text: "Your reservation has been confirmed.", time: "3 hrs" },
  { id: 9,  isNew: false, title: "Review Received",   text: "A guest left you a 5-star review.",   time: "5 hrs" },
];

const INITIAL_SHOW = 4; // today items shown before "View More"
const STEP = 3;

function NotificationItem({ isNew, title, text, time }) {
  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 border transition-all ${
        isNew ? "bg-[#FFF8EE] border-[#F5E6C8]" : "bg-white border-gray-100"
      }`}
      style={{ borderRadius: "104px", borderWidth: "1.04px" }}
    >
      {/* Unread dot — inside, before bell */}
      {isNew ? (
        <span className="w-2.5 h-2.5 bg-[#F97316] rounded-full shrink-0" />
      ) : (
        <span className="w-2.5 shrink-0" />
      )}

      {/* Bell avatar */}
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${isNew ? "bg-white" : "bg-[#FFF8EE]"}`}>
        <BellIcon />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-extrabold text-[#111827] leading-snug">
          {title}
        </p>
        <p className="text-xs font-normal text-gray-500 mt-0.5">{text}</p>
      </div>

      {/* Time */}
      <span className="text-[11px] font-semibold text-gray-400 shrink-0 ml-2">{time}</span>
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [todayCount, setTodayCount] = useState(INITIAL_SHOW);
  const [showAllYesterday, setShowAllYesterday] = useState(false);

  const newCount = ALL_TODAY.filter((n) => n.isNew).length;
  const visibleToday = ALL_TODAY.slice(0, todayCount);
  const visibleYesterday = showAllYesterday ? ALL_YESTERDAY : ALL_YESTERDAY.slice(0, 1);
  const hasMoreToday = todayCount < ALL_TODAY.length;
  const hasMoreYesterday = !showAllYesterday && ALL_YESTERDAY.length > 1;
  const hasMore = hasMoreToday || hasMoreYesterday;

  const handleViewMore = () => {
    if (hasMoreToday) {
      setTodayCount((c) => Math.min(c + STEP, ALL_TODAY.length));
    } else {
      setShowAllYesterday(true);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-10 py-5 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-[#111827] hover:text-gray-500 transition-colors shrink-0"
        >
          <BackIcon />
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-extrabold text-[#111827]">Notifications</h1>
          <p className="text-sm font-medium text-gray-400">
            You have <span className="font-bold text-[#111827]">{newCount}</span> new notifications
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex-1 w-full bg-white rounded-3xl border border-gray-100 p-5 sm:p-7 lg:p-8 flex flex-col gap-6">

          {/* Today */}
          <section className="flex flex-col gap-3">
            {visibleToday.map((n) => (
              <NotificationItem key={n.id} {...n} />
            ))}
          </section>

          {/* Yesterday */}
          {visibleYesterday.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="text-base font-extrabold text-[#111827]">Yesterday</h3>
              {visibleYesterday.map((n) => (
                <NotificationItem key={n.id} {...n} />
              ))}
            </section>
          )}

          {/* View More */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={handleViewMore}
                className="px-12 py-3.5 bg-(--color-primary,#228E8A) text-white text-sm font-bold rounded-full hover:opacity-90 transition-opacity"
              >
                View More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
