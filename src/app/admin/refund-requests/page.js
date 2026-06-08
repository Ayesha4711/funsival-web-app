"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  fetchAdminRefundRequests,
  selectAdminRefundRequests,
  selectAdminRefundRequestsPagination,
  selectAdminRefundRequestsStatus,
} from "@/store/slices/paymentsSlice";

const STATUS_TABS = [
  { key: "pending",   label: "Pending" },
  { key: "approved",  label: "Approved" },
  { key: "rejected",  label: "Rejected" },
  { key: "withdrawn", label: "Withdrawn" },
  { key: "expired",   label: "Expired" },
  { key: "",          label: "All" },
];

function StatusBadge({ status }) {
  const cfg = {
    pending:   "bg-yellow-100 text-yellow-700",
    approved:  "bg-green-100 text-green-700",
    rejected:  "bg-red-100 text-red-600",
    withdrawn: "bg-gray-100 text-gray-500",
    expired:   "bg-gray-100 text-gray-400",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${cfg[status] ?? cfg.pending}`}>
      {status}
    </span>
  );
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminRefundRequestsPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const requests = useSelector(selectAdminRefundRequests);
  const pagination = useSelector(selectAdminRefundRequestsPagination);
  const status = useSelector(selectAdminRefundRequestsStatus);

  const [activeTab, setActiveTab] = useState("pending");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    dispatch(fetchAdminRefundRequests({ status: activeTab || undefined, page, limit: 20 }));
  }, [dispatch, activeTab, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const pendingCount = activeTab === "pending" ? pagination.total : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Refund Requests</h1>
            {pendingCount !== null && pendingCount > 0 && (
              <p className="text-sm text-yellow-600 font-medium mt-0.5">{pendingCount} pending review</p>
            )}
          </div>
          <button
            onClick={() => load()}
            className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 font-medium"
          >
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 w-fit flex-wrap">
          {STATUS_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? "bg-[#4AA7A7] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {status === "loading" ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-gray-400 font-medium">No {activeTab || ""} refund requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Guest", "Booking", "Amount", "Reason", "Submitted", "Status", "Action"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req) => {
                    const guest = req.requestedBy;
                    const booking = req.booking;
                    return (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-gray-800">
                            {typeof guest === "object" ? (guest?.name || guest?.email || "Guest") : (guest || "—")}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-gray-700 font-medium">
                            {typeof booking === "object" ? (booking?.id?.slice(-8)?.toUpperCase() ?? "—") : (booking?.slice(-8)?.toUpperCase() ?? "—")}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-bold text-gray-900">
                            {req.amount != null ? `$${Number(req.amount).toLocaleString()}` : "—"}
                            {req.currency ? ` ${req.currency}` : ""}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 max-w-xs">
                          <p className="text-sm text-gray-600 truncate" title={req.reason}>{req.reason || "—"}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="text-sm text-gray-500">{formatDateTime(req.createdAt)}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => router.push(`/admin/refund-requests/${req.id}`)}
                            className="px-4 py-1.5 rounded-lg bg-[#4AA7A7] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                          >
                            {req.status === "pending" ? "Review" : "View"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {pagination.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
              disabled={page >= pagination.totalPages}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
