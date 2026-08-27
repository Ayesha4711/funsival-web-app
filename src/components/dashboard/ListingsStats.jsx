"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHostListingStats,
  selectHostListingStats,
  selectHostListingStatsStatus,
} from "@/store/slices/listingsSlice";

// Semantic color map
const SUB_COLORS = {
  success: "text-[#16A34A]"
};

function StatCard({ label, value, sub, subType = "neutral" }) {
  const colorClass = SUB_COLORS[subType] || SUB_COLORS.neutral;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex flex-col gap-1">
      <p className="text-xs text-[var(--color-text-muted)] font-medium">
        {label}
      </p>

      <p className="text-2xl lg:text-3xl font-extrabold text-[var(--color-text)]">
        {value}
      </p>

      {sub &&
        <p className={`text-xs font-medium ${colorClass}`}>
          {sub}
        </p>}
    </div>
  );
}

export default function ListingsStats() {
  const dispatch = useDispatch();
  const stats = useSelector(selectHostListingStats);
  const statsStatus = useSelector(selectHostListingStatsStatus);

  useEffect(() => {
    dispatch(fetchHostListingStats());
  }, [dispatch]);

  const cards = stats?.cards ?? {};
  const loading = statsStatus === "loading" && !stats;

  const cardValue = (card) => {
    if (card == null) return 0;
    if (typeof card === "object") return card.total ?? 0;
    return card;
  };

  const cardSub = (card, suffix) => {
    if (!card || typeof card !== "object" || card.quarterChangePercentage == null) return null;
    const pct = card.quarterChangePercentage;
    const sign = pct > 0 ? "+" : "";
    return `${sign}${pct}% ${suffix}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Listings"
        value={loading ? "—" : cardValue(cards.totalListings)}
        sub={loading ? null : cardSub(cards.totalListings, "this quarter")}
        subType="success"
      />

      <StatCard
        label="Listing Views"
        value={loading ? "—" : cardValue(cards.listingViews)}
        sub={loading ? null : cardSub(cards.listingViews, "this quarter")}
        subType="success"
      />

      <StatCard
        label="Total Bookings"
        value={loading ? "—" : cardValue(cards.totalBookings)}
        sub={loading ? null : cardSub(cards.totalBookings, "this quarter")}
        subType="success"
      />

      <StatCard
        label="Avg. Rating"
        value={loading ? "—" : cardValue(cards.averageRating)}
        sub={loading ? null : cardSub(cards.averageRating, "this quarter")}
        subType="success"
      />
    </div>
  );
}
