'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBrowseListings,
  selectActivities,
  selectActivitiesPagination,
  selectActivitiesStatus,
} from '@/store/slices/activitiesSlice';
import AppFooter from '@/components/shared/AppFooter';
import NotificationPopover from '@/components/shared/NotificationPopover';
import MapView from '@/components/user-dashboard/MapView';
import Pagination from '@/components/shared/Pagination';

/* ─── Navbar Icons ───────────────────────────────────────────────────────────── */
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ─── Navbar ─────────────────────────────────────────────────────────────────── */
function ExploreNavbar() {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleBellClick = () => {
    if (window.innerWidth < 1024) {
      router.push('/user-dashboard/notifications');
    } else {
      setNotifOpen((v) => !v);
      setProfileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#4AA7A7]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <Link href="/user-dashboard/explore" className="flex items-center gap-2 shrink-0">
            <svg className="w-7 h-7 text-[#F5C842]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-xl font-bold text-white hidden sm:inline">funsival</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-4">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search here"
                className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* User label + chevron — desktop */}
            {/* <div className="hidden sm:flex items-center gap-1 text-white text-sm font-medium">
              User <ChevronDownIcon />
            </div> */}

             <div className="relative hidden sm:block">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 text-white text-sm font-medium hover:text-white/80 transition-colors"
          >
            User
            <ChevronDownIcon />
          </button>
          {dropdownOpen &&
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl py-1 z-50">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/dashboard");
                }}
                className="block w-full text-left px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-light)]"
              >
                Provider
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/user-dashboard/explore");
                }}
                className="block w-full text-left px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-light)]"
              >
                User
              </button>
            </div>}
        </div>

            {/* Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleBellClick}
                className="relative w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"
              >
                <BellIcon />
                <span className="absolute top-1 right-1 w-3 h-3 bg-[#F5C842] rounded-full text-[8px] flex items-center justify-center text-gray-900 font-bold border border-[#4AA7A7]">3</span>
              </button>
              {notifOpen && (
                <NotificationPopover viewAllHref="/user-dashboard/notifications" onClose={() => setNotifOpen(false)} />
              )}
            </div>

            {/* Messages */}
            <button
              onClick={() => router.push('/user-dashboard/messages')}
              className="w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"
              aria-label="Messages"
            >
              <MessageIcon />
            </button>

            {/* Avatar + Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
                className="w-9 h-9 rounded-full bg-[#F5C842] flex items-center justify-center text-gray-900 font-bold text-sm shrink-0 border-2 border-white/40 hover:border-white/70 transition-colors"
                aria-label="Profile menu"
              >
                U
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl py-1.5 z-50 border border-gray-100">
                  <button
                    onClick={() => { setProfileOpen(false); router.push('/user-dashboard/profile'); }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-500"><UserIcon /></span>
                    View Profile
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); router.push('/user-dashboard/settings'); }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-500"><SettingsIcon /></span>
                    Settings
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={() => { setProfileOpen(false); router.push('/login'); }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogoutIcon />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger (extra small screens) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown for xs screens */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-3 border-t border-white/20 flex flex-col gap-1 pb-4">
            <button onClick={() => { setMobileMenuOpen(false); router.push('/user-dashboard/notifications'); }}
              className="flex items-center gap-2 text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10">
              <BellIcon /> Notifications
            </button>
            <button onClick={() => { setMobileMenuOpen(false); router.push('/user-dashboard/messages'); }}
              className="flex items-center gap-2 text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10">
              <MessageIcon /> Messages
            </button>
            <button onClick={() => { setMobileMenuOpen(false); router.push('/user-dashboard/settings'); }}
              className="flex items-center gap-2 text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10">
              <SettingsIcon /> Settings
            </button>
            <button onClick={() => { setMobileMenuOpen(false); router.push('/login'); }}
              className="flex items-center gap-2 text-red-300 text-sm px-3 py-2 rounded-lg hover:bg-white/10">
              <LogoutIcon /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

/* ─── Tab Bar ────────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'all', label: 'All' },
  { id: 'places', label: 'Places' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'activities', label: 'Activities' },
];

/* ─── Sub Filters per tab ────────────────────────────────────────────────────── */
const SUB_FILTERS = {
  all: [],
  places: [
    { id: 'all', label: 'Pool' },
    { id: 'tennis', label: 'Tennis Court' },
    { id: 'basketball', label: 'Basketball Court' },
    { id: 'gym', label: 'Gym' },
    { id: 'golf', label: 'Golf Course' },
    { id: 'football', label: 'Football Court' },
    { id: 'padel', label: 'Padel Courts' },
  ],
  equipment: [
    { id: 'all', label: 'Scuba gear' },
    { id: 'bikes', label: 'Bikes' },
    { id: 'snowmobiles', label: 'Snowmobiles' },
    { id: 'boulder', label: 'Boulder / Mountain Bikes' },
    { id: 'kayak', label: 'Kayak' },
    { id: 'sup', label: 'Paddle Boards / SUP' },
  ],
  activities: [
    { id: 'all', label: 'Scuba Diving' },
    { id: 'swimming', label: 'Swimming' },
    { id: 'skydiving', label: 'Skydiving' },
    { id: 'rockclimbing', label: 'Rock Climbing' },
    { id: 'parasailing', label: 'Parasailing' },
    { id: 'snowshoeing', label: 'Snowshoeing' },
    { id: 'skydivecamps', label: 'Skydive Camps' },
  ],
};

/* ─── Star Rating ────────────────────────────────────────────────────────────── */
function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.floor(rating) ? 'text-[#F5C842] fill-current' : 'text-gray-300 fill-current'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Listing Card — matches design: image, title+tag row, rating, price pills, location ── */
function ListingCard({ listing }) {
  const router = useRouter();

  const id = listing._id || listing.id;
  const info = listing.basicInformation ?? {};
  const loc = listing.placeLocation ?? {};
  const category = listing.category ?? (listing.tab?.includes('places') ? 'places' : listing.tab?.includes('equipment') ? 'equipment' : 'activities');

  const title = info.activityTitle || info.equipmentName || info.placeName || listing.title || 'Listing';

  const images = listing.photos || info.images || listing.images || [];
  const image = (Array.isArray(images) && images.length > 0 ? images[0] : images) || listing.image || 'https://images.unsplash.com/photo-1572331165267-854da2b021cc?w=400&q=80';

  const locationStr = [loc.city, loc.state, loc.country].filter(Boolean).join(', ') || info.location || listing.location || '—';

  const priceObj = typeof listing.price === 'object' && listing.price !== null ? listing.price : null;

  const toNum = (v) => {
    const n = Number(v);
    return !isNaN(n) && isFinite(n) && n > 0 ? n : null;
  };

  const hourlyPrice = toNum(priceObj?.hourly ?? priceObj?.perHour ?? info.pricePerHour);
  const dailyPrice = toNum(priceObj?.daily ?? priceObj?.dailyRate ?? info.dailyRate);
  const perPersonPrice = toNum(priceObj?.perPerson ?? info.pricePerPerson);
  const fallbackPrice = toNum(priceObj?.amount) ?? (typeof listing.price === 'number' ? toNum(listing.price) : null);

  const rating = listing.rating ?? 4.4;
  const reviews = listing.reviewCount ?? listing.reviews ?? '21K';

  const categoryLabel = info.category || listing.categoryLabel || (
    category === 'places' ? 'Swimming' : category === 'equipment' ? 'Equipment' : 'Diving'
  );

  const navigateToListing = () => {
    router.push(`/user-dashboard/listing/${id}?type=${category}`);
  };

  return (
    <div
      onClick={navigateToListing}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300 group"
    >
      {/* Image */}
      <div className="relative h-48 sm:h-52 overflow-hidden rounded-2xl">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Favorite — top right, orange bg */}
        <button
          onClick={e => e.stopPropagation()}
          className="absolute top-3 right-3 w-8 h-8 bg-[#F5823A] hover:bg-[#e06d2a] rounded-full flex items-center justify-center transition-colors shadow"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-3 pt-3 pb-4 sm:px-4 sm:pt-3.5 sm:pb-4">
        {/* Title + category tag */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3 className="text-[15px] font-bold text-[#3DAA8A] leading-tight line-clamp-1">{title}</h3>
          <span className="shrink-0 text-[11px] font-medium text-[#F5823A] border border-[#F5823A] rounded-full px-2.5 py-0.5 whitespace-nowrap bg-white">
            {categoryLabel}
          </span>
        </div>

        {/* Rating row */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm font-semibold text-gray-800">{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
          <svg className="w-4 h-4 text-[#F5C842] fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs text-gray-400">({reviews} Reviews)</span>
        </div>

        {/* Price pills — full width single, half-width each when two */}
        {(() => {
          const hasHourly = hourlyPrice != null;
          const hasDaily = dailyPrice != null;
          const hasPerPerson = perPersonPrice != null;
          const hasFallback = !hasHourly && !hasDaily && !hasPerPerson && fallbackPrice != null;
          const twoCol = hasHourly && hasDaily;

          return (
            <div className={`flex gap-2 mb-3 ${twoCol ? '' : ''}`}>
              {hasHourly && (
                <div className={`flex items-center rounded-full border border-[#F5C842] overflow-hidden text-xs font-medium ${twoCol ? 'flex-1' : 'w-full'}`}>
                  <span className="px-3 py-1.5 text-gray-400 bg-[#FFF9EC] whitespace-nowrap">Hourly</span>
                  <span className="flex-1 text-right px-3 py-1.5 text-[#F5823A] font-bold bg-[#FFF9EC]">${hourlyPrice}</span>
                </div>
              )}
              {hasDaily && (
                <div className={`flex items-center rounded-full border border-[#4AA7A7] overflow-hidden text-xs font-medium ${twoCol ? 'flex-1' : 'w-full'}`}>
                  <span className="px-3 py-1.5 text-gray-400 bg-[#EDF8F8] whitespace-nowrap">Daily</span>
                  <span className="flex-1 text-right px-3 py-1.5 text-[#4AA7A7] font-bold bg-[#EDF8F8]">${dailyPrice}</span>
                </div>
              )}
              {hasPerPerson && !hasHourly && !hasDaily && (
                <div className="flex items-center rounded-full border border-[#F5C842] overflow-hidden text-xs font-medium w-full">
                  <span className="px-3 py-1.5 text-gray-400 bg-[#FFF9EC] whitespace-nowrap">Per Person</span>
                  <span className="flex-1 text-right px-3 py-1.5 text-[#F5823A] font-bold bg-[#FFF9EC]">${perPersonPrice}</span>
                </div>
              )}
              {hasFallback && (
                <div className="flex items-center rounded-full border border-[#F5C842] overflow-hidden text-xs font-medium w-full">
                  <span className="px-3 py-1.5 text-gray-400 bg-[#FFF9EC] whitespace-nowrap">From</span>
                  <span className="flex-1 text-right px-3 py-1.5 text-[#F5823A] font-bold bg-[#FFF9EC]">${fallbackPrice}</span>
                </div>
              )}
            </div>
          );
        })()}

        {/* Location — orange filled pin */}
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 shrink-0 text-[#F5823A] fill-current" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span className="text-xs text-gray-500">{locationStr}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
export default function UserExplorePage() {
  const dispatch = useDispatch();
  const apiListings = useSelector(selectActivities);
  const listingsStatus = useSelector(selectActivitiesStatus);
  const pagination = useSelector(selectActivitiesPagination);

  const [activeTab, setActiveTab] = useState('all');
  const [activeSubFilter, setActiveSubFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const category = activeTab === 'all' ? undefined : activeTab;
    dispatch(fetchBrowseListings({ page: currentPage, limit: ITEMS_PER_PAGE, category }));
  }, [dispatch, currentPage, activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setActiveSubFilter('all');
    setCurrentPage(1);
  };

  const handleSubFilterChange = (filterId) => {
    setActiveSubFilter(filterId);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // API already filters by category; apply sub-filter (type) client-side
  const allListings = apiListings || [];
  const filteredListings =
    activeSubFilter === 'all'
      ? allListings
      : allListings.filter((l) => l.type === activeSubFilter);

  const totalPages = pagination.totalPages || 1;
  // Pagination is server-side — show whatever the API returned
  const paginatedListings = filteredListings;

  const subFilters = SUB_FILTERS[activeTab] || [];

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5]">

      {/* ── Main content: single white rounded card ── */}
      <main className="flex-1 max-w-350 mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 lg:p-8">

          {/* ── Tabs row + Map View + Filter — inside the card ── */}
          <div className="flex items-center justify-between gap-2 mb-6">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide bg-[#F0FAFA] rounded-full p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-5 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Map / Grid View toggle */}
              <button
                onClick={() => setViewMode(v => v === 'grid' ? 'map' : 'grid')}
                className={`hidden sm:flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  viewMode === 'map'
                    ? 'border-[#4AA7A7] bg-[#4AA7A7] text-white'
                    : 'border-[#4AA7A7] text-[#4AA7A7] hover:bg-[#4AA7A7] hover:text-white'
                }`}
              >
                {viewMode === 'map' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Grid View
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Map View
                  </>
                )}
              </button>

              {/* Filter icon button */}
              <button className="flex items-center justify-center w-9 h-9 border border-[#4AA7A7] rounded-full text-[#4AA7A7] hover:bg-[#4AA7A7] hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Sub Filters ── */}
          {subFilters.length > 0 && (
            <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide">
              <button className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-[#4AA7A7] hover:text-[#4AA7A7] transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {subFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleSubFilterChange(filter.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                    activeSubFilter === filter.id
                      ? 'bg-[#4AA7A7] text-white border-[#4AA7A7]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#4AA7A7] hover:text-[#4AA7A7]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
              <button className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-[#4AA7A7] hover:text-[#4AA7A7] transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* ── Grid / Map / States ── */}
          {viewMode === 'map' ? (
            <MapView listings={filteredListings} />
          ) : listingsStatus === 'loading' ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-4 border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : paginatedListings.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {paginatedListings.map((listing) => (
                  <ListingCard key={listing._id || listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination — centered */}
              {totalPages >= 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-1">No listings found</p>
              <p className="text-sm text-gray-400">Try a different category or filter</p>
            </div>
          )}

        </div>
      </main>


      <AppFooter />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
