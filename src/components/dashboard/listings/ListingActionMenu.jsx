"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertIcon, EditIcon, TrashIcon, PlayIcon } from "@/icons";

/**
 * Three-dot action menu for a listing row / card.
 *
 * Props:
 *   item          — the listing object (needs at least item.status)
 *   onEdit        — called with item
 *   onDelete      — called with item
 *   onResumeDraft — called with item (only when status === "Draft")
 *   isLast        — when true the menu opens upward (table last-row helper)
 */
export default function ListingActionMenu({ item, onEdit, onDelete, onResumeDraft, isLast }) {
  const [open, setOpen] = useState(false);
  const ref    = useRef(null);
  const isDraft = item.status === "Draft";

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative flex justify-center" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <MoreVertIcon />
      </button>

      {open && (
        <div
          className={`absolute right-0 z-30 bg-white border border-gray-100 rounded-2xl py-1.5 min-w-36 ${
            isLast ? "bottom-full mb-1" : "top-9"
          }`}
        >
          {isDraft ? (
            <>
              <button
                onClick={() => { setOpen(false); onResumeDraft(item); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
              >
                <PlayIcon size={13} /> Resume Draft
              </button>
              <button
                onClick={() => { setOpen(false); onDelete(item); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <TrashIcon size={13} /> Discard Draft
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setOpen(false); onEdit(item); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[var(--color-text)] hover:bg-gray-50 transition-colors"
              >
                <EditIcon size={13} /> Edit
              </button>
              <button
                onClick={() => { setOpen(false); onDelete(item); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <TrashIcon size={13} /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
