"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { enable2FA, disable2FA } from "@/store/slices/authSlice";
import { selectUser, fetchProfile, setProfile } from "@/store/slices/profileSlice";
import { ShieldIcon, MailIcon, SpinnerIcon } from "@/icons";
import { Toggle, AutoSaveNotice, SectionHeader } from "./SettingsPrimitives";

export default function SecurityTab() {
  const dispatch = useDispatch();
  const profile = useSelector(selectUser);

  const twoFactor = !!(
    profile?.twoFactorEnabled ?? profile?.isTwoFactorEnabled ?? profile?.twoFactor ?? false
  );
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [verifyMethod, setVerifyMethod] = useState("email");

  useEffect(() => {
    if (!profile) dispatch(fetchProfile());
  }, [dispatch, profile]);

  const handle2FAToggle = async (enabled) => {
    setTwoFactorLoading(true);
    const action = enabled ? enable2FA : disable2FA;
    const result = await dispatch(action());
    setTwoFactorLoading(false);

    if (action.fulfilled.match(result)) {
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
      bg: "bg-primary",
      iconColor: "text-white",
    },
  ];

  return (
    <div className="space-y-6 2xl:min-h-[calc(100vh-400px)]">
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-6 2xl:min-h-[600px]">
        <SectionHeader emoji="🔒" title="Security" subtitle="Manage your security settings" />

        <div className="flex items-start gap-4 bg-gray-50 rounded-2xl px-5 py-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
            <ShieldIcon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text">Two-factor authentication</p>
            <p className="text-xs text-gray-400 mt-0.5">Add an extra layer of security</p>
          </div>
          {twoFactorLoading ? (
            <SpinnerIcon size={24} className="shrink-0 mt-0.5" color="var(--color-primary)" />
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
                className={`w-full flex items-center gap-4 rounded-2xl border px-5 py-4 transition-colors text-left ${
                  active ? "border-primary bg-primary/5" : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${m.bg} flex items-center justify-center shrink-0 ${m.iconColor}`}>
                  <m.Icon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${active ? "text-primary" : "text-text"}`}>{m.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-primary" : "border-gray-300"}`}>
                  {active && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
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
