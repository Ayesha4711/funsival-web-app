"use client";

import React from "react";
import Link from "next/link";

export default function NotificationPopover({ onClose }) {
  const notifications = [
    { id: 1, text: "Lorem ipsum dolor sit amet consectetur.", time: "5 min ago", isNew: true },
    { id: 2, text: "Lorem ipsum dolor sit amet consectetur.", time: "1 hour ago", isNew: false },
    { id: 3, text: "Lorem ipsum dolor sit amet consectetur.", time: "8 hours ago", isNew: false },
  ];

  return (
    <div className="absolute right-0 top-full mt-3 w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-50">
        <h3 className="text-base font-extrabold text-[var(--color-text)]">Notifications</h3>
        <button className="text-[11px] font-bold text-[var(--color-secondary)] hover:underline">
          Mark all as read
        </button>
      </div>

      {/* List */}
      <div className="max-h-[300px] overflow-y-auto">
        {notifications.map((n) => (
          <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors relative">
            <div className="flex gap-3">
              {n.isNew && <span className="w-2 h-2 bg-[var(--color-secondary)] rounded-full mt-1.5 shrink-0" />}
              <div className={!n.isNew ? "pl-5" : ""}>
                <p className="text-xs font-bold text-[var(--color-text)] leading-relaxed mb-1">
                  {n.text}
                </p>
                <p className="text-[10px] text-gray-400 font-medium">{n.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <Link 
        href="/dashboard/notifications" 
        onClick={onClose}
        className="block p-4 text-center text-xs font-bold text-[var(--color-secondary)] hover:bg-gray-50 border-t border-gray-50 transition-colors"
      >
        View All
      </Link>
    </div>
  );
}
