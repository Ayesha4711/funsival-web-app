'use client';

import React, { useState } from 'react';
import LandingNavbar from '../landing/LandingNavbar';
import ActivityHero from './ActivityHero';
import ActivityFilters from './ActivityFilters';
import ActivityCard from './ActivityCard';
import FAQSection from '../landing/FAQSection';
import NewsletterSection from '../landing/NewsletterSection';
import LandingFooter from '../landing/LandingFooter';

export default function ActivityListingPage({
  heroTitle,
  heroSubtitle,
  heroBackground,
  heroBackgroundColor,
  filters,
  activities
}) {
  const [activeFilter, setActiveFilter] = useState(filters[0]?.id || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter activities based on active filter
  const filteredActivities = activeFilter === 'all'
    ? activities
    : activities.filter(activity => activity.category === activeFilter);

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <ActivityHero
          title={heroTitle}
          subtitle={heroSubtitle}
          backgroundImage={heroBackground}
          backgroundColor={heroBackgroundColor}
        />

        {/* Filters */}
        <ActivityFilters
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />

        {/* Activities Grid */}
        <section className="py-8 md:py-12 lg:py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Results Count */}
            <div className="mb-6 md:mb-8">
              <p className="text-gray-600 text-sm md:text-base">
                Showing <span className="font-semibold">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredActivities.length)}</span> of{' '}
                <span className="font-semibold">{filteredActivities.length}</span> activities
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
              {paginatedActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            page === currentPage
                              ? 'bg-[#4AA7A7] text-white'
                              : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />

        {/* Newsletter Section */}
        <NewsletterSection />
      </main>

      <LandingFooter />
    </div>
  );
}
