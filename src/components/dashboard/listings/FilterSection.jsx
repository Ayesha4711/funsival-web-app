"use client";

import React, { useState } from "react";
import { ChevronDownIcon } from "@/icons";

/** Collapsible labelled section used inside FilterDrawer. */
export default function FilterSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-sm font-bold text-gray-800"
      >
        {title}
        <ChevronDownIcon
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}
