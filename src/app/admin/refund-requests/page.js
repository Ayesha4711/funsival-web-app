"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  fetchAdminRefundRequests,
  approveRefundRequest,
  rejectRefundRequest,
  selectAdminRefundRequests,
  selectAdminRefundRequestsPagination,
  selectAdminRefundRequestsStatus,
  selectPaymentsActionError,
  clearActionError,
} from "@/store/slices/paymentsSlice";
import Pagination from "@/components/shared/Pagination";

const STATUS_TABS = [
  { key: "pending",  label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "",         label: "All" },
];

const STATUS_STYLES = {
  pending:   "bg-yellow-100 text-yellow-700",
  approved:  "bg-green-100 text-green-700",
  rejected:  "bg-red-100 text-red-600",
  withdrawn: "bg-gray-100 text-gray-500",
  expired:   "bg-gray-100 text-gray-400",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? STATUS_STYLES.pending}`}>
      {status}
    </span>
  );
}

function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function resolveGuestName(requestedBy) {
  if (!requestedBy || typeof requestedBy !== "object") return requestedBy || "—";
  const p = requestedBy.providerProfile;
  if (p) return [p.firstName, p.lastName].filter(Boolean).join(" ") || requestedBy.email || "—";
  return requestedBy.email || "—";
}

function resolveHostName(host) {
  if (!host || typeof host !== "object") return host || "—";
  const p = host.providerProfile;
  if (p) return [p.firstName, p.lastName].filter(Boolean).join(" ") || host.email || "—";
  return host.email || "—";
}

function resolveBookingRef(booking) {
  if (!booking) return "—";
  if (typeof booking === "object") return booking.id?.slice(-8)?.toUpperCase() ?? "—";
  return booking.slice(-8).toUpperCase();
}

/* ── Reject note modal ─────────────────────────────────────────────────────── */
function RejectModal({ onClose, onConfirm, loading }) {
  const [note, setNote] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Reject Refund Request</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm text-gray-500">The guest will be notified. Funds will still release to the host on day 7.</p>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={textareaRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Outside cancellation policy — service was delivered"
              rows={3}
              className="w-full px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-500 font-semibold rounded-full text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => onConfirm(note.trim())}
              disabled={loading || !note.trim()}
              className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-full text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Rejecting…" : "Reject"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────────── */
export default function AdminRefundRequestsPage() {
  const dispatch = useDispatch();

  const requests     = useSelector(selectAdminRefundRequests);
  const pagination   = useSelector(selectAdminRefundRequestsPagination);
  const fetchStatus  = useSelector(selectAdminRefundRequestsStatus);
  const actionError  = useSelector(selectPaymentsActionError);

  const [activeTab, setActiveTab] = useState("pending");
  const [page, setPage]           = useState(1);

  // Track which row is being actioned: { id, type: "approve"|"reject" }
  const [acting, setActing]   = useState(null);
  // Reject modal state: requestId or null
  const [rejectTarget, setRejectTarget] = useState(null);

  const load = useCallback(() => {
    dispatch(fetchAdminRefundRequests({ status: activeTab || undefined, page, limit: 20 }));
  }, [dispatch, activeTab, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (actionError) {
      toast.error(typeof actionError === "string" ? actionError : "Action failed. Please try again.");
      dispatch(clearActionError());
    }
  }, [actionError, dispatch]);

  const handleTabChange = (key) => { setActiveTab(key); setPage(1); };

  const handleApprove = async (requestId) => {
    setActing({ id: requestId, type: "approve" });
    try {
      await dispatch(approveRefundRequest({ requestId })).unwrap();
      toast.success("Refund approved and issued.");
      load();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Approval failed.");
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (note) => {
    if (!rejectTarget) return;
    setActing({ id: rejectTarget, type: "reject" });
    try {
      await dispatch(rejectRefundRequest({ requestId: rejectTarget, note })).unwrap();
      toast.success("Refund request rejected.");
      setRejectTarget(null);
      load();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Rejection failed.");
    } finally {
      setActing(null);
    }
  };

  const isLoading       = fetchStatus === "loading";
  const rejectModalOpen = !!rejectTarget;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 2xl:p-8">
      <div className="w-full flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl 2xl:text-3xl font-bold text-gray-900">Refund Requests</h1>
            {activeTab === "pending" && pagination.total > 0 && (
              <p className="text-sm 2xl:text-base text-yellow-600 font-medium mt-0.5">{pagination.total} pending review</p>
            )}
          </div>
          <button
            onClick={load}
            className="px-4 2xl:px-6 py-2 2xl:py-3 text-sm 2xl:text-base border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 font-medium transition-colors"
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
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-[3px] border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-gray-400 font-medium text-sm">No {activeTab} refund requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-240 border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Guest", "Host", "Booking Ref", "Amount", "Reason", "Submitted", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-5 2xl:px-8 py-3 2xl:py-5 text-left text-xs 2xl:text-sm font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req) => {
                    const guestName   = resolveGuestName(req.requestedBy);
                    const guestEmail  = typeof req.requestedBy === "object" ? req.requestedBy?.email : null;
                    const guestAvatar = req.requestedBy?.providerProfile?.profileImage || null;
                    const hostName    = resolveHostName(req.host);
                    const hostEmail   = typeof req.host === "object" ? req.host?.email : null;
                    const bookingRef  = resolveBookingRef(req.booking);
                    const bookingTotal = typeof req.booking === "object" ? req.booking?.totalAmount : null;
                    const isPending   = req.status === "pending";
                    const isActing    = acting?.id === req.id;

                    return (
                      <tr key={req.id} className="hover:bg-gray-50/60 transition-colors">

                        {/* Guest */}
                        <td className="px-5 2xl:px-8 py-3.5 2xl:py-5">
                          <div className="flex items-center gap-2.5">
                            {guestAvatar ? (
                              <img src={guestAvatar} alt="" className="w-8 h-8 2xl:w-11 2xl:h-11 rounded-full object-cover shrink-0 border border-gray-100" />
                            ) : (
                              <div className="w-8 h-8 2xl:w-11 2xl:h-11 rounded-full bg-[#EBF6F6] text-[#4AA7A7] flex items-center justify-center text-xs 2xl:text-sm font-bold shrink-0">
                                {guestName?.[0]?.toUpperCase() || "G"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm 2xl:text-base font-semibold text-gray-800 truncate max-w-30 2xl:max-w-48">{guestName}</p>
                              {guestEmail && <p className="text-xs 2xl:text-sm text-gray-400 truncate max-w-30 2xl:max-w-48">{guestEmail}</p>}
                            </div>
                          </div>
                        </td>

                        {/* Host */}
                        <td className="px-5 2xl:px-8 py-3.5 2xl:py-5">
                          <p className="text-sm 2xl:text-base font-semibold text-gray-800 truncate max-w-32.5">{hostName}</p>
                          {hostEmail && <p className="text-xs 2xl:text-sm text-gray-400 truncate max-w-32.5">{hostEmail}</p>}
                        </td>

                        {/* Booking Ref */}
                        <td className="px-5 2xl:px-8 py-3.5 2xl:py-5">
                          <p className="text-sm 2xl:text-base font-mono font-semibold text-gray-700">#{bookingRef}</p>
                          {bookingTotal != null && <p className="text-xs 2xl:text-sm text-gray-400">${bookingTotal} total</p>}
                        </td>

                        {/* Amount */}
                        <td className="px-5 2xl:px-8 py-3.5 2xl:py-5 whitespace-nowrap">
                          <p className="text-sm 2xl:text-base font-bold text-gray-900">
                            {req.amount != null ? `$${Number(req.amount).toLocaleString()}` : "—"}
                            {req.currency && <span className="text-xs 2xl:text-sm font-normal text-gray-400 ml-1">{req.currency}</span>}
                          </p>
                        </td>

                        {/* Reason */}
                        <td className="px-5 2xl:px-8 py-3.5 2xl:py-5 max-w-40 2xl:max-w-64">
                          <p className="text-sm 2xl:text-base text-gray-600 truncate" title={req.reason}>{req.reason || "—"}</p>
                        </td>

                        {/* Submitted */}
                        <td className="px-5 2xl:px-8 py-3.5 2xl:py-5 whitespace-nowrap">
                          <p className="text-sm 2xl:text-base text-gray-500">{formatDateTime(req.createdAt)}</p>
                        </td>

                        {/* Status */}
                        <td className="px-5 2xl:px-8 py-3.5 2xl:py-5">
                          <StatusBadge status={req.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-5 2xl:px-8 py-3.5 2xl:py-5">
                          {isPending ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApprove(req.id)}
                                disabled={isActing}
                                className="flex items-center gap-1.5 px-3 2xl:px-4 py-1.5 2xl:py-2 rounded-lg bg-green-500 text-white text-xs 2xl:text-sm font-bold hover:bg-green-600 disabled:opacity-50 transition-colors whitespace-nowrap"
                              >
                                {isActing && acting?.type === "approve" ? (
                                  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                  </svg>
                                ) : (
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                )}
                                Accept
                              </button>
                              <button
                                onClick={() => setRejectTarget(req.id)}
                                disabled={isActing}
                                className="flex items-center gap-1.5 px-3 2xl:px-4 py-1.5 2xl:py-2 rounded-lg border border-red-300 text-red-600 text-xs 2xl:text-sm font-bold hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap"
                              >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium capitalize">{req.status}</span>
                          )}
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
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        )}

      </div>

      {/* Reject modal */}
      {rejectModalOpen && (
        <RejectModal
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
          loading={acting?.type === "reject"}
        />
      )}
    </div>
  );
}
