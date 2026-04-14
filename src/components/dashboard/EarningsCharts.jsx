"use client";

import React from "react";

/* ─── Revenue by Category (Donut) ─────────────────────────────────────────── */
export function RevenueByCategory() {
  const segments = [
    { label: "Places", pct: 60, color: "#FEB538", offset: 0 },
    { label: "Equipments", pct: 30, color: "#1d8c82", offset: 60 },
    { label: "Services", pct: 10, color: "#f97316", offset: 90 },
  ];
  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;
  const gap = 2;

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[var(--color-border)] h-full flex flex-col">
      <h2 className="text-base font-bold text-[var(--color-text)] mb-6">Revenue by Category</h2>
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {/* SVG Donut */}
        <div className="relative shrink-0">
          <svg width="180" height="180" viewBox="0 0 160 160">
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
                  strokeWidth="28"
                  strokeDasharray={`${dashArray} ${circumference - dashArray}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${cx} ${cy})`}
                />
              );
            })}
          </svg>
          
          {/* Legend and percentage labels can be added here or outside */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
             <div className="text-[10px] font-bold text-gray-400">Total</div>
             <div className="text-xl font-extrabold text-[var(--color-text)]">100%</div>
          </div>

          <div className="absolute -top-1 -right-4 bg-white px-2 py-0.5 border rounded-lg shadow-xs text-[10px] font-extrabold text-[var(--color-text)]">10% <br/><span className="text-[8px] font-medium text-gray-400">Services</span></div>
          <div className="absolute top-12 -left-8 bg-white px-2 py-0.5 border rounded-lg shadow-xs text-[10px] font-extrabold text-[var(--color-text)]">30% <br/><span className="text-[8px] font-medium text-gray-400">Equipments</span></div>
          <div className="absolute bottom-4 right-0 bg-white px-2 py-0.5 border rounded-lg shadow-xs text-[10px] font-extrabold text-[var(--color-text)]">60% <br/><span className="text-[8px] font-medium text-gray-400">Places</span></div>
        </div>

        {/* Custom Legend */}
        <div className="flex items-center gap-6">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-xs font-bold text-[var(--color-text-muted)]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Earnings Trend (Area Chart) ─────────────────────────────────────────── */
export function EarningsTrend() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data = [9500, 14000, 18000, 16000, 22000, 26000, 28000, 32000, 28000, 27000, 31000, 38000];
  
  const W = 800;
  const H = 300;
  const pad = 40;
  const chartW = W - pad * 2;
  const chartH = H - pad * 2;
  const max = 38000;

  const toPath = (data) =>
    data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * chartW;
        const y = H - pad - (v / max) * chartH;
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      }).join(" ");

  const toArea = (data) => {
    const top = toPath(data);
    const lastX = pad + chartW;
    const firstX = pad;
    return `${top} L${lastX},${H - pad} L${firstX},${H - pad} Z`;
  };

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[var(--color-border)]">
      <h2 className="text-base font-bold text-[var(--color-text)] mb-8">Earnings Trend</h2>
      
      <div className="w-full overflow-x-auto no-scrollbar">
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full min-w-[600px] overflow-visible">
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1d8c82" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FEB538" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 9500, 19000, 28500, 38000].map((v) => {
             const y = H - pad - (v / max) * chartH;
             return (
               <React.Fragment key={v}>
                 <line x1={pad} y1={y} x2={W - pad} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                 <text x={pad - 10} y={y + 5} textAnchor="end" fontSize="11" fill="#94a3b8">{v}</text>
               </React.Fragment>
             );
          })}

          {/* Area fill */}
          <path d={toArea(data)} fill="url(#trendGrad)" />
          
          {/* Line */}
          <path d={toPath(data)} fill="none" stroke="#FEB538" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots on line */}
          {data.map((v, i) => {
             const x = pad + (i / (data.length - 1)) * chartW;
             const y = H - pad - (v / max) * chartH;
             return (
               <circle key={i} cx={x} cy={y} r="4" fill="#FEB538" stroke="white" strokeWidth="2" />
             );
          })}

          {/* Month labels */}
          {months.map((m, i) => {
            const x = pad + (i / (months.length - 1)) * chartW;
            return (
              <text key={m} x={x} y={H} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="500">
                {m}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
