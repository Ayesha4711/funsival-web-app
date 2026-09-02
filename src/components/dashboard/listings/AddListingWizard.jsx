"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import StepCategory from "./StepCategory";
import StepType from "./StepType";
import StepDetails from "./StepDetails";
import StepPrice from "./StepPrice";
import StepReview from "./StepReview";
import StepSuccess from "./StepSuccess";
import WizardNavbar from "./WizardNavbar";
import Stepper from "./Stepper";
import StripeGateScreen, { BackSubHeader } from "./StripeGateScreen";
import { useDispatch, useSelector } from "react-redux";
import { createListing, saveDraft, fetchDraft, deleteDraft } from "@/store/slices/listingsSlice";
import { createEmptyPrice, normalizeListingPrice } from "./listingPrice";
import { buildListingPayload } from "./listingWizardUtils";
import {
  fetchConnectStatus,
  startConnectOnboarding,
  selectConnectStatus,
  selectConnectStatusLoading,
  selectConnectStatusError,
  selectOnboardLoading,
} from "@/store/slices/paymentsSlice";
import { normalizeDateValue } from "@/components/shared/dateUtils";
import { ArrowLeftIcon, SpinnerIcon } from "@/icons";

/* ─── Step config ──────────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Category" },
  { id: 2, label: "Type" },
  { id: 3, label: "Details" },
  { id: 4, label: "Price" },
  { id: 5, label: "Review" },
  { id: 6, label: "Success" }
];

/* ─── Wizard ───────────────────────────────────────────────────────────────── */
export default function AddListingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const connectStatus = useSelector(selectConnectStatus);
  const connectStatusLoading = useSelector(selectConnectStatusLoading);
  const connectStatusError = useSelector(selectConnectStatusError);
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
  const didInitRef = React.useRef(false);

  // On mount: fetch existing draft and resume from saved step
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const normalizeSlots = (slots) =>
      Array.isArray(slots)
        ? slots.map((slot) => (
            slot
              ? { ...slot, day: normalizeDateValue(slot.day) }
              : slot
          ))
        : slots;

    if (isFreshCreate) {
      // Clear any previously abandoned draft so this explicit "new listing" click
      // starts blank, then drop ?mode=new from the URL — otherwise a refresh on
      // step 2+ would re-enter this branch and wipe out the draft we're about to save.
      dispatch(deleteDraft());
      try { localStorage.removeItem("listing_draft_local"); } catch { /* ignore */ }
      router.replace("/dashboard/listings/add");
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
      // Read locally-cached details/price — backend draft doesn't reliably persist these fields
      let localDetails = {};
      let localPrice = null;
      let hasLocalCache = false;
      try {
        const raw = localStorage.getItem("listing_draft_local");
        if (raw) {
          const parsed = JSON.parse(raw);
          hasLocalCache = true;
          localDetails = parsed.details ?? {};
          if (localDetails.slots) {
            localDetails = { ...localDetails, slots: normalizeSlots(localDetails.slots) };
          }
          if (parsed.price) {
            localPrice = normalizeListingPrice(parsed.category ?? "", parsed.price);
          }
        }
      } catch { /* ignore */ }

      const result = await dispatch(fetchDraft());
      if (fetchDraft.fulfilled.match(result) && result.payload) {
        const res = result.payload;
        const draft = res.data?.draft || res.data || res;
        // The server's draft.details/price are unreliable (may come back empty, partial,
        // or stale) — localStorage is written in full on every "Next" click, so prefer it
        // and only use server fields to fill in anything localStorage is missing (e.g.
        // a different browser/device with no local cache).
        const serverDetails = draft.details && typeof draft.details === "object" ? draft.details : {};
        const mergedDetails = hasLocalCache
          ? { ...serverDetails, ...localDetails }
          : serverDetails;
        const mergedPrice = localPrice
          ? { ...(draft.price ?? {}), ...localPrice }
          : draft.price;
        const loaded = {
          category: draft.category ?? "",
          type: draft.type ?? "",
          details: { ...mergedDetails, slots: normalizeSlots(mergedDetails.slots) },
          price: normalizeListingPrice(draft.category ?? "", mergedPrice ?? createEmptyPrice(draft.category ?? "")),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    parkingSpace: "parkingSpace",
    amenities: "amenities",
    minRentalTime: "minRentalTime",
    maxRentalTime: "maxRentalTime",
    brand: "brand",
    model: "model",
  };

  // Fields that live in StepDetails (step 3) vs StepReview/other steps
  const STEP3_FIELDS = new Set([
    "difficultyLevel", "instructorName", "cancellationPolicy", "whatsIncluded",
    "duration", "maxParticipants", "activityTitle", "description",
    "addressLine1", "city", "state", "country", "postalCode",
    "startTime", "endTime", "photos", "availability",
    "parkingSpace", "amenities", "minRentalTime", "maxRentalTime", "brand", "model",
  ]);

  const handleSubmitListing = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors(null);
    const payload = buildListingPayload(data);

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

  // Show spinner until we have a definitive answer
  if (connectStatusLoading) {
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

  // If the fetch errored (non-404 network/auth failure), block and offer retry
  if (connectStatusError && !connectStatus) {
    return (
      <div className="flex flex-col bg-[#F3F4F6] min-h-full">
        <WizardNavbar />
        <BackSubHeader label="Add New Listing" router={router} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Could not verify Stripe status</h2>
            <p className="text-sm text-gray-400 leading-relaxed">We couldn&apos;t check your payment account status. Please try again.</p>
            <button
              onClick={() => dispatch(fetchConnectStatus())}
              className="w-full py-3 rounded-full bg-secondary text-gray-900 font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Block wizard if Stripe Connect is not ready
  const stripeNotReady = connectStatus !== null && !connectStatus.chargesEnabled;
  if (stripeNotReady) {
    const isIncomplete = connectStatus?.hasAccount && !connectStatus?.chargesEnabled;

    const handleGoToStripe = async () => {
      try {
        const payload = isIncomplete ? {} : { country: stripeCountry };
        const res = await dispatch(startConnectOnboarding(payload)).unwrap();
        const url = res?.data?.url ?? res?.url;
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          toast.error("Could not start Stripe onboarding. Please try again.");
        }
      } catch (err) {
        toast.error(typeof err === "string" ? err : "Stripe onboarding failed. Please try again.");
      }
    };

    return <StripeGateScreen
      isIncomplete={isIncomplete}
      connectStatus={connectStatus}
      stripeCountry={stripeCountry}
      setStripeCountry={setStripeCountry}
      onboardLoading={onboardLoading}
      onSubmit={handleGoToStripe}
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
          <Stepper current={step} onStepClick={jumpToStep} steps={STEPS} />
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
                category={data.category}
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
