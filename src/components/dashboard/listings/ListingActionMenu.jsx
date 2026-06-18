"use client";

import React, { useCallback } from "react";
import { createPortal } from "react-dom";
import { MoreVertIcon, EditIcon, TrashIcon, PlayIcon, EyeIcon } from "@/icons";
import useDropdownPosition from "@/hooks/useDropdownPosition";

const MENU_WIDTH = 144;

export default function ListingActionMenu({ item, onEdit, onDelete, onResumeDraft, onViewDetails }) {
  const isDraft = item.status === "Draft";
  const getHeight = useCallback(() => (isDraft ? 88 : 120), [isDraft]);
  const { open, toggle, close, pos, btnRef, menuRef } = useDropdownPosition({
    width: MENU_WIDTH,
    getHeight,
    align: "right",
  });

  const menu = open && (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top:      pos.top,
        left:     pos.left,
        zIndex:   9999,
        minWidth: MENU_WIDTH,
      }}
      className="bg-white border border-gray-100 rounded-2xl py-1.5 shadow-lg"
    >
      {isDraft ? (
        <>
          <button
            onClick={() => { close(); onResumeDraft(item); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary-light transition-colors"
          >
            <PlayIcon size={13} /> Resume Draft
          </button>
          <button
            onClick={() => { close(); onDelete(item); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <TrashIcon size={13} /> Discard Draft
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => { close(); onViewDetails?.(item); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-text hover:bg-gray-50 transition-colors"
          >
            <EyeIcon size={13} /> View Details
          </button>
          <button
            onClick={() => { close(); onEdit(item); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-text hover:bg-gray-50 transition-colors"
          >
            <EditIcon size={13} /> Edit
          </button>
          <button
            onClick={() => { close(); onDelete(item); }}
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
        onClick={toggle}
        className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <MoreVertIcon />
      </button>
      {typeof document !== "undefined" && createPortal(menu, document.body)}
    </div>
  );
}
