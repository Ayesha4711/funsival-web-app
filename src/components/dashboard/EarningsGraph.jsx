"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import axiosInstance from "@/store/axiosInstance";

const USD = "USD";
const PERIODS = [
  { key: "12m", label: "12 months", range: "12m" },
  { key: "30d", label: "30 days", range: "30d" },
  { key: "7d", label: "7 days", range: "7d" },
  { key: "24h", label: "24 hours", range: "24h" },
];

function formatMoney(value, currency = USD) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatEarningsAxisLabel(periodStart, interval) {
  if (!periodStart) return "";
  const date = new Date(periodStart);
  if (Number.isNaN(date.getTime())) return String(periodStart);
  if (interval === "hour") return date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
  if (interval === "day") return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return date.toLocaleDateString("en-US", { month: "short" });
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * The backend returns a rolling 12-month window ending at the current month
 * (e.g. Oct→Aug). The UI wants a fixed calendar-year Jan→Dec axis instead, so
 * points are re-slotted by month into a full Jan–Dec frame, zero-filling any
 * month the backend didn't return.
 */
function reorderToCalendarYear(points) {
  const now = new Date();
  const byMonth = new Map();
  points.forEach((point) => {
    const date = new Date(point.periodStart);
    if (Number.isNaN(date.getTime())) return;
    byMonth.set(date.getMonth(), point);
  });

  return MONTH_LABELS.map((label, month) => {
    const existing = byMonth.get(month);
    if (existing) return { ...existing, label };
    return {
      label,
      periodStart: new Date(now.getFullYear(), month, 1).toISOString(),
      availableEarnings: 0,
      pendingEarnings: 0,
      netEarnings: 0,
      bookingCount: 0,
    };
  });
}

function normalizeEarningsResponse(payload, requestedCurrency) {
  const data = payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data) ? payload.data : payload ?? {};
  const interval = String(data.interval || "month").toLowerCase();
  const seriesList = Array.isArray(data.series) ? data.series : [];

  let series = null;
  if (requestedCurrency) {
    series = seriesList.find((s) => String(s?.currency || "").toUpperCase() === requestedCurrency) ?? null;
  } else if (seriesList.length === 1) {
    series = seriesList[0];
  }

  let points = (series?.points ?? []).map((point) => ({
    label: formatEarningsAxisLabel(point.periodStart, interval),
    periodStart: point.periodStart,
    availableEarnings: Number(point.availableEarnings ?? 0),
    pendingEarnings: Number(point.pendingEarnings ?? 0),
    netEarnings: Number(point.netEarnings ?? 0),
    bookingCount: Number(point.bookingCount ?? 0),
  }));

  if ((interval === "month" || !interval) && points.length > 0) {
    points = reorderToCalendarYear(points);
  }

  return {
    interval: interval === "hour" || interval === "day" ? interval : "month",
    currency: String(series?.currency || requestedCurrency || "").toUpperCase(),
    availableCurrencies: seriesList.map((s) => String(s?.currency || "").toUpperCase()).filter(Boolean),
    points,
    hasSeries: seriesList.length > 0,
  };
}

function EarningsXAxisTick({ x, y, payload }) {
  return (
    <g transform={`translate(${x},${y + 18})`}>
      <text textAnchor="middle" fill="#667085" fontFamily="var(--font-inter), Inter, sans-serif" fontSize="12" fontWeight="400">
        {payload.value}
      </text>
    </g>
  );
}

function EarningsTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs shadow-sm">
      <p className="font-bold text-gray-500 mb-1">{label}</p>
      <p className="font-semibold" style={{ color: "#1d8c82" }}>
        Available: {formatMoney(point.availableEarnings, currency)}
      </p>
      <p className="font-semibold" style={{ color: "#FEB538" }}>
        Pending: {formatMoney(point.pendingEarnings, currency)}
      </p>
      <p className="font-semibold text-gray-700">
        Net: {formatMoney(point.netEarnings, currency)}
      </p>
      <p className="text-gray-400 mt-1">
        {point.bookingCount} {point.bookingCount === 1 ? "booking" : "bookings"}
      </p>
    </div>
  );
}

function EarningsChartSkeleton() {
  return (
    <div className="flex-1 min-h-[240px] flex items-end gap-2 px-2 pb-8 animate-pulse">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-100 rounded-t-md"
          style={{ height: `${30 + ((i * 37) % 60)}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Provider earnings graph — GET /payments/connect/earnings.
 * Shared by the Dashboard tab widget and the dedicated Earnings page.
 */
export default function EarningsGraph({ title = "Earnings", initialCurrency = USD }) {
  const [activePeriod, setActivePeriod] = useState("12m");
  const [currency, setCurrency] = useState(initialCurrency);
  const [state, setState] = useState({
    loading: true,
    error: "",
    forbidden: false,
    data: { points: [], interval: "month", currency: initialCurrency, availableCurrencies: [], hasSeries: false },
  });
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const selectedRange = PERIODS.find((p) => p.key === activePeriod)?.range ?? "12m";

    const run = async () => {
      setState((prev) => ({ ...prev, loading: true, error: "", forbidden: false }));
      try {
        const { data } = await axiosInstance.get("/payments/connect/earnings", {
          params: { range: selectedRange, currency },
          signal: controller.signal,
        });
        if (!active) return;
        setState({ loading: false, error: "", forbidden: false, data: normalizeEarningsResponse(data, currency) });
      } catch (error) {
        if (!active || error?.code === "ERR_CANCELED") return;
        if (error?.response?.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth-token");
            document.cookie = "auth-token=; Max-Age=0; path=/";
            window.location.replace("/logout");
          }
          return;
        }
        if (error?.response?.status === 403) {
          setState((prev) => ({ ...prev, loading: false, error: "", forbidden: true }));
          return;
        }
        setState((prev) => ({
          ...prev,
          loading: false,
          forbidden: false,
          error: error?.response?.data?.message || error?.message || "Unable to load earnings.",
        }));
      }
    };

    run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [activePeriod, currency, retryTick]);

  const chartData = useMemo(() => state.data.points, [state.data.points]);
  const hasMultipleCurrencies = state.data.availableCurrencies.length > 1;

  return (
    <div className="flex flex-col flex-1 bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-6 lg:p-8 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[17px] sm:text-[18px] leading-[28px] font-semibold text-[#101828]" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
          {title}
        </h2>
        {hasMultipleCurrencies && (
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="text-[13px] font-semibold text-[#344054] border border-[#E5E7EB] rounded-lg px-2 py-1 focus:outline-none focus:border-[#228E8A]"
            aria-label="Select currency"
          >
            {state.data.availableCurrencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-4 sm:mt-7 flex items-center gap-4 sm:gap-8 border-b border-[#E5E7EB] overflow-x-auto scrollbar-hide">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePeriod(p.key)}
            className={`pb-3 sm:pb-4 text-[13px] sm:text-[14px] leading-[20px] font-semibold transition-colors whitespace-nowrap ${
              activePeriod === p.key
                ? "text-[#228E8A] border-b-2 border-[#228E8A]"
                : "text-[#667085] hover:text-[#344054]"
            }`}
            style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {state.forbidden ? (
        <div className="flex-1 min-h-[240px] flex items-center justify-center text-sm text-gray-500 text-center px-4">
          This earnings view is only available for host accounts.
        </div>
      ) : state.loading ? (
        <EarningsChartSkeleton />
      ) : state.error ? (
        <div className="flex-1 min-h-[240px] flex items-center justify-center text-sm text-red-600">
          <div className="text-center">
            <p>{state.error}</p>
            <button type="button" onClick={() => setRetryTick((t) => t + 1)} className="mt-3 text-[#228E8A] font-semibold">
              Retry
            </button>
          </div>
        </div>
      ) : !state.data.hasSeries ? (
        <div className="flex-1 min-h-[240px] flex items-center justify-center text-sm text-gray-400">
          No earnings data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%" className="flex-1 min-h-[240px]">
          <AreaChart data={chartData} margin={{ top: 24, right: 0, left: 0, bottom: 8 }} className="sm:!mt-[34px] sm:!mr-[4px] sm:!ml-0">
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1d8c82" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#1d8c82" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expensesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FEB538" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#FEB538" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" stroke="#EAECF0" vertical={false} />
            <XAxis
              dataKey="label"
              type="category"
              interval={0}
              height={42}
              tickMargin={14}
              tick={<EarningsXAxisTick />}
              axisLine={false}
              tickLine={false}
              padding={{ left: 12, right: 12 }}
            />
            <YAxis hide />
            <Tooltip content={<EarningsTooltip currency={state.data.currency} />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />
            <Area type="monotone" dataKey="availableEarnings" name="Available" stroke="#1d8c82" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: "#1d8c82", stroke: "#fff", strokeWidth: 2 }} />
            <Area type="monotone" dataKey="pendingEarnings" name="Pending" stroke="#FEB538" strokeWidth={2.5} fill="url(#expensesGrad)" dot={false} activeDot={{ r: 5, fill: "#FEB538", stroke: "#fff", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
