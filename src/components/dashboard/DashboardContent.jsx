"use client";

import React, { useState } from "react";
import Image from "next/image";
import heroImg from "@/assets/images/HeroImg.jpg";

/* ─── Stat Card ─────────────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, subColor = "text-green-500" }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--color-border)] flex flex-col gap-1">
      <p className="text-xs text-[var(--color-text-muted)] font-medium">{label}</p>
      <p className="text-2xl lg:text-3xl font-extrabold text-[var(--color-text)]">{value}</p>
      {sub && <p className={`text-xs font-medium ${subColor}`}>{sub}</p>}
    </div>
  );
}

/* ─── Status Badge ───────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    Completed: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

/* ─── Recent Reservations ────────────────────────────────────────────────────── */
const reservations = [
  { id: 1, name: "Atv Quad Bike", date: "Sep 9th 2023", type: "Equipment", status: "Completed" },
  { id: 2, name: "Atv Quad Bike", date: "Sep 9th 2023", type: "Equipment", status: "Pending" },
  { id: 3, name: "Atv Quad Bike", date: "Sep 9th 2023", type: "Places", status: "Cancelled" },
  { id: 4, name: "Atv Quad Bike", date: "Sep 9th 2023", type: "Services", status: "Completed" },
  { id: 5, name: "Atv Quad Bike", date: "Sep 9th 2023", type: "Services", status: "Cancelled" },
];

function RecentReservations() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--color-border)]">
      <h2 className="text-base font-bold text-[var(--color-text)] mb-4">Recent Reservations</h2>
      <div className="flex flex-col gap-3">
        {reservations.map((r) => (
          <div key={r.id} className="flex items-center gap-3">
            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative">
              <Image src={heroImg} alt={r.name} fill className="object-cover" />
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)] truncate">{r.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{r.date}</p>
            </div>
            {/* Status + type */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <StatusBadge status={r.status} />
              <span className="text-[11px] text-[var(--color-text-subtle)]">{r.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Donut Chart – Listing Performance ─────────────────────────────────────── */
function DonutChart() {
  // Completed 65%, Pending 20%, Cancelled 15%
  const segments = [
    { label: "Completed", pct: 65, color: "#FEB538", offset: 0 },
    { label: "Pending", pct: 20, color: "#1d8c82", offset: 65 },
    { label: "Cancelled", pct: 15, color: "#f97316", offset: 85 },
  ];
  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;
  const gap = 2;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--color-border)]">
      <h2 className="text-base font-bold text-[var(--color-text)] mb-4">Listing Performance</h2>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Donut */}
        <div className="relative shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {segments.map((seg, i) => {
              const dashArray = ((seg.pct / 100) * circumference) - gap;
              const dashOffset = circumference - (seg.offset / 100) * circumference;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="22"
                  strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${cx} ${cy})`}
                />
              );
            })}
            {/* Center label */}
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="500">Total</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="20" fill="#1c2b2d" fontWeight="800">100</text>
          </svg>

          {/* Percentage labels outside */}
          <div className="absolute top-2 right-0 text-xs font-bold text-[var(--color-text-muted)]">10%</div>
          <div className="absolute bottom-6 left-0 text-xs font-bold text-[var(--color-text-muted)]">20%</div>
          <div className="absolute bottom-4 right-2 text-xs font-bold text-[var(--color-text-muted)]">65%</div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-sm text-[var(--color-text-muted)]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Utilization Bars ───────────────────────────────────────────────────────── */
function UtilizationCard() {
  const bars = [
    { label: "Idle", pct: 70, color: "bg-[var(--color-primary)]" },
    { label: "Booked", pct: 40, color: "bg-[var(--color-secondary)]" },
  ];
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--color-border)]">
      <h2 className="text-base font-bold text-[var(--color-text)] mb-4">Utilization</h2>
      <div className="flex flex-col gap-4">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm text-[var(--color-text-muted)] font-medium">{b.label}</span>
              <span className="text-sm font-bold text-[var(--color-text)]">{b.pct}%</span>
            </div>
            <div className="h-9 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className={`h-full ${b.color} rounded-lg transition-all duration-700`}
                style={{ width: `${b.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Earnings Chart ─────────────────────────────────────────────────────────── */
function EarningsChart() {
  const [activePeriod, setActivePeriod] = useState("12 months");
  const periods = ["12 months", "30 days", "7 days", "24 hours"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Mock wave data for two lines
  const line1 = [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 72, 85];
  const line2 = [20, 30, 25, 38, 30, 45, 42, 55, 48, 60, 55, 65];

  const W = 600;
  const H = 120;
  const padX = 10;
  const padY = 10;
  const chartW = W - padX * 2;
  const chartH = H - padY * 2;
  const max = 100;

  const toPath = (data) =>
    data
      .map((v, i) => {
        const x = padX + (i / (data.length - 1)) * chartW;
        const y = padY + chartH - (v / max) * chartH;
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");

  const toArea = (data) => {
    const top = toPath(data);
    const lastX = padX + chartW;
    const firstX = padX;
    return `${top} L${lastX},${H} L${firstX},${H} Z`;
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--color-border)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-base font-bold text-[var(--color-text)]">Earnings</h2>
        <div className="flex items-center gap-1 sm:gap-3">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`text-xs font-medium px-2 sm:px-3 py-1 rounded-full transition-colors ${
                activePeriod === p
                  ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {p}
            </button>
          ))}
          <button className="ml-2 text-xs font-semibold text-[var(--color-primary)] border border-[var(--color-primary)] px-3 py-1 rounded-full hover:bg-[var(--color-primary-light)] transition-colors hidden sm:block">
            View report
          </button>
        </div>
      </div>

      {/* SVG chart */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full min-w-[320px]" preserveAspectRatio="none">
          {/* Area fills */}
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1d8c82" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#1d8c82" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FEB538" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FEB538" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={toArea(line1)} fill="url(#grad1)" />
          <path d={toArea(line2)} fill="url(#grad2)" />
          {/* Lines */}
          <path d={toPath(line1)} fill="none" stroke="#1d8c82" strokeWidth="2.5" strokeLinejoin="round" />
          <path d={toPath(line2)} fill="none" stroke="#FEB538" strokeWidth="2.5" strokeLinejoin="round" />

          {/* Month labels */}
          {months.map((m, i) => {
            const x = padX + (i / (months.length - 1)) * chartW;
            return (
              <text key={m} x={x} y={H + 20} textAnchor="middle" fontSize="10" fill="#94a3b8">
                {m}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ─── Main Dashboard Content ─────────────────────────────────────────────────── */
export default function DashboardContent() {
  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 flex-1">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Earning" value="$284K" sub="+15% this quarter" subColor="text-green-500" />
        <StatCard label="Active Listings" value="12" sub="+2 this month" subColor="text-green-500" />
        <StatCard label="Reservations" value="22" sub="3 pending" subColor="text-yellow-500" />
        <StatCard label="Completed" value="52" sub="96% success rate" subColor="text-green-500" />
      </div>

      {/* Middle section: Reservations | Listing Performance | Utilization */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <RecentReservations />
        <DonutChart />
        <UtilizationCard />
      </div>

      {/* Earnings chart */}
      <EarningsChart />
    </div>
  );
}
