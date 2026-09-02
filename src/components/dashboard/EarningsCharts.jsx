"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip,
} from "recharts";
import axiosInstance from "@/store/axiosInstance";

const COLORS = {
  places:     "#FEB538",
  equipments: "#1d8c82",
  services:   "#f97316",
  other:      "#94a3b8",
  areaLine:   "#FF7B2E",
  areaFill:   "#FFDCC2",
};

function formatMoney(value, currency = "USD") {
  const amount = Number(value ?? 0);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number.isFinite(amount) ? amount : 0);
  } catch {
    return `${Number.isFinite(amount) ? amount.toFixed(0) : "0"} ${currency || ""}`.trim();
  }
}

/**
 * Shared fetch for GET /payments/connect/earnings/overview — calendar-year
 * Jan–Dec trend + category breakdown. Used by both charts below so they
 * always stay in sync on the same year/currency selection.
 */
function useEarningsOverview(currency) {
  const [state, setState] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const run = async () => {
      setState((prev) => ({ ...prev, loading: true, error: "" }));
      try {
        const params = {};
        if (currency) params.currency = currency;
        const { data } = await axiosInstance.get("/payments/connect/earnings/overview", {
          params,
          signal: controller.signal,
        });
        if (!active) return;
        setState({ loading: false, error: "", data: data?.data ?? data ?? null });
      } catch (error) {
        if (!active || error?.code === "ERR_CANCELED") return;
        setState({
          loading: false,
          error: error?.response?.data?.message || error?.message || "Unable to load earnings overview.",
          data: null,
        });
      }
    };

    run();
    return () => {
      active = false;
      controller.abort();
    };
  }, [currency]);

  return state;
}

function pickSeries(seriesList, requestedCurrency) {
  if (!Array.isArray(seriesList) || seriesList.length === 0) return null;
  if (requestedCurrency) {
    return seriesList.find((s) => String(s?.currency || "").toUpperCase() === requestedCurrency) ?? null;
  }
  return seriesList[0];
}

/* ─── Earnings Trend ─────────────────────────────────────────────────────── */
function TrendTooltip({ active, payload, label, currency }) {
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
        {formatMoney(payload[0].value, currency)}
      </p>
    </div>
  );
}

export function EarningsTrend({ currency: initialCurrency }) {
  const { loading, error, data } = useEarningsOverview(initialCurrency);

  const series = useMemo(
    () => pickSeries(data?.trend?.series, initialCurrency),
    [data, initialCurrency]
  );

  const trendData = useMemo(
    () => (series?.points ?? []).map((p) => ({ month: p.label, value: Number(p.netEarnings ?? 0) })),
    [series]
  );

  const currency = series?.currency ?? initialCurrency ?? "USD";
  const maxValue = Math.max(1, ...trendData.map((d) => d.value));
  const yMax = Math.ceil(maxValue / 4) * 4 || 4;
  const hasData = trendData.some((d) => d.value > 0);

  return (
    <div className="bg-white rounded-2xl sm:rounded-[32px] p-3 sm:p-5 lg:p-6 border border-[var(--color-border)] flex-1 flex flex-col">
      <h2
        className="text-[var(--color-text)] mb-4 sm:mb-6"
        style={{ fontFamily: "var(--font-sofia-pro),'Sofia Pro',sans-serif", fontWeight: 700, fontSize: 20, lineHeight: "14px", letterSpacing: 0 }}
      >
        Earnings Trend
      </h2>
      <div className="flex-1 min-h-[200px] sm:min-h-[260px] min-w-0">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">Loading…</div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-red-500 text-center px-4">{error}</div>
        ) : !hasData ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-sm text-gray-400">
            <Image src="/images/No earnings.png" alt="No earnings" width={100} height={100} className="object-contain" />
            No earnings data available
          </div>
        ) : (
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
                domain={[0, yMax]}
                width={42}
              />
              <Tooltip
                content={<TrendTooltip currency={currency} />}
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
        )}
      </div>
    </div>
  );
}

/* ─── Revenue by Category (Donut) ────────────────────────────────────────── */
export function RevenueByCategory({ currency: initialCurrency }) {
  const { loading, error, data } = useEarningsOverview(initialCurrency);

  const series = useMemo(
    () => pickSeries(data?.revenueByCategory?.series, initialCurrency),
    [data, initialCurrency]
  );

  const categoryData = useMemo(
    () => (series?.categories ?? []).map((c) => ({
      name: c.label,
      value: Number(c.percentage ?? 0),
      netEarnings: Number(c.netEarnings ?? 0),
      color: COLORS[c.key] ?? COLORS.other,
    })),
    [series]
  );

  const currency = series?.currency ?? initialCurrency ?? "USD";

  return (
    <div className="bg-white rounded-2xl sm:rounded-[32px] p-3 sm:p-5 lg:p-6 border border-[var(--color-border)] h-full flex flex-col">
      <h2
        className="text-[var(--color-text)] mb-2"
        style={{ fontFamily: "var(--font-sofia-pro),'Sofia Pro',sans-serif", fontWeight: 700, fontSize: 20, lineHeight: "14px", letterSpacing: 0 }}
      >
        Revenue by Category
      </h2>
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        {loading ? (
          <div className="w-full h-full min-h-[260px] flex items-center justify-center text-sm text-gray-400">Loading…</div>
        ) : error ? (
          <div className="w-full h-full min-h-[260px] flex items-center justify-center text-sm text-red-500 text-center px-4">{error}</div>
        ) : categoryData.length === 0 ? (
          <div className="w-full h-full min-h-[260px] flex items-center justify-center text-sm text-gray-400">No revenue data available</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={260} className="sm:!h-[300px]">
              <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <PieTooltip
                  formatter={(value, name, entry) => [
                    `${value}% (${formatMoney(entry?.payload?.netEarnings, currency)})`,
                    name,
                  ]}
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
            <div className="flex items-center gap-6 flex-wrap justify-center">
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
          </>
        )}
      </div>
    </div>
  );
}
