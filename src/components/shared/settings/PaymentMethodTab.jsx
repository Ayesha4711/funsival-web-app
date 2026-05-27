"use client";

import React, { useState } from "react";
import { CreditCardIcon, PlusIcon, EditIcon, TrashIcon } from "@/icons";
import { InfoFilledIcon as InfoIcon } from "@/icons";
import { AutoSaveNotice } from "./SettingsPrimitives";
import AddPaymentModal from "./AddPaymentModal";

const MOCK_ACCOUNTS = [
  { id: 1, name: "Chase Business Account", number: "****-1234", isDefault: true  },
  { id: 2, name: "Chase Business Account", number: "****-5678", isDefault: false },
];

export default function PaymentMethodTab() {
  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);
  const [showModal, setShowModal] = useState(false);

  const setDefault    = (id) => setAccounts((a) => a.map((acc) => ({ ...acc, isDefault: acc.id === id })));
  const removeAccount = (id) => setAccounts((a) => a.filter((acc) => acc.id !== id));
  const addAccount    = (form) => {
    setAccounts((a) => [
      ...a.map((acc) => form.setDefault ? { ...acc, isDefault: false } : acc),
      { id: Date.now(), name: form.bankName, number: form.accountNumber, isDefault: !!form.setDefault },
    ]);
  };

  return (
    <div className="space-y-6 2xl:min-h-[calc(100vh-400px)]">
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-6 2xl:min-h-[600px]">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-xl font-bold text-text flex items-center gap-2">
              <CreditCardIcon size={22} /> Payment Methods
            </h2>
            <p className="text-sm text-gray-400 mt-1">Manage your bank accounts for payouts</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-secondary hover:opacity-90 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-opacity shrink-0 mt-1"
          >
            <PlusIcon /> Add Method
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className={`flex items-center gap-3 sm:gap-4 rounded-2xl border px-4 sm:px-5 py-4 ${
                acc.isDefault ? "border-primary bg-primary/5" : "border-gray-200 bg-white"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <CreditCardIcon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-text">{acc.name}</p>
                  {acc.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary text-white rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Account ending in {acc.number}</p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors">
                  <EditIcon />
                </button>
                <button onClick={() => removeAccount(acc.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <TrashIcon />
                </button>
                {!acc.isDefault && (
                  <button onClick={() => setDefault(acc.id)}
                    className="text-xs text-primary border border-primary rounded-lg px-2 sm:px-3 py-1 hover:bg-primary/5 transition-colors font-semibold whitespace-nowrap">
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
            <span className="text-amber-500 shrink-0 mt-0.5"><InfoIcon size={18} /></span>
            <div>
              <p className="text-sm font-semibold text-amber-700">Payout Information</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Your earnings will be deposited to your default payment method. Payouts are
                processed within 3–5 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
      <AutoSaveNotice />

      {showModal && <AddPaymentModal onClose={() => setShowModal(false)} onAdd={addAccount} />}
    </div>
  );
}
