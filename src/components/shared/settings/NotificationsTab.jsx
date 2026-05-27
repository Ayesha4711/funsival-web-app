"use client";

import React, { useState } from "react";
import { Toggle, AutoSaveNotice, SectionHeader } from "./SettingsPrimitives";

const NOTIF_ITEMS = [
  { key: "booking",    label: "Booking updates" },
  { key: "messages",   label: "Messages" },
  { key: "reminders",  label: "Reminders" },
  { key: "promotions", label: "Promotions" },
];

export default function NotificationsTab() {
  const [state, setState] = useState({
    booking: true, messages: true, reminders: false, promotions: false,
  });

  return (
    <div className="space-y-6 2xl:min-h-[calc(100vh-400px)]">
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-6 2xl:min-h-[600px]">
        <SectionHeader emoji="🔔" title="Notifications" subtitle="Manage your notification preferences" />
        <div className="divide-y divide-gray-100">
          {NOTIF_ITEMS.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <span className="text-sm text-text">{item.label}</span>
              <Toggle checked={state[item.key]} onChange={(v) => setState((s) => ({ ...s, [item.key]: v }))} />
            </div>
          ))}
        </div>
      </div>
      <AutoSaveNotice />
    </div>
  );
}
