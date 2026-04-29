"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import logo from "@/assets/images/logo.svg";
import StepCategory from "./StepCategory";
import StepType from "./StepType";
import StepDetails from "./StepDetails";
import StepPrice from "./StepPrice";
import StepReview from "./StepReview";
import StepSuccess from "./StepSuccess";
import { useDispatch } from "react-redux";
import { createListing, saveDraft, fetchDraft, deleteDraft } from "@/store/slices/listingsSlice";
import { buildListingPricePayload, createEmptyPrice, normalizeListingPrice } from "./listingPrice";

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
      // latitude, longitude, googleMapsUrl not yet collected in form
      // latitude: 0,
      // longitude: 0,
      // googleMapsUrl: "",
    },
    photos: details.photos || [],
    availability,
    price: buildListingPricePayload(category, price),
  };
}

/* ─── Wizard ───────────────────────────────────────────────────────────────── */
export default function AddListingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
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
            ? draft.details
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

  const scrollToTop = () => {
    const main = document.querySelector("main");
    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = useCallback((latestData) => {
    setStep(s => {
      const nextStep = Math.min(s + 1, 6);
      setMaxStepReached(prev => Math.max(prev, nextStep));
      saveDraftSilently(nextStep, latestData ?? data);
      return nextStep;
    });
    scrollToTop();
  }, [data, saveDraftSilently]);

  const back = () => { setStep(s => Math.max(s - 1, 1)); scrollToTop(); };
  const jumpToStep = useCallback((targetStep) => {
    // Allow jumping to any step that has been reached or completed
    if (targetStep <= maxStepReached) {
      setStep(targetStep);
      scrollToTop();
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
        scrollToTop();
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
          scrollToTop();
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
    <div className="flex flex-col  bg-white ">
      {/* Full wizard navbar — desktop only */}
      <WizardNavbar step={step} onBack={back} router={router} />

      <div className="w-full flex flex-col">
        {/* Header Section — Full Width */}
        <div className="px-4 sm:px-6 lg:px-8 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/listings")}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 transition-all shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
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
                    <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/></svg>
                    Saving...
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 hidden sm:inline">Draft saved</span>
                )}
                <button
                  onClick={handleDiscard}
                  className="text-[11px] font-semibold text-red-400 hover:text-red-500 border border-red-100 hover:border-red-200 rounded-full px-3 py-1 transition-colors"
                >
                  Discard
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stepper Section — Full Width */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50/30 border-b border-gray-50">
          <Stepper current={step} onStepClick={jumpToStep} />
        </div>

        {/* Step content Section — Full Width */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
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
