"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/images/logo.svg";

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const BankIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="10" width="18" height="11" rx="1" /><path d="M3 10l9-7 9 7" /><line x1="9" y1="21" x2="9" y2="10" /><line x1="15" y1="21" x2="15" y2="10" />
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const DollarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ─── Shared input class ─────────────────────────────────────────────────────── */
const inputCls = "w-full bg-[#F3F4F6] border-0 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30";
const labelCls = "block text-sm font-semibold text-gray-800 mb-1.5";

/* ─── Add Payment Method Modal ───────────────────────────────────────────────── */
function AddPaymentModal({ onClose, onAdd }) {
  const [tab, setTab] = useState("bank");
  const [showAccNum, setShowAccNum] = useState(false);
  const [form, setForm] = useState({
    bankName: "", accountType: "Checking", holderName: "",
    routing: "", accountNum: "", nickname: "", isDefault: false,
  });

  const tabs = [
    { id: "bank",   label: "Bank Account" },
    { id: "paypal", label: "PayPal"        },
    { id: "debit",  label: "Debit Card"    },
  ];

  const infoText = {
    bank:   "Bank transfers typically take 3-5 business days and have lower fees.",
    paypal: "PayPal transfers typically arrive within 1 business day.",
    debit:  "Debit card transfers arrive instantly but may have higher fees.",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto flex flex-col max-h-[92vh] overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add Payment Method</h2>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">Add a new payment method for withdrawals. All information is<br />encrypted and secure.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0 ml-3 mt-0.5">
            <CloseIcon />
          </button>
        </div>

        {/* Tab pills */}
        <div className="px-6 pb-4 shrink-0">
          <div className="flex p-1 bg-[#EDF6F6] rounded-full">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 px-3 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  tab === t.id ? "bg-white text-[var(--color-primary)] shadow-sm" : "text-gray-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info banner */}
        <div className="px-6 pb-4 shrink-0">
          <div className="flex gap-2.5 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-400 shrink-0 mt-0.5"><ShieldIcon /></span>
            <p className="text-xs text-gray-500 leading-relaxed">{infoText[tab]}</p>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="px-6 pb-2 flex-1 overflow-y-auto">
          {tab === "bank" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Bank Name *</label>
                  <input className={inputCls} placeholder="e.g., Chase, Bank of America" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Account Type *</label>
                  <div className="relative">
                    <select
                      className={inputCls + " appearance-none pr-9 cursor-pointer"}
                      value={form.accountType}
                      onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                    >
                      <option>Checking</option>
                      <option>Savings</option>
                      <option>Business</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown />
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Account Holder Name *</label>
                <input className={inputCls} placeholder="Full name as it appears on account" value={form.holderName} onChange={(e) => setForm({ ...form, holderName: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Routing Number *</label>
                  <input className={inputCls} placeholder="9-digit routing number" value={form.routing} onChange={(e) => setForm({ ...form, routing: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Account Number *</label>
                  <div className="relative">
                    <input
                      type={showAccNum ? "text" : "password"}
                      className={inputCls + " pr-10"}
                      placeholder="Account number"
                      value={form.accountNum}
                      onChange={(e) => setForm({ ...form, accountNum: e.target.value })}
                    />
                    <button type="button" onClick={() => setShowAccNum((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <EyeIcon />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Account Nickname *</label>
                <input className={inputCls} placeholder="e.g., Primary Business Account" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer py-1">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 accent-[var(--color-primary)]"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                />
                <span className="text-sm text-gray-600 font-medium">Make this my default payment method</span>
              </label>
            </div>
          )}

          {tab === "paypal" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>PayPal Email *</label>
                <input className={inputCls} placeholder="your@email.com" />
              </div>
              <div>
                <label className={labelCls}>Account Nickname *</label>
                <input className={inputCls} placeholder="e.g., My PayPal" />
              </div>
            </div>
          )}

          {tab === "debit" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Card Number *</label>
                <input className={inputCls} placeholder="•••• •••• •••• ••••" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Expiry *</label>
                  <input className={inputCls} placeholder="MM / YY" />
                </div>
                <div>
                  <label className={labelCls}>CVV *</label>
                  <input className={inputCls} placeholder="•••" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Card Nickname *</label>
                <input className={inputCls} placeholder="e.g., My Visa" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onAdd({ name: form.nickname || "New Account", last4: "5678", isDefault: form.isDefault }); onClose(); }}
            className="px-6 py-2.5 rounded-full bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white text-sm font-bold transition-colors"
          >
            Add Payment Method
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Withdraw Funds Modal ───────────────────────────────────────────────────── */
function WithdrawModal({ availableBalance, paymentMethod, onClose, onConfirm }) {
  const [amount, setAmount] = useState("12,500.00");

  const rawAmount = parseFloat(amount.replace(/,/g, "")) || 0;
  const processingFee = rawAmount > 0 ? parseFloat((rawAmount * 0.0002).toFixed(2)) : 0;
  const youReceive = rawAmount > 0 ? (rawAmount - processingFee).toFixed(2) : "0.00";

  const setPercent = (pct) => {
    const val = pct === 1 ? availableBalance : availableBalance * pct;
    setAmount(val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto flex flex-col max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="px-6 pt-6 pb-4 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-secondary)]"><DollarIcon /></span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Withdraw Funds</h2>
              <p className="text-xs text-gray-400 mt-0.5">Transfer your available funds to your preferred payment method</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0 ml-3">
            <CloseIcon />
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Add Amount:</label>
            <div className="flex items-center border-2 border-[var(--color-primary)] rounded-xl px-3 py-2.5 gap-2 bg-white">
              <span className="text-sm font-bold text-gray-500">$</span>
              <input className="flex-1 text-sm font-bold text-gray-900 focus:outline-none" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[["25%", 0.25], ["50%", 0.5], ["All", 1]].map(([label, pct]) => (
              <button key={label} onClick={() => setPercent(pct)} className="py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors">
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-400 shrink-0"><InfoIcon /></span>
            <p className="text-xs text-gray-500">Minimum withdrawal: $10 • Maximum: ${availableBalance.toLocaleString()}</p>
          </div>

          <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Withdrawal Amount:</span><span className="font-bold text-gray-900">${rawAmount.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Processing Fee:</span><span className="font-bold text-gray-500">-${processingFee}</span></div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100"><span className="font-bold text-gray-900">You'll receive:</span><span className="font-bold text-[var(--color-primary)]">${parseFloat(youReceive).toLocaleString()}</span></div>
          </div>

          <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-gray-500"><BankIcon /></span>
              <div>
                <p className="text-sm font-bold text-gray-900">{paymentMethod.name}</p>
                <p className="text-xs text-gray-400">****-{paymentMethod.last4}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1"><ClockIcon /><span>Estimated arrival: 3-5 business days</span></div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-400 shrink-0 mt-0.5"><ShieldIcon /></span>
            <div>
              <p className="text-xs font-semibold text-gray-700">Security Notice:</p>
              <p className="text-xs text-gray-500 mt-0.5">Withdrawals cannot be cancelled once processed. Please verify all details are correct before confirming.</p>
            </div>
          </div>

          <button
            onClick={() => onConfirm({ amount: rawAmount, fee: processingFee, net: youReceive, method: paymentMethod })}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white font-bold rounded-full transition-colors text-sm"
          >
            Confirm Withdrawal <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Success Modal ──────────────────────────────────────────────────────────── */
function SuccessModal({ withdrawalData, onClose }) {
  const txId = "WD-" + Math.floor(Math.random() * 9000000000 + 1000000000);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto flex flex-col shadow-2xl">
        <div className="px-6 pt-6 pb-4 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-secondary)]"><DollarIcon /></span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Withdraw Funds</h2>
              <p className="text-xs text-gray-400 mt-0.5">Transfer your available funds to your preferred payment method</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0 ml-3"><CloseIcon /></button>
        </div>
        <div className="px-6 pb-6 flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500"><CheckCircleIcon /></div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Withdrawal Initiated!</h3>
            <p className="text-sm text-gray-500">Your withdrawal of ${parseFloat(withdrawalData.net).toLocaleString()} has been processed and will arrive in 3-5 business days.</p>
          </div>
          <div className="w-full border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Transaction ID:</span><span className="font-bold text-gray-900 text-xs">{txId}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Method:</span><span className="font-bold text-gray-900">{withdrawalData.method.name}</span></div>
            <div className="flex justify-between text-sm items-center"><span className="text-gray-500">Status:</span><span className="px-3 py-1 bg-orange-50 text-orange-500 border border-orange-100 rounded-full text-xs font-bold">Processing</span></div>
          </div>
          <button onClick={onClose} className="px-10 py-3 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white font-bold rounded-full transition-colors text-sm">Done</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Payment Method Row ─────────────────────────────────────────────────────── */
function PaymentMethodRow({ method, onDelete }) {
  return (
    <div className="flex items-center p-4 border-2 border-gray-200 rounded-xl">
      {/* Bank icon */}
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
        <BankIcon />
      </div>

      {/* Name + last4 */}
      <div className="ml-3 flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{method.name}</p>
        <p className="text-xs text-gray-400">****-{method.last4}</p>
      </div>

      {/* Default / Edit / Delete stacked */}
      <div className="flex flex-col items-end gap-1.5 ml-4 shrink-0">
        {method.isDefault && (
          <span className="px-3 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold">Default</span>
        )}
        <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[var(--color-primary)] transition-colors">
          Edit <EditIcon />
        </button>
        <button
          onClick={() => onDelete(method.id)}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
        >
          Delete <TrashIcon />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Withdraw Page ─────────────────────────────────────────────────────── */
export default function WithdrawPage() {
  const router = useRouter();
  const availableBalance = 50000;

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, name: "Chase Business Account", last4: "1234", isDefault: true },
  ]);

  const [modal, setModal] = useState(null);
  const [withdrawalResult, setWithdrawalResult] = useState(null);
  const [showLastWithdrawal, setShowLastWithdrawal] = useState(true);
  const lastWithdrawal = { amount: 12497.5, date: "12/12/12", methodName: "Chase Business Account", last4: "1234" };

  const defaultMethod = paymentMethods.find((m) => m.isDefault) ?? paymentMethods[0];

  const handleAddMethod = (newMethod) => {
    setPaymentMethods((prev) => [
      ...prev.map((m) => newMethod.isDefault ? { ...m, isDefault: false } : m),
      { id: Date.now(), ...newMethod },
    ]);
  };

  const handleWithdrawConfirm = (data) => {
    setWithdrawalResult(data);
    setModal("success");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F3F4F6]">

      <div className="bg-white border-b border-gray-100 px-4 sm:px-8 lg:px-10 py-6 flex items-center gap-3">
        <Image src={logo} alt="Funsival" width={120} height={36} className="h-9 w-auto object-contain" />
        <button
          onClick={() => router.back()}
          className="text-gray-900 hover:text-gray-600 transition-colors shrink-0"
        >
          <BackIcon />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Get Paid</h1>
        <span className="text-sm text-gray-400 font-normal hidden sm:inline">Manage your Finance. Your Account Review</span>
      </div>

      <div className="flex-1 px-4 sm:px-8 lg:px-10 py-6 flex flex-col gap-5">

        {/* Combined Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6">
            <button onClick={() => router.push("/dashboard/earnings")} className="text-[#228E8A] hover:opacity-80 transition-opacity">
              <HomeIcon />
            </button>
            <ChevronRight />
            <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600 font-medium">Withdraw Funds</span>
          </div>

          {/* Available Balance Section */}
          <div className="mb-6 p-5 border-2 border-gray-200 rounded-xl">
            <p className="text-sm font-semibold text-gray-500 mb-3">Available Balance</p>
            <p className="text-4xl font-extrabold text-green-500 mb-1">
              ${availableBalance.toLocaleString()}
            </p>
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-400">Ready for withdrawal</p>
              <button
                onClick={() => setModal("withdraw")}
                className="flex items-center gap-2 px-7 py-3 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white text-sm font-bold rounded-full transition-colors"
              >
                Get Paid <ArrowRightIcon />
              </button>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="p-5 border-2 border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Select Payment Method</h2>
              <button
                onClick={() => setModal("addMethod")}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
              >
                <PlusIcon /> Add Method
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {paymentMethods.map((method) => (
                <PaymentMethodRow
                    key={method.id}
                    method={method}
                    onDelete={(id) => setPaymentMethods((prev) => prev.filter((m) => m.id !== id))}
                  />
                ))}
                {paymentMethods.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No payment methods added yet.</p>
                )}
              </div>
            </div>
          </div>

        {lastWithdrawal && showLastWithdrawal && (
          <div className="bg-[#EDF6F6] rounded-2xl border border-[#C8E6E5] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[#228E8A]"><ShieldIcon /></span>
                <p className="text-sm font-bold text-gray-800">Last Withdrawal</p>
              </div>
              <button
                onClick={() => setShowLastWithdrawal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              >
                <CloseIcon />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {"Your last withdrawal was $" + lastWithdrawal.amount.toLocaleString() + " on date " + lastWithdrawal.date + "."}
            </p>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                <BankIcon />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{lastWithdrawal.methodName}</p>
                <p className="text-xs text-gray-400">****-{lastWithdrawal.last4}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {modal === "addMethod" && (
        <AddPaymentModal onClose={() => setModal(null)} onAdd={handleAddMethod} />
      )}
      {modal === "withdraw" && defaultMethod && (
        <WithdrawModal
          availableBalance={availableBalance}
          paymentMethod={defaultMethod}
          onClose={() => setModal(null)}
          onConfirm={handleWithdrawConfirm}
        />
      )}
      {modal === "success" && withdrawalResult && (
        <SuccessModal
          withdrawalData={withdrawalResult}
          onClose={() => { setModal(null); router.push("/dashboard/earnings"); }}
        />
      )}
    </div>
  );
}
