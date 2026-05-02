"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import heroImg from "@/assets/images/HeroImg.jpg";
import { fetchHostBookings, selectHostBookings, selectHostBookingsStatus } from "@/store/slices/bookingsSlice";
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ─── Stat Card ─────────────────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  subClassName = "text-green-500",
  valueClassName = "text-[#212121]",
}) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#D3E8EE] px-4 xs:px-5 sm:px-6 py-4 sm:py-5 flex flex-col gap-2">
      <p
        className="text-[13px] xs:text-[14px] leading-none font-regular text-[#9A9A9A]"
        style={{ fontFamily: "var(--font-sofia-pro)" }}
      >
        {label}
      </p>
      <p
        className={`text-[24px] xs:text-[26px] sm:text-[28px] leading-none font-medium ${valueClassName}`}
        style={{ fontFamily: "var(--font-sofia-pro)" }}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`text-[13px] xs:text-[14px] leading-[16px] font-regular ${subClassName}`}
          style={{ fontFamily: "var(--font-sofia-pro)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Status Badge ───────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    Completed: "bg-[#29A329] text-white",
    Pending: "bg-[#FEB538] text-white",
    Cancelled: "bg-[#E25C5C] text-white",
  };
  return (
    <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${map[status] ?? "bg-gray-400 text-white"}`}>
      {status}
    </span>
  );
}

/* ─── Recent Reservations ────────────────────────────────────────────────────── */
function normalizeStatus(status = "") {
  const s = status.toLowerCase();
  if (s === "completed") return "Completed";
  if (s === "pending" || s === "confirmed") return "Pending";
  if (s === "cancelled" || s === "canceled") return "Cancelled";
  return status;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ReservationRow({ r, className = "" }) {
  const name = r.listing?.title ?? r.title ?? "Reservation";
  const date = formatDate(r.createdAt ?? r.startDate);
  const type = r.listing?.category ?? r.category ?? "";
  const normalStatus = normalizeStatus(r.status);
  const img = r.listing?.images?.[0] ?? null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative bg-gray-100">
        {img ? (
          <Image src={img} alt={name} fill className="object-cover" />
        ) : (
          <Image src={heroImg} alt={name} fill className="object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text)] truncate">{name}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{date}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <StatusBadge status={normalStatus} />
        {type && <span className="text-[11px] text-[var(--color-text-subtle)]">{type}</span>}
      </div>
    </div>
  );
}

function RecentReservations() {
  const dispatch = useDispatch();
  const hostBookings = useSelector(selectHostBookings);
  const status = useSelector(selectHostBookingsStatus);
  const [mobileIndex, setMobileIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchHostBookings({ page: 1, limit: 10 }));
  }, [dispatch]);

  const reservations = [...hostBookings]
    .sort((a, b) => new Date(b.createdAt ?? b.startDate ?? 0) - new Date(a.createdAt ?? a.startDate ?? 0))
    .slice(0, 5);

  const handlePrev = () => setMobileIndex((i) => (i - 1 + Math.max(reservations.length, 1)) % Math.max(reservations.length, 1));
  const handleNext = () => setMobileIndex((i) => (i + 1) % Math.max(reservations.length, 1));

  if (status === "loading") {
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
        {reservations.length > 0 && (
          <div className="flex md:hidden gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous reservation"
              className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next reservation"
              className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </div>

      {reservations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)] text-sm">No reservations yet.</div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4 flex-1">
          {/* Mobile: show one at a time */}
          <ReservationRow r={reservations[mobileIndex] ?? reservations[0]} className="flex md:hidden" />
          {/* Desktop/iPad: show all */}
          {reservations.map((r) => (
            <ReservationRow key={r._id ?? r.id} r={r} className="hidden md:flex" />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Donut Chart – Listing Performance ─────────────────────────────────────── */
const performanceData = [
  { name: "Completed", value: 60, color: "#1d8c82" },
  { name: "Pending",   value: 30, color: "#FEB538" },
  { name: "Canceled",  value: 10, color: "#f97316" },
];

function renderPerfLabel({ cx, cy, midAngle, outerRadius, name, value }) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const offsets = {
    Completed: { x: 6, y: 10 },
    Pending: { x: -66, y: -6 },
    Canceled: { x: -10, y: -34 },
  };
  const { x: offsetX, y: offsetY } = offsets[name] ?? { x: -36, y: -20 };
  return (
    <foreignObject x={x + offsetX} y={y + offsetY} width={76} height={42}>
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "3px 6px",
          boxShadow: "0 1px 4px rgba(15, 23, 42, 0.08)",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>{value}%</span>
        <span style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.1 }}>{name}</span>
      </div>
    </foreignObject>
  );
}

function DonutChart() {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] flex flex-col h-full">
      <h2 className="text-[17px] sm:text-[18px] font-bold text-[var(--color-text)] px-4 sm:px-5 pt-4 sm:pt-5 pb-0">Listing Performance</h2>
      <div className="flex-1 flex flex-col items-center justify-center px-2 py-3">
        <ResponsiveContainer width="100%" height={280} className="sm:!h-[320px]">
          <PieChart margin={{ top: 28, right: 28, bottom: 0, left: 28 }}>
            <Pie
              data={performanceData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              labelLine={false}
              label={renderPerfLabel}
              className="sm:!innerRadius-[64] sm:!outerRadius-[98]"
            >
              {performanceData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <PieTooltip
              formatter={(value, name) => [`${value}%`, name]}
              contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4 sm:gap-6 px-4 sm:px-5 pb-4 sm:pb-5 flex-wrap">
        {performanceData.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-[13px] sm:text-sm font-semibold text-[var(--color-text-muted)]">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Utilization Bars ───────────────────────────────────────────────────────── */
const utilizationData = [
  { name: "Idle",  value: 70, fill: "#1d8c82" },
  { name: "Booked", value: 40, fill: "#FEB538" },
];

// Horizontal bar for mobile/tablet
function UtilizationBarHorizontal({ name, value, fill }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative overflow-hidden bg-[#E5E7EB] rounded-xl h-[60px]">
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${value}%`,
            background: fill,
            borderRadius: 12,
          }}
        />
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-white"
          style={{ fontFamily: "var(--font-sofia-pro)" }}
        >
          {name}
        </span>
      </div>
      <span
        className="text-[17px] font-bold text-[#1A1A1A] min-w-[48px] text-right"
        style={{ fontFamily: "var(--font-sofia-pro)" }}
      >
        {value}%
      </span>
    </div>
  );
}

// Vertical bar for mobile and desktop
function UtilizationBarVertical({ name, value, fill }) {
  return (
    <div className="flex flex-col items-center gap-2 shrink-0 w-[60px] xl:w-20">
      <div
        className="w-full relative overflow-hidden h-[280px] xl:h-[380px]"
        style={{ background: "#e5e7eb", borderRadius: 12 }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${value}%`,
            background: fill,
            borderRadius: 12,
          }}
        />
        <span
          className="absolute top-3 xl:top-4 left-0 right-0 text-center text-[11px] xl:text-xs font-bold text-[#374151]"
          style={{ fontFamily: "var(--font-sofia-pro)" }}
        >
          {value}%
        </span>
        <span
          className="absolute bottom-3 xl:bottom-4 left-0 right-0 text-center text-[11px] xl:text-xs font-semibold text-white"
          style={{ fontFamily: "var(--font-sofia-pro)" }}
        >
          {name}
        </span>
      </div>
    </div>
  );
}

function UtilizationCard() {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] flex flex-col h-full min-w-0">
      <h2 className="text-base font-bold text-[var(--color-text)] px-5 pt-5 pb-4">Utilization</h2>

      {/* Horizontal bars for mobile */}
      <div className="flex md:hidden flex-1 flex-col gap-4 px-5 pb-5">
        {utilizationData.map((d) => (
          <UtilizationBarHorizontal key={d.name} name={d.name} value={d.value} fill={d.fill} />
        ))}
      </div>

      {/* Vertical bars for iPad and desktop */}
      <div className="hidden md:flex flex-1 items-end justify-center px-4 pb-5 gap-5">
        {utilizationData.map((d) => (
          <UtilizationBarVertical key={d.name} name={d.name} value={d.value} fill={d.fill} />
        ))}
      </div>
    </div>
  );
}

/* ─── Earnings Chart (dual area) ────────────────────────────────────────────── */
const earningsData = [
  { month: "Jan", revenue: 30, expenses: 20 },
  { month: "Feb", revenue: 45, expenses: 30 },
  { month: "Mar", revenue: 35, expenses: 25 },
  { month: "Apr", revenue: 52, expenses: 38 },
  { month: "May", revenue: 40, expenses: 30 },
  { month: "Jun", revenue: 62, expenses: 45 },
  { month: "Jul", revenue: 56, expenses: 42 },
  { month: "Aug", revenue: 72, expenses: 55 },
  { month: "Sep", revenue: 66, expenses: 49 },
  { month: "Oct", revenue: 82, expenses: 60 },
  { month: "Nov", revenue: 74, expenses: 56 },
  { month: "Dec", revenue: 88, expenses: 66 },
];

const earningsTicks = earningsData.map((d) => d.month);

function EarningsXAxisTick({ x, y, payload }) {
  return (
    <g transform={`translate(${x},${y + 18})`}>
      <text
        textAnchor="middle"
        fill="#667085"
        fontFamily="var(--font-inter), Inter, sans-serif"
        fontSize="12"
        fontWeight="400"
      >
        {payload.value}
      </text>
    </g>
  );
}

function EarningsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs">
      <p className="font-bold text-gray-500 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-semibold" style={{ color: p.color }}>
          {p.name.charAt(0).toUpperCase() + p.name.slice(1)}: {p.value}k
        </p>
      ))}
    </div>
  );
}

function EarningsChart() {
  const [activePeriod, setActivePeriod] = useState("12 months");
  const periods = ["12 months", "30 days", "7 days", "24 hours"];

  return (
    <div className="bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-6 lg:p-8 border border-[#E5E7EB] shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
      {/* Row 1: Earnings title + View report button */}
      <div className="flex items-start justify-between gap-4">
        <h2
          className="text-[17px] sm:text-[18px] leading-[28px] font-semibold text-[#101828]"
          style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
        >
          Earnings
        </h2>
        <button
          className="rounded-xl border border-[#CBD5E1] bg-white px-3 sm:px-5 py-2 sm:py-3 text-[13px] sm:text-[14px] leading-[20px] font-semibold text-[#344054] shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-colors hover:bg-[#F8FAFC]"
          style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
        >
          View report
        </button>
      </div>
      {/* Row 2: Period tabs — sits below the heading row */}
      <div className="mt-4 sm:mt-7 flex items-center gap-4 sm:gap-8 border-b border-[#E5E7EB] overflow-x-auto scrollbar-hide">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setActivePeriod(p)}
            className={`pb-3 sm:pb-4 text-[13px] sm:text-[14px] leading-[20px] font-semibold transition-colors whitespace-nowrap ${
              activePeriod === p
                ? "text-[#228E8A] border-b-2 border-[#228E8A]"
                : "text-[#667085] hover:text-[#344054]"
            }`}
            style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
          >
            {p}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240} className="sm:!h-[300px]">
        <AreaChart data={earningsData} margin={{ top: 24, right: 0, left: -28, bottom: 8 }} className="sm:!mt-[34px] sm:!mr-[4px] sm:!ml-0">
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#1d8c82" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#1d8c82" stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="expensesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#FEB538" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#FEB538" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="0" stroke="#EAECF0" vertical={false} />
          <XAxis
            dataKey="month"
            type="category"
            ticks={earningsTicks}
            interval={0}
            height={42}
            tickMargin={14}
            tick={<EarningsXAxisTick />}
            axisLine={false}
            tickLine={false}
            padding={{ left: 12, right: 12 }}
          />
          <YAxis hide />
          <Tooltip content={<EarningsTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />
          <Area type="monotone" dataKey="revenue"  stroke="#1d8c82" strokeWidth={2.5} fill="url(#revenueGrad)"  dot={false} activeDot={{ r: 5, fill: "#1d8c82", stroke: "#fff", strokeWidth: 2 }} />
          <Area type="monotone" dataKey="expenses" stroke="#FEB538" strokeWidth={2.5} fill="url(#expensesGrad)" dot={false} activeDot={{ r: 5, fill: "#FEB538", stroke: "#fff", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Main Dashboard Content ─────────────────────────────────────────────────── */
export default function DashboardContent() {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 p-3 xs:p-4 sm:p-6 flex-1">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Earning"
          value="$284K"
          sub="+15% this quarter"
          subClassName="text-[#FF7201]"
        />
        <StatCard
          label="Active Listings"
          value="12"
          sub="+2 this month"
          subClassName="text-[#FF7201]"
        />
        <StatCard
          label="Reservations"
          value="22"
          sub="2 pending"
          subClassName="text-[#228E8A]"
        />
        <StatCard
          label="Completed"
          value="52"
          sub="98% success rate"
          subClassName="text-[#16A34A]"
        />
      </div>

      {/* Middle section: Reservations | Listing Performance | Utilization */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1.15fr)_minmax(0,0.72fr)] gap-3 sm:gap-4 items-stretch">
        <RecentReservations />
        <DonutChart />
        <UtilizationCard />
      </div>

      {/* Earnings chart */}
      <EarningsChart />
    </div>
  );
}
