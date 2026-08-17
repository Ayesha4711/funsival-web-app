"use client";

import React, { useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import heroImg from "@/assets/images/HeroImg.jpg";
import { MoreHorizIcon, CheckCircleIcon, ClockIcon, RefundIcon, MapPinIcon } from "@/icons";
import useDropdownPosition from "@/hooks/useDropdownPosition";

const MENU_WIDTH = 180;

/* ─── Action Dropdown — portal-based so it escapes overflow/scroll clipping ── */
function ActionMenu({ item, onViewDetails, onCancel, onAccept, onDecline }) {
  const isActionNeeded = item.status === "Action Needed";
  const isUpcoming     = item.status === "Upcoming";

  const getHeight = useCallback(() => {
    const itemCount = (isActionNeeded ? 2 : 0) + 1 + (isUpcoming || isActionNeeded ? 1 : 0);
    return itemCount * 44 + 12;
  }, [isActionNeeded, isUpcoming]);

  const { open, toggle, close, pos, btnRef, menuRef } = useDropdownPosition({
    width: MENU_WIDTH,
    getHeight,
    align: "right",
  });

  const menu = open && (
    <div
      ref={menuRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999, width: MENU_WIDTH }}
      className="bg-white border border-gray-200 rounded-2xl py-1.5 shadow-lg"
    >
      {isActionNeeded && (
        <>
          <button
            onClick={() => { close(); onAccept?.(item); }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors"
          >
            ✓ Accept Booking
          </button>
          <button
            onClick={() => { close(); onDecline?.(item); }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            ✕ Decline
          </button>
        </>
      )}
      <button
        onClick={() => { close(); onViewDetails(item); }}
        className="w-full text-left px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-gray-50 transition-colors"
      >
        View Details
      </button>
      {(isUpcoming || isActionNeeded) && (
        <button
          onClick={() => { close(); onCancel(item); }}
          className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );

  return (
    <div className="flex justify-center">
      <button
        ref={btnRef}
        onClick={toggle}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <MoreHorizIcon />
      </button>
      {typeof document !== "undefined" && createPortal(menu, document.body)}
    </div>
  );
}

/* ─── Table ──────────────────────────────────────────────────────────────────── */
export default function ReservationTable({ data, onViewDetails, onCancel, onAccept, onDecline }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Upcoming":      return "bg-[#CFEDEC] text-[#168F8D]";
      case "Completed":     return "bg-[#DDFBE7] text-[#12A84A]";
      case "Cancelled":     return "bg-[#FFE0DE] text-[#FF1F1F]";
      case "Declined":      return "bg-[#FFE0DE] text-[#FF1F1F]";
      case "Action Needed": return "bg-amber-100 text-amber-700";
      case "Pending":       return "bg-[#FFF3CD] text-[#D97706]";
      default:              return "bg-gray-100 text-gray-500";
    }
  };

  const getInvoiceStyle = (status) => {
    switch (status) {
      case "Paid":        return "text-[#27AE60]";
      case "Overdue":     return "text-[#F5A623]";
      case "Refunded":    return "text-[#E25C5C]";
      case "Authorized":  return "text-[#6366F1]";
      case "Processing":  return "text-[#6366F1]";
      case "Pending":     return "text-[#D97706]";
      default:            return "text-gray-500";
    }
  };

  const getInvoiceIcon = (status) => {
    switch (status) {
      case "Paid":        return <CheckCircleIcon size={13} />;
      case "Overdue":     return <ClockIcon size={13} />;
      case "Refunded":    return <RefundIcon size={13} />;
      case "Authorized":  return <ClockIcon size={13} />;
      case "Processing":  return <ClockIcon size={13} />;
      case "Pending":     return <ClockIcon size={13} />;
      default:            return null;
    }
  };

  const headers = ["Reservation", "Category", "Invoice", "Reserved By", "Date & Time", "Status", "Actions"];

  return (
    <div
      className="rounded-2xl border border-[#E0E0E0] bg-white flex flex-col"
      style={{ minHeight: 596 }}
    >
      <div
        className="flex-1 overflow-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}
      >
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[#E0E0E0] bg-[#FBFCFD]">
              {headers.map((h) => (
                <th
                  key={h}
                  style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 600, fontSize: 14, lineHeight: "21px", letterSpacing: 0 }}
                  className="px-5 py-3 text-[var(--color-text)] whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E8E8E8]">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">

                {/* Reservation */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <Image src={heroImg} alt={item.name} fill className="object-cover" />
                      }
                    </div>
                    <div className="min-w-0 max-w-[180px]">
                      <p style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 600 }} className="text-[13px] text-[var(--color-text)] truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5 min-w-0">
                        <MapPinIcon size={10} className="shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-5 py-3">
                  <span style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 600 }} className="text-[12px] text-[var(--color-text)] bg-[#F3F4F6] px-3 py-1 rounded-full whitespace-nowrap">
                    {item.category}
                  </span>
                </td>

                {/* Invoice */}
                <td className="px-5 py-3">
                  <div className="flex flex-col gap-1">
                    <div className={`flex items-center gap-1.5 text-[12px] font-semibold ${getInvoiceStyle(item.invoice)}`} style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}>
                      {getInvoiceIcon(item.invoice)}
                      <span>{item.invoice}</span>
                    </div>
                    {item.activeRefundRequest && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-50 text-yellow-700 w-fit">
                        Refund Pending
                      </span>
                    )}
                  </div>
                </td>

                {/* Reserved By */}
                <td className="px-5 py-3 text-[12px] text-[var(--color-text)] whitespace-nowrap" style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 500 }}>
                  {item.reservedBy}
                </td>

                {/* Date & Time */}
                <td className="px-5 py-3">
                  <div className="text-[12px] text-[var(--color-text)] font-semibold whitespace-nowrap" style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}>
                    {item.dateRange}
                  </div>
                  {Array.isArray(item.timeRanges) && item.timeRanges.length > 0 ? (
                    <div className="mt-0.5 flex flex-col gap-0.5 text-[11px] text-[var(--color-text-muted)] whitespace-nowrap" style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}>
                      {item.timeRanges.map((range, index) => (
                        <span key={`${range}-${index}`}>{range}</span>
                      ))}
                    </div>
                  ) : item.time ? (
                    <div className="text-[11px] text-[var(--color-text-muted)] whitespace-nowrap mt-0.5" style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}>
                      {item.time}
                    </div>
                  ) : null}
                </td>

                {/* Status */}
                <td className="px-5 py-3">
                  <span style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 600 }} className={`text-[11px] px-3.5 py-1.5 rounded-full whitespace-nowrap ${getStatusStyle(item.status)}`}>
                    {item.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-3">
                  <ActionMenu
                    item={item}
                    onViewDetails={onViewDetails}
                    onCancel={onCancel}
                    onAccept={onAccept}
                    onDecline={onDecline}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
