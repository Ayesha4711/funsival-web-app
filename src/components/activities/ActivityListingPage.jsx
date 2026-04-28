'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBrowseListings } from '@/store/slices/activitiesSlice';
import {
  selectActivities,
  selectActivitiesPagination,
  selectActivitiesStatus,
  selectActivitiesError,
} from '@/store/slices/activitiesSlice';
import LandingNavbar from '../landing/LandingNavbar';
import ActivityHero from './ActivityHero';
import ActivityFilters from './ActivityFilters';
import ActivityCard from './ActivityCard';
import FAQSection from '../landing/FAQSection';
import NewsletterSection from '../landing/NewsletterSection';
import LandingFooter from '../landing/LandingFooter';
import Pagination from '@/components/shared/Pagination';

export default function ActivityListingPage({
  heroTitle,
  heroSubtitle,
  heroBackground,
  filters,
  category,
  type,
}) {
  const dispatch = useDispatch();
  const listings = useSelector(selectActivities);
  const pagination = useSelector(selectActivitiesPagination);
  const status = useSelector(selectActivitiesStatus);
  const error = useSelector(selectActivitiesError);

  const [activeFilter, setActiveFilter] = useState(filters?.[0]?.id || 'all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchBrowseListings({ page: currentPage, limit: 12, category, type }));
  }, [dispatch, currentPage, category, type]);

  const filteredListings =
    activeFilter === 'all'
      ? listings
      : listings.filter(
          (l) =>
            l.category === activeFilter ||
            l.type === activeFilter
        );

  const handleFilterChange = (id) => {
    setActiveFilter(id);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {status === 'loading' && (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {status === 'failed' && (
              <p className="text-center text-red-500 py-10">{error}</p>
            )}

            {status === 'succeeded' && filteredListings.length === 0 && (
              <p className="text-center text-gray-400 py-10">No listings found.</p>
            )}

            {status === 'succeeded' && filteredListings.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                  {filteredListings.map((listing) => (
                    <ActivityCard key={listing.id} listing={listing} />
                  ))}
                </div>
                {pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
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
