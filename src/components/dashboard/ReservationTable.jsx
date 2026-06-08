"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import heroImg from "@/assets/images/HeroImg.jpg";
import { MoreHorizIcon, CheckCircleIcon, ClockIcon, RefundIcon, MapPinIcon } from "@/icons";

/* ─── Action Dropdown ─────────────────────────────────────────────────────────
   Opens above when the row index is in the last 2 rows of the visible set.     */
function ActionMenu({ item, onViewDetails, onCancel, onApprove, isNearBottom, totalRows }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Open upward only when near the bottom AND enough rows fill the scroll area */
  const popupPositionClass = (isNearBottom && totalRows >= 6)
    ? "bottom-full mb-1"
    : "top-full mt-1";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <MoreHorizIcon />
      </button>

      {open && (
        <div
          className={`absolute right-0 z-40 bg-white border border-gray-200 rounded-2xl py-1.5 min-w-[160px] shadow-lg ${popupPositionClass}`}
        >
          {(item.status === "Upcoming" || item.status === "Pending") && (
            <button
              onClick={() => { setOpen(false); onApprove?.(item); }}
              style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-text hover:bg-gray-50 transition-colors"
            >
              Approve
            </button>
          )}
          <button
            onClick={() => { setOpen(false); onViewDetails(item); }}
            style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-gray-50 transition-colors"
          >
            View Details
          </button>
          {item.status === "Upcoming" && (
            <button
              onClick={() => { setOpen(false); onCancel(item); }}
              style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Table ──────────────────────────────────────────────────────────────────── */
export default function ReservationTable({ data, onViewDetails, onCancel, onApprove, activeTab = "all" }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Upcoming":  return "bg-[#CFEDEC] text-[#168F8D]";
      case "Completed": return "bg-[#DDFBE7] text-[#12A84A]";
      case "Cancelled": return "bg-[#FFE0DE] text-[#FF1F1F]";
      case "Pending":   return "bg-[#FFF3CD] text-[#D97706]";
      default:          return "bg-gray-100 text-gray-500";
    }
  };

  const getInvoiceStyle = (status) => {
    switch (status) {
      case "Paid":     return "text-[#27AE60]";
      case "Overdue":  return "text-[#F5A623]";
      case "Refunded": return "text-[#E25C5C]";
      default:         return "text-gray-500";
    }
  };

  const getInvoiceIcon = (status) => {
    switch (status) {
      case "Paid":     return <CheckCircleIcon size={13} />;
      case "Overdue":  return <ClockIcon size={13} />;
      case "Refunded": return <RefundIcon size={13} />;
      default:         return null;
    }
  };

  const getPaymentStatusStyle = (ps) => {
    switch (ps) {
      case "held":              return "bg-blue-50 text-blue-600";
      case "released":          return "bg-green-50 text-green-600";
      case "refunded":          return "bg-red-50 text-red-500";
      case "processing":        return "bg-yellow-50 text-yellow-600";
      case "requires_payment":  return "bg-gray-100 text-gray-500";
      default:                  return "bg-gray-100 text-gray-400";
    }
  };

  const paymentStatusLabel = (ps) => {
    switch (ps) {
      case "held":              return "Held";
      case "released":          return "Released";
      case "refunded":          return "Refunded";
      case "processing":        return "Processing";
      case "requires_payment":  return "Unpaid";
      default:                  return ps ?? "—";
    }
  };

  const totalRows = data.length;
  const headers = ["Reservation", "Category", "Invoice", "Reserved By", "Date & Time", "Status", "Actions"];

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-[#E0E0E0] bg-white">
      <div
        className="h-full overflow-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}
      >
        <table className="w-full min-w-[980px] border-collapse text-left">
          {/* ── Thead ── */}
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-[#E0E0E0] bg-[#FBFCFD]">
              {headers.map((h) => (
                <th
                  key={h}
                  style={{
                    fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                    lineHeight: "21px",
                    letterSpacing: 0,
                  }}
                  className="px-5 py-3 text-[var(--color-text)] whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Tbody ── */}
          <tbody className="divide-y divide-[#E8E8E8]">
            {data.map((item, index) => {
              const isNearBottom = index >= totalRows - 2;
              return (
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
                      <div className="min-w-0">
                        <p
                          style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 600 }}
                          className="text-[13px] text-[var(--color-text)] whitespace-nowrap"
                        >
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted)] whitespace-nowrap flex items-center gap-1 mt-0.5">
                          <MapPinIcon size={10} className="shrink-0" />
                          {item.location}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-3">
                    <span
                      style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 600 }}
                      className="text-[12px] text-[var(--color-text)] bg-[#F3F4F6] px-3 py-1 rounded-full whitespace-nowrap"
                    >
                      {item.category}
                    </span>
                  </td>

                  {/* Invoice / Payment Status */}
                  <td className="px-5 py-3">
                    <div className="flex flex-col gap-1">
                      <div className={`flex items-center gap-1.5 text-[12px] font-semibold ${getInvoiceStyle(item.invoice)}`}
                        style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}
                      >
                        {getInvoiceIcon(item.invoice)}
                        <span>{item.invoice}</span>
                      </div>
                      {item.paymentStatus && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${getPaymentStatusStyle(item.paymentStatus)}`}>
                          {paymentStatusLabel(item.paymentStatus)}
                        </span>
                      )}
                      {item.activeRefundRequest && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-50 text-yellow-700 w-fit">
                          Refund Pending
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Reserved By */}
                  <td
                    className="px-5 py-3 text-[12px] text-[var(--color-text)] whitespace-nowrap"
                    style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 500 }}
                  >
                    {item.reservedBy}
                  </td>

                  {/* Date & Time */}
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div
                      className="text-[12px] text-[var(--color-text)]"
                      style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 600 }}
                    >
                      {item.date}
                    </div>
                    <div
                      className="text-[11px] text-[var(--color-text-muted)] mt-0.5"
                      style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}
                    >
                      {item.time}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3">
                    <span
                      style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif", fontWeight: 600 }}
                      className={`text-[11px] px-3.5 py-1.5 rounded-full whitespace-nowrap ${getStatusStyle(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <div className="flex items-center">
                      <ActionMenu
                        item={item}
                        onViewDetails={onViewDetails}
                        onCancel={onCancel}
                        onApprove={onApprove}
                        isNearBottom={isNearBottom}
                        totalRows={totalRows}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
