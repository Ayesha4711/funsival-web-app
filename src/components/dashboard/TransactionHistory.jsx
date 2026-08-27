"use client";

import React, { useEffect, useMemo, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/store/axiosInstance";
import Pagination from "@/components/shared/Pagination";
import { ExportIcon, ChevronDownIcon, CheckIcon } from "@/icons";

const USD = "USD";
const TYPE_TABS = [
  { key: "all", label: "All Transactions" },
  { key: "earning", label: "Earnings" },
  { key: "withdrawal", label: "Withdrawals" },
];

const EARNING_STATUS_CONFIG = {
  pending:    { label: "Pending",    className: "bg-[#FFF3CD] text-[#D97706]" },
  refunding:  { label: "Refunding",  className: "bg-orange-50 text-orange-600" },
  processing: { label: "Processing", className: "bg-blue-50 text-blue-600" },
  available:  { label: "Available",  className: "bg-[#E7F7F5] text-[#228E8A]" },
  refunded:   { label: "Refunded",   className: "bg-red-50 text-red-500" },
  disputed:   { label: "Disputed",   className: "bg-red-100 text-red-700" },
};

const WITHDRAWAL_STATUS_CONFIG = {
  pending:  { label: "Pending",   className: "bg-[#FFF3CD] text-[#D97706]" },
  paid:     { label: "Paid",      className: "bg-[#DDFBE7] text-[#12A84A]" },
  failed:   { label: "Failed",    className: "bg-red-50 text-red-500" },
  canceled: { label: "Cancelled", className: "bg-gray-100 text-gray-500" },
};

function formatMoney(value, currency = USD) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function csvCell(value) {
  const str = value == null ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

/* ─── Client-side CSV export (no backend export endpoint yet) ───────────── */
function buildTransactionsCsv(rows) {
  const header = [
    "Transaction ID", "Type", "Description", "Status",
    "Gross Amount", "Platform Fee", "Net Amount", "Currency", "Date Received",
  ];
  const lines = [header.map(csvCell).join(",")];

  rows.forEach((t) => {
    const isWithdrawal = t.type === "withdrawal";
    lines.push([
      t.reference,
      isWithdrawal ? "Withdrawal" : "Earning",
      t.description,
      t.status ?? "",
      isWithdrawal ? "" : (t.gross ?? ""),
      isWithdrawal ? "" : (t.fee ?? ""),
      t.isDebit ? -Math.abs(Number(t.net || 0)) : Math.abs(Number(t.net || 0)),
      t.currency,
      formatDate(t.date),
    ].map(csvCell).join(","));
  });

  return lines.join("\r\n");
}

function StatusBadge({ type, status }) {
  const raw = String(status || "").toLowerCase();
  const config = type === "withdrawal"
    ? WITHDRAWAL_STATUS_CONFIG[raw]
    : EARNING_STATUS_CONFIG[raw];
  const label = config?.label ?? (status ? String(status) : "—");
  const className = config?.className ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${className}`}>
      {label}
    </span>
  );
}

/* ─── Map a raw transaction to display fields ────────────────────────────── */
function mapTransaction(t) {
  const isWithdrawal = t.type === "withdrawal";
  const booking = t.booking ?? {};
  const withdrawal = t.withdrawal ?? {};
  const customer = booking?.customer?.name || booking?.customer?.email || "—";

  return {
    id: t.id,
    type: t.type,
    direction: t.direction,
    status: t.status,
    currency: String(t.currency || USD).toUpperCase(),
    date: t.transactionDate,
    description: isWithdrawal ? "Bank withdrawal" : (t.description || booking?.listing?.title || "Earning"),
    reference: isWithdrawal ? (withdrawal.id || "—") : (booking.id || "—"),
    customer: isWithdrawal ? null : customer,
    gross: isWithdrawal ? null : booking.grossAmount,
    fee: isWithdrawal ? null : booking.platformFee,
    net: t.amount,
    arrivalDate: withdrawal.arrivalDate || null,
    failureReason: withdrawal.failureReason || null,
    isDebit: t.direction === "debit" || isWithdrawal,
  };
}

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
function TableSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-gray-100" />
      ))}
    </div>
  );
}

/* ─── Mobile card ─────────────────────────────────────────────────────────── */
function TransactionCard({ tx }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = tx.type === "withdrawal" ? (tx.arrivalDate || tx.failureReason) : (tx.gross != null || tx.fee != null);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[#111827] truncate">{tx.description}</p>
          <p className="text-[10px] text-gray-400 mt-1">{formatDate(tx.date)}</p>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <StatusBadge type={tx.type} status={tx.status} />
            <span className="text-[10px] font-semibold uppercase text-gray-400">{tx.type}</span>
          </div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <p className={`text-sm font-extrabold ${tx.isDebit ? "text-red-500" : "text-green-600"}`}>
            {tx.isDebit ? "-" : "+"}{formatMoney(Math.abs(Number(tx.net || 0)), tx.currency)}
          </p>
          <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{tx.currency}</p>
        </div>
      </div>

      {hasDetails && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-[#228E8A] border-t border-gray-50"
        >
          {expanded ? "Hide details" : "Show details"}
        </button>
      )}

      {expanded && (
        <div className="grid grid-cols-2 gap-x-2 gap-y-2 px-3 pb-3 pt-2 border-t border-gray-50">
          <div className="min-w-0">
            <p className="text-[8px] font-extrabold text-gray-400 uppercase mb-0.5">Transaction ID</p>
            <p className="text-[10px] font-bold text-[#111827] truncate">{tx.reference}</p>
          </div>
          {tx.type !== "withdrawal" ? (
            <>
              <div className="min-w-0">
                <p className="text-[8px] font-extrabold text-gray-400 uppercase mb-0.5">Customer</p>
                <p className="text-[10px] font-bold text-[#111827] truncate">{tx.customer}</p>
              </div>
              <div>
                <p className="text-[8px] font-extrabold text-gray-400 uppercase mb-0.5">Gross</p>
                <p className="text-[10px] font-bold text-[#111827]">{tx.gross != null ? formatMoney(tx.gross, tx.currency) : "—"}</p>
              </div>
              <div>
                <p className="text-[8px] font-extrabold text-gray-400 uppercase mb-0.5">Platform Fee</p>
                <p className="text-[10px] font-bold text-[#111827]">{tx.fee != null ? formatMoney(tx.fee, tx.currency) : "—"}</p>
              </div>
            </>
          ) : (
            <>
              {tx.arrivalDate && (
                <div className="min-w-0">
                  <p className="text-[8px] font-extrabold text-gray-400 uppercase mb-0.5">Arrival Date</p>
                  <p className="text-[10px] font-bold text-[#111827]">{formatDate(tx.arrivalDate)}</p>
                </div>
              )}
              {tx.failureReason && (
                <div className="col-span-2 min-w-0">
                  <p className="text-[8px] font-extrabold text-gray-400 uppercase mb-0.5">Failure Reason</p>
                  <p className="text-[10px] font-bold text-red-500">{tx.failureReason}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

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

const VALID_TYPES = ["all", "earning", "withdrawal"];
const CURRENCY_OPTIONS = ["USD", "PKR", "EUR", "GBP"];

/* ─── Currency dropdown (custom — native <select> popups can't be themed) ──── */
function CurrencyDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Select currency"
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{ fontFamily: "var(--font-sofia-pro), Sofia Pro, sans-serif" }}
        className={`flex items-center gap-1.5 h-9 sm:h-10 px-3 sm:px-4 bg-[#EDF6F6] rounded-full text-xs sm:text-sm font-bold text-gray-600 transition-colors ${
          open ? "ring-2 ring-[#228E8A]/30" : "hover:bg-[#d6ecec]"
        }`}
      >
        {value}
        <ChevronDownIcon size={12} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-2xl py-1.5 min-w-[120px] shadow-lg"
        >
          {CURRENCY_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              role="option"
              aria-selected={value === c}
              onClick={() => { onChange(c); setOpen(false); }}
              className="w-full flex items-center justify-between gap-2 text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {c}
              {value === c && <CheckIcon size={14} className="text-[#228E8A]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function TransactionHistory() {
  return (
    <Suspense fallback={null}>
      <TransactionHistoryContent />
    </Suspense>
  );
}

function getInitialUrlState(searchParams) {
  const typeParam = searchParams.get("type");
  const pageParam = parseInt(searchParams.get("page"), 10);
  return {
    type: VALID_TYPES.includes(typeParam) ? typeParam : "all",
    currency: (searchParams.get("currency") || USD).toUpperCase(),
    page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1,
  };
}

function TransactionHistoryContent() {
  const searchParams = useSearchParams();
  const tableAreaRef = useRef(null);
  const requestRef = useRef(null);

  const [activeType, setActiveType] = useState(() => getInitialUrlState(searchParams).type);
  const [currency, setCurrency] = useState(() => getInitialUrlState(searchParams).currency);
  const [currentPage, setCurrentPage] = useState(() => getInitialUrlState(searchParams).page);
  const [limit] = useState(20);
  const [retryTick, setRetryTick] = useState(0);
  const [exporting, setExporting] = useState(false);

  const [state, setState] = useState({
    loading: true,
    error: "",
    forbidden: false,
    transactions: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 1, hasNextPage: false, hasPrevPage: false },
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeType && activeType !== "all") params.set("type", activeType);
    if (currency && currency !== USD) params.set("currency", currency);
    if (currentPage > 1) params.set("page", String(currentPage));
    const query = params.toString();
    const url = query ? `?${query}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [activeType, currency, currentPage]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get("type");
      const pageParam = parseInt(params.get("page"), 10);
      setActiveType(VALID_TYPES.includes(typeParam) ? typeParam : "all");
      setCurrency((params.get("currency") || USD).toUpperCase());
      setCurrentPage(Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (requestRef.current?.abort) requestRef.current.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    const run = async () => {
      setState((prev) => ({ ...prev, loading: true, error: "", forbidden: false }));
      try {
        const { data } = await axiosInstance.get("/payments/connect/transactions", {
          params: { page: currentPage, limit, type: activeType, currency },
          signal: controller.signal,
        });
        const payload = data?.data ?? data ?? {};
        setState({
          loading: false,
          error: "",
          forbidden: false,
          transactions: Array.isArray(payload.transactions) ? payload.transactions.map(mapTransaction) : [],
          pagination: payload.pagination ?? { total: 0, page: 1, limit, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        });
      } catch (error) {
        if (error?.code === "ERR_CANCELED") return;
        const status = error?.response?.status;
        if (status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth-token");
            document.cookie = "auth-token=; Max-Age=0; path=/";
            window.location.replace("/logout");
          }
          return;
        }
        if (status === 403) {
          setState((prev) => ({ ...prev, loading: false, error: "", forbidden: true, transactions: [] }));
          return;
        }
        const message = error?.response?.data?.message || error?.message || "Unable to load transactions.";
        setState((prev) => ({ ...prev, loading: false, error: message, forbidden: false }));
      }
    };

    run();
    return () => controller.abort();
  }, [activeType, currency, currentPage, limit, retryTick]);

  useEffect(() => {
    if (tableAreaRef.current) tableAreaRef.current.scrollIntoView({ block: "start" });
  }, [currentPage]);

  const rows = useMemo(() => state.transactions, [state.transactions]);
  const hasActiveFilters = activeType !== "all" || currency !== USD;

  const handleTypeChange = (type) => {
    setActiveType(type);
    setCurrentPage(1);
  };
  const handleCurrencyChange = (c) => {
    setCurrency(c);
    setCurrentPage(1);
  };
  const handleClearFilters = () => {
    setActiveType("all");
    setCurrency(USD);
    setCurrentPage(1);
  };

  /**
   * No backend export endpoint exists yet, so the CSV is assembled client-side:
   * page through every result for the current type/currency filter, then
   * build and download the file in the browser.
   */
  const handleExportCSV = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const exportLimit = 100;
      let page = 1;
      let totalPages = 1;
      const all = [];

      do {
        const { data } = await axiosInstance.get("/payments/connect/transactions", {
          params: { page, limit: exportLimit, type: activeType, currency },
        });
        const payload = data?.data ?? data ?? {};
        const batch = Array.isArray(payload.transactions) ? payload.transactions.map(mapTransaction) : [];
        all.push(...batch);
        totalPages = payload.pagination?.totalPages ?? 1;
        page += 1;
      } while (page <= totalPages);

      const csv = buildTransactionsCsv(all);
      const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // export failures are non-critical; surfaced via the button's disabled/error state is out of scope here
    } finally {
      setExporting(false);
    }
  };

  const { pagination } = state;

  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl sm:rounded-4xl p-3 sm:p-5 lg:p-6 border border-border" ref={tableAreaRef}>

      {/* Header row */}
      <div className="flex items-center justify-between mb-3 gap-3">
        <h2 style={headingStyle} className="text-text text-base! sm:text-xl!">
          Transaction History
        </h2>
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={exporting}
          style={{
            fontFamily:      "var(--font-sofia-pro), Sofia Pro, sans-serif",
            fontWeight:      600,
            backgroundColor: "rgba(255, 114, 1, 0.1)",
          }}
          className="flex items-center gap-2 px-5 py-2 border border-[#FF7201] text-[#FF7201] rounded-full text-sm hover:bg-[#FF7201]/20 transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ExportIcon />
          <span>{exporting ? "Exporting…" : "Export CSV"}</span>
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mb-4 sm:mb-6" />

      {/* Tabs + currency */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex p-1 bg-[#EDF6F6] rounded-full overflow-x-auto scrollbar-hide w-full sm:w-fit">
          {TYPE_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTypeChange(key)}
              aria-pressed={activeType === key}
              style={{
                fontFamily:    "var(--font-sofia-pro), 'Sofia Pro', sans-serif",
                fontWeight:    600,
                fontSize:      "14px",
                lineHeight:    "100%",
                letterSpacing: "0%",
                textAlign:     "center",
              }}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all whitespace-nowrap shrink-0 ${
                activeType === key ? "bg-white text-[#228E8A] shadow-sm" : "text-[#666666]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <CurrencyDropdown value={currency} onChange={handleCurrencyChange} />
        </div>
      </div>

      {/* Forbidden */}
      {state.forbidden && (
        <div className="flex-1 flex items-center justify-center py-16 text-sm text-gray-500 text-center px-4">
          Transaction history is only available for host/provider accounts.
        </div>
      )}

      {/* Loading */}
      {!state.forbidden && state.loading && <TableSkeleton />}

      {/* Error */}
      {!state.forbidden && !state.loading && state.error && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-red-500 text-center px-4">
          <p>{state.error}</p>
          <button
            type="button"
            onClick={() => setRetryTick((t) => t + 1)}
            className="text-sm font-semibold text-[#228E8A] hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!state.forbidden && !state.loading && !state.error && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-gray-500 text-center px-4">
          <p>{hasActiveFilters ? "No transactions match your filters." : "No transactions found."}</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-sm font-semibold text-[#228E8A] hover:opacity-80"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Data */}
      {!state.forbidden && !state.loading && !state.error && rows.length > 0 && (
        <>
          {/* Desktop table */}
          <div
            className="hidden md:block w-full overflow-x-auto"
            style={{ borderRadius: "12px", border: "0.88px solid #E5E7EB" }}
          >
            <table className="w-full text-left border-collapse" style={{ minWidth: 900 }}>
              <thead className="sticky top-0 z-10">
                <tr style={{ background: "#F9FAFB" }}>
                  {[
                    "Transaction ID", "Type", "Description", "Status",
                    ...(activeType !== "withdrawal" ? ["Gross Amount", "Platform Fee"] : []),
                    "Net Amount", "Date Received",
                  ].map((col, i, cols) => (
                    <th
                      key={col}
                      className="px-5 py-3 whitespace-nowrap"
                      style={{
                        ...thStyle,
                        borderBottom: "0.88px solid #E5E7EB",
                        borderRadius: i === 0 ? "12px 0 0 0" : i === cols.length - 1 ? "0 12px 0 0" : 0,
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((t, idx) => (
                  <tr
                    key={t.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: idx < rows.length - 1 ? "0.88px solid #F3F4F6" : "none" }}
                  >
                    <td className="px-5 py-3.5 text-[11px] text-gray-400 whitespace-nowrap font-medium">{t.reference}</td>
                    <td className="px-5 py-3.5 text-[11px] font-bold uppercase text-gray-500 whitespace-nowrap">
                      {t.type === "withdrawal" ? "Withdrawal" : "Earning"}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-[#111827] whitespace-nowrap max-w-[220px] truncate">
                      {t.description}
                      {t.type === "withdrawal" && t.failureReason && (
                        <span className="block text-[10px] font-semibold text-red-500 mt-0.5">{t.failureReason}</span>
                      )}
                      {t.type === "withdrawal" && t.arrivalDate && (
                        <span className="block text-[10px] font-medium text-gray-400 mt-0.5">Arrives {formatDate(t.arrivalDate)}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge type={t.type} status={t.status} />
                    </td>
                    {t.type !== "withdrawal" && (
                      <>
                        <td className="px-5 py-3.5 text-[11px] font-semibold text-[#111827] whitespace-nowrap">
                          {formatMoney(t.gross, t.currency)}
                        </td>
                        <td className="px-5 py-3.5 text-[11px] text-gray-400 whitespace-nowrap font-medium">
                          {formatMoney(t.fee, t.currency)}
                        </td>
                      </>
                    )}
                    {t.type === "withdrawal" && activeType !== "withdrawal" && (
                      <td className="px-5 py-3.5 whitespace-nowrap" colSpan={2} />
                    )}
                    <td className={`px-5 py-3.5 text-[11px] font-bold whitespace-nowrap ${t.isDebit ? "text-red-500" : "text-green-600"}`}>
                      {t.isDebit ? "-" : "+"}{formatMoney(Math.abs(Number(t.net || 0)), t.currency)}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-gray-400 whitespace-nowrap font-medium">{formatDate(t.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {rows.map((t) => (
              <TransactionCard key={t.id} tx={t} />
            ))}
          </div>
        </>
      )}

      <div className="flex-1" />
      {!state.forbidden && !state.loading && !state.error && rows.length > 0 && (
        <div className="mt-4 sm:mt-6 flex flex-col items-center gap-2">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setCurrentPage(p)}
            hasPrevPage={pagination.hasPrevPage}
            hasNextPage={pagination.hasNextPage}
          />
        </div>
      )}
    </div>
  );
}
