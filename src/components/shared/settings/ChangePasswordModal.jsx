"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { changePassword } from "@/store/slices/authSlice";
import { LockIcon, EyeIcon, EyeOffIcon, SpinnerIcon, CloseIcon as XIcon } from "@/icons";
import { ModalOverlay } from "./SettingsPrimitives";

const FIELDS = [
  { key: "current", label: "Current Password",    placeholder: "Enter current password" },
  { key: "newPwd",  label: "New Password",         placeholder: "Enter new password" },
  { key: "confirm", label: "Confirm New Password", placeholder: "Confirm new password" },
];

export default function ChangePasswordModal({ onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleShow = (k) => setShow((s) => ({ ...s, [k]: !s[k] }));
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError(""); };

  const passwordChecks = [
    { text: "At least 8 characters long", met: form.newPwd.length >= 8 },
    { text: "Contains uppercase and lowercase letters", met: /[A-Z]/.test(form.newPwd) && /[a-z]/.test(form.newPwd) },
    { text: "Contains at least one number", met: /[0-9]/.test(form.newPwd) },
    { text: "Contains at least one special character", met: /[^A-Za-z0-9]/.test(form.newPwd) },
  ];

  const handleSubmit = async () => {
    if (!form.current || !form.newPwd || !form.confirm) { setError("All fields are required."); return; }
    if (/\s/.test(form.newPwd)) { setError("Spaces are not allowed in password."); return; }
    if (!passwordChecks.every((c) => c.met)) { setError("Password does not meet all requirements."); return; }
    if (form.newPwd !== form.confirm) { setError("New passwords do not match."); return; }

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

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-primary"><LockIcon size={20} /></span>
            <h3 className="text-base font-bold text-text">Change Password</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><XIcon /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={show[key] ? "text" : "password"}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={set(key)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder-gray-400"
                />
                <button type="button" onClick={() => toggleShow(key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show[key] ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </div>
          ))}

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-gray-600 mb-2">Password requirements:</p>
            <ul className="space-y-1">
              {passwordChecks.map(({ text, met }) => (
                <li key={text} className="flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${met ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className={met ? "text-green-600" : "text-gray-400"}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6">
          <button onClick={onClose} disabled={loading}
            className="flex-1 border border-gray-200 text-sm font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-text disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-primary text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <SpinnerIcon size={14} />}
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
