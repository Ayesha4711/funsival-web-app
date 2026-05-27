"use client";

import React, { useState } from "react";
import { CreditCardIcon, PlusIcon, CloseIcon as XIcon, ShieldLockIcon } from "@/icons";
import { ModalOverlay } from "./SettingsPrimitives";

export default function AddPaymentModal({ onClose, onAdd }) {
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

  const fields = [
    { key: "holderName",    label: "Account Holder Name", placeholder: "Enter account holder name" },
    { key: "bankName",      label: "Bank Name",           placeholder: "e.g. Chase Bank" },
    { key: "accountNumber", label: "Account Number",      placeholder: "Enter account number" },
    { key: "routingNumber", label: "Routing Number",      placeholder: "Enter routing number" },
    { key: "accountType",   label: "Account Type",        placeholder: "e.g. Checking, Savings" },
  ];

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-primary"><CreditCardIcon size={20} /></span>
            <h3 className="text-base font-bold text-text">Add Payment Method</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              <input
                placeholder={placeholder}
                value={form[key]}
                onChange={set(key)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder-gray-400"
              />
            </div>
          ))}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.setDefault}
              onChange={(e) => setForm((f) => ({ ...f, setDefault: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 accent-[var(--color-primary)]"
            />
            <span className="text-sm text-text font-medium">Set as default payment method</span>
          </label>

          <div className="flex items-start gap-3 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3">
            <span className="text-primary shrink-0 mt-0.5"><ShieldLockIcon /></span>
            <p className="text-xs text-primary leading-relaxed">
              Your banking information is encrypted and securely stored. We never share your
              financial details with third parties.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-sm font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-text">
            Cancel
          </button>
          <button onClick={handleAdd}
            className="flex-1 bg-primary text-white text-sm font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <PlusIcon /> Add Payment Method
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
