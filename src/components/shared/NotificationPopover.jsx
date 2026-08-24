"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  selectRecentNotifications,
  selectNotificationsStatus,
} from "@/store/slices/notificationsSlice";
import { BellIcon } from "@/icons";

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
function NotificationItem({ n, onClick, isSelected, isLast }) {
  const title = n.title ?? "Notification";
  const time  = formatRelativeTime(n.createdAt ?? n.created_at);

  return (
    <div
      onClick={() => onClick(n)}
      className={`flex items-start gap-2 px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${isLast ? "" : "border-b border-gray-100"}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${isSelected ? "bg-[#F5C842]" : "bg-transparent"}`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 leading-snug">{title}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
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
  const [selectedId, setSelectedId] = React.useState(null);

  const allNotifications = useSelector(selectRecentNotifications);
  const status           = useSelector(selectNotificationsStatus);

  useEffect(() => {
    if (status === "idle") dispatch(fetchNotifications({ page: 1 }));
  }, [dispatch, status]);

  // close on Escape or on outside click
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  const preview = allNotifications.slice(0, 3);
  const isLoading = status === "loading" && allNotifications.length === 0;

  const handleItemClick = (n) => {
    const id = n._id ?? n.id;
    setSelectedId(id);
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
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-3 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden z-50"
      style={{ width: "517px", maxWidth: "calc(100vw - 2rem)", maxHeight: "402px" }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b-2 border-[#228E8A]/15 shrink-0 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
        <button
          onClick={() => dispatch(markAllNotificationsRead())}
          className="text-xs font-semibold text-[#F5C842] hover:underline"
        >
          Mark all as read
        </button>
      </div>

      {/* List (preview only) */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex flex-col">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2 px-5 py-3 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-200 shrink-0 mt-1.5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && preview.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <BellIcon size={20} className="text-gray-300" />
            <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
          </div>
        )}

        {preview.map((n, i) => {
          const id = n._id ?? n.id;
          const isSelected = selectedId ? selectedId === id : i === 0;
          return (
            <NotificationItem
              key={id}
              n={n}
              onClick={handleItemClick}
              isSelected={isSelected}
              isLast={i === preview.length - 1}
            />
          );
        })}
      </div>

      {/* Footer — View All */}
      <button
        onClick={handleViewAll}
        className="w-full py-3 text-sm font-bold text-[#F5C842] hover:bg-gray-50 border-t border-gray-100 transition-colors shrink-0"
      >
        View All
      </button>
    </div>
  );
}
