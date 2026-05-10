'use client';

import React, { useState } from 'react';
import LandingNavbar from '../landing/LandingNavbar';
import ActivityHero from './ActivityHero';
import ActivityFilters from './ActivityFilters';
import ActivityCard from './ActivityCard';
import FAQSection from '../landing/FAQSection';
import AppFooter from '@/components/shared/AppFooter';

const MOCK_LISTINGS = [
  {
    id: '1',
    basicInformation: { activityTitle: 'Skydiving Adventure', location: 'Denver, Colorado' },
    placeLocation: { city: 'Denver' },
    serviceDetails: { duration: { value: 4, unit: 'hours' }, difficultyLevel: 'All Levels' },
    price: { perPerson: 280, currency: 'USD' },
    photos: ['https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=600&q=80'],
    rating: 4.8,
  },
  {
    id: '2',
    basicInformation: { activityTitle: 'Tandem Jump Experience', location: 'Colorado Springs' },
    placeLocation: { city: 'Colorado Springs' },
    serviceDetails: { duration: { value: 3, unit: 'hours' }, difficultyLevel: 'Beginner' },
    price: { perPerson: 199, currency: 'USD' },
    photos: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80'],
    rating: 4.6,
  },
  {
    id: '3',
    basicInformation: { activityTitle: 'High Altitude Freefall', location: 'Boulder, Colorado' },
    placeLocation: { city: 'Boulder' },
    serviceDetails: { duration: { value: 5, unit: 'hours' }, difficultyLevel: 'Intermediate' },
    price: { perPerson: 350, currency: 'USD' },
    photos: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80'],
    rating: 4.9,
  },
  {
    id: '4',
    basicInformation: { activityTitle: 'Sunset Skydive', location: 'Aurora, Colorado' },
    placeLocation: { city: 'Aurora' },
    serviceDetails: { duration: { value: 4, unit: 'hours' }, difficultyLevel: 'All Levels' },
    price: { perPerson: 320, currency: 'USD' },
    photos: ['https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=600&q=80'],
    rating: 4.7,
  },
  {
    id: '5',
    basicInformation: { activityTitle: 'Group Skydive Package', location: 'Aspen, Colorado' },
    placeLocation: { city: 'Aspen' },
    serviceDetails: { duration: { value: 6, unit: 'hours' }, difficultyLevel: 'All Levels' },
    price: { perPerson: 240, currency: 'USD' },
    photos: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80'],
    rating: 4.5,
  },
  {
    id: '6',
    basicInformation: { activityTitle: 'Indoor Skydiving Intro', location: 'Hawaii' },
    placeLocation: { city: 'Hawaii' },
    serviceDetails: { duration: { value: 2, unit: 'hours' }, difficultyLevel: 'Beginner' },
    price: { perPerson: 120, currency: 'USD' },
    photos: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80'],
    rating: 4.4,
  },
];

export default function ActivityListingPage({
  heroTitle,
  heroSubtitle,
  heroBackground,
  filters,
}) {
  const [activeFilter, setActiveFilter] = useState(filters?.[0]?.id || 'all');

  const filteredListings =
    activeFilter === 'all'
      ? MOCK_LISTINGS
      : MOCK_LISTINGS.filter((l) => l.category === activeFilter || l.type === activeFilter);

  const handleFilterChange = (id) => {
    setActiveFilter(id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <div className="relative">
          <LandingNavbar />
          <ActivityHero
            title={heroTitle}
            subtitle={heroSubtitle}
            backgroundImage={heroBackground}
          />
        </div>

        {filters && (
          <ActivityFilters
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        )}

        <section className="py-8 md:py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] xl:px-12 2xl:px-16">
            {filteredListings.length === 0 ? (
              <p className="text-center text-gray-400 py-10">No listings found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {filteredListings.map((listing) => (
                  <ActivityCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </section>

        <FAQSection />
      </main>
      <AppFooter />
    </div>
  );
}
