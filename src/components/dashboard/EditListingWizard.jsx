"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import StepCategory from "./listings/StepCategory";
import StepType from "./listings/StepType";
import StepDetails from "./listings/StepDetails";
import StepPrice from "./listings/StepPrice";
import StepReview from "./listings/StepReview";
import WizardNavbar from "./listings/WizardNavbar";
import Stepper from "./listings/Stepper";
import { useDispatch } from "react-redux";
import { fetchListing, updateListing } from "@/store/slices/listingsSlice";
import AppFooter from "@/components/shared/AppFooter";
import { formatListingPrice } from "./listings/listingPrice";
import { apiToWizardData, buildListingPayload } from "./listings/listingWizardUtils";
import { SpinnerIcon, ArrowLeftIcon } from "@/icons";

/* ─── Wizard ───────────────────────────────────────────────────────────────── */
export default function EditListingWizard({ listing, onClose, onSaved, initialStep, onStepChange }) {
  const dispatch = useDispatch();
  // Category (1) and Type (2) determine which fields the rest of the wizard
  // renders, so an already-published listing can't have them changed —
  // only a draft (still being created for the first time) may edit them.
  // Published listings still start at step 1, but those two steps render
  // read-only (see StepCategory/StepType `readOnly` prop below).
  const isDraft = listing.status?.toLowerCase() === "draft";
  const [step, setStep] = useState(initialStep && initialStep >= 1 && initialStep <= 5 ? initialStep : 1);
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
    onStepChange?.(step);
  }, [step, onStepChange]);

  const next = useCallback(() => { setStep(s => Math.min(s + 1, 5)); }, []);
  const back = useCallback(() => { setStep(s => Math.max(s - 1, 1)); }, []);
  const jumpToStep = useCallback((targetStep) => { setStep(targetStep); }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setFieldErrors(null);
    const payload = buildListingPayload(pendingRef.current);
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
              readOnly={!isDraft}
            />}
          {step === 2 &&
            <StepType
              category={data.category}
              selected={data.type}
              onSelect={v => update("type", v)}
              onNext={next}
              onBack={back}
              readOnly={!isDraft}
            />}
          {step === 3 &&
            <StepDetails
              category={data.category}
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
