"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  selectNotifications,
  selectNotificationsStatus,
  selectUnreadCount,
  selectHasNextPage,
  selectCurrentPage,
} from "@/store/slices/notificationsSlice";

function shortId(id) {
  if (!id) return null;
  return `#${String(id).slice(-6).toUpperCase()}`;
}

const TYPE_STYLES = {
  chat_message:       { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700"   },
  booking_confirmed:  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700"  },
  booking_cancelled:  { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700"    },
  booking_pending:    { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
  review:             { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
};

function typeLabel(type) {
  if (!type) return null;
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function NotificationMeta({ type, userId, data }) {
  const parts = [];
  if (data && typeof data === "object") {
    if (data.bookingId)      parts.push({ label: "Booking", value: shortId(data.bookingId) });
    if (data.listingId)      parts.push({ label: "Listing", value: shortId(data.listingId) });
    if (data.orderId)        parts.push({ label: "Order",   value: shortId(data.orderId) });
    if (data.conversationId) parts.push({ label: "Chat",    value: shortId(data.conversationId) });
  }

  const typeStyle = TYPE_STYLES[type] ?? { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600" };
  const label = typeLabel(type);
  const hasAnything = label || userId || parts.length > 0;
  if (!hasAnything) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {label && (
        <span className={`inline-flex items-center text-[10px] font-bold rounded-full px-1.5 py-0.5 border ${typeStyle.bg} ${typeStyle.border} ${typeStyle.text}`}>
          {label}
        </span>
      )}
      {userId && (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-1.5 py-0.5">
          <span className="text-gray-400">User:</span>{shortId(userId)}
        </span>
      )}
      {parts.map(({ label: l, value }) => (
        <span key={l} className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] rounded-full px-1.5 py-0.5">
          <span className="text-[#B45309]">{l}:</span>{value}
        </span>
      ))}
    </div>
  );
}

function formatRelativeTime(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

/**
 * Shared notification popover used by both provider dashboard and user dashboard.
 * Props:
 *  - onClose       {Function}  called when "View All" is clicked
 *  - viewAllHref   {string}    route for "View All" link
 */
export default function NotificationPopover({ onClose, viewAllHref = "/dashboard/notifications" }) {
  const dispatch = useDispatch();
  const allNotifications = useSelector(selectNotifications);
  const status = useSelector(selectNotificationsStatus);
  const unreadCount = useSelector(selectUnreadCount);
  const hasNextPage = useSelector(selectHasNextPage);
  const currentPage = useSelector(selectCurrentPage);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchNotifications({ page: 1 }));
    }
  }, [dispatch, status]);

  const isLoading = status === "loading" && allNotifications.length === 0;
  const isLoadingMore = status === "loading" && allNotifications.length > 0;

  const handleLoadMore = () => {
    if (status !== "loading") {
      dispatch(fetchNotifications({ page: currentPage + 1 }));
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleItemClick = (n) => {
    const id = n._id ?? n.id;
    if (!n.isRead && !n.read) dispatch(markNotificationRead(id));
  };

  return (
    <div
      className="absolute bg-white rounded-2xl border border-gray-100 overflow-hidden z-60 shadow-xl"
      style={{ width: 517, top: "calc(100% + 12px)", right: 0 }}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-extrabold text-text">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs font-bold text-white bg-secondary rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-bold text-secondary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col divide-y divide-gray-50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-6 py-5 animate-pulse flex gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200 mt-1 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && allNotifications.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-gray-400">
              No notifications yet
            </div>
          )}

          {allNotifications.map((n, i) => {
            const isNew = !n.isRead && !n.read;
            const title = n.title ?? "Notification";
            const text = n.message ?? n.body ?? n.text ?? "";
            const time = formatRelativeTime(n.createdAt ?? n.created_at);
            return (
              <div
                key={n._id ?? n.id}
                onClick={() => handleItemClick(n)}
                className={`px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer ${i < allNotifications.length - 1 ? "border-b border-gray-100" : ""} ${isNew ? "bg-[#FFF8EE]" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {isNew ? (
                    <span className="w-2.5 h-2.5 bg-secondary rounded-full mt-1 shrink-0" />
                  ) : (
                    <span className="w-2.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text leading-relaxed">
                      {title}
                    </p>
                    {text && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{text}</p>
                    )}
                    <NotificationMeta type={n.type} userId={n.userId} data={n.data ?? n.metadata ?? null} />
                    <p className="text-xs text-gray-400 font-medium mt-1">{time}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Load more */}
          {hasNextPage && (
            <div className="px-6 py-3 border-t border-gray-100">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full py-2.5 text-sm font-semibold text-secondary border border-secondary rounded-xl hover:bg-secondary/5 transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? "Loading..." : "View More"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <Link
          href={viewAllHref}
          onClick={onClose}
          className="block py-4 text-center text-sm font-bold text-secondary hover:bg-gray-50 border-t border-gray-100 transition-colors"
        >
          View All
        </Link>
      </div>
    </div>
  );
}
