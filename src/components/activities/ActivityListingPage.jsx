'use client';

import React, { useState } from 'react';
import LandingNavbar from '../landing/LandingNavbar';
import ActivityHero from './ActivityHero';
import ActivityFilters from './ActivityFilters';
import ActivityCard from './ActivityCard';
import FAQSection from '../landing/FAQSection';
import NewsletterSection from '../landing/NewsletterSection';
import LandingFooter from '../landing/LandingFooter';
import Pagination from '@/components/shared/Pagination';

export default function ActivityListingPage({ heroTitle, heroSubtitle, heroBackground, filters, activities }) {
  const [activeFilter, setActiveFilter] = useState(filters[0]?.id || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredActivities = activeFilter === 'all'
    ? activities
    : activities.filter(a => a.category === activeFilter);

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (id) => { setActiveFilter(id); setCurrentPage(1); };
  const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        {/* Navbar overlays hero */}
        <div className="relative">
          <LandingNavbar />
          <ActivityHero title={heroTitle} subtitle={heroSubtitle} backgroundImage={heroBackground} />
        </div>

        {/* Filters */}
        <ActivityFilters filters={filters} activeFilter={activeFilter} onFilterChange={handleFilterChange} />

        {/* Cards grid */}
        <section className="py-8 md:py-12 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {paginatedActivities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
          </div>
        </section>

        <FAQSection />
        <NewsletterSection />
      </main>
      <LandingFooter />
    </div>
  );
}
