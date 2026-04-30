"use client";

import React from "react";
import Link from "next/link";

const notifications = [
  { id: 1, text: "Lorem ipsum dolor sit amet consectetur.", time: "5 min ago", isNew: true },
  { id: 2, text: "Lorem ipsum dolor sit amet consectetur.", time: "1 hour ago", isNew: false },
  { id: 3, text: "Lorem ipsum dolor sit amet consectetur.", time: "8 hours ago", isNew: false },
];

/**
 * Shared notification popover used by both provider dashboard and user dashboard.
 *
 * Props:
 *  - onClose        {Function}  called when "View All" is clicked
 *  - viewAllHref    {string}    route for "View All" link  (e.g. "/dashboard/notifications" or "/user-dashboard/notifications")
 */
export default function NotificationPopover({ onClose, viewAllHref = "/dashboard/notifications" }) {
  return (
    <div
      className="absolute bg-white rounded-2xl border border-gray-100 overflow-hidden z-[60] shadow-xl"
      style={{ width: 517, top: "calc(100% + 12px)", right: 0 }}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-extrabold text-[var(--color-text,#1a1a1a)]">Notifications</h3>
          <button className="text-sm font-bold text-[var(--color-secondary,#F5C842)] hover:underline">
            Mark all as read
          </button>
        </div>

        {/* List */}
        <div>
          {notifications.map((n, i) => (
            <div key={n.id} className={`px-6 py-5 hover:bg-gray-50 transition-colors ${i < notifications.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div className="flex items-start gap-3">
                {n.isNew ? (
                  <span className="w-2.5 h-2.5 bg-[var(--color-secondary,#F5C842)] rounded-full mt-1 shrink-0" />
                ) : (
                  <span className="w-2.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text,#1a1a1a)] leading-relaxed">
                    {n.text}
                  </p>
                  <p className="text-xs text-gray-400 font-medium mt-1">{n.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <Link
          href={viewAllHref}
          onClick={onClose}
          className="block py-4 text-center text-sm font-bold text-[var(--color-secondary,#F5C842)] hover:bg-gray-50 border-t border-gray-100 transition-colors"
        >
          View All
        </Link>
      </div>
    </div>
  );
}
