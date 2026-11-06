"use client";

import React from "react";
import LandingNavbar from "./LandingNavbar";
import HeroSection from "./HeroSection";
import BrowseByAdventure from "./BrowseByAdventure";
import PopularAdventures from "./PopularAdventures";
import WhyFunsivalSection from "./WhyFunsivalSection";
import LandingStorySections, { ReadyAdventureBanner } from "./LandingStorySections";
// import PromotionalSections from "./PromotionalSections";
import FAQSection from "./FAQSection";
import { LANDING_FAQS } from "./landingFaqs";
import LandingFooter from "./LandingFooter";

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        {/* Navbar overlays hero */}
        <div className="relative">
          <LandingNavbar />
          <HeroSection />
        </div>

        <PopularAdventures />
        <BrowseByAdventure />
        <section className="landing-statement">
          <img className="landing-statement-circle landing-statement-circle-left" src="/images/landing-statement-left-ring.svg" alt="" aria-hidden="true" />
          <p>Funsival connects people looking for their next <em>adventure</em> with <em>local providers</em> offering activities, places and equipment.</p>
          <img className="landing-statement-circle landing-statement-circle-right" src="/images/landing-statement-right-ring.svg" alt="" aria-hidden="true" />
        </section>
        <WhyFunsivalSection />
        <LandingStorySections />
        {/* <PromotionalSections /> */}
        <FAQSection items={LANDING_FAQS} />
        <ReadyAdventureBanner />
      </main>

      <LandingFooter />
    </div>
  );
}
