"use client";

import React from "react";
import { FileTextIcon, LockIcon, ChevronRightIcon } from "@/icons";
import { AutoSaveNotice, SectionHeader } from "./SettingsPrimitives";

const LEGAL_ITEMS = [
  { label: "Terms of Service", desc: "Read our terms and conditions",  Icon: FileTextIcon, bg: "bg-blue-50", iconColor: "text-blue-500" },
  { label: "Privacy Policy",   desc: "Learn how we protect your data", Icon: LockIcon,     bg: "bg-blue-50", iconColor: "text-blue-500" },
];

export default function LegalTab() {
  return (
    <div className="space-y-6 2xl:min-h-[calc(100vh-400px)]">
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-6 2xl:min-h-[600px]">
        <SectionHeader emoji="📜" title="Legal & Account" subtitle="Legal documents and account options" />
        <div className="space-y-3">
          {LEGAL_ITEMS.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-5 py-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center shrink-0 ${item.iconColor}`}>
                <item.Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <span className="text-gray-400 shrink-0"><ChevronRightIcon /></span>
            </button>
          ))}
        </div>
      </div>
      <AutoSaveNotice />
    </div>
  );
}
