"use client";

import React from "react";
import { useRouter } from "next/navigation";

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FEB538" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

const NOTIFICATIONS = [
  { id: 1, isNew: true,  title: "Congratulations", text: "Lorem ipsum dolor sit amet consectetur.", time: "1 min" },
  { id: 2, isNew: true,  title: "Congratulations", text: "Lorem ipsum dolor sit amet consectetur.", time: "1 min" },
  { id: 3, isNew: false, title: "Congratulations", text: "Lorem ipsum dolor sit amet consectetur.", time: "1 min" },
  { id: 4, isNew: false, title: "Congratulations", text: "Lorem ipsum dolor sit amet consectetur.", time: "1 min" },
];

const YESTERDAY = [
  { id: 5, isNew: false, title: "Congratulations", text: "Lorem ipsum dolor sit amet consectetur.", time: "1 min" },
];

function NotificationItem({ isNew, title, text, time }) {
  return (
    <div className={`relative flex items-center gap-4 p-4 sm:p-5 rounded-3xl border transition-all ${isNew ? "bg-[#FFF8EE] border-[#FFEDD5]" : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"}`}>
      {isNew && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#F97316] rounded-full" />
      )}
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${isNew ? "bg-white shadow-sm" : "bg-gray-50"}`}>
        <BellIcon />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-extrabold text-[#111827] mb-0.5">{title}</h4>
        <p className="text-xs text-gray-500 font-medium">{text}</p>
      </div>
      <div className="text-[10px] font-bold text-gray-400 shrink-0">{time}</div>
    </div>
  );
}

/**
 * Shared notifications page used by both provider dashboard and user dashboard.
 */
export default function NotificationsPage() {
  const router = useRouter();
  const newCount = NOTIFICATIONS.filter((n) => n.isNew).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-10 w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm transition-all"
        >
          <BackIcon />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-[#111827]">Notifications</h1>
          <p className="text-xs font-bold text-gray-400 mt-0.5">
            You have <span className="text-[var(--color-secondary,#F5C842)]">{newCount}</span> new notifications
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Today */}
        <section>
          <div className="flex flex-col gap-3">
            {NOTIFICATIONS.map((n) => (
              <NotificationItem key={n.id} {...n} />
            ))}
          </div>
        </section>

        {/* Yesterday */}
        <section>
          <h3 className="text-base font-extrabold text-[#111827] mb-4">Yesterday</h3>
          <div className="flex flex-col gap-3">
            {YESTERDAY.map((n) => (
              <NotificationItem key={n.id} {...n} />
            ))}
          </div>
        </section>

        {/* View More */}
        <div className="flex justify-center mt-2">
          <button className="px-10 py-3 bg-[var(--color-primary,#4AA7A7)] text-white text-sm font-bold rounded-full hover:opacity-90 transition-opacity shadow-md">
            View More
          </button>
        </div>
      </div>
    </div>
  );
}
