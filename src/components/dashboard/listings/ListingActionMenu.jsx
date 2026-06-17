"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MoreVertIcon, EditIcon, TrashIcon, PlayIcon, EyeIcon } from "@/icons";

export default function ListingActionMenu({ item, onEdit, onDelete, onResumeDraft, onViewDetails }) {
  const [open, setOpen]       = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, openUp: false });
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const isDraft = item.status === "Draft";

  const computePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const menuHeight = isDraft ? 88 : 120;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight + 12;
    setMenuPos({
      top:    openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left:   rect.right - 144,
      openUp,
    });
  }, [isDraft]);

  const handleOpen = () => {
    computePosition();
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e) {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function onScroll() { computePosition(); }
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, computePosition]);

  const menu = open && (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top:      menuPos.top,
        left:     menuPos.left,
        zIndex:   9999,
        minWidth: 144,
      }}
      className="bg-white border border-gray-100 rounded-2xl py-1.5 shadow-lg"
    >
      {isDraft ? (
        <>
          <button
            onClick={() => { setOpen(false); onResumeDraft(item); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary-light transition-colors"
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
            onClick={() => { setOpen(false); onViewDetails?.(item); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-text hover:bg-gray-50 transition-colors"
          >
            <EyeIcon size={13} /> View Details
          </button>
          <button
            onClick={() => { setOpen(false); onEdit(item); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-text hover:bg-gray-50 transition-colors"
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
  );

  return (
    <div className="flex justify-center">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <MoreVertIcon />
      </button>
      {typeof document !== "undefined" && createPortal(menu, document.body)}
    </div>
  );
}
