"use client";

import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend,
} from "recharts";

/* ─── Shared colours ──────────────────────────────────────────────────────── */
const COLORS = {
  places:     "#FEB538",
  equipments: "#1d8c82",
  services:   "#f97316",
};

/* ─── Earnings Trend (Area Chart) ────────────────────────────────────────── */
const trendData = [
  { month: "Jan", value: 9500  },
  { month: "Feb", value: 14000 },
  { month: "Mar", value: 18000 },
  { month: "Apr", value: 16000 },
  { month: "May", value: 22000 },
  { month: "Jun", value: 26000 },
  { month: "Jul", value: 28000 },
  { month: "Aug", value: 32000 },
  { month: "Sep", value: 28000 },
  { month: "Oct", value: 27000 },
  { month: "Nov", value: 31000 },
  { month: "Dec", value: 38000 },
];

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2">
      <p className="text-xs font-bold text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-extrabold" style={{ color: COLORS.places }}>
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export function EarningsTrend() {
  return (
    <div className="bg-white rounded-[32px] p-6 border border-[var(--color-border)]">
      <h2 className="text-base font-bold text-[var(--color-text)] mb-6">Earnings Trend</h2>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={COLORS.places} stopOpacity={0.28} />
              <stop offset="95%" stopColor={COLORS.places} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v === 0 ? "0" : `${v / 1000}k`}
            domain={[0, 40000]}
            ticks={[0, 9500, 19000, 28500, 38000]}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: COLORS.places, strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={COLORS.places}
            strokeWidth={2.5}
            fill="url(#earningsGrad)"
            dot={{ r: 4, fill: COLORS.places, stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: COLORS.places, stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Revenue by Category (Donut) ────────────────────────────────────────── */
const categoryData = [
  { name: "Places",     value: 60, color: COLORS.places     },
  { name: "Equipments", value: 30, color: COLORS.equipments },
  { name: "Services",   value: 10, color: COLORS.services   },
];

function renderCustomLabel({ cx, cy, midAngle, outerRadius, name, value }) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <foreignObject x={x - 28} y={y - 18} width={56} height={36}>
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        className="bg-white border border-gray-100 rounded-lg px-1.5 py-0.5 text-center"
      >
        <p className="text-[10px] font-extrabold text-gray-800 leading-tight">{value}%</p>
        <p className="text-[8px] text-gray-400 leading-tight">{name}</p>
      </div>
    </foreignObject>
  );
}

export function RevenueByCategory() {
  return (
    <div className="bg-white rounded-[32px] p-6 border border-[var(--color-border)] h-full flex flex-col">
      <h2 className="text-base font-bold text-[var(--color-text)] mb-4">Revenue by Category</h2>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
            >
              {categoryData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <PieTooltip
              formatter={(value, name) => [`${value}%`, name]}
              contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center gap-6">
          {categoryData.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-xs font-bold text-[var(--color-text-muted)]">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
