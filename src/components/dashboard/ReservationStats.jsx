"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHostBookingStats,
  selectHostBookingStats,
  selectHostBookingStatsStatus,
} from "@/store/slices/bookingsSlice";

const CURRENCY_SYMBOLS = { USD: "$", EUR: "€", GBP: "£" };

function formatCurrency(amount, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
  return `${symbol}${Number(amount ?? 0).toLocaleString()}`;
}

function formatSignedPercent(value) {
  if (value == null) return null;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

function StatCard({ label, value, sub, subColor = "text-green-500" }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex flex-col gap-1">
      <p className="text-xs text-[var(--color-text-muted)] font-medium">{label}</p>
      <p className="text-2xl lg:text-3xl font-extrabold text-[var(--color-text)]">{value}</p>
      {sub && <p className={`text-xs font-medium ${subColor}`}>{sub}</p>}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex flex-col gap-2 animate-pulse">
      <div className="h-3 w-24 bg-gray-100 rounded" />
      <div className="h-7 w-16 bg-gray-100 rounded" />
      <div className="h-3 w-28 bg-gray-100 rounded" />
    </div>
  );
}

export default function ReservationStats() {
  const dispatch = useDispatch();
  const stats = useSelector(selectHostBookingStats);
  const status = useSelector(selectHostBookingStatsStatus);

  useEffect(() => {
    dispatch(fetchHostBookingStats());
  }, [dispatch]);

  const cards = stats?.cards;

  if (status === "loading" && !cards) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  if (!cards) return null;

  const revenueEntries = Array.isArray(cards.revenue) ? cards.revenue : [];
  const primaryRevenue = revenueEntries[0];
  const revenueValue = primaryRevenue
    ? revenueEntries.length > 1
      ? revenueEntries.map((r) => formatCurrency(r.total, r.currency)).join(" / ")
      : formatCurrency(primaryRevenue.total, primaryRevenue.currency)
    : formatCurrency(0, "USD");
  const revenueChange = formatSignedPercent(primaryRevenue?.monthChangePercentage);

  const totalReservationsChange = cards.totalReservations?.changeFromLastWeek;
  const completionRateChange = formatSignedPercent(cards.completionRate?.changePercentage);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Total Reservations"
        value={cards.totalReservations?.total ?? 0}
        sub={totalReservationsChange != null ? `${totalReservationsChange > 0 ? "+" : ""}${totalReservationsChange} from last week` : null}
        subColor="text-[var(--color-primary)]"
      />
      <StatCard
        label="Revenue"
        value={revenueValue}
        sub={revenueChange ? `${revenueChange} from last month` : null}
        subColor="text-[var(--color-primary)]"
      />
      <StatCard
        label="Active Customers"
        value={cards.activeCustomers?.total ?? 0}
        sub={cards.activeCustomers?.newThisWeek != null ? `+${cards.activeCustomers.newThisWeek} new this week` : null}
        subColor="text-[var(--color-primary)]"
      />
      <StatCard
        label="Completion Rate"
        value={`${cards.completionRate?.rate ?? 0}%`}
        sub={completionRateChange ? `${completionRateChange} from last month` : null}
        subColor="text-[var(--color-primary)]"
      />
    </div>
  );
}
