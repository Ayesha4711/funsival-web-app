"use client";

import React from "react";
import Pagination from "@/components/shared/Pagination";
import { SearchIcon, FilterIcon, ExportIcon, ChevronDownIcon } from "@/icons";
import TransactionActivityCell from "./listings/TransactionActivityCell";
import TransactionStatusCell   from "./listings/TransactionStatusCell";

/* ─── Mock data ──────────────────────────────────────────────────────────────── */
const transactions = [
  { id: 1, date: "Sep 10, 2023", activity: "Pool rent out",           type: "place",     orderId: "F-wv8JfrKc3rUn9jk",  customer: "James Wilson",  status: "Completed", gross: 150,  fee: 4.5,  net: 145.5  },
  { id: 2, date: "Sep 9, 2023",  activity: "Photography Session",     type: "service",   orderId: "F-xa9KgsLdksVoep1",  customer: "Sarah Johnson", status: "Completed", gross: 300,  fee: 9.0,  net: 291.0  },
  { id: 3, date: "Sep 8, 2023",  activity: "Event Equipment Rental",  type: "equipment", orderId: "F-yy8LbtMebWp1qm",   customer: "Mike Davis",    status: "Pending",   gross: 450,  fee: 13.5, net: 436.5  },
  { id: 4, date: "Sep 7, 2023",  activity: "Pool rent out",           type: "place",     orderId: "F-zz1MiuNFkuXq2rn",  customer: "Emily Chen",    status: "Completed", gross: 125,  fee: 3.75, net: 121.25 },
  { id: 5, date: "Sep 6, 2023",  activity: "Music Equipment Rental",  type: "equipment", orderId: "F-aa2Njv0gKvYr3so",  customer: "David Brown",   status: "Completed", gross: 275,  fee: 8.25, net: 266.75 },
  { id: 6, date: "Sep 5, 2023",  activity: "Conference Room Booking", type: "service",   orderId: "F-bb3OkvPhKwZs4tp",  customer: "Lisa Anderson", status: "Refunded",  gross: 200,  fee: 6.0,  net: -200   },
];

/* ─── Styles ─────────────────────────────────────────────────────────────────── */
const thStyle = {
  fontFamily:    "var(--font-sofia-pro), 'Sofia Pro', sans-serif",
  fontWeight:    700,
  fontSize:      "12.25px",
  lineHeight:    "17.5px",
  letterSpacing: "0px",
  color:         "#212121",
};

const headingStyle = {
  fontFamily:    "var(--font-sofia-pro), 'Sofia Pro', sans-serif",
  fontWeight:    700,
  fontSize:      20,
  lineHeight:    "14px",
  letterSpacing: 0,
};

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function TransactionHistory() {
  const [activeTab, setActiveTab] = React.useState("transaction");

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl sm:rounded-4xl p-3 sm:p-5 lg:p-6 border border-border">

      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h2 style={headingStyle} className="text-text text-base! sm:text-xl!">
          Transaction History
        </h2>
        <button
          style={{
            fontFamily:      "var(--font-sofia-pro), Sofia Pro, sans-serif",
            fontWeight:      600,
            backgroundColor: "rgba(255, 114, 1, 0.1)",
          }}
          className="flex items-center gap-2 px-5 py-2 border border-[#FF7201] text-[#FF7201] rounded-full text-sm hover:bg-[#FF7201]/20 transition-colors"
        >
          <ExportIcon />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mb-4 sm:mb-6" />

      {/* Tabs + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex p-1 bg-[#EDF6F6] rounded-full overflow-x-auto scrollbar-hide w-full sm:w-fit">
          {[
            { key: "transaction", label: "Transaction History" },
            { key: "withdrawal",  label: "Withdrawals History" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                fontFamily:    "var(--font-sofia-pro), 'Sofia Pro', sans-serif",
                fontWeight:    600,
                fontSize:      "16px",
                lineHeight:    "100%",
                letterSpacing: "0%",
                textAlign:     "center",
              }}
              className={`px-5 sm:px-7 py-2 sm:py-2.5 rounded-full transition-all whitespace-nowrap shrink-0 ${
                activeTab === key ? "bg-white text-[#228E8A] shadow-sm" : "text-[#666666]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#EDF6F6] rounded-full flex items-center justify-center text-gray-400 cursor-pointer hover:bg-[#d6ecec] transition-colors">
            <SearchIcon />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-8 sm:h-10 bg-[#EDF6F6] rounded-full text-[10px] sm:text-xs font-bold text-gray-500 cursor-pointer hover:bg-[#d6ecec] transition-colors select-none">
            <FilterIcon />
            <span>All Status</span>
            <ChevronDownIcon size={10} />
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div
        className="hidden md:block w-full overflow-x-auto"
        style={{ borderRadius: "12px", border: "0.88px solid #E5E7EB" }}
      >
        <table className="w-full text-left border-collapse" style={{ minWidth: 760 }}>
          <thead className="sticky top-0 z-10">
            <tr style={{ background: "#F9FAFB" }}>
              {["Date", "Activity Name", "Order ID", "Customer", "Status", "Gross Amount", "Platform Fee", "Net Amount"].map((col, i) => (
                <th
                  key={col}
                  className="px-5 py-3 whitespace-nowrap"
                  style={{
                    ...thStyle,
                    borderBottom: "0.88px solid #E5E7EB",
                    borderRadius: i === 0 ? "12px 0 0 0" : i === 7 ? "0 12px 0 0" : 0,
                  }}
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
                  <TransactionActivityCell activity={t.activity} type={t.type} />
                </td>
                <td className="px-5 py-3.5 text-[11px] text-gray-400 whitespace-nowrap font-medium">{t.orderId}</td>
                <td className="px-5 py-3.5 text-[11px] font-semibold text-[#111827] whitespace-nowrap">{t.customer}</td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <TransactionStatusCell status={t.status} />
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
            <div className="flex items-start justify-between gap-2 p-3">
              <div className="min-w-0 flex-1">
                <TransactionActivityCell activity={t.activity} type={t.type} />
                <p className="text-[10px] text-gray-400 mt-1">{t.date}</p>
                <div className="mt-1.5">
                  <TransactionStatusCell status={t.status} />
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className={`text-sm font-extrabold ${t.net < 0 ? "text-red-500" : "text-green-600"}`}>
                  {t.net < 0 ? `-$${Math.abs(t.net)}` : `$${t.net}`}
                </p>
                <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Net Amount</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2 px-3 pb-3 pt-2 border-t border-gray-50">
              <div className="min-w-0">
                <p className="text-[8px] font-extrabold text-gray-400 uppercase mb-0.5">Order ID</p>
                <p className="text-[10px] font-bold text-text truncate">{t.orderId}</p>
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-extrabold text-gray-400 uppercase mb-0.5">Customer</p>
                <p className="text-[10px] font-bold text-text truncate">{t.customer}</p>
              </div>
              <div>
                <p className="text-[8px] font-extrabold text-gray-400 uppercase mb-0.5">Gross</p>
                <p className="text-[10px] font-bold text-text">${t.gross}</p>
              </div>
              <div>
                <p className="text-[8px] font-extrabold text-gray-400 uppercase mb-0.5">Platform Fee</p>
                <p className="text-[10px] font-bold text-text">${t.fee}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1" />
      <div className="mt-4 sm:mt-6">
        <Pagination currentPage={1} totalPages={10} onPageChange={() => {}} />
      </div>
    </div>
  );
}
