"use client";

import React from "react";
import EarningsStats from "@/components/dashboard/EarningsStats";
import { EarningsTrend, RevenueByCategory } from "@/components/dashboard/EarningsCharts";
import TransactionHistory from "@/components/dashboard/TransactionHistory";

export default function EarningsPage() {
  return (
    <div className="p-3 sm:p-6 lg:p-10 max-w-[1600px] mx-auto flex flex-col gap-4 sm:gap-6 bg-[#F3F4F6] flex-1">
      {/* Row 1 — Stats */}
      <EarningsStats />

      {/* Row 2 — Charts: mobile/iPad stacked (Revenue on top), lg+ side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mobile: Revenue first, Trend second via order */}
        <div className="lg:col-span-1 order-first lg:order-last">
          <RevenueByCategory />
        </div>
        <div className="lg:col-span-2 order-last lg:order-first">
          <EarningsTrend />
        </div>
      </div>

      {/* Row 3 — Table */}
      <TransactionHistory />
    </div>
  );
}
