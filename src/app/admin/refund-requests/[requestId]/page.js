"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  fetchAdminRefundRequest,
  approveRefundRequest,
  rejectRefundRequest,
  selectSelectedRefundRequest,
  selectPaymentsActionStatus,
  selectPaymentsActionError,
  clearActionError,
} from "@/store/slices/paymentsSlice";

function StatusBadge({ status }) {
  const cfg = {
    pending:   "bg-yellow-100 text-yellow-700",
    approved:  "bg-green-100 text-green-700",
    rejected:  "bg-red-100 text-red-600",
    withdrawn: "bg-gray-100 text-gray-500",
    expired:   "bg-gray-100 text-gray-400",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold capitalize ${cfg[status] ?? cfg.pending}`}>
      {status}
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 font-medium shrink-0 w-40">{label}</span>
      <span className="text-sm text-gray-800 font-medium text-right flex-1">{value ?? "—"}</span>
    </div>
  );
}

function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function ApproveModal({ onClose, onConfirm, loading }) {
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Approve Refund</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm text-gray-500">This will issue a full refund to the guest via Stripe and cancel the booking.</p>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Internal note <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Verified provider no-show"
              rows={3}
              className="w-full px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded-xl focus:outline-none focus:border-[#4AA7A7] resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-500 font-semibold rounded-full text-sm hover:bg-gray-50">Cancel</button>
            <button
              onClick={() => onConfirm(note.trim() || undefined)}
              disabled={loading}
              className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-full text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Processing…" : "Approve & Refund"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ onClose, onConfirm, loading }) {
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Reject Refund</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm text-gray-500">The guest will be notified. Funds will still release to the host on day 7.</p>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Outside cancellation policy — service was delivered"
              rows={3}
              className="w-full px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border border-gray-200 text-gray-500 font-semibold rounded-full text-sm hover:bg-gray-50">Cancel</button>
            <button
              onClick={() => onConfirm(note.trim())}
              disabled={loading || !note.trim()}
              className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-full text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Rejecting…" : "Reject Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminRefundRequestDetailPage() {
  const router = useRouter();
  const { requestId } = useParams();
  const dispatch = useDispatch();

  const request = useSelector(selectSelectedRefundRequest);
  const actionStatus = useSelector(selectPaymentsActionStatus);
  const actionError = useSelector(selectPaymentsActionError);

  const [modal, setModal] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  useEffect(() => {
    if (!requestId) return;
    dispatch(fetchAdminRefundRequest(requestId)).finally(() => setLoadingDetail(false));
  }, [requestId, dispatch]);

  useEffect(() => {
    if (actionError) {
      toast.error(typeof actionError === "string" ? actionError : "Action failed. Please try again.");
      dispatch(clearActionError());
    }
  }, [actionError, dispatch]);

  const loading = actionStatus === "loading";

  const handleApprove = async (note) => {
    try {
      await dispatch(approveRefundRequest({ requestId, note })).unwrap();
      toast.success("Refund approved and issued.");
      setModal(null);
      router.push("/admin/refund-requests");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Approval failed.");
    }
  };

  const handleReject = async (note) => {
    try {
      await dispatch(rejectRefundRequest({ requestId, note })).unwrap();
      toast.success("Refund request rejected.");
      setModal(null);
      router.push("/admin/refund-requests");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Rejection failed.");
    }
  };

  if (loadingDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-500 font-medium">Refund request not found.</p>
        <button onClick={() => router.back()} className="text-[#4AA7A7] text-sm font-semibold hover:underline">← Back</button>
      </div>
    );
  }

  const guest = request.requestedBy;
  const host = request.host;
  const booking = request.booking;
  const isPending = request.status === "pending";

  // Resolve guest display name from nested providerProfile
  const guestProfile = typeof guest === "object" ? guest?.providerProfile : null;
  const guestName = guestProfile
    ? [guestProfile.firstName, guestProfile.lastName].filter(Boolean).join(" ") || guest?.email
    : (typeof guest === "object" ? guest?.email : guest) || "—";
  const guestEmail = typeof guest === "object" ? guest?.email : null;
  const guestAvatar = guestProfile?.profileImage || null;

  // Resolve host display name
  const hostProfile = typeof host === "object" ? host?.providerProfile : null;
  const hostName = hostProfile
    ? [hostProfile.firstName, hostProfile.lastName].filter(Boolean).join(" ") || host?.email
    : (typeof host === "object" ? host?.email : host) || "—";
  const hostEmail = typeof host === "object" ? host?.email : null;

  const bookingRef = typeof booking === "object"
    ? (booking?.id?.slice(-8)?.toUpperCase() ?? "—")
    : (typeof booking === "string" ? booking.slice(-8).toUpperCase() : "—");

  // Format date only (no time)
  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Format time from HH:MM
  const formatTime = (t) => {
    if (!t) return "—";
    const [h, m] = t.split(":").map(Number);
    if (isNaN(h)) return t;
    const ampm = h < 12 ? "AM" : "PM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/refund-requests")}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Refund Request</h1>
            <p className="text-xs text-gray-400 mt-0.5">#{requestId?.slice(-8)?.toUpperCase()}</p>
          </div>
          <StatusBadge status={request.status} />
        </div>

        {/* Guest & Host cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Guest */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
            {guestAvatar ? (
              <img src={guestAvatar} alt="" className="w-11 h-11 rounded-full object-cover shrink-0 border border-gray-100" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#EBF6F6] text-[#4AA7A7] flex items-center justify-center text-sm font-bold shrink-0">
                {guestName?.[0]?.toUpperCase() || "G"}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Guest</p>
              <p className="text-sm font-bold text-gray-800 truncate">{guestName}</p>
              {guestEmail && <p className="text-xs text-gray-400 truncate">{guestEmail}</p>}
            </div>
          </div>
          {/* Host */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FFF8E7] text-[#F5C842] flex items-center justify-center text-sm font-bold shrink-0">
              {hostName?.[0]?.toUpperCase() || "H"}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Host</p>
              <p className="text-sm font-bold text-gray-800 truncate">{hostName}</p>
              {hostEmail && <p className="text-xs text-gray-400 truncate">{hostEmail}</p>}
            </div>
          </div>
        </div>

        {/* Request summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 flex flex-col gap-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Request Summary</p>
          <DetailRow label="Booking Ref" value={`#${bookingRef}`} />
          <DetailRow
            label="Refund Amount"
            value={request.amount != null ? `$${Number(request.amount).toLocaleString()} ${request.currency ?? "USD"}` : "—"}
          />
          <DetailRow label="Submitted" value={formatDateTime(request.createdAt)} />
          <DetailRow label="Payout Eligible At" value={formatDateTime(request.payoutEligibleAt)} />
          {request.decidedAt && <DetailRow label="Decided At" value={formatDateTime(request.decidedAt)} />}
          {request.decisionNote && <DetailRow label="Admin Note" value={request.decisionNote} />}
        </div>

        {/* Guest reason */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Guest's Reason</p>
          <p className="text-sm text-gray-700 leading-relaxed">{request.reason || "No reason provided."}</p>
        </div>

        {/* Booking details */}
        {typeof booking === "object" && booking && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 flex flex-col gap-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Booking Details</p>
            <DetailRow label="Booking ID" value={`#${booking.id?.slice(-8)?.toUpperCase()}`} />
            <DetailRow label="Type" value={booking.bookingType?.replace(/_/g, " ")} />
            <DetailRow label="Status" value={<span className="capitalize">{booking.status}</span>} />
            <DetailRow label="Payment Status" value={<span className="capitalize">{booking.paymentStatus}</span>} />
            <DetailRow label="Guests" value={booking.numberOfGuests ?? "—"} />
            <DetailRow
              label="Date"
              value={booking.startDate ? formatDate(booking.startDate) : "—"}
            />
            {booking.startTime && (
              <DetailRow
                label="Time"
                value={`${formatTime(booking.startTime)}${booking.endTime ? ` – ${formatTime(booking.endTime)}` : ""}`}
              />
            )}
            <DetailRow label="Price / Unit" value={booking.pricePerUnit != null ? `$${booking.pricePerUnit}` : "—"} />
            <DetailRow label="Subtotal" value={booking.subtotal != null ? `$${booking.subtotal}` : "—"} />
            <DetailRow label="Service Fee" value={booking.serviceFee != null ? `$${booking.serviceFee}` : "—"} />
            <DetailRow
              label="Total"
              value={<span className="font-bold text-gray-900">{booking.totalAmount != null ? `$${booking.totalAmount}` : "—"}</span>}
            />
            {booking.stripePaymentIntentId && (
              <DetailRow label="Stripe PI" value={<span className="font-mono text-xs">{booking.stripePaymentIntentId}</span>} />
            )}
          </div>
        )}

        {/* Action buttons */}
        {isPending ? (
          <div className="flex gap-3">
            <button
              onClick={() => setModal("reject")}
              disabled={loading}
              className="flex-1 py-3.5 rounded-full border-2 border-red-400 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={() => setModal("approve")}
              disabled={loading}
              className="flex-1 py-3.5 rounded-full bg-green-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Approve &amp; Refund
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 text-center">
            <p className="text-sm text-gray-500">
              This request has already been <strong>{request.status}</strong>. No further action is needed.
            </p>
          </div>
        )}
      </div>

      {modal === "approve" && (
        <ApproveModal onClose={() => setModal(null)} onConfirm={handleApprove} loading={loading} />
      )}
      {modal === "reject" && (
        <RejectModal onClose={() => setModal(null)} onConfirm={handleReject} loading={loading} />
      )}
    </div>
  );
}
