"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
  selectNotifications,
  selectNotificationsStatus,
  selectUnreadCount,
  selectHasNextPage,
  selectCurrentPage,
} from "@/store/slices/notificationsSlice";

import { BellIcon, ArrowLeftIcon as BackIcon, TrashIcon } from "@/icons";

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
  if (days < 7) return `${days} days ago`;
  return new Date(isoString).toLocaleDateString([], { month: "short", day: "numeric" });
}

function groupByDay(notifications) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups = {};
  notifications.forEach((n) => {
    const d = new Date(n.createdAt ?? n.created_at ?? Date.now());
    d.setHours(0, 0, 0, 0);
    let label;
    if (d.getTime() === today.getTime()) label = "Today";
    else if (d.getTime() === yesterday.getTime()) label = "Yesterday";
    else label = d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
}

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
    if (data.bookingId)     parts.push({ label: "Booking",  value: shortId(data.bookingId) });
    if (data.listingId)     parts.push({ label: "Listing",  value: shortId(data.listingId) });
    if (data.orderId)       parts.push({ label: "Order",    value: shortId(data.orderId) });
    if (data.reviewId)      parts.push({ label: "Review",   value: shortId(data.reviewId) });
    if (data.conversationId)parts.push({ label: "Chat",     value: shortId(data.conversationId) });
  }

  const typeStyle = TYPE_STYLES[type] ?? { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600" };
  const label = typeLabel(type);

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
      {label && (
        <span className={`inline-flex items-center text-[10px] font-bold rounded-full px-2 py-0.5 border ${typeStyle.bg} ${typeStyle.border} ${typeStyle.text}`}>
          {label}
        </span>
      )}
      {userId && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5">
          <span className="text-gray-400">User:</span>{shortId(userId)}
        </span>
      )}
      {parts.map(({ label: l, value }) => (
        <span
          key={l}
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] rounded-full px-2 py-0.5"
        >
          <span className="text-[#B45309]">{l}:</span>
          {value}
        </span>
      ))}
    </div>
  );
}

function NotificationItem({ notification, dispatch, isSelected, onSelect }) {
  const isNew = !notification.isRead && !notification.read;
  const id = notification._id ?? notification.id;
  const title = notification.title ?? "Notification";
  const text = notification.message ?? notification.body ?? notification.text ?? "";
  const time = formatRelativeTime(notification.createdAt ?? notification.created_at);
  const meta = notification.data ?? notification.metadata ?? null;

  const handleClick = () => {
    onSelect(id);
    if (isNew) dispatch(markNotificationRead(id));
  };

  // const handleDelete = (e) => {
  //   e.stopPropagation();
  //   dispatch(deleteNotification(id));
  // };

  const bgClass = isSelected
    ? "bg-[#FDECC8] border-[#F5C842]"
    : isNew
    ? "border-[#F5E6C8]"
    : "bg-white border-gray-100";

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-4 px-5 py-4 border transition-all cursor-pointer group ${bgClass}`}
      style={{
        borderRadius: "104px",
        borderWidth: "1.04px",
        backgroundColor: isSelected ? "#FDECC8" : isNew ? "rgba(255, 240, 215, 1)" : "#ffffff",
      }}
    >
      {isNew ? (
        <span className="w-2.5 h-2.5 bg-[#F97316] rounded-full shrink-0" />
      ) : (
        <span className="w-2.5 shrink-0" />
      )}

      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${isNew ? "bg-white" : "bg-[#FFF8EE]"}`}>
        <BellIcon />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-extrabold text-[#111827] leading-snug">{title}</p>
        {text && <p className="text-xs font-normal text-gray-500 mt-0.5">{text}</p>}
        <NotificationMeta type={notification.type} userId={notification.userId} data={meta} />
      </div>

      <span className="text-[11px] font-semibold text-gray-400 shrink-0 ml-2">{time}</span>

      {/* <button
        onClick={handleDelete}
        className="shrink-0 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-1"
        title="Delete notification"
      >
        <TrashIcon />
      </button> */}
    </div>
  );
}

function SkeletonItem() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border border-gray-100 rounded-full animate-pulse">
      <span className="w-2.5 h-2.5 rounded-full bg-gray-200 shrink-0" />
      <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-2 bg-gray-100 rounded w-2/3" />
      </div>
      <div className="h-2 w-10 bg-gray-100 rounded" />
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const status = useSelector(selectNotificationsStatus);
  const unreadCount = useSelector(selectUnreadCount);
  const hasNextPage = useSelector(selectHasNextPage);
  const currentPage = useSelector(selectCurrentPage);
  const [selectedId, setSelectedId] = React.useState(null);
  const handleSelect = (id) => setSelectedId((prev) => (prev === id ? null : id));

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1 }));
  }, [dispatch]);

  const handleMarkAllRead = useCallback(() => {
    dispatch(markAllNotificationsRead());
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage) {
      dispatch(fetchNotifications({ page: currentPage + 1 }));
    }
  }, [dispatch, hasNextPage, currentPage]);

  const groups = groupByDay(notifications);
  const groupKeys = Object.keys(groups);
  const isLoading = status === "loading" && notifications.length === 0;

  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-[#111827] hover:text-gray-500 transition-colors shrink-0"
          >
            <BackIcon />
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-extrabold text-[#111827]">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm font-medium text-gray-400">
                You have <span className="font-bold text-[#111827]">{unreadCount}</span> new notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-bold text-[var(--color-secondary,#F5C842)] hover:underline shrink-0"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex-1 w-full bg-white rounded-3xl border border-gray-100 p-5 sm:p-7 lg:p-8 flex flex-col gap-6">

          {isLoading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((i) => <SkeletonItem key={i} />)}
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-4xl">🔔</span>
              <p className="text-sm font-medium text-gray-400">No notifications yet</p>
            </div>
          )}

          {groupKeys.map((label) => (
            <section key={label} className="flex flex-col gap-3">
              {label !== "Today" && (
                <h3 className="text-base font-extrabold text-[#111827]">{label}</h3>
              )}
              {groups[label].map((n) => (
                <NotificationItem key={n._id ?? n.id} notification={n} dispatch={dispatch} isSelected={selectedId === (n._id ?? n.id)} onSelect={handleSelect} />
              ))}
            </section>
          ))}

          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <button
                onClick={handleLoadMore}
                disabled={status === "loading"}
                className="px-12 py-3.5 bg-[var(--color-primary,#228E8A)] text-white text-sm font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {status === "loading" ? "Loading…" : "View More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
