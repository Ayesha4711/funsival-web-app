"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SpinnerIcon, ArrowLeftIcon } from "@/icons";
import WizardNavbar from "./WizardNavbar";

/* ─── Back sub-header (white bar below navbar, matches other dashboard screens) */
export function BackSubHeader({ label = "Add New Listing", router }) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3 shrink-0">
      <button
        type="button"
        onClick={() => router.push("/dashboard/listings")}
        className="text-[#212121] hover:opacity-70 transition-opacity shrink-0"
      >
        <ArrowLeftIcon size={22} />
      </button>
      <div>
        <h1 className="text-lg font-bold text-gray-900 leading-tight">{label}</h1>
        <p className="text-xs text-gray-400">Stripe account setup required</p>
      </div>
    </div>
  );
}

/* ─── Country autocomplete ──────────────────────────────────────────────────── */
function CountryAutocomplete({ value, onChange, disabled, countries }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  const selected = countries.find((c) => c.code === value);
  const filtered = query.trim()
    ? countries.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : countries;

  // Close on outside click
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSelect = (code) => {
    onChange(code);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <div
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-white transition-colors ${open ? "border-[#4AA7A7] ring-1 ring-[#4AA7A7]/30" : "border-gray-200"} ${disabled ? "opacity-60 pointer-events-none" : "cursor-text"}`}
        onClick={() => { if (!disabled) setOpen(true); }}
      >
        <svg className="text-gray-400 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={open ? query : (selected?.name ?? "")}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search country…"
          className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent min-w-0"
        />
        {selected && !open && (
          <span className="text-xs font-semibold text-gray-400 shrink-0 bg-gray-100 px-1.5 py-0.5 rounded">
            {selected.code}
          </span>
        )}
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-52 overflow-y-auto py-1" style={{ scrollbarWidth: "thin" }}>
          {filtered.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => handleSelect(c.code)}
                className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#EDF6F6] transition-colors ${c.code === value ? "bg-[#EDF6F6] font-semibold text-[#228E8A]" : "text-gray-700"}`}
              >
                <span className="w-8 shrink-0 text-xs font-bold text-gray-400">{c.code}</span>
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && filtered.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 px-4 py-3 text-sm text-gray-400">
          No countries match &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}

/* Stripe-supported Connect countries */
export const STRIPE_COUNTRIES = [
  { code: "AU", name: "Australia" }, { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },   { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },    { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },    { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },   { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },   { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },   { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },    { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },   { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" }, { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },    { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },     { code: "KE", name: "Kenya" },
  { code: "LV", name: "Latvia" },    { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },{ code: "MY", name: "Malaysia" },
  { code: "MT", name: "Malta" },     { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },{ code: "NZ", name: "New Zealand" },
  { code: "NG", name: "Nigeria" },   { code: "NO", name: "Norway" },
  { code: "PL", name: "Poland" },    { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },   { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },  { code: "SI", name: "Slovenia" },
  { code: "ZA", name: "South Africa" },{ code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },    { code: "CH", name: "Switzerland" },
  { code: "TH", name: "Thailand" },  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },{ code: "US", name: "United States" },
];

/* ─── Stripe gate screen ────────────────────────────────────────────────────── */
export default function StripeGateScreen({ isIncomplete, stripeCountry, setStripeCountry, onboardLoading, onSubmit, connectStatus }) {
  const router = useRouter();

  const requirements = connectStatus?.requirements ?? {};
  const disabledReason = connectStatus?.disabledReason ?? null;
  const hasAccount     = connectStatus?.hasAccount ?? false;
  const detailsSubmitted = connectStatus?.detailsSubmitted ?? false;

  // Status chips
  const chips = [
    { label: "Account",          ok: hasAccount,        okText: "Created",    failText: "Not created" },
    { label: "Details submitted", ok: detailsSubmitted,  okText: "Yes",        failText: "Incomplete" },
    { label: "Charges enabled",  ok: connectStatus?.chargesEnabled,  okText: "Enabled",  failText: "Disabled" },
    { label: "Payouts enabled",  ok: connectStatus?.payoutsEnabled,  okText: "Enabled",  failText: "Disabled" },
  ];

  return (
    <div className="flex flex-col bg-[#F3F4F6] min-h-full">
      {/* Full wizard navbar (same as the rest of the wizard) */}
      <WizardNavbar />

      {/* White sub-header with back arrow — matches other dashboard screens */}
      <BackSubHeader label="Add New Listing" router={router} />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-lg mx-auto flex flex-col gap-5">

          {/* Main card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5">
            {/* Icon + heading */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isIncomplete ? "Complete your Stripe onboarding" : "Connect your Stripe account"}
                </h2>
                <p className="text-sm text-gray-400 mt-1 leading-relaxed max-w-sm">
                  {isIncomplete
                    ? "Your Stripe account needs additional verification before you can create listings and receive payments."
                    : "Connect a Stripe account to create listings and accept payments from guests."}
                </p>
              </div>
            </div>

            {/* Status chips — shown when account exists */}
            {hasAccount && (
              <div className="grid grid-cols-2 gap-2">
                {chips.map(({ label, ok, okText, failText }) => (
                  <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${ok ? "bg-green-500" : "bg-red-400"}`}>
                      {ok
                        ? <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        : <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      }
                    </span>
                    <span className="truncate">{label}: <span className="font-bold">{ok ? okText : failText}</span></span>
                  </div>
                ))}
              </div>
            )}

            {/* Disabled reason */}
            {disabledReason && (
              <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
                <span className="font-bold">Reason: </span>{disabledReason.replace(/_/g, " ")}
              </div>
            )}


            {/* Country picker — first-time only */}
            {!isIncomplete && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">
                  Your country <span className="text-red-400">*</span>
                </label>
                <CountryAutocomplete
                  value={stripeCountry}
                  onChange={setStripeCountry}
                  disabled={onboardLoading}
                  countries={STRIPE_COUNTRIES}
                />
                <p className="text-[11px] text-gray-400">This cannot be changed later.</p>
              </div>
            )}

            {/* CTA button */}
            <button
              onClick={onSubmit}
              disabled={onboardLoading || (!isIncomplete && !stripeCountry)}
              className="w-full py-3.5 rounded-full bg-[#4AA7A7] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {onboardLoading && <SpinnerIcon size={14} className="text-white" />}
              {onboardLoading ? "Starting…" : isIncomplete ? "Continue Stripe Setup" : "Go to Stripe Setup"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
