"use client";

import React from "react";
import EarningsStats from "@/components/dashboard/EarningsStats";
import { EarningsTrend, RevenueByCategory } from "@/components/dashboard/EarningsCharts";
import TransactionHistory from "@/components/dashboard/TransactionHistory";

export default function EarningsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto flex flex-col gap-6 bg-[var(--color-bg)]">
      {/* Top Stats Section */}
      <EarningsStats />

      {/* Middle Section: Trends and Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <EarningsTrend />
        </div>
        <div className="lg:col-span-1">
           <RevenueByCategory />
        </div>
      </div>

      {/* Bottom Section: Transaction History */}
      <TransactionHistory />
    </div>
  );
}
