"use client";

import React from "react";

/* ─── Shared field components ───────────────────────────────────────────────── */
export function Label({ children, required }) {
  return (
    <label className="block text-xs font-bold text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

export function TextInput({ error, className, ...props }) {
  return (
    <input
      className={[
        "w-full px-3 py-2.5 rounded-xl border bg-[#F5F5F5] text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-colors",
        error
          ? "border-red-400 focus:ring-red-200 focus:border-red-500"
          : "border-transparent focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]",
        className
      ].join(" ")}
      {...props}
    />
  );
}

export function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>;
}

export const DESCRIPTION_MAX = 500;

export function Textarea({ error, rows = 3, maxLength, onChange, value, ...props }) {
  const count = typeof value === "string" ? value.length : 0;
  const limit = maxLength ?? null;
  const over = limit !== null && count > limit;

  const handleChange = (e) => {
    if (limit !== null && e.target.value.length > limit) return;
    onChange?.(e);
  };

  return (
    <div className="relative">
      <textarea
        rows={rows}
        value={value}
        onChange={handleChange}
        className={[
          "w-full px-3 py-2.5 rounded-xl border bg-[#F5F5F5] text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:bg-white resize-none transition-colors",
          error || over
            ? "border-red-400 focus:ring-red-200 focus:border-red-500"
            : "border-transparent focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
        ].join(" ")}
        {...props}
      />
      {limit !== null && (
        <span className={`absolute bottom-2 right-3 text-[11px] font-medium pointer-events-none ${over ? "text-red-400" : count >= limit * 0.9 ? "text-amber-500" : "text-gray-400"}`}>
          {count}/{limit}
        </span>
      )}
    </div>
  );
}

export function SectionTitle({ num, children }) {
  return (
    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-1">
      <span className="text-gray-900 text-base font-bold shrink-0">
        {num}.
      </span>
      {children}
    </h3>
  );
}
