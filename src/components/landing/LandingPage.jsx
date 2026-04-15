'use client';

import React from 'react';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import BrowseByAdventure from './BrowseByAdventure';
import BrowseByDestination from './BrowseByDestination';
import PromotionalSections from './PromotionalSections';
import FAQSection from './FAQSection';
import NewsletterSection from './NewsletterSection';
import LandingFooter from './LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingNavbar />

      <main className="flex-1">
        <HeroSection />
        <BrowseByAdventure />
        <BrowseByDestination />
        <PromotionalSections />
        <FAQSection />
        <NewsletterSection />
      </main>

      <LandingFooter />
    </div>
  );
}
