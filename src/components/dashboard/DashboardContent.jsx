"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import axiosInstance from "@/store/axiosInstance";
import heroImg from "@/assets/images/HeroImg.jpg";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/icons";
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip,
  ResponsiveContainer,
} from "recharts";
import EarningsGraph from "@/components/dashboard/EarningsGraph";

const USD = "USD";
const PERIODS = [
  { key: "12m", label: "12 months", range: "12m" },
  { key: "30d", label: "30 days", range: "30d" },
  { key: "7d", label: "7 days", range: "7d" },
  { key: "24h", label: "24 hours", range: "24h" },
];

const formatMoney = (value, currency = USD) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const clamp = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
};

const normalizeCurrencyEntry = (value, currency = USD) => {
  if (Array.isArray(value)) {
    return value.find((item) => String(item?.currency || item?.code || "").toUpperCase() === currency) ?? value[0] ?? {};
  }
  if (value && typeof value === "object") {
    if (value[currency] && typeof value[currency] === "object") return value[currency];
    return value;
  }
  return {};
};

const mapReservationStatus = (reservation) => {
  const raw = String(reservation?.status || reservation?.bookingStatus || reservation?.state || "").toLowerCase();
  const startDate = reservation?.startDate || reservation?.start_date || reservation?.date || null;
  const start = startDate ? new Date(startDate) : null;
  const now = new Date();
  if (raw === "completed") return "Completed";
  if (raw === "cancelled" || raw === "canceled" || raw === "declined") return "Cancelled";
  if (raw === "pending" || raw === "awaiting_host_approval") return "Pending";
  if (raw === "confirmed") return start && !Number.isNaN(start.getTime()) && start.getTime() > now.getTime() ? "Upcoming" : "Active";
  if (raw === "upcoming" || raw === "active") return raw.charAt(0).toUpperCase() + raw.slice(1);
  return "Pending";
};

const mapStatusStyles = {
  Completed: "bg-[#29A329] text-white",
  Pending: "bg-[#FEB538] text-white",
  Cancelled: "bg-[#E25C5C] text-white",
  Upcoming: "bg-[#1d8c82] text-white",
  Active: "bg-[#1d8c82] text-white",
};

function StatCard({ label, value, sub, subClassName = "text-green-500", valueClassName = "text-[#212121]" }) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#D3E8EE] px-4 xs:px-5 sm:px-6 py-4 sm:py-5 flex flex-col gap-2">
      <p className="text-[13px] xs:text-[14px] leading-none font-regular text-[#9A9A9A]" style={{ fontFamily: "var(--font-sofia-pro)" }}>{label}</p>
      <p className={`text-[24px] xs:text-[26px] sm:text-[28px] leading-none font-medium ${valueClassName}`} style={{ fontFamily: "var(--font-sofia-pro)" }}>{value}</p>
      {sub && (
        <p className={`text-[13px] xs:text-[14px] leading-[16px] font-regular ${subClassName}`} style={{ fontFamily: "var(--font-sofia-pro)" }}>{sub}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${mapStatusStyles[status] ?? "bg-gray-400 text-white"}`}>
      {status}
    </span>
  );
}

function ReservationRow({ r, className = "" }) {
  const name = r.listing?.title ?? r.title ?? "Reservation";
  const date = formatDate(r.startDate ?? r.start_date ?? r.createdAt ?? r.date);
  const type = r.listing?.category ?? r.category ?? "";
  const status = mapReservationStatus(r);
  const img = r.listing?.image ?? r.listing?.photos?.[0] ?? r.listing?.images?.[0] ?? r.image ?? null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative bg-gray-100">
        {img ? (
          <Image src={img} alt={name} fill sizes="48px" className="object-cover" unoptimized />
        ) : (
          <Image src={heroImg} alt={name} fill sizes="48px" className="object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text)] truncate">{name}</p>
        <p style={{ fontFamily: "var(--font-sofia-pro)", fontWeight: 500, fontSize: 12, lineHeight: "12px" }} className="text-[var(--color-text-muted)]">{date}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <StatusBadge status={status} />
        {type && <span style={{ fontFamily: "var(--font-sofia-pro)", fontWeight: 600, fontSize: 12, lineHeight: "160%" }} className="text-[var(--color-text-subtle)]">{type}</span>}
      </div>
    </div>
  );
}

function RecentReservations({ reservations = [], loading = false, error = "", onRetry }) {
  const [mobileIndex, setMobileIndex] = useState(0);
  const handlePrev = () => setMobileIndex((i) => (i - 1 + Math.max(reservations.length, 1)) % Math.max(reservations.length, 1));
  const handleNext = () => setMobileIndex((i) => (i + 1) % Math.max(reservations.length, 1));
  const safeMobileIndex = reservations.length ? Math.min(mobileIndex, reservations.length - 1) : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[var(--color-border)] h-full flex flex-col">
        <h2 className="text-[17px] sm:text-[18px] font-bold text-[var(--color-text)] mb-4">Recent Reservations</h2>
        <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)] text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[var(--color-border)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[17px] sm:text-[18px] font-bold text-[var(--color-text)]">Recent Reservations</h2>
        <div className="flex items-center gap-2">
          {error ? (
            <button type="button" onClick={onRetry} className="text-xs font-semibold text-[#228E8A] hover:opacity-80">
              Retry
            </button>
          ) : null}
          {reservations.length > 0 && (
            <div className="flex md:hidden gap-2">
              <button type="button" onClick={handlePrev} aria-label="Previous reservation" className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <ChevronLeftIcon size={16} />
              </button>
              <button type="button" onClick={handleNext} aria-label="Next reservation" className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <ChevronRightIcon size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[var(--color-text-muted)] text-sm py-6">
          <Image src="/images/No reservations.png" alt="No reservations" width={100} height={100} className="object-contain" />
          No reservations yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4 flex-1">
          <ReservationRow r={reservations[safeMobileIndex] ?? reservations[0]} className="flex md:hidden" />
          {reservations.map((r) => (
            <ReservationRow key={r._id ?? r.id} r={r} className="hidden md:flex" />
          ))}
        </div>
      )}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function DonutChart({ data = [], loading = false, error = "", onRetry }) {
  const chartData = data.length
    ? data
    : [
        { name: "Completed", value: 0, color: "#1d8c82" },
        { name: "Pending", value: 0, color: "#FEB538" },
        { name: "Cancelled", value: 0, color: "#f97316" },
      ];
  const hasData = chartData.some((s) => Number(s.value) > 0);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--color-border)] flex flex-col h-full">
        <h2 className="text-[17px] sm:text-[18px] font-bold text-[var(--color-text)] px-4 sm:px-5 pt-4 sm:pt-5 pb-0">Listing Performance</h2>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] flex flex-col h-full">
      <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-0">
        <h2 className="text-[17px] sm:text-[18px] font-bold text-[var(--color-text)]">Listing Performance</h2>
        {error ? (
          <button type="button" onClick={onRetry} className="text-xs font-semibold text-[#228E8A] hover:opacity-80">
            Retry
          </button>
        ) : null}
      </div>
      {hasData ? (
        <>
          <div className="flex-1 flex flex-col items-center justify-center px-2 py-2">
            <ResponsiveContainer width="100%" height={320} className="sm:!h-[380px]">
              <PieChart margin={{ top: 32, right: 32, bottom: 0, left: 32 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={112}
                  paddingAngle={4}
                  dataKey="value"
                  className="sm:!innerRadius-[64] sm:!outerRadius-[98]"
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <PieTooltip formatter={(value, name) => [`${value}%`, name]} contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 sm:gap-6 px-4 sm:px-5 pb-4 sm:pb-5 flex-wrap">
            {chartData.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-[13px] sm:text-sm font-semibold text-[var(--color-text-muted)]">{s.name}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center px-4 py-6 text-sm text-gray-400">
          No listing performance data available
        </div>
      )}
      {error ? <p className="px-5 pb-4 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function UtilizationBarHorizontal({ name, value, fill }) {
  const pct = clamp(value);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative overflow-hidden bg-[#E5E7EB] rounded-xl h-[60px]">
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: fill, borderRadius: 12 }} />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-white" style={{ fontFamily: "var(--font-sofia-pro)" }}>{name}</span>
      </div>
      <span className="text-[17px] font-bold text-[#1A1A1A] min-w-[48px] text-right" style={{ fontFamily: "var(--font-sofia-pro)" }}>{pct}%</span>
    </div>
  );
}

function UtilizationBarVertical({ name, value, fill }) {
  const pct = clamp(value);
  return (
    <div className="flex flex-col items-center gap-2 shrink-0 w-[60px] xl:w-20">
      <div className="w-full relative overflow-hidden h-[280px] xl:h-[380px]" style={{ background: "#e5e7eb", borderRadius: 12 }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${pct}%`, background: fill, borderRadius: 12 }} />
        <span className="absolute top-3 xl:top-4 left-0 right-0 text-center text-[11px] xl:text-xs font-bold text-[#374151]" style={{ fontFamily: "var(--font-sofia-pro)" }}>{pct}%</span>
        <span className="absolute bottom-3 xl:bottom-4 left-0 right-0 text-center text-[11px] xl:text-xs font-semibold text-white" style={{ fontFamily: "var(--font-sofia-pro)" }}>{name}</span>
      </div>
    </div>
  );
}

function UtilizationCard({ data = {}, loading = false, error = "", onRetry }) {
  const booked = data?.booked?.percentage ?? data?.booked?.value ?? data?.booked ?? 0;
  const pending = data?.pending?.percentage ?? data?.pending?.value ?? data?.pending ?? 0;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--color-border)] flex flex-col h-full min-w-0">
        <h2 className="text-base font-bold text-[var(--color-text)] px-5 pt-5 pb-4">Utilization</h2>
        <div className="flex items-center justify-center flex-1 text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] flex flex-col h-full min-w-0">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <h2 className="text-base font-bold text-[var(--color-text)]">Utilization</h2>
        {error ? (
          <button type="button" onClick={onRetry} className="text-xs font-semibold text-[#228E8A] hover:opacity-80">
            Retry
          </button>
        ) : null}
      </div>

      <div className="flex md:hidden flex-1 flex-col gap-4 px-5 pb-5">
        <UtilizationBarHorizontal name="Booked" value={booked} fill="#1d8c82" />
        <UtilizationBarHorizontal name="Pending" value={pending} fill="#FEB538" />
      </div>

      <div className="hidden md:flex flex-1 items-end justify-center px-4 pb-5 gap-5">
        <UtilizationBarVertical name="Booked" value={booked} fill="#1d8c82" />
        <UtilizationBarVertical name="Pending" value={pending} fill="#FEB538" />
      </div>
      {error ? <p className="px-5 pb-4 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function normalizeOverviewResponse(payload) {
  const data = payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data) ? payload.data : payload ?? {};
  const cards = data.cards ?? {};
  const totalEarningsEntry = normalizeCurrencyEntry(cards.totalEarnings, USD);
  const totalEarningsAmount = Number(totalEarningsEntry?.amount ?? totalEarningsEntry?.value ?? totalEarningsEntry?.total ?? totalEarningsEntry?.earnings ?? 0);
  const quarterChange = totalEarningsEntry?.quarterChangePercentage ?? cards.totalEarnings?.quarterChangePercentage ?? null;
  const performance = data.listingPerformance ?? {};
  const utilization = data.utilization ?? {};
  return {
    stats: {
      totalEarnings: {
        value: formatMoney(totalEarningsAmount, USD),
        sub: quarterChange == null ? "No previous-quarter comparison" : `${quarterChange >= 0 ? "+" : ""}${Number(quarterChange).toFixed(1)}% this quarter`,
        subClassName: quarterChange >= 0 ? "text-[#228E8A]" : "text-[#FF7201]",
      },
      activeListings: {
        value: Number(cards.activeListings?.total ?? 0).toLocaleString("en-US"),
        sub: `${Number(cards.activeListings?.addedThisMonth ?? 0)} this month`,
        subClassName: "text-[#FF7201]",
      },
      reservations: {
        value: Number(cards.reservations?.total ?? 0).toLocaleString("en-US"),
        sub: `${Number(cards.reservations?.pending ?? 0)} pending`,
        subClassName: "text-[#228E8A]",
      },
      completed: {
        value: Number(cards.completed?.total ?? 0).toLocaleString("en-US"),
        sub: `${cards.completed?.successRate ?? "0%"} success rate`,
        subClassName: "text-[#16A34A]",
      },
    },
    reservations: Array.isArray(data.recentReservations) ? data.recentReservations : [],
    performance: [
      { name: "Completed", value: clamp(performance.completed?.percentage ?? performance.completed ?? 0), color: "#1d8c82" },
      { name: "Pending", value: clamp(performance.pending?.percentage ?? performance.pending ?? 0), color: "#FEB538" },
      { name: "Cancelled", value: clamp(performance.cancelled?.percentage ?? performance.cancelled ?? 0), color: "#f97316" },
    ],
    utilization: {
      booked: clamp(utilization.booked?.percentage ?? utilization.booked ?? 0),
      pending: clamp(utilization.pending?.percentage ?? utilization.pending ?? 0),
    },
  };
}

export default function DashboardContent() {
  const [state, setState] = useState({ loading: true, error: "", forbidden: false, data: null });
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const run = async () => {
      setState((prev) => ({ ...prev, loading: true, error: "", forbidden: false }));
      try {
        const { data } = await axiosInstance.get("/dashboard/host/overview", {
          params: { currency: USD, recentLimit: 5 },
          signal: controller.signal,
        });
        if (!active) return;
        setState({ loading: false, error: "", forbidden: false, data: normalizeOverviewResponse(data) });
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
          setState({ loading: false, error: "", forbidden: true, data: null });
          return;
        }
        setState({
          loading: false,
          error: error?.response?.data?.message || error?.message || "Unable to load dashboard.",
          forbidden: false,
          data: null,
        });
      }
    };

    run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [retryTick]);

  const data = state.data;

  if (state.forbidden) {
    return (
      <div className="flex flex-col gap-4 sm:gap-5 p-3 xs:p-4 sm:p-6 flex-1">
        <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#D3E8EE] px-4 xs:px-5 sm:px-6 py-5 sm:py-6">
          <h2 className="text-[17px] sm:text-[18px] font-bold text-[#212121]">Provider dashboard</h2>
          <p className="mt-2 text-sm text-gray-500">This dashboard is only available for host accounts.</p>
        </div>
      </div>
    );
  }

  if (state.error && !data) {
    return (
      <div className="flex flex-col gap-4 sm:gap-5 p-3 xs:p-4 sm:p-6 flex-1">
        <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#D3E8EE] px-4 xs:px-5 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[17px] sm:text-[18px] font-bold text-[#212121]">Provider dashboard</h2>
              <p className="mt-1 text-sm text-red-600">{state.error}</p>
            </div>
            <button type="button" onClick={() => setRetryTick((tick) => tick + 1)} className="rounded-full bg-[#228E8A] px-4 py-2 text-sm font-semibold text-white">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5 p-3 xs:p-4 sm:p-6 flex-1">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Earning" value={data?.stats.totalEarnings.value ?? "—"} sub={data?.stats.totalEarnings.sub} subClassName={data?.stats.totalEarnings.subClassName} />
        <StatCard label="Active Listings" value={data?.stats.activeListings.value ?? "—"} sub={data?.stats.activeListings.sub} subClassName={data?.stats.activeListings.subClassName} />
        <StatCard label="Reservations" value={data?.stats.reservations.value ?? "—"} sub={data?.stats.reservations.sub} subClassName={data?.stats.reservations.subClassName} />
        <StatCard label="Completed" value={data?.stats.completed.value ?? "—"} sub={data?.stats.completed.sub} subClassName={data?.stats.completed.subClassName} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1.15fr)_minmax(0,0.72fr)] gap-3 sm:gap-4 items-stretch">
        <RecentReservations reservations={data?.reservations ?? []} loading={state.loading && !data} error={state.error} onRetry={() => setRetryTick((tick) => tick + 1)} />
        <DonutChart data={data?.performance ?? []} loading={state.loading && !data} error={state.error} onRetry={() => setRetryTick((tick) => tick + 1)} />
        <UtilizationCard data={data?.utilization ?? {}} loading={state.loading && !data} error={state.error} onRetry={() => setRetryTick((tick) => tick + 1)} />
      </div>

      <div className="flex-1 flex flex-col">
        <EarningsGraph />
      </div>
    </div>
  );
}
