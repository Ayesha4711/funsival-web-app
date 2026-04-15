"use client";

import React, { useState } from "react";

// ─── Icons ─────────────────────────────────────────────────────────────────────

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const SlidersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
    <circle cx="8" cy="6" r="2" fill="white" /><circle cx="16" cy="12" r="2" fill="white" /><circle cx="8" cy="18" r="2" fill="white" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const FileTextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const CreditCardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Shared UI ──────────────────────────────────────────────────────────────────

const AutoSaveNotice = () => (
  <div className="flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-6 text-sm text-teal-700">
    <span className="mt-0.5">ℹ️</span>
    <span>Your settings are automatically saved. Changes will take effect immediately.</span>
  </div>
);

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-[var(--color-primary)]" : "bg-gray-300"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function Select({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) || options[0];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] bg-white hover:border-gray-300 transition-colors"
      >
        <span>{selected.label}</span>
        <ChevronDownIcon />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-52 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${opt.value === value ? "text-[var(--color-primary)] font-medium" : "text-[var(--color-text)]"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notifications Tab ──────────────────────────────────────────────────────────

const notifItems = [
  { key: "booking",    label: "Booking Updates",    desc: "Receive updates about your booking status" },
  { key: "messages",   label: "Messages",            desc: "Get notified when you receive new messages" },
  { key: "reminders",  label: "Reminders",           desc: "Event reminders and upcoming booking alerts" },
  { key: "promotions", label: "Promotions & Offers", desc: "Deals, discounts and special promotions" },
];

function NotificationsTab() {
  const [state, setState] = useState({ booking: true, messages: true, reminders: false, promotions: true });
  return (
    <div>
      <AutoSaveNotice />
      <div className="space-y-4">
        {notifItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
            <Toggle checked={state[item.key]} onChange={(v) => setState((s) => ({ ...s, [item.key]: v }))} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Preferences Tab ────────────────────────────────────────────────────────────

const languages = [
  { value: "en", label: "English" }, { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },  { value: "de", label: "German" },
  { value: "it", label: "Italian" }, { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" }, { value: "ja", label: "Japanese" },
];
const currencies = [
  { value: "usd", label: "USD — US Dollar" }, { value: "eur", label: "EUR — Euro" },
  { value: "gbp", label: "GBP — British Pound" }, { value: "pkr", label: "PKR — Pakistani Rupee" },
];
const timezones = [
  { value: "utc", label: "UTC+00:00 — London" }, { value: "est", label: "UTC-05:00 — Eastern Time" },
  { value: "pst", label: "UTC-08:00 — Pacific Time" }, { value: "pk", label: "UTC+05:00 — Pakistan" },
  { value: "ist", label: "UTC+05:30 — India" },
];

function PreferencesTab() {
  const [lang, setLang] = useState("en");
  const [currency, setCurrency] = useState("usd");
  const [tz, setTz] = useState("utc");
  return (
    <div>
      <AutoSaveNotice />
      <div className="space-y-5">
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-3">Language</p>
          <Select value={lang} onChange={setLang} options={languages} />
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-3">Currency</p>
          <Select value={currency} onChange={setCurrency} options={currencies} />
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-3">Time Zone</p>
          <Select value={tz} onChange={setTz} options={timezones} />
        </div>
      </div>
    </div>
  );
}

// ─── Security Tab ───────────────────────────────────────────────────────────────

function SecurityTab() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState("email");
  return (
    <div>
      <AutoSaveNotice />
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">Two-Factor Authentication</p>
            <p className="text-xs text-gray-400 mt-0.5">Add an extra layer of security to your account</p>
          </div>
          <Toggle checked={twoFactor} onChange={setTwoFactor} />
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-4">Verification Method</p>
          <div className="space-y-3">
            {[
              { value: "email", label: "Email Verification", desc: "Receive a code to your registered email" },
              { value: "sms",   label: "SMS Verification",   desc: "Receive a code via text message" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setVerifyMethod(opt.value)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${verifyMethod === opt.value ? "border-[var(--color-primary)]" : "border-gray-300"}`}
                >
                  {verifyMethod === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Legal Tab ──────────────────────────────────────────────────────────────────

function LegalTab() {
  return (
    <div>
      <AutoSaveNotice />
      <div className="space-y-3">
        {[
          { label: "Terms of Service", desc: "Read our terms and conditions" },
          { label: "Privacy Policy",   desc: "How we collect and use your data" },
        ].map((item) => (
          <button
            key={item.label}
            className="flex items-center justify-between w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
            <span className="text-gray-400"><ChevronRightIcon /></span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Profile Tab ────────────────────────────────────────────────────────────────
// role="provider" shows Provider Information section; role="user" hides it.

function ProfileTab({ role }) {
  return (
    <div>
      <AutoSaveNotice />
      <div className="space-y-5">
        {/* Avatar */}
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-6 flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white text-2xl font-bold">
              {role === "provider" ? "P" : "U"}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white border-2 border-white">
              <CameraIcon />
            </button>
          </div>
          <button className="text-sm text-[var(--color-primary)] font-medium hover:underline">Change Picture</button>
        </div>

        {/* Personal Information */}
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5">
          <p className="text-sm font-bold text-[var(--color-text)] mb-4">Personal Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "First Name",     placeholder: "John" },
              { label: "Last Name",      placeholder: "Doe" },
              { label: "Email Address",  placeholder: "john@example.com" },
              { label: "Phone Number",   placeholder: "+1 234 567 8901" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{f.label}</label>
                <input
                  type="text"
                  placeholder={f.placeholder}
                  defaultValue=""
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5">
          <p className="text-sm font-bold text-[var(--color-text)] mb-4">Location Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "City",    placeholder: "New York" },
              { label: "Country", placeholder: "United States" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{f.label}</label>
                <input
                  type="text"
                  placeholder={f.placeholder}
                  defaultValue=""
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Provider Information — provider only */}
        {role === "provider" && (
          <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5">
            <p className="text-sm font-bold text-[var(--color-text)] mb-4">Provider Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Agency Name",   placeholder: "Funsival Agency" },
                { label: "Business Type", placeholder: "Event Management" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    defaultValue=""
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Changes */}
        <button className="w-full bg-[var(--color-primary)] hover:opacity-90 text-white font-semibold text-sm py-3 rounded-xl transition-opacity">
          Save Changes
        </button>

        {/* Account Settings */}
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-5">
          <p className="text-sm font-bold text-[var(--color-text)] mb-4">Account Settings</p>
          <div className="space-y-3">
            <button className="flex items-center justify-between w-full text-left hover:bg-gray-50 rounded-xl px-3 py-2.5 transition-colors">
              <span className="text-sm text-[var(--color-text)]">Change Password</span>
              <ChevronRightIcon />
            </button>
            <button className="flex items-center justify-between w-full text-left hover:bg-red-50 rounded-xl px-3 py-2.5 transition-colors">
              <span className="text-sm text-red-500">Delete Account</span>
              <span className="text-red-400"><ChevronRightIcon /></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Method Tab ─────────────────────────────────────────────────────────

const mockBankAccounts = [
  { id: 1, name: "Chase Bank",        number: "**** **** **** 4523", type: "Checking", isDefault: true  },
  { id: 2, name: "Bank of America",   number: "**** **** **** 7891", type: "Savings",  isDefault: false },
];

function PaymentMethodTab() {
  const [accounts, setAccounts] = useState(mockBankAccounts);
  const [showModal, setShowModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", number: "", type: "Checking" });

  const setDefault    = (id) => setAccounts((a) => a.map((acc) => ({ ...acc, isDefault: acc.id === id })));
  const deleteAccount = (id) => setAccounts((a) => a.filter((acc) => acc.id !== id));
  const addAccount    = () => {
    if (!newAccount.name || !newAccount.number) return;
    setAccounts((a) => [...a, { id: Date.now(), ...newAccount, isDefault: false }]);
    setNewAccount({ name: "", number: "", type: "Checking" });
    setShowModal(false);
  };

  return (
    <div>
      <AutoSaveNotice />
      <div className="space-y-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                <CreditCardIcon />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{acc.name}</p>
                  {acc.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full">Default</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{acc.number} · {acc.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!acc.isDefault && (
                <button onClick={() => setDefault(acc.id)} className="text-xs text-[var(--color-primary)] border border-[var(--color-primary)] rounded-lg px-2.5 py-1 hover:bg-[var(--color-primary)]/5 transition-colors">
                  Set Default
                </button>
              )}
              <button className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 rounded-lg transition-colors"><EditIcon /></button>
              <button onClick={() => deleteAccount(acc.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon /></button>
            </div>
          </div>
        ))}

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-2xl py-4 text-sm font-medium text-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        >
          <PlusIcon /> Add Payment Method
        </button>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 text-sm text-teal-700">
          <p className="font-semibold mb-1">Payout Information</p>
          <p className="text-xs">Payouts are processed every 7 days. Your earnings will be transferred to the default account automatically.</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[var(--color-text)]">Add Payment Method</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><XIcon /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: "name",   label: "Bank Name",       placeholder: "e.g. Chase Bank",        type: "text" },
                { key: "number", label: "Account Number",  placeholder: "**** **** **** 0000",     type: "text" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={newAccount[f.key]}
                    onChange={(e) => setNewAccount((a) => ({ ...a, [f.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Account Type</label>
                <select
                  value={newAccount.type}
                  onChange={(e) => setNewAccount((a) => ({ ...a, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                >
                  <option>Checking</option>
                  <option>Savings</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={addAccount} className="flex-1 bg-[var(--color-primary)] text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity">Add Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tabs config ────────────────────────────────────────────────────────────────

const TABS = [
  { key: "notifications", label: "Notifications",   icon: BellIcon,       Panel: NotificationsTab },
  { key: "preferences",   label: "Preferences",     icon: SlidersIcon,    Panel: PreferencesTab   },
  { key: "security",      label: "Security",         icon: ShieldIcon,     Panel: SecurityTab      },
  { key: "legal",         label: "Legal & Account",  icon: FileTextIcon,   Panel: LegalTab         },
  { key: "profile",       label: "Profile",          icon: UserIcon,       Panel: ProfileTab       },
  { key: "payment",       label: "Payment Method",   icon: CreditCardIcon, Panel: PaymentMethodTab },
];

// ─── Main ───────────────────────────────────────────────────────────────────────

/**
 * Shared settings page used by both provider dashboard and user dashboard.
 *
 * Props:
 *  - role  {"provider" | "user"}  controls role-specific fields (e.g. Provider Information).
 *                                  Defaults to "provider" for backwards-compatibility.
 */
export default function SettingsPage({ role = "provider" }) {
  const [activeTab, setActiveTab] = useState("notifications");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const active = TABS.find((t) => t.key === activeTab);
  const { Panel } = active ?? TABS[0];

  return (
    <div className="flex-1 bg-[var(--color-bg)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl font-bold text-[var(--color-text)] mb-6">Settings</h1>

        <div className="flex gap-6 items-start">
          {/* Desktop sidebar */}
          <aside className="hidden md:flex flex-col w-52 lg:w-60 shrink-0 bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors text-left ${
                    isActive ? "bg-[var(--color-primary)] text-white" : "text-gray-500 hover:bg-gray-50 hover:text-[var(--color-text)]"
                  }`}
                >
                  <Icon />
                  {tab.label}
                </button>
              );
            })}
          </aside>

          {/* Mobile tab selector */}
          <div className="md:hidden w-full mb-2">
            <button
              onClick={() => setMobileNavOpen((o) => !o)}
              className="flex items-center justify-between w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--color-text)]"
            >
              <span className="flex items-center gap-2">
                {active && <active.icon />}
                {active?.label}
              </span>
              <ChevronDownIcon />
            </button>
            {mobileNavOpen && (
              <div className="mt-1 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg z-10 relative">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => { setActiveTab(tab.key); setMobileNavOpen(false); }}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors text-left ${
                        isActive ? "text-[var(--color-primary)] bg-[var(--color-primary)]/5" : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <Icon />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Content panel — desktop */}
          <div className="flex-1 min-w-0 hidden md:block">
            <Panel role={role} />
          </div>
        </div>

        {/* Content panel — mobile */}
        <div className="md:hidden mt-4">
          <Panel role={role} />
        </div>
      </div>
    </div>
  );
}
