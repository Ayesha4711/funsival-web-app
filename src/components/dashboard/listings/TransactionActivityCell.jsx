"use client";

import React from "react";
import { CircleCheckIcon, CircleClockIcon, CircleAlertIcon } from "@/icons";

const ACTIVITY_ICON_CONFIG = {
  place:     { Icon: CircleCheckIcon, color: "#22c55e" },
  equipment: { Icon: CircleClockIcon, color: "#f97316" },
  service:   { Icon: CircleAlertIcon, color: "#ef4444" },
};

/**
 * Renders the activity name with a coloured circle icon based on listing type.
 * Used in TransactionHistory table and mobile cards.
 */
export default function TransactionActivityCell({ activity, type }) {
  const cfg = ACTIVITY_ICON_CONFIG[type] ?? ACTIVITY_ICON_CONFIG.service;
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0">
        <cfg.Icon size={16} color={cfg.color} />
      </span>
      <span className="whitespace-nowrap text-[13px] font-medium text-[#111827]">
        {activity}
      </span>
    </div>
  );
}
