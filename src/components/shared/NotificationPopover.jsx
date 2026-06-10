"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { BellIcon, CloseIcon } from "@/icons";

/* ─── helpers ─────────────────────────────────────────────────────────────────── */
function shortId(id) {
  if (!id) return null;
  return `#${String(id).slice(-6).toUpperCase()}`;
}

const TYPE_STYLES = {
  chat_message:      { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700"   },
  booking_confirmed: { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700"  },
  booking_cancelled: { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700"    },
  booking_pending:   { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
  booking_new:       { bg: "bg-teal-50",   border: "border-teal-200",   text: "text-teal-700"   },
  review:            { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  refund_requested:  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  refund_approved:   { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700"  },
  refund_rejected:   { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700"    },
};

function typeLabel(type) {
  if (!type) return null;
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function NotificationMeta({ type, data }) {
  const parts = [];
  if (data && typeof data === "object") {
    if (data.bookingId)      parts.push({ label: "Booking", value: shortId(data.bookingId) });
    if (data.listingId)      parts.push({ label: "Listing", value: shortId(data.listingId) });
    if (data.conversationId) parts.push({ label: "Chat",    value: shortId(data.conversationId) });
  }
  const typeStyle = TYPE_STYLES[type] ?? { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600" };
  const label = typeLabel(type);
  if (!label && parts.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1 mt-1.5">
      {label && (
        <span className={`inline-flex items-center text-[10px] font-bold rounded-full px-2 py-0.5 border ${typeStyle.bg} ${typeStyle.border} ${typeStyle.text}`}>
          {label}
        </span>
      )}
      {parts.map(({ label: l, value }) => (
        <span key={l} className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] rounded-full px-2 py-0.5">
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
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

/* ─── NotificationItem ────────────────────────────────────────────────────────── */
function NotificationItem({ n, onClick }) {
  const isNew = !n.isRead && !n.read;
  const title = n.title ?? "Notification";
  const text  = n.message ?? n.body ?? n.text ?? "";
  const time  = formatRelativeTime(n.createdAt ?? n.created_at);
  const typeStyle = TYPE_STYLES[n.type] ?? { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600" };

  return (
    <div
      onClick={() => onClick(n)}
      className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${isNew ? "bg-[#FFFBF0]" : "bg-white"}`}
    >
      {/* Icon circle */}
      <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center border ${typeStyle.bg} ${typeStyle.border}`}>
        <BellIcon size={15} className={typeStyle.text} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${isNew ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
            {title}
          </p>
          <span className="text-[10px] text-gray-400 font-medium shrink-0 mt-0.5">{time}</span>
        </div>
        {text && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{text}</p>
        )}
        <NotificationMeta type={n.type} data={n.data ?? n.metadata ?? null} />
      </div>

      {isNew && (
        <span className="w-2 h-2 bg-[#F5C842] rounded-full shrink-0 mt-1.5" />
      )}
    </div>
  );
}

/* ─── Main popover ───────────────────────────────────────────────────────────── */
/**
 * Props:
 *  onClose      {Function}  close the popover
 *  viewAllHref  {string}    "View All" navigation target
 */
export default function NotificationPopover({ onClose, viewAllHref = "/dashboard/notifications" }) {
  const dispatch = useDispatch();
  const router   = useRouter();
  const panelRef = useRef(null);

  const allNotifications = useSelector(selectNotifications);
  const status           = useSelector(selectNotificationsStatus);
  const unreadCount      = useSelector(selectUnreadCount);
  const hasNextPage      = useSelector(selectHasNextPage);
  const currentPage      = useSelector(selectCurrentPage);

  useEffect(() => {
    if (status === "idle") dispatch(fetchNotifications({ page: 1 }));
  }, [dispatch, status]);

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const isLoading     = status === "loading" && allNotifications.length === 0;
  const isLoadingMore = status === "loading" && allNotifications.length > 0;

  const handleItemClick = (n) => {
    const id = n._id ?? n.id;
    if (!n.isRead && !n.read) dispatch(markNotificationRead(id));
    const data = n.data ?? n.metadata ?? {};
    const type = n.type ?? "";
    if (type === "refund_requested") {
      router.push(data.refundRequestId ? `/admin/refund-requests/${data.refundRequestId}` : "/admin/refund-requests");
      onClose();
    } else if (type === "refund_approved" || type === "refund_rejected") {
      router.push("/user-dashboard/bookings");
      onClose();
    } else if (type === "booking_new" || type === "booking_cancelled") {
      router.push("/dashboard/reservations");
      onClose();
    }
  };

  const handleViewAll = () => {
    router.push(viewAllHref);
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] flex items-start justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Dimmed backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative mt-16 mr-4 sm:mr-8 w-[360px] sm:w-[420px] max-h-[calc(100vh-80px)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <BellIcon size={18} className="text-[#228E8A]" />
            <h3 className="text-base font-bold text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-xs font-bold text-white bg-[#F5C842] rounded-full px-2 py-0.5 leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllNotificationsRead())}
                className="text-xs font-semibold text-[#228E8A] hover:underline"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading && (
            <div className="flex flex-col">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-4 border-b border-gray-100 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && allNotifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <BellIcon size={22} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
            </div>
          )}

          {allNotifications.map((n) => (
            <NotificationItem key={n._id ?? n.id} n={n} onClick={handleItemClick} />
          ))}

          {hasNextPage && (
            <div className="px-5 py-3">
              <button
                onClick={() => { if (status !== "loading") dispatch(fetchNotifications({ page: currentPage + 1 })); }}
                disabled={isLoadingMore}
                className="w-full py-2.5 text-sm font-semibold text-[#228E8A] border border-[#228E8A] rounded-xl hover:bg-[#EBF6F6] transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>

        {/* Footer — View All */}
        <div className="shrink-0 border-t border-gray-100">
          <button
            onClick={handleViewAll}
            className="w-full py-3.5 text-sm font-bold text-[#228E8A] hover:bg-[#EBF6F6] transition-colors"
          >
            View All
          </button>
        </div>
      </div>
    </div>
  );
}
