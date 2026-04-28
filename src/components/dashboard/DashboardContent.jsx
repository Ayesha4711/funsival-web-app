"use client";

import React, { useState } from "react";
import Image from "next/image";
import heroImg from "@/assets/images/HeroImg.jpg";
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ─── Stat Card ─────────────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, subColor = "text-green-500" }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] flex flex-col gap-1">
      <p className="text-xs text-[var(--color-text-muted)] font-medium">{label}</p>
      <p className="text-2xl lg:text-3xl font-extrabold text-[var(--color-text)]">{value}</p>
      {sub && <p className={`text-xs font-medium ${subColor}`}>{sub}</p>}
    </div>
  );
}

/* ─── Status Badge ───────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    Completed: "bg-green-500 text-white",
    Pending: "bg-yellow-400 text-white",
    Cancelled: "bg-red-400 text-white",
  };
  return (
    <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${map[status] ?? "bg-gray-400 text-white"}`}>
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
    <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] h-full flex flex-col">
      <h2 className="text-base font-bold text-[var(--color-text)] mb-4">Recent Reservations</h2>
      <div className="flex flex-col gap-4 flex-1">
        {reservations.map((r) => (
          <div key={r.id} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative">
              <Image src={heroImg} alt={r.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)] truncate">{r.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{r.date}</p>
            </div>
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
      <h2 className="text-base font-bold text-[var(--color-text)] px-5 pt-5 pb-0">Listing Performance</h2>
      <div className="flex-1 flex flex-col items-center justify-center px-2 py-3">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart margin={{ top: 28, right: 28, bottom: 18, left: 28 }}>
            <Pie
              data={performanceData}
              cx="50%"
              cy="54%"
              innerRadius={64}
              outerRadius={98}
              paddingAngle={4}
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
      </div>
      <div className="flex items-center justify-center gap-6 px-5 pb-5">
        {performanceData.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-sm font-semibold text-[var(--color-text-muted)]">{s.name}</span>
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

function UtilizationBar({ name, value, fill }) {
  return (
    <div className="flex flex-col items-center gap-2 shrink-0" style={{ width: 68 }}>
      <div
        className="w-full relative overflow-hidden"
        style={{ background: "#e5e7eb", borderRadius: 8, height: 292 }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${value}%`,
            background: fill,
            borderRadius: 8,
          }}
        />
        <span
          style={{
            position: "absolute",
            top: 16,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "#374151",
          }}
        >
          {value}%
        </span>
        <span
          style={{
            position: "absolute",
            bottom: 16,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 12,
            fontWeight: 600,
            color: "#ffffff",
          }}
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
      <h2 className="text-base font-bold text-[var(--color-text)] px-4 pt-5 pb-4">Utilization</h2>
      <div className="flex-1 flex items-end justify-center px-4 pb-5 gap-5">
        {utilizationData.map((d) => (
          <UtilizationBar key={d.name} name={d.name} value={d.value} fill={d.fill} />
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
    <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)]">
      {/* Row 1: Earnings title + View report button */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-[var(--color-text)]">Earnings</h2>
        <button className="text-xs font-semibold text-[var(--color-text)] border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
          View report
        </button>
      </div>
      {/* Row 2: Period tabs — sits below the heading row */}
      <div className="flex items-center gap-1 mb-4 border-b border-gray-100">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setActivePeriod(p)}
            className={`text-xs font-medium px-3 py-2 transition-colors ${
              activePeriod === p
                ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {p}
          </button>
        ))}
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.15fr)_minmax(0,0.72fr)] gap-4 items-stretch">
        <RecentReservations />
        <DonutChart />
        <UtilizationCard />
      </div>

      {/* Earnings chart */}
      <EarningsChart />
    </div>
  );
}
