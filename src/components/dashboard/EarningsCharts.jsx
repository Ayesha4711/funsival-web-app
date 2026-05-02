"use client";

import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip,
} from "recharts";

const COLORS = {
  places:     "#FEB538",
  equipments: "#1d8c82",
  services:   "#f97316",
  areaLine:   "#FF7B2E",
  areaFill:   "#FFDCC2",
};

/* ─── Earnings Trend ─────────────────────────────────────────────────────── */
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
    <div style={{
      background: "#fff",
      border: "1px solid #f1f5f9",
      borderRadius: 10,
      padding: "6px 12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}>
      <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 800, color: COLORS.areaLine }}>
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export function EarningsTrend() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-[32px] p-3 sm:p-5 lg:p-6 border border-[var(--color-border)] flex-1 flex flex-col">
      <h2
        className="text-[var(--color-text)] mb-4 sm:mb-6"
        style={{ fontFamily: "var(--font-sofia-pro),'Sofia Pro',sans-serif", fontWeight: 700, fontSize: 20, lineHeight: "14px", letterSpacing: 0 }}
      >
        Earnings Trend
      </h2>
      <div className="flex-1 min-h-[200px] sm:min-h-[260px] min-w-0">
      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={COLORS.areaFill} stopOpacity={0.85} />
              <stop offset="100%" stopColor={COLORS.areaFill} stopOpacity={0.05} />
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
            tickFormatter={(v) => v === 0 ? "0" : `${(v / 1000).toString().replace(/\.0$/, "")}k`}
            domain={[0, 40000]}
            ticks={[0, 9500, 19000, 28500, 38000]}
            width={42}
          />
          <Tooltip
            content={<TrendTooltip />}
            cursor={{ stroke: COLORS.areaLine, strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={COLORS.areaLine}
            strokeWidth={2.5}
            fill="url(#earningsGrad)"
            dot={false}
            activeDot={{ r: 5, fill: COLORS.areaLine, stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Revenue by Category (Donut) ────────────────────────────────────────── */
const categoryData = [
  { name: "Places",     value: 60, color: COLORS.places     },
  { name: "Equipments", value: 30, color: COLORS.equipments },
  { name: "Services",   value: 10, color: COLORS.services   },
];

function CalloutLabel({ cx, cy, midAngle, outerRadius, value, name }) {
  const RADIAN = Math.PI / 180;
  const angle = -midAngle * RADIAN;

  // Increase line length for Services to make it more readable
  const lineLen = name === "Services" ? 50 : 36;
  const lineStartX = cx + (outerRadius + 4) * Math.cos(angle);
  const lineStartY = cy + (outerRadius + 4) * Math.sin(angle);
  const lineEndX   = cx + (outerRadius + 4 + lineLen) * Math.cos(angle);
  const lineEndY   = cy + (outerRadius + 4 + lineLen) * Math.sin(angle);

  const boxW = 70;
  const boxH = 36;
  const bx = lineEndX - boxW / 2;
  const by = lineEndY - boxH / 2;

  return (
    <g>
      <line
        x1={lineStartX} y1={lineStartY}
        x2={lineEndX}   y2={lineEndY}
        stroke="#cbd5e1" strokeWidth={1}
      />
      <rect
        x={bx} y={by}
        width={boxW} height={boxH}
        rx={7}
        fill="white"
        stroke="#e2e8f0"
        strokeWidth={1}
        style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.07))" }}
      />
      <text
        x={lineEndX}
        y={by + 13}
        textAnchor="middle"
        fill="#1e293b"
        fontSize={11}
        fontWeight={800}
      >
        {value}%
      </text>
      <text
        x={lineEndX}
        y={by + 25}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize={9.5}
        fontWeight={500}
      >
        {name}
      </text>
    </g>
  );
}

export function RevenueByCategory() {
  return (
    <div className="bg-white rounded-2xl sm:rounded-[32px] p-3 sm:p-5 lg:p-6 border border-[var(--color-border)] h-full flex flex-col">
      <h2
        className="text-[var(--color-text)] mb-2"
        style={{ fontFamily: "var(--font-sofia-pro),'Sofia Pro',sans-serif", fontWeight: 700, fontSize: 20, lineHeight: "14px", letterSpacing: 0 }}
      >
        Revenue by Category
      </h2>
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <ResponsiveContainer width="100%" height={260} className="sm:!h-[300px]">
          <PieChart margin={{ top: 92, right: 60, bottom: 44, left: 60 }}>
            <Pie
              data={categoryData}
              cx="50%"
              cy="55%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={CalloutLabel}
              startAngle={90}
              endAngle={-270}
            >
              {categoryData.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <PieTooltip
              formatter={(value, name) => [`${value}%`, name]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #f1f5f9",
                fontSize: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center gap-6">
          {categoryData.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-xs font-semibold text-text-muted">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
