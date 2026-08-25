"use client";

import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { MoreVertIcon, TrashIcon, PlusIcon, UploadIcon, StarIcon } from "@/icons";

function extractUploadedPhotoUrls(response) {
  const urls = [];
  const seen = new Set();

  const visit = (value) => {
    if (!value) return;

    if (typeof value === "string") {
      const normalized = value.trim();
      if (
        normalized &&
        !seen.has(normalized) &&
        (normalized.startsWith("http://") ||
          normalized.startsWith("https://") ||
          normalized.startsWith("/"))
      ) {
        seen.add(normalized);
        urls.push(normalized);
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (typeof value === "object") {
      [
        "photos",
        "images",
        "urls",
        "links",
        "files",
        "items",
        "data",
        "result",
        "url",
        "path",
      ].forEach((key) => visit(value[key]));
    }
  };

  visit(response?.data ?? response);
  return urls;
}

/* ─── Photo upload ───────────────────────────────────────────────────────────── */
export default function PhotoUpload({ photos, onPhotosChange, onUploadFiles, isUploading }) {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const menuRef = useRef(null);
  const thumbInputRef = useRef(null);
  const dropInputRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleFiles = async (files) => {
    const filesArray = Array.from(files ?? []).filter(Boolean);
    if (filesArray.length === 0) return;

    const previewUrls = filesArray.map((file) => URL.createObjectURL(file));
    onPhotosChange((prev) => [...prev, ...previewUrls]);

    try {
      const response = await onUploadFiles(filesArray);
      const uploadedUrls = extractUploadedPhotoUrls(response);

      if (uploadedUrls.length === 0) {
        throw new Error("Upload succeeded, but no image link was returned.");
      }

      onPhotosChange((prev) => {
        const remaining = prev.filter((src) => !previewUrls.includes(src));
        return [...remaining, ...uploadedUrls];
      });
    } catch (error) {
      onPhotosChange((prev) => prev.filter((src) => !previewUrls.includes(src)));
      toast.error(error?.message || "Failed to upload images. Please try again.");
    } finally {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    }
  };

  const deletePhoto = (index) => {
    if (isUploading) return;
    onPhotosChange(photos.filter((_, i) => i !== index));
    setOpenMenuIndex(null);
  };

  const makeCoverImage = (index) => {
    if (isUploading || index === 0) return;
    onPhotosChange((prev) => {
      const next = [...prev];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return next;
    });
    setOpenMenuIndex(null);
  };

  const triggerThumb = () => { if (!isUploading) thumbInputRef.current?.click(); };
  const triggerDrop = () => { if (!isUploading) dropInputRef.current?.click(); };

  return (
    <div className="space-y-3">
      {/* Hidden file inputs */}
      <input ref={thumbInputRef} type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} disabled={isUploading} />
      <input ref={dropInputRef} type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} disabled={isUploading} />

      <div className="flex gap-3 flex-wrap">
        {photos.map((src, i) => (
          <div key={i} className="relative w-32 h-24 sm:w-45 sm:h-44.5 rounded-xl border-2 border-gray-200 bg-gray-100 shrink-0 group">
            <div className="w-full h-full rounded-[10px] overflow-hidden">
              {src.startsWith("blob:") || src.startsWith("http") || src.startsWith("data:") ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={src} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-sky-200 to-blue-300 flex items-center justify-center text-2xl">🪂</div>
              )}
              {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-secondary)] text-white text-[9px] font-bold text-center py-0.5">Cover Image</div>}
            </div>

            {/* Three dots menu button */}
            <div className="absolute top-2 right-2 left-2" ref={openMenuIndex === i ? menuRef : null}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === i ? null : i); }}
                className="w-7 h-7 ml-auto rounded-full bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center transition-colors"
              >
                <MoreVertIcon size={16} />
              </button>

              {/* Dropdown menu */}
              {openMenuIndex === i && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-100 shadow-lg py-1 z-20">
                  {i !== 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => makeCoverImage(i)}
                        disabled={isUploading}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <StarIcon size={14} className="shrink-0" />
                        Make Cover Image
                      </button>
                      <div className="h-px bg-gray-100 mx-1" />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => deletePhoto(i)}
                    disabled={isUploading}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap"
                  >
                    <TrashIcon size={14} className="shrink-0" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {/* Thumbnail + button */}
        <button
          type="button"
          onClick={triggerThumb}
          disabled={isUploading}
          className="flex flex-col items-center justify-center w-32 h-24 sm:w-45 sm:h-44.5 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Drag-drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={triggerDrop}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") triggerDrop(); }}
        onDrop={(e) => { e.preventDefault(); if (!isUploading) handleFiles(e.dataTransfer.files); }}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center w-full py-8 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors select-none"
      >
        <UploadIcon size={28} className="text-gray-400" />
        <p className="text-sm font-bold text-gray-700 mt-2">Upload & Drag Images Here</p>
        <p className="text-xs text-gray-400 mt-0.5">JPEG or PNG files only</p>
        <p className="text-xs text-gray-400">Max size: 5MB</p>
      </div>

      {isUploading && <p className="text-xs font-medium text-[var(--color-primary)]">Uploading images...</p>}
    </div>
  );
}
