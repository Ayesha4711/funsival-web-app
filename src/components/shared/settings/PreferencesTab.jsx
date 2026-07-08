"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckIcon, SearchIcon } from "@/icons";
import {
  AutoSaveNotice,
  DropdownField,
  SectionHeader,
} from "./SettingsPrimitives";
import {
  CURRENCY_OPTIONS,
  TIMEZONE_OPTIONS,
  formatClockForTimeZone,
} from "./preferenceOptions";

function getSelectedCurrency(value) {
  return CURRENCY_OPTIONS.find((option) => option.code === value) || CURRENCY_OPTIONS[0];
}

function getSelectedTimeZone(value) {
  for (const section of TIMEZONE_OPTIONS) {
    const match = section.options.find((option) => option.timeZone === value);
    if (match) return { ...match, region: section.region };
  }
  const first = TIMEZONE_OPTIONS[0]?.options[0];
  return first ? { ...first, region: TIMEZONE_OPTIONS[0].region } : null;
}

function groupCurrencies(query) {
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? CURRENCY_OPTIONS.filter((option) => option.searchText.includes(normalized))
    : CURRENCY_OPTIONS;

  return filtered
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .reduce((groups, option) => {
      const key = option.name[0].toUpperCase();
      const group = groups.find((entry) => entry.key === key);
      if (group) {
        group.items.push(option);
      } else {
        groups.push({ key, items: [option] });
      }
      return groups;
    }, []);
}

function groupTimezones(query) {
  const normalized = query.trim().toLowerCase();
  return TIMEZONE_OPTIONS.map((section) => ({
    region: section.region,
    items: section.options.filter((option) => {
      if (!normalized) return true;
      return option.searchText.includes(normalized);
    }),
  })).filter((section) => section.items.length > 0);
}

export default function PreferencesTab() {
  const [currency, setCurrency] = useState("USD");
  const [tz, setTz] = useState("America/Los_Angeles");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currencyQuery, setCurrencyQuery] = useState("");
  const [timezoneQuery, setTimezoneQuery] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const selectedCurrency = useMemo(() => getSelectedCurrency(currency), [currency]);
  const selectedTimezone = useMemo(() => getSelectedTimeZone(tz), [tz]);
  const currencyGroups = useMemo(() => groupCurrencies(currencyQuery), [currencyQuery]);
  const timezoneGroups = useMemo(() => groupTimezones(timezoneQuery), [timezoneQuery]);

  const closeCurrency = () => {
    setOpenDropdown((current) => (current === "currency" ? null : current));
    setCurrencyQuery("");
  };

  const closeTimezone = () => {
    setOpenDropdown((current) => (current === "timezone" ? null : current));
    setTimezoneQuery("");
  };

  return (
    <div className="space-y-6 2xl:min-h-[calc(100vh-400px)]">
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-6 2xl:min-h-[600px]">
        <SectionHeader emoji="🌍" title="Preferences" subtitle="Customize your experience" />

        <DropdownField
          label="Currency"
          open={openDropdown === "currency"}
          onToggle={() => {
            setOpenDropdown((current) => (current === "currency" ? null : "currency"));
            setCurrencyQuery("");
            setTimezoneQuery("");
          }}
          onClose={closeCurrency}
          menuClassName="max-h-[40vh]"
          trigger={(
            <div className="flex items-center gap-3">
              <span className="text-2xl leading-none">{selectedCurrency.flag}</span>
              <span className="min-w-0 text-[15px] font-semibold text-text sm:text-[16px]">
                {selectedCurrency.name} <span className="text-gray-400">({selectedCurrency.code})</span>
              </span>
            </div>
          )}
        >
          <div className="border-b border-gray-100 p-2.5">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
              <SearchIcon size={16} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                value={currencyQuery}
                onChange={(event) => setCurrencyQuery(event.target.value)}
                placeholder="Search currencies"
                className="w-full bg-transparent text-sm text-text placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-[44vh] overflow-y-auto px-3 py-2.5">
            {currencyGroups.length > 0 ? (
              currencyGroups.map((group) => (
                <div key={group.key} className="mb-3 last:mb-0">
                  <div className="mb-2 px-1 text-xs font-bold uppercase tracking-[0.28em] text-gray-400">
                    {group.key}
                  </div>
                  <div className="space-y-1.5">
                    {group.items.map((option) => {
                      const isSelected = option.code === selectedCurrency.code;
                      return (
                        <button
                          key={option.code}
                          type="button"
                          onClick={() => {
                            setCurrency(option.code);
                            setOpenDropdown(null);
                            setCurrencyQuery("");
                          }}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-2.5 text-left transition-colors ${
                            isSelected
                              ? "border-primary/20 bg-primary/10 text-primary"
                              : "border-transparent hover:border-gray-200 hover:bg-gray-50 text-text"
                          }`}
                        >
                          <span className="text-2xl leading-none">{option.flag}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">
                              {option.name}
                            </span>
                            <span className="block text-xs text-gray-400">{option.code}</span>
                          </span>
                          {isSelected && <CheckIcon size={16} className="text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="px-2 py-6 text-sm text-gray-400">No currencies found.</p>
            )}
          </div>
        </DropdownField>

        <DropdownField
          label="Time zone"
          open={openDropdown === "timezone"}
          onToggle={() => {
            setOpenDropdown((current) => (current === "timezone" ? null : "timezone"));
            setCurrencyQuery("");
            setTimezoneQuery("");
          }}
          onClose={closeTimezone}
          menuClassName="max-h-[40vh]"
          trigger={(
            <div className="flex items-center gap-3">
              <span className="min-w-0 text-[15px] font-semibold text-text sm:text-[16px]">
                {selectedTimezone?.label || "Select time zone"}
              </span>
              {selectedTimezone && (
                <span className="ml-auto shrink-0 text-sm font-medium text-gray-400">
                  {formatClockForTimeZone(selectedTimezone.timeZone, now)}
                </span>
              )}
            </div>
          )}
        >
          <div className="border-b border-gray-100 p-2.5">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
              <SearchIcon size={16} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                value={timezoneQuery}
                onChange={(event) => setTimezoneQuery(event.target.value)}
                placeholder="Search time zones"
                className="w-full bg-transparent text-sm text-text placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-[44vh] overflow-y-auto px-4 py-2.5">
            {timezoneGroups.length > 0 ? (
              timezoneGroups.map((section) => (
                <div key={section.region} className="mb-4 last:mb-0">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-gray-400">
                    {section.region}
                  </h3>
                  <div className="space-y-1.5">
                    {section.items.map((option) => {
                      const isSelected = option.timeZone === selectedTimezone?.timeZone;
                      return (
                        <button
                          key={option.timeZone}
                          type="button"
                          onClick={() => {
                            setTz(option.timeZone);
                            setOpenDropdown(null);
                            setTimezoneQuery("");
                          }}
                          className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-2.5 text-left transition-colors ${
                            isSelected
                              ? "border-primary/20 bg-primary/10 text-primary"
                              : "border-transparent hover:border-gray-200 hover:bg-gray-50 text-text"
                          }`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">
                              {option.label}
                            </span>
                            <span className="block text-xs text-gray-400">{option.timeZone}</span>
                          </span>
                          <span className="shrink-0 text-sm font-medium text-gray-500">
                            {formatClockForTimeZone(option.timeZone, now)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="px-2 py-6 text-sm text-gray-400">No time zones found.</p>
            )}
          </div>
        </DropdownField>
      </div>
      <AutoSaveNotice />
    </div>
  );
}
