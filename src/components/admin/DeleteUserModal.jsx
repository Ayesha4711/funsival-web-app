"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { deleteAdminUser } from "@/store/slices/adminSlice";
import { TrashIcon, SpinnerIcon } from "@/icons";

function resolveDisplayName(user) {
  const p = user?.providerProfile;
  if (p && (p.firstName || p.lastName)) {
    return [p.firstName, p.lastName].filter(Boolean).join(" ");
  }
  return user?.name || user?.email || "—";
}

export default function DeleteUserModal({ user, currentAdminId, onClose, onDeleted }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSelf = currentAdminId && user?.id === currentAdminId;
  const displayName = resolveDisplayName(user);

  const handleDelete = async () => {
    if (isSelf) {
      setError("You cannot delete your own account.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await dispatch(deleteAdminUser(user.id));
    setLoading(false);

    if (deleteAdminUser.fulfilled.match(result)) {
      toast.success(`${displayName} has been deleted.`);
      onDeleted?.(user.id);
      onClose();
    } else {
      const msg = typeof result.payload === "string" ? result.payload : "Failed to delete user.";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-3xl w-full max-w-sm px-6 py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <TrashIcon size={22} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete {displayName}?</h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-6">
          This permanently deletes the user&apos;s listings, draft listings, and wishlists. Bookings, reviews,
          refund requests, and withdrawals are kept as historical records. This action cannot be undone.
        </p>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 text-left">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold text-sm py-3 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading || isSelf}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm py-3 rounded-full transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <SpinnerIcon size={14} />}
            {loading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
}
