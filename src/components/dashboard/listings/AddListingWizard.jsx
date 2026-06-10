"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import logo from "@/assets/images/logo.svg";
import StepCategory from "./StepCategory";
import StepType from "./StepType";
import StepDetails from "./StepDetails";
import StepPrice from "./StepPrice";
import StepReview from "./StepReview";
import StepSuccess from "./StepSuccess";
import { useDispatch, useSelector } from "react-redux";
import { createListing, saveDraft, fetchDraft, deleteDraft } from "@/store/slices/listingsSlice";
import { selectUser } from "@/store/slices/profileSlice";
import { fetchConversations, selectTotalUnreadCount } from "@/store/slices/chatSlice";
import axiosInstance from "@/store/axiosInstance";
import { resetStore } from "@/store/store";
import { getStoredFcmToken, useFCM } from "@/hooks/useFCM";
import { firebaseAuth } from "@/lib/firebase";
import NotificationPopover from "@/components/shared/NotificationPopover";
import { buildListingPricePayload, createEmptyPrice, normalizeListingPrice } from "./listingPrice";
import {
  fetchConnectStatus,
  startConnectOnboarding,
  selectConnectStatus,
  selectConnectStatusLoading,
  selectOnboardLoading,
} from "@/store/slices/paymentsSlice";
import { normalizeDateValue, parseCalendarDate } from "@/components/shared/dateUtils";
import {
  CheckIcon,
  SearchIcon,
  BellIcon,
  MessageIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  SpinnerIcon,
  UserIcon,
  SettingsIcon,
  LogoutIcon,
} from "@/icons";

/* ─── Step config ──────────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Category" },
  { id: 2, label: "Type" },
  { id: 3, label: "Details" },
  { id: 4, label: "Price" },
  { id: 5, label: "Review" },
  { id: 6, label: "Success" }
];

/* ─── Stepper ──────────────────────────────────────────────────────────────── */
function Stepper({ current, onStepClick }) {
  return (
    /* mobile/tablet: justify-between fills full width
       laptop (lg+): justify-center so steps don't stretch */
    <div className="flex items-center justify-between lg:justify-center w-full py-2 px-1">
      {STEPS.map((step, idx) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <React.Fragment key={step.id}>
            {/* Step node */}
            <button
              type="button"
              onClick={() => onStepClick(step.id)}
              className="flex flex-col items-center shrink-0"
            >
              <div
                className={[
                  "w-7 h-7 min-[375px]:w-8 min-[375px]:h-8 lg:w-10 lg:h-10 rounded-full border-2 flex items-center justify-center text-[10px] min-[375px]:text-xs lg:text-sm font-bold transition-colors",
                  done
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                    : active
                      ? "border-[#FF7201] text-[#FF7201]"
                      : "border-[#465668] text-[#465668]"
                ].join(" ")}
              >
                {done
                  ? <CheckIcon size={12} />
                  : String(step.id).padStart(2, "0")}
              </div>
              <span
                className={[
                  "mt-1 text-[8px] min-[375px]:text-[10px] lg:text-xs font-semibold whitespace-nowrap",
                  active
                    ? "text-[#FF7201]"
                    : done ? "text-[var(--color-primary)]" : "text-[#465668]"
                ].join(" ")}
              >
                {step.label}
              </span>
            </button>

            {/* Connector line */}
            {idx < STEPS.length - 1 &&
              <div
                className={[
                  "h-px mb-4 transition-colors",
                  /* mobile: flex-1 fills space; laptop: fixed width */
                  "flex-1 mx-0.5 lg:flex-none lg:w-16 lg:mx-2",
                  done ? "bg-[var(--color-primary)]" : "bg-[#465668]"
                ].join(" ")}
              />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Back sub-header (white bar below navbar, matches other dashboard screens) */
function BackSubHeader({ label = "Add New Listing", router }) {
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

/* ─── Stripe gate screen ────────────────────────────────────────────────────── */
function StripeGateScreen({ isIncomplete, stripeCountry, setStripeCountry, onboardLoading, onSubmit, STRIPE_COUNTRIES, connectStatus }) {
  const router = useRouter();

  const requirements = connectStatus?.requirements ?? {};
  const currentlyDue   = requirements.currently_due   ?? [];
  const pastDue        = requirements.past_due         ?? [];
  const errors         = requirements.errors           ?? [];
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

            {/* Requirements due */}
            {(pastDue.length > 0 || currentlyDue.length > 0) && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Action required</p>
                {[...new Set([...pastDue, ...currentlyDue])].map((req) => (
                  <div key={req} className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100">
                    <svg className="text-red-400 shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span className="text-xs text-red-700 font-medium">{req.replace(/\./g, " › ")}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Stripe errors */}
            {errors.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Verification errors</p>
                {errors.map((e, i) => (
                  <div key={i} className="px-3 py-2.5 rounded-xl bg-orange-50 border border-orange-100 text-xs text-orange-800 leading-relaxed">
                    <p className="font-bold mb-0.5">{e.code?.replace(/_/g, " ")}</p>
                    <p>{e.reason}</p>
                  </div>
                ))}
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

/* ─── Wizard navbar ─────────────────────────────────────────────────────────── */
function WizardNavbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const profile  = useSelector(selectUser);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  const currentUserId = profile?.id || profile?._id || null;
  const totalUnread   = useSelector((state) => selectTotalUnreadCount(state, currentUserId));

  const displayFirstName = profile?.firstName || profile?.providerProfile?.firstName || "";
  const displayLastName  = profile?.lastName  || profile?.providerProfile?.lastName  || "";
  const avatarLetter  = (displayFirstName[0] || displayLastName[0] || profile?.email?.[0] || "P").toUpperCase();
  const profileImage  = profile?.providerProfile?.profileImage ?? profile?.profileImage ?? null;
  const displayFullName = [displayFirstName, displayLastName].filter(Boolean).join(" ");

  // Live unread-message badge
  useFCM();
  useEffect(() => {
    if (!currentUserId) return;
    if (pathname?.includes("/messages")) return;
    dispatch(fetchConversations());
    const timer = setInterval(() => {
      if (document.visibilityState !== "hidden" && !pathname?.includes("/messages")) {
        dispatch(fetchConversations());
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [dispatch, pathname, currentUserId]);

  // Close popovers on outside click
  useEffect(() => {
    function handle(e) {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleNotifClick = () => {
    if (window.innerWidth < 1024) {
      router.push("/dashboard/notifications");
    } else {
      setNotifOpen(v => !v);
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    const fcmToken = getStoredFcmToken();
    if (fcmToken) {
      await axiosInstance
        .delete(`/notifications/device-tokens/${encodeURIComponent(fcmToken)}`)
        .catch(() => {});
    }
    await firebaseAuth.signOut().catch(() => {});
    localStorage.removeItem("auth-token");
    localStorage.removeItem("reservation_wishlists");
    localStorage.removeItem("listing_draft_local");
    sessionStorage.clear();
    dispatch(resetStore());
    window.location.href = "/logout";
  };

  return (
    <header className="flex h-16 bg-[#228E8A] items-center justify-between px-4 sm:px-8 gap-4 shrink-0 sticky top-0 z-50">
      {/* Logo */}
      <Image src={logo} alt="Funsival" width={110} height={32} className="h-8 w-auto object-contain shrink-0" />

      {/* Search */}
      <div className="flex-1 flex justify-center px-4">
        <div className="relative w-full max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            placeholder="Search here"
            className="w-full h-9 pl-10 pr-4 rounded-full bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4 shrink-0">

        {/* Provider / User switcher */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-1.5 text-white text-sm font-medium hover:text-white/80 transition-colors"
          >
            Provider <ChevronDownIcon size={14} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl py-1 z-50 shadow-lg">
              <button
                onClick={() => { setDropdownOpen(false); router.push("/dashboard"); }}
                className="block w-full text-left px-4 py-2 text-sm font-semibold text-[#228E8A] bg-[#EBF6F6] hover:bg-[#d5efee] transition-colors"
              >
                Provider
              </button>
              <button
                onClick={() => { setDropdownOpen(false); router.push("/user-dashboard/explore"); }}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                User
              </button>
            </div>
          )}
        </div>

        <span className="w-px h-5 bg-white/40 shrink-0" />

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleNotifClick}
            className="text-white/90 hover:text-white transition-colors relative p-1"
            aria-label="Notifications"
          >
            <BellIcon size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#FEB538] rounded-full border border-[#228E8A]" />
          </button>
          {notifOpen && <NotificationPopover onClose={() => setNotifOpen(false)} />}
        </div>

        {/* Messages */}
        <button
          onClick={() => router.push("/dashboard/messages")}
          className="relative text-white/90 hover:text-white transition-colors p-1"
          aria-label="Messages"
        >
          <MessageIcon size={20} />
          {totalUnread > 0 && (
            <span className="absolute top-0 right-0 min-w-3.5 h-3.5 bg-[#FEB538] rounded-full text-[8px] flex items-center justify-center text-white font-bold border border-[#228E8A] px-0.5">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>

        {/* Avatar + profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(v => !v)}
            className="w-9 h-9 rounded-full bg-[#FEB538] flex items-center justify-center text-white font-bold text-sm border-2 border-white/30 overflow-hidden hover:border-white/60 transition-colors"
            aria-label="Profile menu"
          >
            {profileImage
              ? <img src={profileImage} alt="avatar" className="w-full h-full object-cover" />
              : avatarLetter}
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl py-1.5 z-50 border border-gray-100 shadow-lg">
              {profile && (
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FEB538] flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
                    {profileImage
                      ? <img src={profileImage} alt="avatar" className="w-full h-full object-cover" />
                      : avatarLetter}
                  </div>
                  <div className="min-w-0">
                    {displayFullName && (
                      <p className="text-xs font-bold text-gray-900 truncate">{displayFullName}</p>
                    )}
                    <p className="text-[10px] text-gray-400 truncate">{profile.email}</p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => { setProfileOpen(false); router.push("/dashboard/settings?tab=profile"); }}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-400"><UserIcon /></span> My Profile
              </button>
              <button
                type="button"
                onClick={() => { setProfileOpen(false); router.push("/dashboard/settings"); }}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-400"><SettingsIcon /></span> Settings
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogoutIcon /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── Build API payload from wizard data ───────────────────────────────────── */
function buildPayload(data) {
  const { category, type, details = {}, price } = data;

  // Parse duration string (e.g. "2h" → { value: 2, unit: "hours" })
  const durationMap = {
    "30min": { value: 30, unit: "minutes" },
    "1h": { value: 1, unit: "hours" },
    "2h": { value: 2, unit: "hours" },
    "half_day": { value: 4, unit: "hours" },
    "full_day": { value: 8, unit: "hours" },
  };
  const duration = durationMap[details.duration] || { value: 0, unit: "hours" };

  const formatDateForApi = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const normalizeTimeToHHMM = (raw) => {
    if (!raw) return "";
    const s = String(raw).trim().toUpperCase();
    if (/^\d{2}:\d{2}$/.test(s)) return s;
    const hasAM = s.includes("AM");
    const hasPM = s.includes("PM");
    const digits = s.replace(/[^0-9:]/g, "");
    let h, m;
    if (digits.includes(":")) { [h, m] = digits.split(":").map(Number); }
    else if (digits.length <= 2) { h = Number(digits); m = 0; }
    else if (digits.length === 3) { h = Number(digits.slice(0, 1)); m = Number(digits.slice(1)); }
    else { h = Number(digits.slice(0, 2)); m = Number(digits.slice(2, 4)); }
    if (isNaN(h) || isNaN(m) || m < 0 || m > 59) return raw;
    if (hasAM) { if (h === 12) h = 0; } else if (hasPM) { if (h !== 12) h += 12; }
    if (h < 0 || h > 23) return raw;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const normalizeSlot = (slot) => {
    if (!slot || !slot.day || !slot.startTime || !slot.endTime) return null;
    const parsed = parseCalendarDate(slot.day);
    const isoDate = parsed ? formatDateForApi(parsed) : slot.day;
    return {
      date: isoDate,
      startTime: normalizeTimeToHHMM(slot.startTime),
      endTime: normalizeTimeToHHMM(slot.endTime),
      isAvailable: true,
    };
  };

  const buildRecurringAvailability = () => {
    const start = parseCalendarDate(details.recurringStartDate);
    const end = parseCalendarDate(details.recurringEndDate);
    if (!start || !end || start > end) return [];

    const recurringDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const availability = [];

    for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
      const dayName = recurringDays[current.getDay()];
      const date = formatDateForApi(current);
      const daySlots = details.recurringSlots?.[dayName] || [];

      daySlots.forEach((slot) => {
        if (slot && slot.startTime && slot.endTime && date) {
          availability.push({
            date,
            startTime: normalizeTimeToHHMM(slot.startTime),
            endTime: normalizeTimeToHHMM(slot.endTime),
            isAvailable: true,
          });
        }
      });
    }

    return availability;
  };

  const oneTimeAvailability = (details.slots || [])
    .map(normalizeSlot)
    .filter(Boolean);

  const recurringAvailability = buildRecurringAvailability();
  const availability =
    details.availabilityType === "recurring"
      ? (recurringAvailability.length > 0 ? recurringAvailability : oneTimeAvailability)
      : details.availabilityType === "one_time"
        ? oneTimeAvailability
        : (oneTimeAvailability.length > 0 ? oneTimeAvailability : recurringAvailability);

  const firstSlot = availability[0] || {};

  const categoryMap = { activities: "activity", places: "place", equipment: "equipment" };
  const normalizedCategory = categoryMap[category] ?? category ?? "";

  return {
    category: normalizedCategory,
    type: type || "",
    startTime: firstSlot.startTime || "",
    endTime: firstSlot.endTime || "",
    basicInformation: {
      activityTitle: details.title || "",
      location: details.location ||
        [details.placeCity, details.state, details.country]
          .filter(Boolean).join(", ") ||
        details.addressLine1 || "",
      description: details.description || "",
    },
    serviceDetails: {
      difficultyLevel: details.difficulty || "",
      duration,
      maxParticipants: details.maxParticipants || 1,
      instructorName: details.instructorName || "",
      cancellationPolicy: details.cancellationPolicy || "",
      whatsIncluded: details.included || [],
      // Use requirementsList array directly if available, else fallback to splitting the string
      requirements: (Array.isArray(details.requirementsList) && details.requirementsList.length > 0)
        ? details.requirementsList
        : (details.requirements
            ? details.requirements.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
            : []),
    },
    placeLocation: {
      addressLine1: details.addressLine1 || "",
      addressLine2: details.addressLine2 || "",
      city: details.placeCity || "",
      state: details.state || "",
      country: details.country || "",
      postalCode: details.postalCode || "",
      // latitude, longitude, googleMapsUrl not yet collected in form
      // latitude: 0,
      // longitude: 0,
      // googleMapsUrl: "",
    },
    photos: Array.isArray(details.photos)
      ? details.photos.filter((photo) =>
          typeof photo === "string" &&
          photo &&
          !photo.startsWith("blob:") &&
          !photo.startsWith("data:")
        )
      : [],
    availability,
    price: buildListingPricePayload(category, price),
  };
}

/* ─── Wizard ───────────────────────────────────────────────────────────────── */
export default function AddListingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const connectStatus = useSelector(selectConnectStatus);
  const connectStatusLoading = useSelector(selectConnectStatusLoading);
  const onboardLoading = useSelector(selectOnboardLoading);
  const [stripeCountry, setStripeCountry] = useState("US");
  const mode = searchParams.get("mode") ?? "resume";
  const isFreshCreate = mode === "new";
  const [step, setStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [data, setData] = useState({
    category: "",
    type: "",
    details: {},
    price: createEmptyPrice(),
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const [draftLoading, setDraftLoading] = useState(true);
  const [draftSaving, setDraftSaving] = useState(false);

  // On mount: fetch existing draft and resume from saved step
  useEffect(() => {
    const normalizeSlots = (slots) =>
      Array.isArray(slots)
        ? slots.map((slot) => (
            slot
              ? { ...slot, day: normalizeDateValue(slot.day) }
              : slot
          ))
        : slots;

    if (isFreshCreate) {
      const blank = {
        category: "",
        type: "",
        details: {},
        price: createEmptyPrice(),
      };
      pendingRef.current = blank;
      setData(blank);
      setDraftLoading(false);
      return;
    }

    async function loadDraft() {
      // Read locally-cached details/price — backend draft doesn't persist these fields
      let localDetails = {};
      let localPrice = createEmptyPrice();
      try {
        const raw = localStorage.getItem("listing_draft_local");
        if (raw) {
          const parsed = JSON.parse(raw);
          localDetails = parsed.details ?? {};
          if (localDetails.slots) {
            localDetails = { ...localDetails, slots: normalizeSlots(localDetails.slots) };
          }
          localPrice = normalizeListingPrice(parsed.category ?? "", parsed.price ?? createEmptyPrice(parsed.category ?? ""));
        }
      } catch { /* ignore */ }

      const result = await dispatch(fetchDraft());
      if (fetchDraft.fulfilled.match(result) && result.payload) {
        const res = result.payload;
        const draft = res.data?.draft || res.data || res;
        const loaded = {
          category: draft.category ?? "",
          type: draft.type ?? "",
          // Server doesn't return details — fall back to localStorage copy
          details: (draft.details && Object.keys(draft.details).length > 0)
            ? { ...draft.details, slots: normalizeSlots(draft.details.slots) }
            : localDetails,
          price: normalizeListingPrice(draft.category ?? "", draft.price ?? localPrice),
        };
        pendingRef.current = loaded;
        setData(loaded);
        if (draft.currentStep && draft.currentStep > 1) {
          setStep(draft.currentStep);
          setMaxStepReached(draft.currentStep);
        }
      }
      setDraftLoading(false);
    }
    loadDraft();
  }, [isFreshCreate, dispatch]);

  // Save draft after every step advance (fire-and-forget, no blocking UX)
  const saveDraftSilently = useCallback(async (nextStep, latestData) => {
    setDraftSaving(true);
    // Mirror details + price to localStorage since the backend draft doesn't persist them
    try {
      localStorage.setItem("listing_draft_local", JSON.stringify({
        category: latestData.category,
        details: latestData.details,
        price: latestData.price,
      }));
    } catch { /* ignore */ }
    await dispatch(saveDraft({
      currentStep: nextStep,
      category: latestData.category,
      type: latestData.type,
      details: latestData.details,
      price: latestData.price,
    }));
    setDraftSaving(false);
  }, [dispatch]);

  useEffect(() => {
    const main = document.querySelector("main");
    if (main) main.scrollTo({ top: 0, behavior: "instant" });
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  const next = useCallback((latestData) => {
    setStep(s => {
      const nextStep = Math.min(s + 1, 6);
      setMaxStepReached(prev => Math.max(prev, nextStep));
      saveDraftSilently(nextStep, latestData ?? data);
      return nextStep;
    });
  }, [data, saveDraftSilently]);

  const back = () => { setStep(s => Math.max(s - 1, 1)); };
  const jumpToStep = useCallback((targetStep) => {
    // Allow jumping to any step that has been reached or completed
    if (targetStep <= maxStepReached) {
      setStep(targetStep);
    } else {
      toast.error("Please complete the current step before moving forward.");
    }
  }, [maxStepReached]);

  // Refs mirror the latest values so saveDraft never captures stale state
  const pendingRef = React.useRef({ ...data });

  const update = (key, val) => {
    pendingRef.current = { ...pendingRef.current, [key]: val };
    setData(d => ({ ...d, [key]: val }));
  };

  const handleCategoryNext = () => next({ ...pendingRef.current });
  const handleTypeNext = () => next({ ...pendingRef.current });

  const handleDetailsChange = useCallback((val) => update("details", val), []);
  const handleDetailsNext = () => next({ ...pendingRef.current });

  const handlePriceChange = (val) => update("price", val);
  const handlePriceNext = () => next({ ...pendingRef.current });

  // Maps backend field names → form field keys used by StepDetails
  const BACKEND_TO_FORM_FIELD = {
    difficultyLevel: "difficulty",
    instructorName: "instructorName",
    cancellationPolicy: "cancellationPolicy",
    whatsIncluded: "whatsIncluded",
    duration: "duration",
    maxParticipants: "maxParticipants",
    activityTitle: "activityTitle",
    description: "description",
    addressLine1: "addressLine1",
    city: "placeCity",
    state: "state",
    country: "country",
    postalCode: "postalCode",
    startTime: "availability",
    endTime: "availability",
  };

  // Fields that live in StepDetails (step 3) vs StepReview/other steps
  const STEP3_FIELDS = new Set([
    "difficultyLevel", "instructorName", "cancellationPolicy", "whatsIncluded",
    "duration", "maxParticipants", "activityTitle", "description",
    "addressLine1", "city", "state", "country", "postalCode",
    "startTime", "endTime",
  ]);

  const handleSubmitListing = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors(null);
    const payload = buildPayload(data);

    try {
      // Always persist final state to draft first
      await dispatch(saveDraft({ currentStep: 5, ...data }));

      const result = await dispatch(createListing(payload));
      if (createListing.fulfilled.match(result)) {
        // Fire cleanup in background — don't block the success UX on it
        dispatch(deleteDraft());
        try { localStorage.removeItem("listing_draft_local"); } catch { /* ignore */ }
        toast.success("Listing created successfully!");
        setSubmitting(false);
        setStep(6);
        return;
      } else {
        const resData = result.payload;
        const errorMsg = typeof resData === "string" ? resData : resData?.message || "Failed to create listing. Please try again.";
        const backendErrors = resData?.errors || null;

        // Remap backend field names to form field keys
        const remappedErrors = backendErrors
          ? Object.fromEntries(
              Object.entries(backendErrors).map(([k, v]) => [BACKEND_TO_FORM_FIELD[k] ?? k, v])
            )
          : null;

        setSubmitError(errorMsg);
        setFieldErrors(remappedErrors);

        // Show toast with all error messages
        const errorLines = backendErrors ? Object.values(backendErrors) : [];
        toast.error(errorLines.length > 0 ? errorLines.join("\n") : errorMsg);

        // Navigate to step 3 if any error belongs to a StepDetails field
        const hasStep3Error = backendErrors && Object.keys(backendErrors).some(k => STEP3_FIELDS.has(k));
        if (hasStep3Error) {
          setStep(3);
        }
      }
    } catch (err) {
      console.error("Submit listing error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscard = async () => {
    await dispatch(deleteDraft());
    try { localStorage.removeItem("listing_draft_local"); } catch { /* ignore */ }
    router.push("/dashboard/listings");
  };

  const resetWizard = () => {
    try { localStorage.removeItem("listing_draft_local"); } catch { /* ignore */ }
    setStep(1);
    const blank = { category: "", type: "", details: {}, price: createEmptyPrice() };
    setData(blank);
    pendingRef.current = blank;
  };

  // Fetch Connect status once on mount so we can gate the wizard
  useEffect(() => {
    dispatch(fetchConnectStatus());
  }, [dispatch]);

  if (connectStatusLoading && !connectStatus) {
    return (
      <div className="flex flex-col bg-[#F3F4F6] min-h-full">
        <WizardNavbar />
        <BackSubHeader label="Add New Listing" router={router} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <SpinnerIcon size={32} color="var(--color-primary)" />
          <p className="text-sm font-medium text-gray-500">Checking payment setup…</p>
        </div>
      </div>
    );
  }

  // Block wizard if Stripe Connect is not ready
  if (connectStatus && !connectStatus.chargesEnabled) {
    const isIncomplete = connectStatus.hasAccount && !connectStatus.chargesEnabled;

    const handleGoToStripe = async () => {
      try {
        const payload = isIncomplete ? {} : { country: stripeCountry };
        const res = await dispatch(startConnectOnboarding(payload)).unwrap();
        const url = res?.data?.url ?? res?.url;
        if (url) {
          window.location.href = url;
        } else {
          toast.error("Could not start Stripe onboarding. Please try again.");
        }
      } catch (err) {
        toast.error(typeof err === "string" ? err : "Stripe onboarding failed. Please try again.");
      }
    };

    // Stripe-supported Connect countries
    const STRIPE_COUNTRIES = [
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

    return <StripeGateScreen
      isIncomplete={isIncomplete}
      connectStatus={connectStatus}
      stripeCountry={stripeCountry}
      setStripeCountry={setStripeCountry}
      onboardLoading={onboardLoading}
      onSubmit={handleGoToStripe}
      STRIPE_COUNTRIES={STRIPE_COUNTRIES}
    />;
  }

  if (draftLoading) {
    return (
      <div className="flex flex-col bg-[#F3F4F6] min-h-full">
        <WizardNavbar />
        <BackSubHeader label="Add New Listing" router={router} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <SpinnerIcon size={32} color="var(--color-primary)" />
          <p className="text-sm font-medium text-gray-500">Loading your draft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white min-h-full">
      {/* Full wizard navbar — desktop only */}
      <WizardNavbar step={step} onBack={back} router={router} />

      <div className="flex flex-col flex-1">
        {/* Header Section — Full Width */}
        <div className="px-4 sm:px-6 lg:px-8 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/listings")}
              className="text-[#212121] hover:opacity-70 transition-opacity shrink-0"
            >
              <ArrowLeftIcon size={22} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[var(--color-text)] leading-tight">
                Add New Listings
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Manage your account preferences and settings
              </p>
            </div>
            {/* Draft status indicator + discard */}
            {step < 6 && (
              <div className="flex items-center gap-3 shrink-0">
                {draftSaving ? (
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <SpinnerIcon size={10} />
                    Saving...
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 hidden sm:inline">Draft saved</span>
                )}
                <button
                  onClick={handleDiscard}
                  className="text-sm font-semibold text-white bg-red-400 hover:bg-red-500 rounded-full px-5 py-2 transition-colors shadow-sm"
                >
                  Discard
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stepper Section — Full Width */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50/30 border-b border-gray-50 shrink-0">
          <Stepper current={step} onStepClick={jumpToStep} />
        </div>

        {/* Step content Section — Full Width */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="w-full">
            {step === 1 &&
              <StepCategory
                selected={data.category}
                onSelect={v => update("category", v)}
                onNext={handleCategoryNext}
              />}
            {step === 2 &&
              <StepType
                category={data.category}
                selected={data.type}
                onSelect={v => update("type", v)}
                onNext={handleTypeNext}
                onBack={back}
              />}
            {step === 3 &&
              <StepDetails
                details={data.details}
                onChange={handleDetailsChange}
                onNext={handleDetailsNext}
                onBack={back}
                fieldErrors={fieldErrors}
              />}
            {step === 4 &&
              <StepPrice
                category={data.category}
                price={data.price}
                onChange={handlePriceChange}
                onNext={handlePriceNext}
                onBack={back}
              />}
            {step === 5 && (
              <StepReview
                data={data}
                onNext={handleSubmitListing}
                onBack={back}
                onBackToDetails={() => setStep(3)}
                submitting={submitting}
                submitError={submitError}
                fieldErrors={fieldErrors}
              />
            )}
            {step === 6 &&
              <StepSuccess
                onDone={() => router.push("/dashboard/listings?tab=active")}
                onAddMore={resetWizard}
              />}
          </div>
        </div>
      </div>
    </div>
  );
}
