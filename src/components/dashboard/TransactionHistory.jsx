"use client";

import React from "react";
import Pagination from "@/components/shared/Pagination";

/* ─── Toolbar icons ──────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/* ─── Status badge icons ─────────────────────────────────────────────────────── */
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── Activity type icons (Places / Equipment / Services) ────────────────────── */
const PlaceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const EquipmentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const ServiceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

/* ─── Data ───────────────────────────────────────────────────────────────────── */
const transactions = [
  { id: 1, date: "Sep 10, 2023", activity: "Pool rent out",            type: "place",     orderId: "F-wv8JfrKc3rUn9jk",    customer: "James Wilson",  status: "Completed", gross: 150,  fee: 4.5,  net: 145.5  },
  { id: 2, date: "Sep 9, 2023",  activity: "Photography Session",      type: "service",   orderId: "F-xa9KgsLdksVoep1",   customer: "Sarah Johnson", status: "Completed", gross: 300,  fee: 9.0,  net: 291.0  },
  { id: 3, date: "Sep 8, 2023",  activity: "Event Equipment Rental",   type: "equipment", orderId: "F-yy8LbtMebWp1qm",    customer: "Mike Davis",    status: "Pending",   gross: 450,  fee: 13.5, net: 436.5  },
  { id: 4, date: "Sep 7, 2023",  activity: "Pool rent out",            type: "place",     orderId: "F-zz1MiuNFkuXq2rn",   customer: "Emily Chen",    status: "Completed", gross: 125,  fee: 3.75, net: 121.25 },
  { id: 5, date: "Sep 6, 2023",  activity: "Music Equipment Rental",   type: "equipment", orderId: "F-aa2Njv0gKvYr3so",   customer: "David Brown",   status: "Completed", gross: 275,  fee: 8.25, net: 266.75 },
  { id: 6, date: "Sep 5, 2023",  activity: "Conference Room Booking",  type: "service",   orderId: "F-bb3OkvPhKwZs4tp",   customer: "Lisa Anderson", status: "Refunded",  gross: 200,  fee: 6.0,  net: -200   },
];

/* ─── Activity icon + colour by type ────────────────────────────────────────── */
const typeConfig = {
  place:     { icon: <PlaceIcon />,     bg: "#EDF6F6", color: "#1d8c82" },
  equipment: { icon: <EquipmentIcon />, bg: "#FEF9EC", color: "#D4940A" },
  service:   { icon: <ServiceIcon />,   bg: "#FFF3EC", color: "#f97316" },
};

function ActivityCell({ activity, type }) {
  const cfg = typeConfig[type] ?? typeConfig.service;
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: cfg.bg, color: cfg.color }}
      >
        {cfg.icon}
      </span>
      <span className="whitespace-nowrap font-semibold text-[#111827]">{activity}</span>
    </div>
  );
}

/* ─── Status badge ───────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = {
    Completed: { cls: "bg-green-50  text-green-600  border-green-100",  icon: <CheckIcon /> },
    Pending:   { cls: "bg-orange-50 text-orange-500 border-orange-100", icon: <ClockIcon /> },
    Refunded:  { cls: "bg-red-50    text-red-500    border-red-100",    icon: <XIcon />     },
  };
  const { cls, icon } = cfg[status] ?? cfg.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${cls}`}>
      {icon}{status}
    </span>
  );
}

/* ─── Section heading style (shared) ─────────────────────────────────────────── */
const headingStyle = {
  fontFamily: "var(--font-sofia-pro), 'Sofia Pro', sans-serif",
  fontWeight: 700,
  fontSize: 20,
  lineHeight: "14px",
  letterSpacing: 0,
};

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function TransactionHistory() {
  const [activeTab, setActiveTab] = React.useState("transaction");

  return (
    <div className="bg-white rounded-2xl sm:rounded-[32px] p-3 sm:p-5 lg:p-6 border border-[var(--color-border)]">

      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h2 style={headingStyle} className="text-[var(--color-text)] !text-base sm:!text-xl">Transaction History</h2>
        <button className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 border border-[var(--color-secondary)] text-[var(--color-secondary)] rounded-full text-xs sm:text-sm font-semibold hover:bg-[var(--color-secondary-light)] transition-colors shrink-0">
          <ExportIcon /><span className="hidden xs:inline sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Divider below heading */}
      <div className="h-px bg-[var(--color-border)] mb-4 sm:mb-6" />

      {/* Tabs + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        {/* Tabs — scroll on very small screens */}
        <div className="flex p-1 bg-[#EDF6F6] rounded-full overflow-x-auto scrollbar-hide w-full sm:w-fit">
          <button
            onClick={() => setActiveTab("transaction")}
            className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 ${activeTab === "transaction" ? "bg-white text-[#228E8A] shadow-sm" : "text-gray-400"}`}
          >
            Transaction History
          </button>
          <button
            onClick={() => setActiveTab("withdrawal")}
            className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0 ${activeTab === "withdrawal" ? "bg-white text-[#228E8A] shadow-sm" : "text-gray-400"}`}
          >
            Withdrawals History
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#EDF6F6] rounded-full flex items-center justify-center text-gray-400 cursor-pointer hover:bg-[#d6ecec] transition-colors">
            <SearchIcon />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-8 sm:h-10 bg-[#EDF6F6] rounded-full text-[10px] sm:text-xs font-bold text-gray-500 cursor-pointer hover:bg-[#d6ecec] transition-colors select-none">
            <FilterIcon />
            <span>All Status</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Scrollable table — exact spec: w=1078.25, h=239.3125, r=12, border=0.88px */}
      <div
        className="hidden md:block overflow-x-auto overflow-y-auto"
        style={{
          maxWidth: "1078.25px",
          height: "239.3125px",
          borderRadius: "12px",
          border: "0.88px solid #E5E7EB",
        }}
      >
        <table className="w-full text-left border-collapse" style={{ minWidth: 760 }}>
          <thead className="sticky top-0 z-10">
            <tr style={{ background: "#F9FAFB" }}>
              {["Date", "Activity Name", "Order ID", "Customer", "Status", "Gross Amount", "Platform Fee", "Net Amount"].map((col, i) => (
                <th
                  key={col}
                  className="px-5 py-3 text-[10px] uppercase font-extrabold text-[#6B7280] whitespace-nowrap"
                  style={{ borderBottom: "0.88px solid #E5E7EB", borderRadius: i === 0 ? "12px 0 0 0" : i === 7 ? "0 12px 0 0" : 0 }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, idx) => (
              <tr
                key={t.id}
                className="hover:bg-gray-50 transition-colors"
                style={{ borderBottom: idx < transactions.length - 1 ? "0.88px solid #F3F4F6" : "none" }}
              >
                <td className="px-5 py-3.5 text-[11px] text-gray-400 whitespace-nowrap font-medium">{t.date}</td>
                <td className="px-5 py-3.5 text-[11px] whitespace-nowrap">
                  <ActivityCell activity={t.activity} type={t.type} />
                </td>
                <td className="px-5 py-3.5 text-[11px] text-gray-400 whitespace-nowrap font-medium">{t.orderId}</td>
                <td className="px-5 py-3.5 text-[11px] font-semibold text-[#111827] whitespace-nowrap">{t.customer}</td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-5 py-3.5 text-[11px] font-semibold text-[#111827] whitespace-nowrap">${t.gross}</td>
                <td className="px-5 py-3.5 text-[11px] text-gray-400 whitespace-nowrap font-medium">${t.fee}</td>
                <td className={`px-5 py-3.5 text-[11px] font-bold whitespace-nowrap ${t.net < 0 ? "text-red-500" : "text-green-600"}`}>
                  {t.net < 0 ? `-$${Math.abs(t.net)}` : `+$${t.net}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {transactions.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Top row: activity + net */}
            <div className="flex items-start justify-between gap-2 p-3">
              <div className="min-w-0 flex-1">
                {/* Activity icon + name */}
                <div className="flex items-center gap-2 min-w-0">
                  {(() => {
                    const cfg = typeConfig[t.type] ?? typeConfig.service;
                    return (
                      <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        {cfg.icon}
                      </span>
                    );
                  })()}
                  <span className="text-[11px] sm:text-xs font-semibold text-[#111827] truncate">{t.activity}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-8">{t.date}</p>
                <div className="mt-1.5 ml-8"><StatusBadge status={t.status} /></div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className={`text-sm font-extrabold ${t.net < 0 ? "text-red-500" : "text-green-600"}`}>
                  {t.net < 0 ? `-$${Math.abs(t.net)}` : `$${t.net}`}
                </p>
                <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Net Amount</p>
              </div>
            </div>

            {/* Bottom grid: 4 fields */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-2 px-3 pb-3 pt-2 border-t border-gray-50">
              <div className="min-w-0">
                <p className="text-[8px] font-extrabold text-gray-400 uppercase mb-0.5">Order ID</p>
                <p className="text-[10px] font-bold text-[var(--color-text)] truncate">{t.orderId}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-extrabold text-gray-400 uppercase mb-0.5">Customer</p>
                <p className="text-[10px] font-bold text-[var(--color-text)] truncate">{t.customer}</p>
              </div>
              <div>
                <p className="text-[8px] font-extrabold text-gray-400 uppercase mb-0.5">Gross</p>
                <p className="text-[10px] font-bold text-[var(--color-text)]">${t.gross}</p>
              </div>
              <div>
                <p className="text-[8px] font-extrabold text-gray-400 uppercase mb-0.5">Platform Fee</p>
                <p className="text-[10px] font-bold text-[var(--color-text)]">${t.fee}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 sm:mt-6">
        <Pagination currentPage={1} totalPages={10} onPageChange={() => {}} />
      </div>
    </div>
  );
}
