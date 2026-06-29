"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppFooter from "@/components/shared/AppFooter";
import {
  BellIcon,
  GlobeIcon,
  ShieldIcon,
  FileTextIcon,
  UserIcon,
  CreditCardIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowLeftIcon,
} from "@/icons";

import NotificationsTab  from "./settings/NotificationsTab";
import PreferencesTab    from "./settings/PreferencesTab";
import SecurityTab       from "./settings/SecurityTab";
import LegalTab          from "./settings/LegalTab";
import ProfileTab        from "./settings/ProfileTab";
import PaymentMethodTab  from "./settings/PaymentMethodTab";
import ChangePasswordModal from "./settings/ChangePasswordModal";
import DeleteAccountModal  from "./settings/DeleteAccountModal";

// ─── Tabs config ────────────────────────────────────────────────────────────────

const TABS = [
  { key: "notifications", label: "Notifications",   Icon: BellIcon,       Panel: NotificationsTab  },
  { key: "preferences",   label: "Preferences",     Icon: GlobeIcon,      Panel: PreferencesTab    },
  { key: "security",      label: "Security",         Icon: ShieldIcon,     Panel: SecurityTab       },
  { key: "legal",         label: "Legal & Account",  Icon: FileTextIcon,   Panel: LegalTab          },
  { key: "profile",       label: "Profile",          Icon: UserIcon,       Panel: ProfileTab        },
  { key: "payment",       label: "Payment Method",   Icon: CreditCardIcon, Panel: PaymentMethodTab  },
];

// ─── Main ────────────────────────────────────────────────────────────────────────

export default function SettingsPage({ role = "provider", showFooter = true }) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const initialTab  = searchParams.get("tab") ?? "notifications";
  const [activeTab,   setActiveTab]   = useState(initialTab);
  // Mobile: null = list view, string = content view for that tab key
  const [mobileView,  setMobileView]  = useState(searchParams.get("tab") ?? null);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount,  setShowDeleteAccount]  = useState(false);

  const active       = TABS.find((t) => t.key === activeTab) ?? TABS[0];
  const mobileActive = mobileView ? TABS.find((t) => t.key === mobileView) : null;

  const handleTabClick   = (key) => { setActiveTab(key); setMobileView(key); };
  const handleMobileBack = ()    => setMobileView(null);

  /** Render a panel, always passing the shared modal-opener callbacks */
  const renderPanel = (tab) => {
    const { Panel } = tab;
    return (
      <Panel
        role={role}
        onChangePassword={() => setShowChangePassword(true)}
        onDeleteAccount={()  => setShowDeleteAccount(true)}
      />
    );
  };

  return (
    <>
      {/* ── Desktop header bar ───────────────────────────────────────────────── */}
      <div className="hidden md:block bg-white border-b border-gray-100">
        <div className="px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text">Settings</h1>
            <span className="text-sm text-gray-400">
              Manage your account preferences and settings
            </span>
          </div>
        </div>
      </div>

      {/* ── Mobile header bar ────────────────────────────────────────────────── */}
      <div className="md:hidden bg-white border-b border-gray-100">
        <div className="px-4 sm:px-6 py-5 flex items-center gap-3">
          {!mobileActive ? (
            <>
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon size={20} />
              </button>
              <div>
                <h1 className="text-lg font-bold text-text">Settings</h1>
                <p className="text-xs text-gray-400">Manage your account</p>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleMobileBack}
                className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronLeftIcon />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-primary">
                  <mobileActive.Icon size={18} />
                </span>
                <h1 className="text-lg font-bold text-text">{mobileActive.label}</h1>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 bg-[#F4F6F8] p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-200px)] 2xl:min-h-200">

        {/* ── Mobile layout ────────────────────────────────────────────────── */}
        <div className="md:hidden">
          {!mobileActive ? (
            /* List view */
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {TABS.map((tab, i) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabClick(tab.key)}
                  className={`flex items-center gap-4 w-full px-5 py-4 text-left transition-colors hover:bg-gray-50 ${
                    i > 0 ? "border-t border-gray-100" : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                    <tab.Icon size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text">{tab.label}</p>
                  </div>
                  <span className="text-gray-300 shrink-0">
                    <ChevronRightIcon />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            /* Content view */
            renderPanel(mobileActive)
          )}
        </div>

        {/* ── Desktop layout (md+) ─────────────────────────────────────────── */}
        <div className="hidden md:flex flex-col flex-1">
          <div className="flex gap-6 flex-1 items-stretch">

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
                          ? "bg-primary text-white"
                          : "text-gray-500 hover:bg-gray-50 hover:text-text"
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

      {/* Footer — lg+ only, opt-out via showFooter prop */}
      {showFooter && (
        <div className="hidden lg:block">
          <AppFooter />
        </div>
      )}

      {/* Modals */}
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
      {showDeleteAccount && (
        <DeleteAccountModal onClose={() => setShowDeleteAccount(false)} />
      )}
    </>
  );
}
