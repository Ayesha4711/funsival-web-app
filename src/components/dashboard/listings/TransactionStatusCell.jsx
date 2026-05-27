"use client";

import React from "react";
import { CircleCheckIcon, CircleClockIcon, CircleAlertIcon } from "@/icons";

const STATUS_CONFIG = {
  Completed: { Icon: CircleCheckIcon, color: "#22c55e" },
  Pending:   { Icon: CircleClockIcon, color: "#f97316" },
  Refunded:  { Icon: CircleAlertIcon, color: "#ef4444" },
};

/**
 * Renders a transaction status with a coloured icon and text — no pill.
 * Used in TransactionHistory table and mobile cards.
 */
export default function TransactionStatusCell({ status }) {
  const { Icon, color } = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={16} color={color} />
      <span
        className="text-[13px] font-semibold whitespace-nowrap"
        style={{ color }}
      >
        {status}
      </span>
    </div>
  );
}
