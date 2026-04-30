"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import AppFooter from "@/components/shared/AppFooter";
import { changePassword, enable2FA, disable2FA } from "@/store/slices/authSlice";
import { selectUser, fetchProfile, setProfile, updateProviderProfile } from "@/store/slices/profileSlice";

// ─── SVG Icons ──────────────────────────────────────────────────────────────────

const BellIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const GlobeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const ShieldIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const FileTextIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const UserIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const CreditCardIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const CameraIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);
const LockIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="var(--color-primary)"/>
    <line x1="12" y1="16" x2="12" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="8" x2="12.01" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const ShieldLockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <rect x="9" y="11" width="6" height="5" rx="1"/>
    <path d="M12 11V9a2 2 0 0 0-2-2"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

// ─── Shared ──────────────────────────────────────────────────────────────────────

function AutoSaveNotice() {
  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-600">
      <span className="shrink-0 text-[var(--color-primary)]"><InfoIcon /></span>
      <span>Your settings are automatically saved. Changes will take effect immediately.</span>
    </div>
  );
}

function SectionHeader({ emoji, title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
        <span>{emoji}</span>{title}
      </h2>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ${checked ? "bg-[var(--color-primary)]" : "bg-gray-200"}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

// Language-aware SelectField with teal-highlighted selected option
function SelectField({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) || options[0];
  return (
    <div className="mb-5">
      <label className="block text-xs font-semibold text-gray-500 mb-2">{label}</label>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center justify-between w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[var(--color-text)] bg-white hover:border-gray-300 transition-colors"
        >
          <span>{selected.label}</span>
          <ChevronDownIcon />
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl z-20 max-h-52 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`flex items-center justify-between w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    isSelected
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold"
                      : "hover:bg-gray-50 text-[var(--color-text)]"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({ label, placeholder, defaultValue = "", type = "text", icon }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors"
      />
    </div>
  );
}

// ─── Modal overlay ────────────────────────────────────────────────────────────────

function ModalOverlay({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}

// ─── Add Payment Method Modal ─────────────────────────────────────────────────────

function AddPaymentModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    holderName: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountType: "",
    setDefault: false,
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const handleAdd = () => {
    if (!form.holderName || !form.bankName || !form.accountNumber) return;
    onAdd(form);
    onClose();
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-primary)]"><CreditCardIcon size={20} /></span>
            <h3 className="text-base font-bold text-[var(--color-text)]">Add Payment Method</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><XIcon /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Account Holder Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Account Holder Name</label>
            <input
              placeholder="Enter account holder name"
              value={form.holderName}
              onChange={set("holderName")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors placeholder-gray-400"
            />
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Bank Name</label>
            <input
              placeholder="e.g. Chase Bank"
              value={form.bankName}
              onChange={set("bankName")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors placeholder-gray-400"
            />
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Account Number</label>
            <input
              placeholder="Enter account number"
              value={form.accountNumber}
              onChange={set("accountNumber")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors placeholder-gray-400"
            />
          </div>

          {/* Routing Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Routing Number</label>
            <input
              placeholder="Enter routing number"
              value={form.routingNumber}
              onChange={set("routingNumber")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors placeholder-gray-400"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Account Type</label>
            <input
              placeholder="e.g. Checking, Savings"
              value={form.accountType}
              onChange={set("accountType")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors placeholder-gray-400"
            />
          </div>

          {/* Set as default */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.setDefault}
              onChange={(e) => setForm((f) => ({ ...f, setDefault: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 accent-[var(--color-primary)]"
            />
            <span className="text-sm text-[var(--color-text)] font-medium">Set as default payment method</span>
          </label>

          {/* Security notice */}
          <div className="flex items-start gap-3 bg-[var(--color-primary)]/8 border border-[var(--color-primary)]/20 rounded-xl px-4 py-3">
            <span className="text-[var(--color-primary)] shrink-0 mt-0.5"><ShieldLockIcon /></span>
            <p className="text-xs text-[var(--color-primary)] leading-relaxed">
              Your banking information is encrypted and securely stored. We never share your financial details with third parties.
            </p>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-sm font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-[var(--color-text)]"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 bg-[var(--color-primary)] text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <PlusIcon /> Add Payment Method
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────────

function ChangePasswordModal({ onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleShow = (k) => setShow((s) => ({ ...s, [k]: !s[k] }));
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError(""); };

  const handleSubmit = async () => {
    if (!form.current || !form.newPwd || !form.confirm) {
      setError("All fields are required.");
      return;
    }
    if (form.newPwd !== form.confirm) {
      setError("New passwords do not match.");
      return;
    }
    if (form.newPwd.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await dispatch(changePassword({
      currentPassword: form.current,
      newPassword: form.newPwd,
      confirmNewPassword: form.confirm,
    }));
    setLoading(false);
    if (changePassword.fulfilled.match(result)) {
      toast.success("Password updated successfully.");
      onClose();
    } else {
      setError(result.payload || "Failed to update password.");
    }
  };

  const fields = [
    { key: "current", label: "Current Password",    placeholder: "Enter current password" },
    { key: "newPwd",  label: "New Password",         placeholder: "Enter new password" },
    { key: "confirm", label: "Confirm New Password", placeholder: "Confirm new password" },
  ];

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-primary)]"><LockIcon size={20} /></span>
            <h3 className="text-base font-bold text-[var(--color-text)]">Change Password</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><XIcon /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={show[key] ? "text" : "password"}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={set(key)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-colors placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => toggleShow(key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show[key] ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </div>
          ))}

          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          {/* Password requirements */}
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-gray-600 mb-2">Password requirements:</p>
            <ul className="space-y-1">
              {[
                "At least 8 characters long",
                "Contains uppercase and lowercase letters",
                "Contains at least one number",
                "Contains at least one special character",
              ].map((req) => (
                <li key={req} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-gray-200 text-sm font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-[var(--color-text)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-[var(--color-primary)] text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/>
              </svg>
            )}
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── Delete Account Modal ─────────────────────────────────────────────────────────

function DeleteAccountModal({ onClose }) {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm px-6 py-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <TrashIcon />
        </div>

        <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Are You Sure?</h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-8">
          This action is permanent and cannot be undone. All your data, bookings, listings, and account information will be permanently deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold text-sm py-3 rounded-full hover:bg-[var(--color-primary)]/5 transition-colors"
          >
            Return
          </button>
          <button
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm py-3 rounded-full transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ─── Notifications ───────────────────────────────────────────────────────────────

const notifItems = [
  { key: "booking",    label: "Booking updates" },
  { key: "messages",   label: "Messages" },
  { key: "reminders",  label: "Reminders" },
  { key: "promotions", label: "Promotions" },
];

function NotificationsTab() {
  const [state, setState] = useState({ booking: true, messages: true, reminders: false, promotions: false });
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-6">
        <SectionHeader emoji="🔔" title="Notifications" subtitle="Manage your notification preferences" />
        <div className="divide-y divide-gray-100">
          {notifItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <span className="text-sm text-[var(--color-text)]">{item.label}</span>
              <Toggle checked={state[item.key]} onChange={(v) => setState((s) => ({ ...s, [item.key]: v }))} />
            </div>
          ))}
        </div>
      </div>
      <AutoSaveNotice />
    </div>
  );
}

// ─── Preferences ────────────────────────────────────────────────────────────────

const languages  = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese" },
];
const currencies = [{ value: "usd", label: "USD" }, { value: "eur", label: "EUR" }, { value: "gbp", label: "GBP" }, { value: "pkr", label: "PKR" }];
const timezones  = [{ value: "est", label: "EST" }, { value: "pst", label: "PST" }, { value: "utc", label: "UTC" }, { value: "pk", label: "PKT" }];

function PreferencesTab() {
  const [lang, setLang] = useState("en");
  const [currency, setCurrency] = useState("usd");
  const [tz, setTz] = useState("est");
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-6">
        <SectionHeader emoji="🌍" title="Preferences" subtitle="Customize your experience" />
        <SelectField label="Language" value={lang} onChange={setLang} options={languages} />
        <SelectField label="Currency" value={currency} onChange={setCurrency} options={currencies} />
        <SelectField label="Time zone" value={tz} onChange={setTz} options={timezones} />
      </div>
      <AutoSaveNotice />
    </div>
  );
}

// ─── Security ────────────────────────────────────────────────────────────────────

function SecurityTab() {
  const dispatch = useDispatch();
  const profile = useSelector(selectUser);

  // Read actual 2FA status from profile — covers both possible field names the API may return
  const twoFactor = !!(
    profile?.twoFactorEnabled ??
    profile?.isTwoFactorEnabled ??
    profile?.twoFactor ??
    false
  );

  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState("email");

  // Fetch profile on mount if not yet loaded so we get the real 2FA state
  useEffect(() => {
    if (!profile) dispatch(fetchProfile());
  }, [dispatch, profile]);

  const handle2FAToggle = async (enabled) => {
    setTwoFactorLoading(true);
    const action = enabled ? enable2FA : disable2FA;
    const result = await dispatch(action());
    setTwoFactorLoading(false);
    if (action.fulfilled.match(result)) {
      // Optimistically update the profile in Redux so the toggle reflects correctly
      // without needing a full re-fetch
      const field =
        profile?.twoFactorEnabled  !== undefined ? "twoFactorEnabled"  :
        profile?.isTwoFactorEnabled !== undefined ? "isTwoFactorEnabled" :
        "twoFactorEnabled";
      dispatch(setProfile({ ...profile, [field]: enabled }));
      toast.success(enabled ? "Two-factor authentication enabled." : "Two-factor authentication disabled.");
    } else {
      toast.error(result.payload || `Failed to ${enabled ? "enable" : "disable"} 2FA.`);
    }
  };

  const methods = [
    {
      value: "email",
      label: "Email verification",
      desc: profile?.email || "—",
      Icon: MailIcon,
      bg: "bg-[var(--color-primary)]",
      iconColor: "text-white",
    },
    {
      value: "sms",
      label: "SMS verification",
      desc: profile?.phone || profile?.phoneNumber || "+1 (555) 123-4567",
      Icon: PhoneIcon,
      bg: "bg-gray-100",
      iconColor: "text-gray-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-6">
        <SectionHeader emoji="🔒" title="Security" subtitle="Manage your security settings" />

        {/* 2FA toggle row */}
        <div className="flex items-start gap-4 bg-gray-50 rounded-2xl px-5 py-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 text-[var(--color-primary)]">
            <ShieldIcon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text)]">Two-factor authentication</p>
            <p className="text-xs text-gray-400 mt-0.5">Add an extra layer of security</p>
          </div>
          {twoFactorLoading ? (
            <svg className="animate-spin shrink-0 mt-0.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/>
            </svg>
          ) : (
            <Toggle checked={twoFactor} onChange={handle2FAToggle} />
          )}
        </div>

        <p className="text-sm text-gray-500 mb-3">Choose verification method:</p>
        <div className="space-y-3">
          {methods.map((m) => {
            const active = verifyMethod === m.value;
            return (
              <button
                key={m.value}
                onClick={() => setVerifyMethod(m.value)}
                className={`w-full flex items-center gap-4 rounded-2xl border px-5 py-4 transition-colors text-left ${active ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-gray-200 bg-white hover:bg-gray-50"}`}
              >
                <div className={`w-10 h-10 rounded-full ${m.bg} flex items-center justify-center shrink-0 ${m.iconColor}`}>
                  <m.Icon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${active ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}>{m.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-[var(--color-primary)]" : "border-gray-300"}`}>
                  {active && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <AutoSaveNotice />
    </div>
  );
}

// ─── Legal ───────────────────────────────────────────────────────────────────────

const legalItems = [
  { label: "Terms of Service", desc: "Read our terms and conditions",   Icon: FileTextIcon, bg: "bg-blue-50",   iconColor: "text-blue-500" },
  { label: "Privacy Policy",   desc: "Learn how we protect your data",  Icon: LockIcon,     bg: "bg-blue-50",   iconColor: "text-blue-500" },
];

function LegalTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-6">
        <SectionHeader emoji="📜" title="Legal & Account" subtitle="Legal documents and account options" />
        <div className="space-y-3">
          {legalItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 bg-white border border-gray-200 rounded-2xl px-5 py-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center shrink-0 ${item.iconColor}`}>
                <item.Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text)]">{item.label}</p>
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

// ─── Profile ─────────────────────────────────────────────────────────────────────

function ProfileTab({ role, onChangePassword, onDeleteAccount }) {
  const dispatch = useDispatch();
  const profile = useSelector(selectUser);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    bio: "",
    profileImage: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    businessName: "",
    businessType: "",
  });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [initialized, setInitialized] = useState(false);
  const fileInputRef = React.useRef(null);

  const REQUIRED_FIELDS = ["firstName", "lastName", "email", "phoneNumber", "bio", "profileImage"];

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profile]);

  useEffect(() => {
    if (profile && !initialized) {
      setForm({
        firstName:    profile.firstName    ?? "",
        lastName:     profile.lastName     ?? "",
        email:        profile.email        ?? "",
        phoneNumber:  profile.phoneNumber  ?? profile.phone ?? "",
        dateOfBirth:  profile.dateOfBirth  ?? "",
        bio:          profile.bio          ?? "",
        profileImage: profile.profileImage ?? "",
        addressLine1: profile.addressLine1 ?? "",
        addressLine2: profile.addressLine2 ?? "",
        city:         profile.city         ?? "",
        state:        profile.state        ?? "",
        postalCode:   profile.postalCode   ?? "",
        country:      profile.country      ?? "",
        businessName: profile.businessName ?? "",
        businessType: profile.businessType ?? "",
      });
      setInitialized(true);
    }
  }, [profile, initialized]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, profileImage: ev.target.result }));
      if (fieldErrors.profileImage) setFieldErrors((fe) => ({ ...fe, profileImage: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (fieldErrors[k]) setFieldErrors((fe) => ({ ...fe, [k]: undefined }));
  };

  const FIELD_LABELS = {
    firstName: "First Name", lastName: "Last Name", email: "Email Address",
    phoneNumber: "Phone Number", bio: "Bio", profileImage: "Profile Picture",
  };

  const handleSave = async () => {
    const localErrors = {};
    for (const key of REQUIRED_FIELDS) {
      if (!form[key]?.trim()) {
        localErrors[key] = `${FIELD_LABELS[key]} is required.`;
      }
    }
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      toast.error("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    const result = await dispatch(updateProviderProfile(form));
    setSaving(false);

    if (updateProviderProfile.fulfilled.match(result)) {
      toast.success("Profile updated successfully.");
      setFieldErrors({});
    } else {
      const payload = result.payload;
      if (payload?.errors && typeof payload.errors === "object") {
        setFieldErrors(payload.errors);
        const firstMsg = Object.values(payload.errors)[0];
        toast.error(firstMsg || payload.message || "Validation failed.");
      } else {
        toast.error(payload?.message ?? (typeof payload === "string" ? payload : "Failed to update profile."));
      }
    }
  };

  const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ") || "—";
  const initials = (form.firstName?.[0] ?? "") + (form.lastName?.[0] ?? "") || (role === "provider" ? "P" : "?");

  const field = (label, key, placeholder, icon, colSpan) => {
    const hasError = !!fieldErrors[key];
    const isRequired = REQUIRED_FIELDS.includes(key);
    return (
      <div className={colSpan ? "sm:col-span-2" : ""} key={key}>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5">
          {icon && <span className="text-gray-400">{icon}</span>}
          {label}
          {isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
          type="text"
          placeholder={placeholder}
          value={form[key]}
          onChange={set(key)}
          className={`w-full border rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
            hasError
              ? "border-red-400 focus:ring-red-200 focus:border-red-400"
              : "border-gray-200 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
          }`}
        />
        {hasError && (
          <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors[key]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-6">
        <SectionHeader emoji="👤" title="Account Settings" subtitle="Manage your account details and security" />

        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative shrink-0">
            <div
              className={`w-16 h-16 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-2 ${fieldErrors.profileImage ? "ring-red-400" : "ring-transparent"}`}
            >
              {form.profileImage ? (
                <img src={form.profileImage} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                initials.toUpperCase()
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white border-2 border-white hover:opacity-80 transition-opacity"
            >
              <CameraIcon />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--color-text)]">{fullName}</p>
            <p className="text-xs text-gray-400">{form.email || "—"}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-[var(--color-primary)] font-semibold mt-1 hover:underline"
            >
              Change profile picture
            </button>
            {fieldErrors.profileImage && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.profileImage}</p>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[var(--color-primary)]"><UserIcon size={16} /></span>
            <p className="text-sm font-bold text-[var(--color-text)]">Personal Information</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("First Name",    "firstName",   "John",                 null)}
            {field("Last Name",     "lastName",    "Doe",                  null)}
            {field("Email Address", "email",       "john.doe@example.com", <MailIcon />)}
            {field("Phone Number",  "phoneNumber", "+1 (555) 123-4567",    <PhoneIcon />)}
            {field("Date of Birth", "dateOfBirth", "YYYY-MM-DD",           null, true)}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tell us about yourself..."
                value={form.bio}
                onChange={set("bio")}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none ${
                  fieldErrors.bio
                    ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                    : "border-gray-200 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                }`}
              />
              {fieldErrors.bio && (
                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[var(--color-primary)]"><MapPinIcon size={16} /></span>
            <p className="text-sm font-bold text-[var(--color-text)]">Location Information</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field("Address Line 1", "addressLine1", "123 Main Street", null, true)}
            {field("Address Line 2", "addressLine2", "Suite 4B",        null, true)}
            {field("City",           "city",         "San Francisco",   null)}
            {field("State/Province", "state",        "California",      null)}
            {field("Zip/Postal Code","postalCode",   "94102",           null)}
            {field("Country",        "country",      "United States",   null)}
          </div>
        </div>

        {/* Provider Information — provider/host only */}
        {role === "provider" && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[var(--color-primary)]"><BuildingIcon size={16} /></span>
              <p className="text-sm font-bold text-[var(--color-text)]">Provider Information</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field("Business Name", "businessName", "Adventure Hub",          null)}
              {field("Business Type", "businessType", "e.g. Event Management",  null)}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--color-primary)] hover:opacity-90 text-white font-semibold text-sm px-8 py-2.5 rounded-xl transition-opacity disabled:opacity-60 flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/>
              </svg>
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Account Settings card */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
        <p className="text-sm font-bold text-[var(--color-text)] mb-4">Account Settings</p>
        <div className="space-y-2">
          <button
            onClick={onChangePassword}
            className="w-full flex items-center gap-4 rounded-2xl border border-gray-200 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <span className="text-xl">🔑</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)]">Change password</p>
              <p className="text-xs text-gray-400">Update your account password</p>
            </div>
            <span className="text-gray-400 shrink-0"><ChevronRightIcon /></span>
          </button>
          <button
            onClick={onDeleteAccount}
            className="w-full flex items-center gap-4 rounded-2xl border border-red-100 bg-red-50/40 px-5 py-4 hover:bg-red-50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <TrashIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-500">Delete account</p>
              <p className="text-xs text-gray-400">Permanently delete your account and data</p>
            </div>
            <span className="text-red-300 shrink-0"><ChevronRightIcon /></span>
          </button>
        </div>
      </div>

      <AutoSaveNotice />
    </div>
  );
}

// ─── Payment Method ───────────────────────────────────────────────────────────────

const mockAccounts = [
  { id: 1, name: "Chase Business Account", number: "****-1234", isDefault: true  },
  { id: 2, name: "Chase Business Account", number: "****-5678", isDefault: false },
];

function PaymentMethodTab() {
  const [accounts, setAccounts] = useState(mockAccounts);
  const [showModal, setShowModal] = useState(false);

  const setDefault    = (id) => setAccounts((a) => a.map((acc) => ({ ...acc, isDefault: acc.id === id })));
  const deleteAccount = (id) => setAccounts((a) => a.filter((acc) => acc.id !== id));
  const addAccount    = (form) => {
    setAccounts((a) => [
      ...a.map((acc) => form.setDefault ? { ...acc, isDefault: false } : acc),
      { id: Date.now(), name: form.bankName, number: form.accountNumber, isDefault: !!form.setDefault },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-6">
        {/* Header row with Add Method button */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
              <CreditCardIcon size={22} /> Payment Methods
            </h2>
            <p className="text-sm text-gray-400 mt-1">Manage your bank accounts for payouts</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[var(--color-secondary)] hover:opacity-90 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-opacity shrink-0 mt-1"
          >
            <PlusIcon /> Add Method
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className={`flex items-center gap-3 sm:gap-4 rounded-2xl border px-4 sm:px-5 py-4 ${acc.isDefault ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-gray-200 bg-white"}`}
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 text-[var(--color-primary)]">
                <CreditCardIcon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{acc.name}</p>
                  {acc.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[var(--color-primary)] text-white rounded-full">Default</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Account ending in {acc.number}</p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 rounded-lg transition-colors"><EditIcon /></button>
                <button onClick={() => deleteAccount(acc.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><TrashIcon /></button>
                {!acc.isDefault && (
                  <button onClick={() => setDefault(acc.id)} className="text-xs text-[var(--color-primary)] border border-[var(--color-primary)] rounded-lg px-2 sm:px-3 py-1 hover:bg-[var(--color-primary)]/5 transition-colors font-semibold whitespace-nowrap">
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Payout info */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <span className="text-amber-500 shrink-0 mt-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-700">Payout Information</p>
              <p className="text-xs text-amber-600 mt-0.5">Your earnings will be deposited to your default payment method. Payouts are processed within 3–5 business days.</p>
            </div>
          </div>
        </div>
      </div>
      <AutoSaveNotice />

      {showModal && <AddPaymentModal onClose={() => setShowModal(false)} onAdd={addAccount} />}
    </div>
  );
}

// ─── Tabs config ────────────────────────────────────────────────────────────────

const TABS = [
  { key: "notifications", label: "Notifications",  Icon: BellIcon,       Panel: NotificationsTab },
  { key: "preferences",   label: "Preferences",    Icon: GlobeIcon,      Panel: PreferencesTab   },
  { key: "security",      label: "Security",        Icon: ShieldIcon,     Panel: SecurityTab      },
  { key: "legal",         label: "Legal & Account", Icon: FileTextIcon,   Panel: LegalTab         },
  { key: "profile",       label: "Profile",         Icon: UserIcon,       Panel: ProfileTab       },
  { key: "payment",       label: "Payment Method",  Icon: CreditCardIcon, Panel: PaymentMethodTab },
];

// ─── Main ────────────────────────────────────────────────────────────────────────

export default function SettingsPage({ role = "provider", showFooter = true }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("notifications");
  // On mobile: null = showing sidebar list, string = showing content for that tab
  const [mobileView, setMobileView] = useState(null);

  // Modals
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount]   = useState(false);

  const active = TABS.find((t) => t.key === activeTab) ?? TABS[0];

  // On mobile, which tab content to show (null means list view)
  const mobileActive = mobileView ? TABS.find((t) => t.key === mobileView) : null;

  const handleTabClick = (key) => {
    setActiveTab(key);
    setMobileView(key);
  };

  const handleMobileBack = () => {
    setMobileView(null);
  };

  // Render the content panel (with modal callbacks for Profile tab)
  const renderPanel = (tab, extraProps = {}) => {
    const { Panel } = tab;
    return (
      <Panel
        role={role}
        onChangePassword={() => setShowChangePassword(true)}
        onDeleteAccount={() => setShowDeleteAccount(true)}
        {...extraProps}
      />
    );
  };

  return (
    <>
      {/* ── Full-width header bar ─────────────────────────────────────────────── */}
      <div className="hidden md:block bg-white border-b border-gray-100">
        <div className="px-6 lg:px-8 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)] inline">Settings</h1>
            <span className="text-sm text-gray-400 ml-2">Manage your account preferences and settings</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#F4F6F8] min-h-screen p-4 sm:p-6 lg:p-8">

        {/* ── Mobile: list view (shown when mobileView is null) ─────────────── */}
        <div className="md:hidden">
          {!mobileActive ? (
            /* Mobile sidebar list */
            <>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => router.back()}
                  className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                  </svg>
                </button>
                <div>
                  <h1 className="text-lg font-bold text-[var(--color-text)]">Settings</h1>
                  <p className="text-xs text-gray-400">Manage your account</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {TABS.map((tab, i) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabClick(tab.key)}
                    className={`flex items-center gap-4 w-full px-5 py-4 text-left transition-colors hover:bg-gray-50 ${i > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 text-[var(--color-primary)]">
                      <tab.Icon size={17} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text)]">{tab.label}</p>
                    </div>
                    <span className="text-gray-300 shrink-0"><ChevronRightIcon /></span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Mobile content view */
            <>
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={handleMobileBack}
                  className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ChevronLeftIcon />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-primary)]"><mobileActive.Icon size={18} /></span>
                  <h1 className="text-lg font-bold text-[var(--color-text)]">{mobileActive.label}</h1>
                </div>
              </div>
              {renderPanel(mobileActive)}
            </>
          )}
        </div>

        {/* ── Desktop (md+) layout ──────────────────────────────────────────── */}
        <div className="hidden md:block">
          <div className="flex gap-6 items-start">
            {/* Sidebar */}
            <aside className="w-56 lg:w-64 shrink-0 bg-white border border-gray-100 rounded-2xl overflow-hidden self-start">
              <div className="p-3 space-y-1">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                        isActive
                          ? "bg-[var(--color-primary)] text-white"
                          : "text-gray-500 hover:bg-gray-50 hover:text-[var(--color-text)]"
                      }`}
                    >
                      <tab.Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Content panel */}
            <div className="flex-1 min-w-0">
              {renderPanel(active)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer — visible on laptop (lg+) only, and only when the shell doesn't already include one */}
      {showFooter && (
        <div className="hidden lg:block">

          <AppFooter />
        </div>
      )}

      {/* Modals */}
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
      {showDeleteAccount   && <DeleteAccountModal onClose={() => setShowDeleteAccount(false)} />}
    </>
  );
}
