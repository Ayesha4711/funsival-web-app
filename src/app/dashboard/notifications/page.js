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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

function NotificationItem({ isNew, text, time }) {
  return (
    <div className={`relative flex items-center gap-4 p-5 rounded-3xl border transition-all ${isNew ? 'bg-[#FFF8EE] border-[#FFEDD5]' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'}`}>
      {isNew && <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#F97316] rounded-full" />}
      
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isNew ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
        <BellIcon />
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-extrabold text-[#111827] mb-1">Congratulations</h4>
        <p className="text-xs text-gray-500 font-medium">Lorem ipsum dolor sit amet consectetur.</p>
      </div>

      <div className="text-[10px] font-bold text-gray-400 shrink-0">
        {time}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[1200px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-white hover:shadow-sm transition-all"
        >
          <BackIcon />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827]">Notifications</h1>
          <p className="text-xs font-bold text-gray-400 mt-0.5">You have <span className="text-[var(--color-secondary)]">2</span> new notifications</p>
        </div>
      </div>

      <div className="flex flex-col gap-10 max-w-[900px]">
        {/* Today */}
        <section>
          <div className="flex flex-col gap-4">
            <NotificationItem isNew={true} time="1 min" />
            <NotificationItem isNew={true} time="1 min" />
            <NotificationItem isNew={false} time="1 min" />
            <NotificationItem isNew={false} time="1 min" />
          </div>
        </section>

        {/* Yesterday */}
        <section>
          <h3 className="text-lg font-extrabold text-[#111827] mb-6">Yesterday</h3>
          <div className="flex flex-col gap-4">
            <NotificationItem isNew={false} time="1 min" />
            <NotificationItem isNew={false} time="1 min" />
            <NotificationItem isNew={false} time="1 min" />
          </div>
        </section>

        {/* View More */}
        <div className="flex justify-center mt-4">
          <button className="px-12 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-[var(--color-primary-light)]">
             View More
          </button>
        </div>
      </div>
    </div>
  );
}
