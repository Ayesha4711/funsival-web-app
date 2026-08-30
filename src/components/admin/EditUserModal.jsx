"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { updateAdminUser } from "@/store/slices/adminSlice";
import {
  parsePhoneNumber,
  formatPhoneNumber,
  stripPhoneNumber,
  validatePhoneNumber,
} from "@/lib/phone";
import { CloseIcon, SpinnerIcon, PhoneIcon } from "@/icons";
import { PhoneCountryPicker } from "@/components/shared/settings/SettingsPrimitives";
import DatePickerField from "@/components/shared/settings/DatePickerField";

const ROLES = ["user", "host", "admin"];

function resolveDisplayName(user) {
  const p = user?.providerProfile;
  if (p && (p.firstName || p.lastName)) {
    return [p.firstName, p.lastName].filter(Boolean).join(" ");
  }
  return user?.name || user?.email || "—";
}

export default function EditUserModal({ user, currentAdminId, onClose, onSaved }) {
  const dispatch = useDispatch();
  const pp = user?.providerProfile ?? {};
  const initialPhone = parsePhoneNumber(pp.phoneNumber ?? user?.phoneNumber ?? "");

  const [form, setForm] = useState({
    email: user?.email ?? "",
    firstName: pp.firstName ?? user?.firstName ?? "",
    lastName: pp.lastName ?? user?.lastName ?? "",
    phoneNumber: initialPhone.number,
    bio: pp.bio ?? user?.bio ?? "",
    dateOfBirth: (pp.dateOfBirth ?? user?.dateOfBirth ?? "")?.split?.("T")[0] ?? "",
    addressLine1: pp.location?.addressLine1 ?? user?.addressLine1 ?? "",
    addressLine2: pp.location?.addressLine2 ?? user?.addressLine2 ?? "",
    city: pp.location?.city ?? user?.city ?? "",
    state: pp.location?.state ?? user?.state ?? "",
    postalCode: pp.location?.postalCode ?? user?.postalCode ?? "",
    country: pp.location?.country ?? user?.country ?? "",
    businessName: pp.businessName ?? user?.businessName ?? "",
    businessType: pp.businessType ?? user?.businessType ?? "",
    role: user?.role ?? "user",
    agencyName: user?.agencyName ?? "",
    isEmailVerified: !!user?.isEmailVerified,
    twoFactorEnabled: !!user?.twoFactorEnabled,
  });
  const [phoneCountryCode, setPhoneCountryCode] = useState(initialPhone.countryCode || "+92");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (key) => (e) => {
    const value = e?.target?.type === "checkbox" ? e.target.checked : e?.target?.value ?? e;
    setForm((f) => ({ ...f, [key]: value }));
    if (error) setError("");
  };

  const setPhoneNumber = (e) => {
    const digits = stripPhoneNumber(e.target.value).replace(/^0+/, "");
    setForm((f) => ({ ...f, phoneNumber: digits }));
    if (error) setError("");
    if (fieldErrors.phoneNumber) setFieldErrors((fe) => ({ ...fe, phoneNumber: undefined }));
  };

  const setPhoneCode = (valueOrEvent) => {
    const next = typeof valueOrEvent === "string" ? valueOrEvent : valueOrEvent?.target?.value;
    setPhoneCountryCode(next);
    if (fieldErrors.phoneNumber) setFieldErrors((fe) => ({ ...fe, phoneNumber: undefined }));
  };

  const isSelf = currentAdminId && user?.id === currentAdminId;

  const handleSave = async () => {
    if (isSelf && form.role !== "admin") {
      setError("You cannot change your own role away from admin.");
      return;
    }

    if (form.phoneNumber && !validatePhoneNumber(form.phoneNumber, { allowLeadingZero: false })) {
      const digits = stripPhoneNumber(form.phoneNumber);
      const msg = digits.length > 15
        ? "Phone number cannot exceed 15 digits."
        : digits.startsWith("0")
          ? "Please enter the phone number without the leading 0."
          : "Please enter a valid phone number.";
      setFieldErrors((fe) => ({ ...fe, phoneNumber: msg }));
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneCountryCode, form.phoneNumber);

    // Only send fields that changed
    const original = {
      email: user?.email ?? "",
      firstName: pp.firstName ?? user?.firstName ?? "",
      lastName: pp.lastName ?? user?.lastName ?? "",
      phoneNumber: pp.phoneNumber ?? user?.phoneNumber ?? "",
      bio: pp.bio ?? user?.bio ?? "",
      dateOfBirth: (pp.dateOfBirth ?? user?.dateOfBirth ?? "")?.split?.("T")[0] ?? "",
      addressLine1: pp.location?.addressLine1 ?? user?.addressLine1 ?? "",
      addressLine2: pp.location?.addressLine2 ?? user?.addressLine2 ?? "",
      city: pp.location?.city ?? user?.city ?? "",
      state: pp.location?.state ?? user?.state ?? "",
      postalCode: pp.location?.postalCode ?? user?.postalCode ?? "",
      country: pp.location?.country ?? user?.country ?? "",
      businessName: pp.businessName ?? user?.businessName ?? "",
      businessType: pp.businessType ?? user?.businessType ?? "",
      role: user?.role ?? "user",
      agencyName: user?.agencyName ?? "",
      isEmailVerified: !!user?.isEmailVerified,
      twoFactorEnabled: !!user?.twoFactorEnabled,
    };

    const payload = {};
    for (const key of Object.keys(form)) {
      if (key === "phoneNumber") continue;
      if (form[key] !== original[key]) payload[key] = form[key];
    }
    if (formattedPhone !== original.phoneNumber) payload.phoneNumber = formattedPhone;

    if (Object.keys(payload).length === 0) {
      toast.error("No changes to save.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const result = await dispatch(updateAdminUser({ userId: user.id, payload }));
      if (updateAdminUser.fulfilled.match(result)) {
        toast.success("User updated successfully.");
        onSaved?.(result.payload?.data ?? result.payload);
        onClose();
      } else {
        const msg = typeof result.payload === "string" ? result.payload : "Failed to update user.";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const displayName = resolveDisplayName(user);

  const field = (label, key, type = "text") => (
    <div key={key}>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4AA7A7]/20 focus:border-[#4AA7A7] transition-colors"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit User</h2>
            <p className="text-xs text-gray-400 mt-0.5">{displayName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Personal Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field("Email", "email", "email")}
              {field("First Name", "firstName")}
              {field("Last Name", "lastName")}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5">
                  <span className="text-gray-400"><PhoneIcon /></span>
                  Phone Number
                </label>
                <div className={`flex items-stretch overflow-visible rounded-xl border bg-white transition-colors focus-within:ring-2 ${
                  fieldErrors.phoneNumber
                    ? "border-red-400 focus-within:ring-red-200"
                    : "border-gray-200 focus-within:ring-[#4AA7A7]/20 focus-within:border-[#4AA7A7]"
                }`}>
                  <PhoneCountryPicker value={phoneCountryCode} onChange={setPhoneCode} />
                  <input
                    type="tel" placeholder="Enter phone number" maxLength={20}
                    value={form.phoneNumber} onChange={setPhoneNumber}
                    className="min-w-0 h-[42px] flex-1 rounded-r-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                </div>
                {fieldErrors.phoneNumber && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.phoneNumber}</p>}
              </div>
              <DatePickerField
                value={form.dateOfBirth}
                onChange={(v) => { setForm((f) => ({ ...f, dateOfBirth: v })); if (error) setError(""); }}
                hasError={!!fieldErrors.dateOfBirth}
                errorMsg={fieldErrors.dateOfBirth}
              />
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Bio</label>
                <textarea
                  rows={2}
                  value={form.bio}
                  onChange={set("bio")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4AA7A7]/20 focus:border-[#4AA7A7] resize-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Location</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field("Address Line 1", "addressLine1")}
              {field("Address Line 2", "addressLine2")}
              {field("City", "city")}
              {field("State", "state")}
              {field("Postal Code", "postalCode")}
              {field("Country", "country")}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Business Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field("Business Name", "businessName")}
              {field("Business Type", "businessType")}
              {field("Agency Name", "agencyName")}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Admin Controls</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Role</label>
                <select
                  value={form.role}
                  onChange={set("role")}
                  disabled={isSelf}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 capitalize focus:outline-none focus:ring-2 focus:ring-[#4AA7A7]/20 focus:border-[#4AA7A7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="capitalize">{r}</option>
                  ))}
                </select>
                {isSelf && <p className="mt-1 text-[11px] text-gray-400">You cannot change your own role.</p>}
              </div>
              <div className="flex flex-col justify-center gap-3 pt-1">
                <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <input type="checkbox" checked={form.isEmailVerified} onChange={set("isEmailVerified")} className="w-4 h-4 accent-[#4AA7A7]" />
                  Email Verified
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <input type="checkbox" checked={form.twoFactorEnabled} onChange={set("twoFactorEnabled")} className="w-4 h-4 accent-[#4AA7A7]" />
                  Two-Factor Enabled
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-5 border-t border-gray-100 shrink-0">
          <button onClick={onClose} disabled={saving} className="flex-1 py-3 border border-gray-200 text-gray-500 font-semibold rounded-full text-sm hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-[#4AA7A7] text-white font-semibold rounded-full text-sm hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2"
          >
            {saving && <SpinnerIcon size={14} />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
