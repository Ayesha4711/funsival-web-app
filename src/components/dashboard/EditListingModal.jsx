"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { updateListing } from "@/store/slices/listingsSlice";
import { CloseIcon } from "@/icons";

export default function EditListingModal({ listing, onClose, onSaved }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: listing?.name ?? "",
    location: listing?.location ?? "",
    category: listing?.category ?? "",
    price: listing?.priceRaw ?? "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      basicInformation: {
        activityTitle: form.name,
        location: form.location,
      },
      category: form.category,
      price: { amount: Number(form.price) || form.price },
    };

    const result = await dispatch(updateListing({ listingId: listing.id, payload }));
    setSaving(false);

    if (updateListing.rejected.match(result)) {
      toast.error(result.payload ?? "Failed to update listing.");
      return;
    }

    toast.success("Listing updated.");
    onSaved({
      ...listing,
      name: form.name,
      location: form.location,
      category: form.category,
      price: form.price ? `$${form.price} / person` : listing.price,
    });
    onClose();
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-text outline-none focus:border-primary transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-extrabold text-text">Edit Listing</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
            <CloseIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold uppercase text-gray-400">Activity Title</label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Activity title" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold uppercase text-gray-400">Location</label>
            <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Location" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold uppercase text-gray-400">Category</label>
            <input type="text" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Category" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold uppercase text-gray-400">Price per person ($)</label>
            <input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0" className={inputClass} />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
