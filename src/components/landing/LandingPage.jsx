"use client";

import React from "react";
import LandingNavbar from "./LandingNavbar";
import HeroSection from "./HeroSection";
import BrowseByAdventure from "./BrowseByAdventure";
import BrowseByDestination from "./BrowseByDestination";
import MobileAdventureSection from "./MobileAdventureSection";
// import PromotionalSections from "./PromotionalSections";
import FAQSection from "./FAQSection";
import AppFooter from "@/components/shared/AppFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        {/* Navbar overlays hero */}
        <div className="relative">
          <LandingNavbar />
          <HeroSection />
        </div>

        <BrowseByAdventure />
        <BrowseByDestination />
        <MobileAdventureSection />
        {/* <PromotionalSections /> */}
        <FAQSection />

      </main>

      <AppFooter />
    </div>
  );
}
