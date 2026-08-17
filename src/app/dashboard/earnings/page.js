"use client";

import React from "react";
import EarningsStats from "@/components/dashboard/EarningsStats";
import { EarningsTrend, RevenueByCategory } from "@/components/dashboard/EarningsCharts";
import TransactionHistory from "@/components/dashboard/TransactionHistory";

export default function EarningsPage() {
  return (
    <div className="p-3 xs:p-4 sm:p-6 w-full flex flex-col gap-4 sm:gap-5 bg-[#F3F4F6] flex-1">
      <EarningsStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-1 order-first lg:order-last flex flex-col">
          <RevenueByCategory />
        </div>
        <div className="lg:col-span-2 order-last lg:order-first flex flex-col">
          <EarningsTrend />
        </div>
      </div>

      <TransactionHistory />
    </div>
  );
}
