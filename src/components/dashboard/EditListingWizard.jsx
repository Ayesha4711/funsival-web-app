"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Country, State } from "country-state-city";
import StepCategory from "./listings/StepCategory";
import StepType from "./listings/StepType";
import StepDetails from "./listings/StepDetails";
import StepPrice from "./listings/StepPrice";
import StepReview from "./listings/StepReview";
import { useDispatch, useSelector } from "react-redux";
import { fetchListing, updateListing } from "@/store/slices/listingsSlice";
import { selectUser } from "@/store/slices/profileSlice";
import AppFooter from "@/components/shared/AppFooter";
import { buildListingPricePayload, createEmptyPrice, formatListingPrice, normalizeListingPrice } from "./listings/listingPrice";
import { normalizeDateValue } from "@/components/shared/dateUtils";
import axiosInstance from "@/store/axiosInstance";
import { resetStore } from "@/store/store";
import { getStoredFcmToken, useFCM } from "@/hooks/useFCM";
import { firebaseAuth } from "@/lib/firebase";
import logo from "@/assets/images/logo.svg";
import { SearchIcon, ChevronDownIcon, BellIcon, MessageIcon, CheckIcon, SpinnerIcon, ArrowLeftIcon, UserIcon, SettingsIcon, LogoutIcon } from "@/icons";
import { fetchConversations, selectTotalUnreadCount } from "@/store/slices/chatSlice";
import NotificationPopover from "@/components/shared/NotificationPopover";

/* ─── Wizard Navbar ────────────────────────────────────────────────────────── */
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
  const avatarLetter   = (displayFirstName[0] || displayLastName[0] || profile?.email?.[0] || "P").toUpperCase();
  const profileImage   = profile?.providerProfile?.profileImage ?? profile?.profileImage ?? null;
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
    <header className="h-16 bg-[#228E8A] flex items-center justify-between px-8 gap-4 shrink-0 sticky top-0 z-50">
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

/* ─── Step config ──────────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Category" },
  { id: 2, label: "Type" },
  { id: 3, label: "Details" },
  { id: 4, label: "Price" },
  { id: 5, label: "Review" },
];

/* ─── Stepper ──────────────────────────────────────────────────────────────── */
function Stepper({ current, onStepClick }) {
  return (
    <div className="flex items-center justify-between lg:justify-center w-full py-2 px-1">
      {STEPS.map((step, idx) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <React.Fragment key={step.id}>
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
                  active ? "text-[#FF7201]" : done ? "text-[var(--color-primary)]" : "text-[#465668]"
                ].join(" ")}
              >
                {step.label}
              </span>
            </button>
            {idx < STEPS.length - 1 &&
              <div
                className={[
                  "h-px mb-4 transition-colors",
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

/* ─── Reverse-map API response → wizard data ───────────────────────────────── */
function apiToWizardData(raw) {
  const durationReverseMap = {
    30: "30min",
    1: "1h",
    2: "2h",
    4: "half_day",
    8: "full_day",
  };

  const dur = raw.serviceDetails?.duration;
  let durationKey = "";
  if (dur) {
    const val = dur.unit === "minutes" ? dur.value / 60 : dur.value;
    durationKey = durationReverseMap[dur.unit === "minutes" ? dur.value : dur.value] ?? "";
    // map by value+unit directly
    if (dur.unit === "minutes" && dur.value === 30) durationKey = "30min";
    else if (dur.unit === "hours" && dur.value === 1) durationKey = "1h";
    else if (dur.unit === "hours" && dur.value === 2) durationKey = "2h";
    else if (dur.unit === "hours" && dur.value === 4) durationKey = "half_day";
    else if (dur.unit === "hours" && dur.value === 8) durationKey = "full_day";
    else durationKey = durationKey || "";
  }

  const requirements = Array.isArray(raw.serviceDetails?.requirements)
    ? raw.serviceDetails.requirements
    : [];

  const slots = Array.isArray(raw.availability) && raw.availability.length > 0
    ? raw.availability.map(s => ({ day: normalizeDateValue(s.date || s.day || ""), startTime: s.startTime || "", endTime: s.endTime || "" }))
    : [{ day: "", startTime: "", endTime: "" }];

  // Filter out blob URLs from photos (they won't work after refresh)
  const validPhotos = Array.isArray(raw.photos)
    ? raw.photos.filter(p => p && typeof p === "string" && !p.startsWith("blob:") && !p.startsWith("data:"))
    : [];

  // Convert country and state names to ISO codes for the dropdowns
  const countryName = raw.placeLocation?.country || "";
  const stateName = raw.placeLocation?.state || "";

  // Find country by name to get its ISO code
  const countryObj = Country.getAllCountries().find(
    c => c.name.toLowerCase() === countryName.toLowerCase()
  );
  const countryCode = countryObj?.isoCode || "";

  // Find state by name within the country to get its code
  let stateCode = "";
  if (countryCode && stateName) {
    const stateObj = State.getStatesOfCountry(countryCode).find(
      s => s.name.toLowerCase() === stateName.toLowerCase()
    );
    stateCode = stateObj?.isoCode || "";
  }

  const addressLine1 = raw.placeLocation?.addressLine1 || "";
  const derivedLocation = addressLine1
    ? [addressLine1, raw.placeLocation?.city, raw.placeLocation?.state, raw.placeLocation?.country].filter(Boolean).join(", ")
    : raw.basicInformation?.location || "";

  const details = {
    title: raw.basicInformation?.activityTitle || "",
    location: derivedLocation,
    description: raw.basicInformation?.description || "",
    difficulty: raw.serviceDetails?.difficultyLevel || "",
    duration: durationKey,
    maxParticipants: raw.serviceDetails?.maxParticipants || 1,
    instructorName: raw.serviceDetails?.instructorName || "",
    cancellationPolicy: raw.serviceDetails?.cancellationPolicy || "",
    included: Array.isArray(raw.serviceDetails?.whatsIncluded) ? raw.serviceDetails.whatsIncluded : [],
    requirements: requirements.join(", "),
    requirementsList: requirements,
    airConditioning: false,
    wifi: false,
    photos: validPhotos,
    slots,
    addressLine1: raw.placeLocation?.addressLine1 || "",
    addressLine2: raw.placeLocation?.addressLine2 || "",
    placeCity: raw.placeLocation?.city || "",
    state: stateName,
    stateCode: stateCode,
    country: countryName,
    countryCode: countryCode,
    postalCode: raw.placeLocation?.postalCode || "",
  };

  return {
    category: raw.category || "",
    type: raw.type || "",
    status: raw.status || "Active",
    details,
    price: normalizeListingPrice(raw.category || "", raw.price ?? createEmptyPrice(raw.category || "")),
  };
}

/* ─── Build API payload (same logic as AddListingWizard) ───────────────────── */
function buildPayload(data) {
  const { category, type, details = {}, price, status = "Active" } = data;

  const durationMap = {
    "30min": { value: 30, unit: "minutes" },
    "1h": { value: 1, unit: "hours" },
    "2h": { value: 2, unit: "hours" },
    "half_day": { value: 4, unit: "hours" },
    "full_day": { value: 8, unit: "hours" },
  };
  const duration = durationMap[details.duration] || { value: 0, unit: "hours" };

  const availability = (details.slots || [])
    .filter(slot => slot.day && slot.startTime && slot.endTime)
    .map((slot) => ({
      date: slot.day, // Mapping UI 'day' field to API 'date' field
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: true,
    }));

  const firstSlot = availability[0] || {};

  return {
    category: category || "",
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
    },
    photos: details.photos || [],
    availability,
    price: buildListingPricePayload(category, price),
    status,
  };
}

/* ─── Wizard ───────────────────────────────────────────────────────────────── */
export default function EditListingWizard({ listing, onClose, onSaved }) {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);

  const pendingRef = useRef(null);
  const scrollRef = useRef(null);

  // Fetch the full listing and seed wizard data
  useEffect(() => {
    async function load() {
      const result = await dispatch(fetchListing(listing.id));
      if (fetchListing.fulfilled.match(result)) {
        const res = result.payload;
        const raw = res?.data?.listing || res?.listing || res?.data || res;
        const wizardData = apiToWizardData(raw);
        pendingRef.current = wizardData;
        setData(wizardData);
      } else {
        toast.error("Failed to load listing details.");
        onClose();
      }
      setLoading(false);
    }
    load();
  }, [listing.id, onClose, dispatch]);

  // Escape key closes
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const update = useCallback((key, val) => {
    pendingRef.current = { ...pendingRef.current, [key]: val };
    setData(d => ({ ...d, [key]: val }));
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  const next = useCallback(() => { setStep(s => Math.min(s + 1, 5)); }, []);
  const back = useCallback(() => { setStep(s => Math.max(s - 1, 1)); }, []);
  const jumpToStep = useCallback((targetStep) => { setStep(targetStep); }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors(null);
    const payload = buildPayload(pendingRef.current);
    try {
      const result = await dispatch(updateListing({ listingId: listing.id, payload }));
      if (updateListing.fulfilled.match(result)) {
        const addr = payload.placeLocation;
        const builtLocation = addr?.addressLine1
          ? [addr.addressLine1, addr.city, addr.state, addr.country].filter(Boolean).join(", ")
          : payload.basicInformation.location || listing.location;
        const updated = {
          ...listing,
          name: payload.basicInformation.activityTitle || listing.name,
          location: builtLocation,
          category: payload.category || listing.category,
          price: formatListingPrice(payload.category || listing.category, payload.price),
          priceLabel: formatListingPrice(payload.category || listing.category, payload.price),
          status: payload.status || listing.status,
          slots: payload.availability,
        };
        toast.success("Listing updated successfully.");
        setSubmitting(false);
        onSaved(updated);
        onClose();
        return;
      } else {
        const resData = result.payload;
        setSubmitError(typeof resData === "string" ? resData : resData?.message || "Failed to update listing. Please try again.");
        setFieldErrors(resData?.errors || null);
        toast.error(typeof resData === "string" ? resData : resData?.message || "Failed to update listing. Please try again.");
      }
    } catch (err) {
      console.error("Update listing error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
        <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-3">
          <SpinnerIcon size={32} color="var(--color-primary)" />
          <p className="text-sm font-medium text-gray-500">Loading listing...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col"
    >
      <WizardNavbar />

      {/* Header + stepper */}
      <div className="bg-white shrink-0">
        <div className="border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-[#212121] hover:opacity-70 transition-opacity shrink-0"
            >
              <ArrowLeftIcon size={22} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[var(--color-text)] leading-tight">
                Edit Listing
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                {listing.name}
              </p>
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-100">
          <Stepper current={step} onStepClick={jumpToStep} />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="w-full">
          {step === 1 &&
            <StepCategory
              selected={data.category}
              onSelect={v => update("category", v)}
              onNext={next}
            />}
          {step === 2 &&
            <StepType
              category={data.category}
              selected={data.type}
              onSelect={v => update("type", v)}
              onNext={next}
              onBack={back}
            />}
          {step === 3 &&
            <StepDetails
              details={data.details}
              onChange={val => update("details", val)}
              onNext={next}
              onBack={back}
              fieldErrors={fieldErrors}
            />}
          {step === 4 &&
            <StepPrice
              category={data.category}
              price={data.price}
              onChange={val => update("price", val)}
              onNext={next}
              onBack={back}
            />}
          {step === 5 && (
            <StepReview
              data={data}
              onNext={handleSubmit}
              onBack={back}
              onBackToDetails={() => setStep(3)}
              submitting={submitting}
              submitError={submitError}
              fieldErrors={fieldErrors}
              submitLabel="Save Changes"
            />
          )}
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
