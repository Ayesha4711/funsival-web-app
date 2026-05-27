"use client";

import React, { useState } from "react";
import { SelectField, AutoSaveNotice, SectionHeader } from "./SettingsPrimitives";

const CURRENCIES = [
  { value: "usd", label: "USD" },
  { value: "eur", label: "EUR" },
  { value: "gbp", label: "GBP" },
  { value: "pkr", label: "PKR" },
];

const TIMEZONES = [
  { value: "est", label: "EST" },
  { value: "pst", label: "PST" },
  { value: "utc", label: "UTC" },
  { value: "pk",  label: "PKT" },
];

export default function PreferencesTab() {
  const [currency, setCurrency] = useState("usd");
  const [tz, setTz] = useState("est");

  return (
    <div className="space-y-6 2xl:min-h-[calc(100vh-400px)]">
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-6 2xl:min-h-[600px]">
        <SectionHeader emoji="🌍" title="Preferences" subtitle="Customize your experience" />
        <SelectField label="Currency" value={currency} onChange={setCurrency} options={CURRENCIES} />
        <SelectField label="Time zone" value={tz} onChange={setTz} options={TIMEZONES} />
      </div>
      <AutoSaveNotice />
    </div>
  );
}
