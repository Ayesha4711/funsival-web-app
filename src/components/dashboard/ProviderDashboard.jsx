"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import heroImg from "@/assets/images/HeroImg.jpg";
import axiosInstance from "@/store/axiosInstance";
import { selectUser } from "@/store/slices/profileSlice";
import { resetStore } from "@/store/store";
import { ChevronRightIcon } from "@/icons";

const USD_CURRENCY = "USD";
const OVERVIEW_RANGE = "12m";
const EARNINGS_RANGES = [
  { key: "12m", label: "12 months" },
  { key: "30d", label: "30 days" },
  { key: "7d", label: "7 days" },
  { key: "24h", label: "24 hours" },
];

const PERFORMANCE_COLORS = {
  Completed: "#1D8C82",
  Pending: "#FEB538",
  Cancelled: "#F97316",
};

function unwrapData(payload) {
  if (!payload || typeof payload !== "object") return {};
  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return payload.data;
  }
  return payload;
}

function clamp(value, min = 0, max = 100) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.min(max, Math.max(min, numeric));
}

function formatSignedPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";
  const formatter = new Intl.NumberFormat("en-US", {
    signDisplay: "always",
    maximumFractionDigits: 1,
  });
  return `${formatter.format(numeric)}%`;
}

function formatDateLabel(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(value, currency = USD_CURRENCY) {
  const numeric = Number(value);
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });
  return formatter.format(Number.isFinite(numeric) ? numeric : 0);
}

function currencyAmount(entry, currency = USD_CURRENCY) {
  if (Array.isArray(entry)) {
    const matched = entry.find((item) => String(item?.currency || item?.code || "").toUpperCase() === currency);
    if (matched) return Number(matched.amount ?? matched.value ?? matched.total ?? matched.earnings ?? 0);
    const first = entry[0];
    return Number(first?.amount ?? first?.value ?? first?.total ?? first?.earnings ?? 0);
  }
  if (entry && typeof entry === "object") {
    if (entry[currency] != null && typeof entry[currency] === "object") {
      return Number(entry[currency]?.amount ?? entry[currency]?.value ?? entry[currency]?.total ?? entry[currency]?.earnings ?? 0);
    }
    if (entry.amount != null || entry.value != null || entry.total != null || entry.earnings != null) {
      return Number(entry.amount ?? entry.value ?? entry.total ?? entry.earnings ?? 0);
    }
    if (entry[0] != null) {
      return currencyAmount(Object.values(entry), currency);
    }
  }
  return Number(entry ?? 0);
}

function pickCurrencyRecord(value, currency = USD_CURRENCY) {
  if (Array.isArray(value)) {
    const matched = value.find((item) => String(item?.currency || item?.code || "").toUpperCase() === currency);
    return matched ?? value[0] ?? {};
  }
  if (value && typeof value === "object") {
    if (value[currency] && typeof value[currency] === "object") return value[currency];
    if ("amount" in value || "value" in value || "total" in value || "earnings" in value) return value;
  }
  return {};
}

function getReservationStatus(reservation) {
  const raw = String(
    reservation?.status ??
    reservation?.bookingStatus ??
    reservation?.state ??
    ""
  ).toLowerCase();
  const startDateValue = reservation?.startDate ?? reservation?.start_date ?? reservation?.date ?? null;
  const startDate = startDateValue ? new Date(startDateValue) : null;
  const now = new Date();

  if (raw === "completed") return "Completed";
  if (raw === "cancelled" || raw === "canceled" || raw === "declined") return "Cancelled";
  if (raw === "pending" || raw === "awaiting_host_approval" || raw === "awaitinghostapproval") return "Pending";
  if (raw === "confirmed") {
    if (startDate && !Number.isNaN(startDate.getTime()) && startDate.getTime() > now.getTime()) return "Upcoming";
    return "Active";
  }
  if (raw === "upcoming" || raw === "active") return raw.charAt(0).toUpperCase() + raw.slice(1);
  return "Pending";
}

function handleUnauthorized(dispatch) {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth-token");
    document.cookie = "auth-token=; Max-Age=0; path=/";
    localStorage.removeItem("reservation_wishlists");
    dispatch(resetStore());
    window.location.replace("/logout");
  }
}

function useOverviewData(currency = USD_CURRENCY) {
  const dispatch = useDispatch();
  const [refreshTick, setRefreshTick] = useState(0);
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: "",
    forbidden: false,
  });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const run = async () => {
      setState((prev) => ({ ...prev, loading: true, error: "", forbidden: false }));
      try {
        const { data } = await axiosInstance.get("/dashboard/host/overview", {
          params: { currency, recentLimit: 5 },
          signal: controller.signal,
        });
        if (!active) return;
        setState({ data: unwrapData(data), loading: false, error: "", forbidden: false });
      } catch (error) {
        if (!active || error?.code === "ERR_CANCELED") return;
        const status = error?.response?.status;
        if (status === 401) {
          handleUnauthorized(dispatch);
          return;
        }
        if (status === 403) {
          setState({ data: null, loading: false, error: "", forbidden: true });
          return;
        }
        setState({
          data: null,
          loading: false,
          error: error?.response?.data?.message || error?.message || "Unable to load dashboard.",
          forbidden: false,
        });
      }
    };

    run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [currency, dispatch, refreshTick]);

  return { ...state, reload: () => setRefreshTick((tick) => tick + 1) };
}

function StatSkeleton() {
  return <div className="h-[110px] animate-pulse rounded-[24px] border border-gray-100 bg-white/70" />;
}

function PanelSkeleton({ className = "" }) {
  return <div className={`min-h-[260px] animate-pulse rounded-[28px] border border-gray-100 bg-white/70 ${className}`} />;
}

function ChartSkeleton() {
  return (
    <div className="min-h-[360px] animate-pulse rounded-[28px] border border-gray-100 bg-white/70 p-5">
      <div className="h-6 w-40 rounded-full bg-gray-100" />
      <div className="mt-6 grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-8 rounded-full bg-gray-100" />
        ))}
      </div>
      <div className="mt-8 h-[250px] rounded-[24px] bg-gray-50" />
    </div>
  );
}

export function DashboardStatCard({ label, value, subtitle, tone = "neutral" }) {
  const subtitleColor = tone === "success" ? "text-[#228E8A]" : tone === "warning" ? "text-[#F5A623]" : tone === "danger" ? "text-[#F97316]" : "text-gray-500";
  return (
    <div className="rounded-[24px] border border-[#D6E8E8] bg-white px-4 py-4 sm:px-5 sm:py-5 shadow-sm">
      <p className="text-[12px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-2 text-[26px] font-bold leading-none text-[#111827] sm:text-[30px]">{value}</p>
      <p className={`mt-2 text-sm font-medium ${subtitleColor}`}>{subtitle}</p>
    </div>
  );
}

export function RecentReservations({ reservations = [], loading = false, error = "", onRetry }) {
  if (loading) return <PanelSkeleton />;
  return (
    <section className="flex min-h-[260px] flex-col rounded-[28px] border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">Recent Reservations</h2>
          <p className="mt-1 text-sm text-gray-500">Latest five bookings from your provider dashboard.</p>
        </div>
        {error ? (
          <button type="button" onClick={onRetry} className="rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-[#228E8A] hover:text-[#228E8A]">
            Retry
          </button>
        ) : null}
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-3">
        {!reservations.length ? (
          <div className="flex flex-1 items-center justify-center rounded-[22px] border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
            <div>
              <p className="text-sm font-semibold text-gray-900">No reservations yet</p>
              <p className="mt-1 text-sm text-gray-500">New reservations will appear here once guests start booking.</p>
            </div>
          </div>
        ) : (
          reservations.map((reservation, index) => {
            const listing = reservation?.listing ?? {};
            const title = listing?.title || reservation?.title || "Listing removed";
            const category = listing?.category || reservation?.category || "—";
            const status = getReservationStatus(reservation);
            const image = listing?.image || listing?.photos?.[0] || listing?.images?.[0] || reservation?.image || null;
            const dateLabel = formatDateLabel(reservation?.startDate ?? reservation?.start_date ?? reservation?.date);

            return (
              <div key={reservation?.id ?? reservation?._id ?? `${title}-${index}`} className="flex items-center gap-3 rounded-[22px] border border-gray-100 px-3 py-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                  {image ? (
                    <Image src={image} alt={title} fill sizes="56px" className="object-cover" />
                  ) : (
                    <Image src={heroImg} alt={title} fill sizes="56px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#111827]">{title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{dateLabel}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                      status === "Completed"
                        ? "bg-[#E7F7F5] text-[#228E8A]"
                        : status === "Pending"
                          ? "bg-[#FFF4D6] text-[#C98A00]"
                          : status === "Upcoming"
                            ? "bg-[#EAF4FF] text-[#2563EB]"
                            : status === "Active"
                              ? "bg-[#DDF7EE] text-[#0F766E]"
                              : "bg-[#FFE8DF] text-[#F97316]"
                    }`}
                  >
                    {status}
                  </span>
                  <span className="text-xs font-medium text-gray-500">{category}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}

export function ListingPerformanceChart({ data, loading = false, error = "", onRetry }) {
  const chartData = [
    { name: "Completed", value: clamp(data?.completed?.percentage ?? data?.completed?.value ?? data?.completed ?? 0), color: PERFORMANCE_COLORS.Completed },
    { name: "Pending", value: clamp(data?.pending?.percentage ?? data?.pending?.value ?? data?.pending ?? 0), color: PERFORMANCE_COLORS.Pending },
    { name: "Cancelled", value: clamp(data?.cancelled?.percentage ?? data?.cancelled?.value ?? data?.cancelled ?? 0), color: PERFORMANCE_COLORS.Cancelled },
  ];
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (loading) return <ChartSkeleton />;

  return (
    <section className="flex min-h-[260px] flex-col rounded-[28px] border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">Listing Performance</h2>
          <p className="mt-1 text-sm text-gray-500">Reservation outcomes across your active listings.</p>
        </div>
        {error ? (
          <button type="button" onClick={onRetry} className="rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-[#228E8A] hover:text-[#228E8A]">
            Retry
          </button>
        ) : null}
      </div>

      {total === 0 ? (
        <div className="mt-6 flex flex-1 items-center justify-center rounded-[22px] border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          No performance data available.
        </div>
      ) : (
        <>
          <div className="mt-4 h-[220px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="62%"
                  outerRadius="86%"
                  paddingAngle={3}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
                  contentStyle={{ borderRadius: 16, border: "1px solid #E5E7EB" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {chartData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between rounded-2xl border border-gray-100 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm font-semibold text-gray-600">{entry.name}</span>
                </div>
                <span className="text-sm font-bold text-[#111827]">{entry.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}

function UtilizationBar({ label, value, color }) {
  const pct = clamp(value);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-[220px] w-full overflow-hidden rounded-[22px] bg-[#EDF1F4] sm:h-[280px]">
        <div
          className="absolute inset-x-0 bottom-0 rounded-[22px]"
          style={{ height: `${pct}%`, backgroundColor: color }}
        />
        <span className="absolute top-3 inset-x-0 text-center text-sm font-bold text-[#111827]">{pct.toFixed(0)}%</span>
      </div>
      <span className="text-sm font-semibold text-gray-600">{label}</span>
    </div>
  );
}

export function UtilizationChart({ data, loading = false, error = "", onRetry }) {
  if (loading) return <PanelSkeleton />;
  return (
    <section className="flex min-h-[260px] flex-col rounded-[28px] border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#111827]">Utilization</h2>
          <p className="mt-1 text-sm text-gray-500">Booked versus pending utilization.</p>
        </div>
        {error ? (
          <button type="button" onClick={onRetry} className="rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-[#228E8A] hover:text-[#228E8A]">
            Retry
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
        <UtilizationBar label="Booked" value={data?.booked?.percentage ?? data?.booked?.value ?? data?.booked ?? 0} color="#1D8C82" />
        <UtilizationBar label="Pending" value={data?.pending?.percentage ?? data?.pending?.value ?? data?.pending ?? 0} color="#FEB538" />
      </div>

      {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}

function EarningsXAxisTick({ x, y, payload }) {
  return (
    <g transform={`translate(${x},${y + 18})`}>
      <text textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="500">
        {payload.value}
      </text>
    </g>
  );
}

function EarningsTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-gray-500">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="font-semibold" style={{ color: item.color }}>
          {item.name}: {formatter.format(Number(item.value ?? 0))}
        </p>
      ))}
    </div>
  );
}

function formatEarningsAxisLabel(point, interval) {
  const candidate =
    point.label ??
    point.date ??
    point.day ??
    point.month ??
    point.hour ??
    point.time ??
    point.x ??
    "";

  if (!candidate) return "";
  const str = String(candidate);
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) return str;

  if (interval === "hour") {
    return date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
  }
  if (interval === "day") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short" });
}

function normalizeEarningsPoints(payload, currency = USD_CURRENCY) {
  const data = unwrapData(payload);
  const interval = String(data.interval || data.granularity || data.period || "month").toLowerCase();
  const rawSeries = Array.isArray(data.series)
    ? data.series
    : Array.isArray(data.points)
      ? data.points
      : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.entries)
          ? data.entries
          : [];

  const points = rawSeries.map((point) => ({
    label: formatEarningsAxisLabel(point, interval),
    availableEarnings: Number(point.availableEarnings ?? point.available_earnings ?? point.available ?? point.earningsAvailable ?? point.totalAvailable ?? 0),
    pendingEarnings: Number(point.pendingEarnings ?? point.pending_earnings ?? point.pending ?? point.earningsPending ?? 0),
    rawLabel: point.label ?? point.date ?? point.day ?? point.month ?? point.hour ?? point.time ?? "",
  }));

  return {
    currency: String(data.currency || currency || USD_CURRENCY).toUpperCase(),
    interval: interval === "hour" || interval === "day" ? interval : "month",
    points,
  };
}

export function EarningsChart({ currency = USD_CURRENCY, onViewReport }) {
  const dispatch = useDispatch();
  const [range, setRange] = useState(OVERVIEW_RANGE);
  const [retryTick, setRetryTick] = useState(0);
  const [state, setState] = useState({
    loading: true,
    error: "",
    data: { points: [], interval: "month", currency },
  });
  const abortRef = React.useRef(null);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let active = true;
    const run = async () => {
      setState((prev) => ({ ...prev, loading: true, error: "" }));
      try {
        const { data } = await axiosInstance.get("/payments/connect/earnings", {
          params: { range, currency },
          signal: controller.signal,
        });
        if (!active) return;
        setState({ loading: false, error: "", data: normalizeEarningsPoints(data, currency) });
      } catch (error) {
        if (!active || error?.code === "ERR_CANCELED") return;
        const status = error?.response?.status;
        if (status === 401) {
          handleUnauthorized(dispatch);
          return;
        }
        setState({
          loading: false,
          error: error?.response?.data?.message || error?.message || "Unable to load earnings.",
          data: { points: [], interval: "month", currency },
        });
      }
    };

    run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [currency, range, retryTick, dispatch]);

  const formatter = useMemo(() => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }), [currency]);

  const hasData = state.data.points.length > 0;

  return (
    <section className="flex min-h-[420px] flex-col rounded-[28px] border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-bold text-[#111827]">Earnings</h2>
            <span className="rounded-full bg-[#EBF6F6] px-3 py-1 text-[11px] font-bold text-[#228E8A]">Net merchant earnings</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">Available and pending earnings over time.</p>
        </div>
        <button
          type="button"
          onClick={onViewReport}
          className="inline-flex items-center gap-2 self-start rounded-full border border-[#D1D5DB] px-4 py-2 text-sm font-semibold text-[#374151] transition-colors hover:border-[#228E8A] hover:text-[#228E8A]"
        >
          View report
          <ChevronRightIcon size={16} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-gray-100 pb-3">
        {EARNINGS_RANGES.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setRange(item.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              range === item.key
                ? "bg-[#228E8A] text-white"
                : "bg-[#F8FAFC] text-gray-500 hover:bg-gray-100"
            }`}
            aria-pressed={range === item.key}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex-1 min-h-[280px]">
        {state.loading ? (
          <ChartSkeleton />
        ) : state.error ? (
          <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
            <div>
              <p className="text-sm font-semibold text-gray-900">Couldn’t load earnings</p>
              <p className="mt-1 text-sm text-gray-500">{state.error}</p>
              <button
                type="button"
                onClick={() => setRetryTick((tick) => tick + 1)}
                className="mt-4 rounded-full bg-[#228E8A] px-4 py-2 text-sm font-semibold text-white"
              >
                Retry
              </button>
            </div>
          </div>
        ) : hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={state.data.points} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="availableEarningsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D8C82" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#1D8C82" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 0" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="label"
                tick={<EarningsXAxisTick />}
                axisLine={false}
                tickLine={false}
                height={42}
                interval={0}
              />
              <YAxis
                tickFormatter={(value) => formatter.format(Number(value ?? 0))}
                axisLine={false}
                tickLine={false}
                width={78}
                tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
              />
              <RechartsTooltip content={<EarningsTooltip currency={currency} />} />
              <Legend
                verticalAlign="top"
                align="left"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: 13, fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="availableEarnings"
                name="Available earnings"
                stroke="#1D8C82"
                fill="url(#availableEarningsFill)"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="pendingEarnings"
                name="Pending earnings"
                stroke="#FEB538"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
            No earnings found for this range.
          </div>
        )}
      </div>
    </section>
  );
}

function formatOverviewCards(data, currency = USD_CURRENCY) {
  const cards = data?.cards ?? {};
  const totalEarningsEntry = pickCurrencyRecord(cards.totalEarnings, currency);
  const totalEarningsAmount = currencyAmount(totalEarningsEntry, currency);
  const quarterChange = totalEarningsEntry?.quarterChangePercentage ?? cards.totalEarnings?.quarterChangePercentage ?? null;

  return {
    totalEarnings: {
      value: formatMoney(totalEarningsAmount, currency),
      subtitle: quarterChange == null ? "No previous-quarter comparison" : `${formatSignedPercent(quarterChange)} this quarter`,
      tone: quarterChange >= 0 ? "success" : "danger",
    },
    activeListings: {
      value: Number(cards.activeListings?.total ?? 0).toLocaleString("en-US"),
      subtitle: String(cards.activeListings?.addedThisMonth ?? "0 this month"),
      tone: "neutral",
    },
    reservations: {
      value: Number(cards.reservations?.total ?? 0).toLocaleString("en-US"),
      subtitle: String(cards.reservations?.pending ?? "0 pending"),
      tone: "warning",
    },
    completed: {
      value: Number(cards.completed?.total ?? 0).toLocaleString("en-US"),
      subtitle: String(cards.completed?.successRate ?? "0% success rate"),
      tone: "success",
    },
  };
}

export default function ProviderDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const profile = useSelector(selectUser);
  const role = String(profile?.role || "").toLowerCase();
  const isHost = role === "host" || role === "provider";
  const { data, loading, error, forbidden, reload } = useOverviewData(USD_CURRENCY);

  const cards = useMemo(() => formatOverviewCards(data, USD_CURRENCY), [data]);
  const reservations = data?.recentReservations ?? [];
  const performance = data?.listingPerformance ?? {};
  const utilization = data?.utilization ?? {};

  if (!isHost) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="max-w-xl rounded-[28px] border border-gray-100 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#228E8A]">Forbidden</p>
          <h1 className="mt-3 text-2xl font-bold text-[#111827]">Provider dashboard is only available for host accounts.</h1>
          <p className="mt-2 text-sm text-gray-500">Please switch to a host account or contact support if this is unexpected.</p>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="max-w-xl rounded-[28px] border border-gray-100 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#228E8A]">Forbidden</p>
          <h1 className="mt-3 text-2xl font-bold text-[#111827]">You do not have access to provider analytics.</h1>
          <p className="mt-2 text-sm text-gray-500">If you believe this is a mistake, ask an administrator to review your account role.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-3 xs:p-4 sm:p-6">
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <StatSkeleton key={index} />)}
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
          <div className="flex items-center justify-between gap-4">
            <p>{error}</p>
            <button type="button" onClick={reload} className="rounded-full bg-white px-4 py-2 font-semibold text-red-600 shadow-sm">
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard label="Total Earnings" value={cards.totalEarnings.value} subtitle={cards.totalEarnings.subtitle} tone={cards.totalEarnings.tone} />
          <DashboardStatCard label="Active Listings" value={cards.activeListings.value} subtitle={cards.activeListings.subtitle} tone={cards.activeListings.tone} />
          <DashboardStatCard label="Reservations" value={cards.reservations.value} subtitle={cards.reservations.subtitle} tone={cards.reservations.tone} />
          <DashboardStatCard label="Completed" value={cards.completed.value} subtitle={cards.completed.subtitle} tone={cards.completed.tone} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.25fr_1fr_0.75fr]">
        <RecentReservations reservations={reservations} loading={loading && !data} error={error} onRetry={reload} />
        <ListingPerformanceChart data={performance} loading={loading && !data} error={error} onRetry={reload} />
        <UtilizationChart data={utilization} loading={loading && !data} error={error} onRetry={reload} />
      </div>

      <EarningsChart currency={USD_CURRENCY} onViewReport={() => router.push("/dashboard/earnings")} />
    </div>
  );
}

export function DashboardContent() {
  return <ProviderDashboard />;
}
