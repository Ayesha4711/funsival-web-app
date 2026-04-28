"use client";

import React from "react";
import Pagination from "@/components/shared/Pagination";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const RefundIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const ExportIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const transactions = [
  { id: 1, date: "Sep 10, 2023", activity: "Pool rent out", orderId: "F-wv8Jf rKc3rUn9jk", customer: "James Wilson", status: "Completed", gross: 150, fee: 4.5, net: 145.5 },
  { id: 2, date: "Sep 9, 2023", activity: "Photography Session", orderId: "F-xa9KgsLdk sVoep1", customer: "Sarah Johnson", status: "Completed", gross: 300, fee: 9.0, net: 291.0 },
  { id: 3, date: "Sep 8, 2023", activity: "Event Equipment Rental", orderId: "F-yy8LbtMe bWp1qm", customer: "Mike Davis", status: "Pending", gross: 450, fee: 13.5, net: 436.5 },
  { id: 4, date: "Sep 7, 2023", activity: "Pool rent out", orderId: "F-zz1MiuNF kuXq2rn", customer: "Emily Chen", status: "Completed", gross: 125, fee: 3.75, net: 121.25 },
  { id: 5, date: "Sep 6, 2023", activity: "Music Equipment Rental", orderId: "F-aa2Njv0g KvYr3so", customer: "David Brown", status: "Completed", gross: 275, fee: 8.25, net: 266.75 },
  { id: 6, date: "Sep 5, 2023", activity: "Conference Room Booking", orderId: "F-bb3OkvPh KwZs4tp", customer: "Lisa Anderson", status: "Refunded", gross: 200, fee: 6.0, net: -200 },
];

function StatusBadge({ status }) {
  const styles = {
    Completed: "bg-green-50 text-green-500 border-green-100",
    Pending: "bg-orange-50 text-orange-500 border-orange-100",
    Refunded: "bg-red-50 text-red-500 border-red-100",
  };
  const icons = {
    Completed: <CheckIcon />,
    Pending: <ClockIcon />,
    Refunded: <RefundIcon />,
  };
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold ${styles[status]}`}>
      {icons[status]}
      {status}
    </div>
  );
}

export default function TransactionHistory() {
  const [activeTab, setActiveTab] = React.useState("transaction");

  return (
    <div className="bg-white rounded-[32px] p-6 border border-[var(--color-border)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Transaction History</h2>
        <button className="flex items-center gap-2 px-4 py-2 border border-[var(--color-secondary)] text-[var(--color-secondary)] rounded-full text-sm font-semibold hover:bg-[var(--color-secondary-light)] transition-colors">
          <ExportIcon />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex p-1 bg-gray-100 rounded-full w-fit">
          <button
            onClick={() => setActiveTab("transaction")}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${activeTab === "transaction" ? "bg-white text-[var(--color-text)]" : "text-gray-400"}`}
          >
            Transaction History
          </button>
          <button
            onClick={() => setActiveTab("withdrawal")}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${activeTab === "withdrawal" ? "bg-white text-[var(--color-text)]" : "text-gray-400"}`}
          >
            Withdrawals History
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <SearchIcon />
          </div>
          <div className="flex items-center gap-2 px-4 h-10 bg-gray-100 rounded-full text-xs font-bold text-gray-500">
            <FilterIcon />
            <span>All Status</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* List - Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-[10px] uppercase font-extrabold text-[#111827]">
              <th className="px-6 py-4 rounded-l-2xl">Date</th>
              <th className="px-6 py-4">Activity Name</th>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Gross Amount</th>
              <th className="px-6 py-4">Platform Fee</th>
              <th className="px-6 py-4 rounded-r-2xl">Net Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((t) => (
              <tr key={t.id} className="text-[11px] font-bold text-[var(--color-text)] hover:bg-gray-50 transition-colors">
                <td className="px-6 py-5 whitespace-nowrap text-gray-500">{t.date}</td>
                <td className="px-6 py-5 whitespace-nowrap flex items-center gap-2">
                   <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center">
                      <CheckIcon />
                   </div>
                   {t.activity}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-gray-400">{t.orderId}</td>
                <td className="px-6 py-5 whitespace-nowrap">{t.customer}</td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-6 py-5 whitespace-nowrap">${t.gross}</td>
                <td className="px-6 py-5 whitespace-nowrap text-gray-400">${t.fee}</td>
                <td className={`px-6 py-5 whitespace-nowrap ${t.net < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {t.net < 0 ? `-$${Math.abs(t.net)}` : `$${t.net}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* List - Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {transactions.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-extrabold text-[var(--color-text)] mb-0.5">{t.activity}</p>
                <p className="text-[10px] text-gray-400">{t.date}</p>
                <div className="mt-2.5">
                   <StatusBadge status={t.status} />
                </div>
              </div>
              <div className="text-right">
                <p className={`text-base font-extrabold ${t.net < 0 ? 'text-red-500' : 'text-green-500'}`}>
                   {t.net < 0 ? `-$${Math.abs(t.net)}` : `$${t.net}`}
                </p>
                <p className="text-[10px] text-gray-400 font-bold">Net Amount</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 pt-4 border-t border-gray-50">
              <div>
                <p className="text-[9px] font-extrabold text-gray-400 uppercase mb-1">Order ID</p>
                <p className="text-[10px] font-bold text-[var(--color-text)] truncate pr-2">{t.orderId}</p>
              </div>
              <div>
                <p className="text-[9px] font-extrabold text-gray-400 uppercase mb-1">Customer</p>
                <p className="text-[10px] font-bold text-[var(--color-text)]">{t.customer}</p>
              </div>
              <div>
                <p className="text-[9px] font-extrabold text-gray-400 uppercase mb-1">Gross Amount</p>
                <p className="text-[10px] font-bold text-[var(--color-text)]">${t.gross}</p>
              </div>
              <div>
                <p className="text-[9px] font-extrabold text-gray-400 uppercase mb-1">Platform Fee</p>
                <p className="text-[10px] font-bold text-[var(--color-text)]">${t.fee}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Pagination currentPage={1} totalPages={10} onPageChange={() => {}} />
      </div>
    </div>
  );
}
