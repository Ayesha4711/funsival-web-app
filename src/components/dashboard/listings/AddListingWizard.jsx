"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import logo from "@/assets/images/logo.svg";
import StepCategory from "./StepCategory";
import StepType from "./StepType";
import StepDetails from "./StepDetails";
import StepPrice from "./StepPrice";
import StepReview from "./StepReview";
import StepSuccess from "./StepSuccess";
import { createListing, saveDraft, getDraft, deleteDraft } from "@/lib/api";

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
function Stepper({ current }) {
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
            <div className="flex flex-col items-center shrink-0">
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
                  ? <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
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
            </div>

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

/* ─── Wizard navbar (desktop only — shown when sidebar/navbar are hidden) ───── */
function WizardNavbar() {
  return (
    <header className="hidden lg:flex h-16 bg-[var(--color-primary)] items-center px-8 gap-4 shrink-0 sticky top-0 z-20">
      {/* Logo */}
      <Image
        src={logo}
        alt="Funsival"
        width={120}
        height={36}
        className="h-9 w-auto object-contain shrink-0"
      />

      {/* Search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search here"
            className="w-full h-9 pl-10 pr-4 rounded-full bg-white text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="flex items-center gap-1 text-white text-sm font-medium">
          Provider
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
        <button className="text-white/90 hover:text-white p-1 relative">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[var(--color-secondary)] rounded-full text-[9px] flex items-center justify-center text-white font-bold border border-[var(--color-primary)]">
            3
          </span>
        </button>
        <button className="text-white/90 hover:text-white p-1">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
        <div className="w-9 h-9 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white font-bold text-sm border-2 border-white/30">
          P
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

  // Map availability slots to API format — filter out incomplete slots
  const availability = (details.slots || [])
    .filter(slot => slot.day && slot.startTime && slot.endTime)
    .map((slot) => ({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: true,
    }));

  return {
    category: category || "",
    type: type || "",
    basicInformation: {
      activityTitle: details.title || "",
      location: details.location || "",
      description: details.description || "",
    },
    serviceDetails: {
      difficultyLevel: details.difficulty || "",
      duration,
      maxParticipants: details.maxParticipants || 1,
      instructorName: details.instructorName || "",
      cancellationPolicy: details.cancellationPolicy || "",
      whatsIncluded: details.included || [],
      // Split comma/newline separated requirements string into an array
      requirements: details.requirements
        ? details.requirements.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
        : [],
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
    photos: details.photos || [],
    availability,
    price: {
      amount: Number(price) || 0,
      currency: "USD",
    },
  };
}

/* ─── Wizard ───────────────────────────────────────────────────────────────── */
export default function AddListingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    category: "",
    type: "",
    details: {},
    price: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const [draftLoading, setDraftLoading] = useState(true);
  const [draftSaving, setDraftSaving] = useState(false);

  // On mount: fetch existing draft and resume from saved step
  useEffect(() => {
    async function loadDraft() {
      const { ok, data: res } = await getDraft();
      if (ok && res) {
        // Data might be in res.data.draft or res.data
        const draft = res.data?.draft || res.data || res;
        const loaded = {
          category: draft.category ?? "",
          type: draft.type ?? "",
          details: draft.details ?? {},
          price: draft.price ?? "",
        };
        pendingRef.current = loaded;
        setData(loaded);
        if (draft.currentStep && draft.currentStep > 1) {
          setStep(draft.currentStep);
        }
      }
      setDraftLoading(false);
    }
    loadDraft();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save draft after every step advance (fire-and-forget, no blocking UX)
  const saveDraftSilently = useCallback(async (nextStep, latestData) => {
    setDraftSaving(true);
    await saveDraft({
      currentStep: nextStep,
      category: latestData.category,
      type: latestData.type,
      details: latestData.details,
      price: latestData.price,
    });
    setDraftSaving(false);
  }, []);

  const next = useCallback((latestData) => {
    setStep(s => {
      const nextStep = Math.min(s + 1, 6);
      saveDraftSilently(nextStep, latestData ?? data);
      return nextStep;
    });
  }, [data, saveDraftSilently]);

  const back = () => setStep(s => Math.max(s - 1, 1));

  // Refs mirror the latest values so saveDraft never captures stale state
  const pendingRef = React.useRef({ ...data });

  const update = (key, val) => {
    pendingRef.current = { ...pendingRef.current, [key]: val };
    setData(d => ({ ...d, [key]: val }));
  };

  const handleCategoryNext = () => next({ ...pendingRef.current });
  const handleTypeNext = () => next({ ...pendingRef.current });

  const handleDetailsChange = (val) => update("details", val);
  const handleDetailsNext = () => next({ ...pendingRef.current });

  const handlePriceChange = (val) => update("price", val);
  const handlePriceNext = () => next({ ...pendingRef.current });

  const handleSubmitListing = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors(null);
    const payload = buildPayload(data);
    const { ok, data: resData } = await createListing(payload);
    if (ok) {
      await deleteDraft();
      toast.success("Listing created successfully!");
      setStep(6);
    } else {
      const errorMsg = resData?.message || "Failed to create listing. Please try again.";
      setSubmitError(errorMsg);
      setFieldErrors(resData?.errors || null);
    }
    setSubmitting(false);
  };

  const handleDiscard = async () => {
    await deleteDraft();
    router.push("/dashboard/listings");
  };

  const resetWizard = () => {
    setStep(1);
    setData({
      category: "",
      type: "",
      details: {},
      price: ""
    });
    pendingRef.current = {
      category: "",
      type: "",
      details: {},
      price: ""
    };
  };

  if (draftLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/>
        </svg>
        <p className="text-sm font-medium text-gray-500">Loading your draft...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Full wizard navbar — desktop only */}
      <WizardNavbar step={step} onBack={back} router={router} />

      {/* Sub-header: back arrow + title + draft/discard — always pinned */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-10 py-3 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => step === 1 ? router.push("/dashboard/listings") : back()}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] transition-colors shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-base sm:text-lg font-bold text-[var(--color-text)] leading-tight">
              Add New Listings
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-400 hidden lg:block">
              Manage your account preferences and settings
            </p>
          </div>
          {/* Draft status indicator + discard */}
          {step < 6 && (
            <div className="flex items-center gap-3 shrink-0">
              {draftSaving ? (
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/></svg>
                  Saving draft...
                </span>
              ) : (
                <span className="text-[10px] text-gray-400 hidden sm:inline">Draft auto-saved</span>
              )}
              <button
                onClick={handleDiscard}
                className="text-[11px] font-semibold text-red-400 hover:text-red-500 border border-red-200 hover:border-red-300 rounded-full px-3 py-1 transition-colors"
              >
                Discard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stepper — pinned below sub-header */}
      <div className="shrink-0 px-2 sm:px-6 lg:px-10 pt-4 pb-2 bg-white border-b border-gray-50 z-20">
        <Stepper current={step} />
      </div>

      {/* Step content */}
      <div className="flex-1">
      <div className="px-4 sm:px-6 lg:px-10 py-4 relative z-0">
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
              onDone={() => router.push("/dashboard/listings")} 
              onAddMore={resetWizard}
            />}
        </div>
      </div>
      </div>
    </div>
  );
}
