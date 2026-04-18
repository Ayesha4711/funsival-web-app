"use client";

import React, { useState } from "react";
import Image from "next/image";
import heroImg from "@/assets/images/HeroImg.jpg";
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

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
const performanceData = [
  { name: "Completed", value: 60, color: "#1d8c82" },
  { name: "Pending",   value: 30, color: "#FEB538" },
  { name: "Canceled",  value: 10, color: "#f97316" },
];

function renderPerfLabel({ cx, cy, midAngle, outerRadius, name, value }) {
  const RADIAN = Math.PI / 180;
  // Push labels further out so longer names like "Completed" don't clip
  const radius = outerRadius + 42;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  // Width wide enough for "Completed", anchored at centre of label
  return (
    <foreignObject x={x - 36} y={y - 20} width={72} height={40}>
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "3px 6px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
      >
        <span style={{ fontSize: 11, fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>{value}%</span>
        <span style={{ fontSize: 9, color: "#9ca3af", lineHeight: 1.2, whiteSpace: "nowrap" }}>{name}</span>
      </div>
    </foreignObject>
  );
}

function DonutChart() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--color-border)]">
      <h2 className="text-base font-bold text-[var(--color-text)] mb-2">Listing Performance</h2>
      {/* Extra vertical space so labels above/below the donut aren't clipped */}
      <ResponsiveContainer width="100%" height={260}>
        <PieChart margin={{ top: 28, right: 28, bottom: 28, left: 28 }}>
          <Pie
            data={performanceData}
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={84}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderPerfLabel}
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
      <div className="flex items-center justify-center gap-5 mt-1">
        {performanceData.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Utilization Bars (vertical) ───────────────────────────────────────────── */
const utilizationData = [
  { name: "Booked",  value: 70, fill: "#1d8c82" },
  { name: "Pending", value: 40, fill: "#FEB538" },
];

function UtilizationTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs font-bold text-gray-700">
      {payload[0].payload.name}: {payload[0].value}%
    </div>
  );
}

function UtilizationCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--color-border)] flex flex-col h-full min-h-[320px]">
      <h2 className="text-base font-bold text-[var(--color-text)] mb-2">Utilization</h2>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={utilizationData} barSize={64} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip content={<UtilizationTooltip />} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {utilizationData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
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

function EarningsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--color-border)]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-base font-bold text-[var(--color-text)]">Earnings</h2>
        <div className="flex items-center gap-1 sm:gap-3">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={`text-xs font-medium px-2 sm:px-3 py-1 transition-colors ${
                activePeriod === p
                  ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {p}
            </button>
          ))}
          <button className="ml-2 text-xs font-semibold text-[var(--color-text)] border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors hidden sm:block">
            View report
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={earningsData} margin={{ top: 5, right: 5, left: -32, bottom: 0 }}>
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
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
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
    <div className="flex flex-col gap-5 p-4 sm:p-6 flex-1">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Earning" value="$284K" sub="+15% this quarter" subColor="text-green-500" />
        <StatCard label="Active Listings" value="12" sub="+2 this month" subColor="text-green-500" />
        <StatCard label="Reservations" value="22" sub="3 pending" subColor="text-yellow-500" />
        <StatCard label="Completed" value="52" sub="96% success rate" subColor="text-green-500" />
      </div>

      {/* Middle section: Reservations | Listing Performance | Utilization */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
        <RecentReservations />
        <DonutChart />
        <UtilizationCard />
      </div>

      {/* Earnings chart */}
      <EarningsChart />
    </div>
  );
}
