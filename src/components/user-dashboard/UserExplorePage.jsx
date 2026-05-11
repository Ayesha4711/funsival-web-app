'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBrowseListings,
  selectActivities,
  selectActivitiesPagination,
  selectActivitiesStatus,
} from '@/store/slices/activitiesSlice';
import AppFooter from '@/components/shared/AppFooter';
import MapView from '@/components/user-dashboard/MapView';
import Pagination from '@/components/shared/Pagination';
import CustomCalendar from '@/components/shared/CustomCalendar';

/* ─── Tab → API category mapping ────────────────────────────────────────────── */
const TAB_TO_CATEGORY = {
  all: undefined,
  places: 'Place',
  equipment: 'Equipment',
  activities: 'Services',
};

/* ─── Tab Bar ────────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'all', label: 'All' },
  { id: 'places', label: 'Places' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'activities', label: 'Activities' },
];

/* ─── Sub Filters per tab ────────────────────────────────────────────────────── */
const PLACES_FILTERS = [
  { id: 'beach', label: 'Beach', emoji: '🏖️' },
  { id: 'mountain', label: 'Mountain', emoji: '⛰️' },
  { id: 'forest', label: 'Forest', emoji: '🌲' },
  { id: 'desert', label: 'Desert', emoji: '🏜️' },
  { id: 'lake', label: 'Lake', emoji: '🏞️' },
  { id: 'waterfall', label: 'Waterfall', emoji: '💧' },
  { id: 'cave', label: 'Cave', emoji: '🕳️' },
  { id: 'island', label: 'Island', emoji: '🏝️' },
];

const EQUIPMENT_FILTERS = [
  { id: 'bikes', label: 'Bikes', emoji: '🚴' },
  { id: 'kayak', label: 'Kayak', emoji: '🚣' },
  { id: 'camping_gear', label: 'Camping Gear', emoji: '⛺' },
  { id: 'diving_gear', label: 'Diving Gear', emoji: '🤿' },
  { id: 'surfboard', label: 'Surfboard', emoji: '🏄' },
  { id: 'skis', label: 'Skis', emoji: '⛷️' },
  { id: 'telescope', label: 'Telescope', emoji: '🔭' },
  { id: 'drone', label: 'Drone', emoji: '🚁' },
];

const ACTIVITIES_FILTERS = [
  { id: 'skydiving', label: 'Skydiving', emoji: '🪂' },
  { id: 'horse_riding', label: 'Horse riding', emoji: '🐴' },
  { id: 'scuba_diving', label: 'Scuba diving', emoji: '🤿' },
  { id: 'paragliding', label: 'Paragliding', emoji: '🪁' },
  { id: 'zipline', label: 'Zipline', emoji: '🚠' },
  { id: 'jeep_rally', label: 'Jeep Rally', emoji: '🗺️' },
  { id: 'hang_glider', label: 'Hang glider', emoji: '🤿' },
  { id: 'bungee', label: 'Bungee', emoji: '🎪' },
  { id: 'bowling', label: 'Bowling', emoji: '🎳' },
  { id: 'trampoline', label: 'Trampoline', emoji: '🎭' },
  { id: 'golf', label: 'Golf', emoji: '⛳' },
  { id: 'boating', label: 'Boating', emoji: '⛵' },
  { id: 'snowboarding', label: 'Snowboarding', emoji: '🏂' },
  { id: 'surfing', label: 'Surfing', emoji: '🏄' },
  { id: 'adventure_atvs', label: "Adventure ATV's", emoji: '🏍️' },
  { id: 'jetski', label: 'Jetski', emoji: '🚤' },
];

const SUB_FILTERS = {
  all: [...PLACES_FILTERS, ...EQUIPMENT_FILTERS, ...ACTIVITIES_FILTERS],
  places: PLACES_FILTERS,
  equipment: EQUIPMENT_FILTERS,
  activities: ACTIVITIES_FILTERS,
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
  const [wishlisted, setWishlisted] = useState(false);

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

  const rawType = listing.type || info.category || listing.categoryLabel;
  const categoryLabel = rawType
    ? rawType.charAt(0).toUpperCase() + rawType.slice(1).replace(/_/g, ' ')
    : category === 'places' ? 'Place' : category === 'equipment' ? 'Equipment' : 'Activity';

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
        {/* Wishlist toggle — top right */}
        <button
          onClick={e => { e.stopPropagation(); setWishlisted(w => !w); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow ${wishlisted ? 'bg-[#F5823A]' : 'bg-white/80 hover:bg-white'}`}
        >
          <svg className={`w-4 h-4 transition-colors ${wishlisted ? 'text-white fill-current' : 'text-[#F5823A] fill-none'}`} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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

/* ─── Filter Panel ───────────────────────────────────────────────────────────── */
const PLACES_CATEGORIES = ['Pools','Jacuzzi','Basketball Courts','Arcade','Pickleball Courts','Golf Course','Bowling Alleys','Ice Skating Rink','Ski Resort','Rock Climbing Gym','Trampoline Parks','Mini-Golf Courses'];
const EQUIPMENT_CATEGORIES = ['Bikes','Kayak','Camping Gear','Diving Gear','Surfboard','Skis','Telescope','Drone'];
const ACTIVITIES_CATEGORIES = ['Skydiving','Horse Riding','Scuba Diving','Paragliding','Zipline','Jeep Rally','Hang Glider','Bungee','Bowling','Trampoline','Golf','Boating'];

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];

function FilterPanel({ open, onClose, filters, onChange }) {
  const cityDropdownRef = useRef(null);
  const calendarRef = useRef(null);
  const [priceTab, setPriceTab] = useState('hourly');
  const [priceRange, setPriceRange] = useState(filters.priceRange || [0, 5000]);
  const [minInput, setMinInput] = useState(String(filters.priceRange?.[0] ?? 0));
  const [maxInput, setMaxInput] = useState(String(filters.priceRange?.[1] ?? 5000));
  const [city, setCity] = useState(filters.city || '');
  const [citySearch, setCitySearch] = useState(filters.city || '');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [sort, setSort] = useState(filters.sort || '');
  const [date, setDate] = useState(filters.date || '');
  const [showCalendar, setShowCalendar] = useState(false);
  const [categoryTab, setCategoryTab] = useState('places');
  const [selectedCategories, setSelectedCategories] = useState(filters.categories || []);
  const [rating, setRating] = useState(filters.rating || null);
  const [instantBook, setInstantBook] = useState(filters.instantBook || null);
  const [radius, setRadius] = useState(filters.radius || 1);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    city: true,
    availability: false,
    category: false,
    rating: false,
    instantBook: false
  });

  // Close city dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categoryOptions = categoryTab === 'places' ? PLACES_CATEGORIES : categoryTab === 'equipment' ? EQUIPMENT_CATEGORIES : ACTIVITIES_CATEGORIES;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const filteredCities = CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()));

  const selectCity = (selectedCity) => {
    setCity(selectedCity);
    setCitySearch(selectedCity);
    setShowCityDropdown(false);
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handleApply = () => {
    const min = Math.max(0, Number(minInput) || 0);
    const max = Math.max(min, Number(maxInput) || 5000);
    const finalRange = [min, max];
    setPriceRange(finalRange);
    onChange({ priceTab, priceRange: finalRange, city, sort, date, categories: selectedCategories, rating, instantBook, radius });
    onClose();
  };

  const handleReset = () => {
    setPriceTab('hourly'); setPriceRange([0, 5000]); setMinInput('0'); setMaxInput('5000');
    setCity(''); setCitySearch(''); setSort(''); setDate(''); setSelectedCategories([]); setRating(null); setInstantBook(null); setRadius(1);
    onChange({});
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#FEB538] shrink-0">
          <span className="text-base font-bold text-gray-900">Filters</span>
          <button onClick={onClose} className="text-gray-700 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

          {/* Price */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-900 text-sm">Price</span>
            </div>
            {/* Price type tabs */}
            <div className="flex rounded-full border border-gray-200 overflow-hidden mb-4 text-xs font-semibold">
              {['hourly','daily','per person'].map(t => (
                <button key={t} onClick={() => setPriceTab(t)}
                  className={`flex-1 py-2 transition-colors capitalize ${priceTab === t ? 'bg-[#FEB538] text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            {/* Range labels */}
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>$0</span><span>$5000</span>
            </div>
            {/* Dual range — simplified with two overlapping inputs */}
            <div className="relative h-5 mb-3">
              <input type="range" min={0} max={5000} value={priceRange[0]}
                onChange={e => { const v = Math.min(Number(e.target.value), priceRange[1] - 50); setPriceRange([v, priceRange[1]]); setMinInput(String(v)); }}
                className="absolute w-full h-1 appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:cursor-pointer pointer-events-none"
                style={{ pointerEvents: 'auto' }}
              />
              <input type="range" min={0} max={5000} value={priceRange[1]}
                onChange={e => { const v = Math.max(Number(e.target.value), priceRange[0] + 50); setPriceRange([priceRange[0], v]); setMaxInput(String(v)); }}
                className="absolute w-full h-1 appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              />
              {/* Track fill */}
              <div className="absolute top-1/2 -translate-y-1/2 h-1 w-full rounded-full bg-gray-200 -z-10" />
              <div className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-gray-900 -z-10"
                style={{ left: `${(priceRange[0]/5000)*100}%`, right: `${100-(priceRange[1]/5000)*100}%` }} />
            </div>
            {/* Min / Max inputs */}
            <div className="flex gap-3">
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 mb-1">Minimum</p>
                <div className="flex items-center border border-gray-200 rounded-full px-3 py-2 text-sm">
                  <span className="text-gray-400 mr-1">$</span>
                  <input type="number" value={minInput} onChange={e => { setMinInput(e.target.value); const v = Number(e.target.value); if (!isNaN(v) && v >= 0) setPriceRange([v, priceRange[1]]); }}
                    className="w-full focus:outline-none text-gray-900" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 mb-1">Maximum</p>
                <div className="flex items-center border border-gray-200 rounded-full px-3 py-2 text-sm">
                  <span className="text-gray-400 mr-1">$</span>
                  <input type="number" value={maxInput} onChange={e => { setMaxInput(e.target.value); const v = Number(e.target.value); if (!isNaN(v) && v >= 0) setPriceRange([priceRange[0], v]); }}
                    className="w-full focus:outline-none text-gray-900" />
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-gray-100" />

          {/* Location */}
          <section>
            <button onClick={() => toggleSection('city')} className="flex items-center justify-between mb-3 w-full">
              <span className="font-semibold text-gray-900 text-sm">Location</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.city ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            {expandedSections.city && (
              <div className="space-y-4">
                <div className="relative" ref={cityDropdownRef}>
                  <input
                    type="text"
                    placeholder="City or address"
                    value={citySearch}
                    onChange={e => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                    onFocus={() => setShowCityDropdown(true)}
                    className="w-full border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#4AA7A7]"
                  />
                  {showCityDropdown && filteredCities.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredCities.map(cityOption => (
                        <button
                          key={cityOption}
                          onClick={() => selectCity(cityOption)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700"
                        >
                          {cityOption}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Radius slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Radius</span>
                    <span className="text-sm font-semibold text-[#4AA7A7]">{radius} miles</span>
                  </div>
                  <div className="relative h-5">
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={radius}
                      onChange={e => setRadius(Number(e.target.value))}
                      className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 h-1 w-full rounded-full bg-gray-200 -z-10" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-gray-900 -z-10"
                      style={{ left: 0, right: `${100 - ((radius - 1) / 99) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          <div className="border-t border-gray-100" />

          {/* Availability */}
          <section>
            <button onClick={() => toggleSection('availability')} className="flex items-center justify-between mb-3 w-full">
              <span className="font-semibold text-gray-900 text-sm">Availability</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.availability ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            {expandedSections.availability && (
              <div className="relative" ref={calendarRef}>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#4AA7A7] flex items-center justify-between text-left"
                >
                  <span className={date ? 'text-gray-900' : 'text-gray-400'}>
                    {date ? formatDisplayDate(date) : 'dd/mm/yyyy'}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </button>
                {showCalendar && (
                  <div className="absolute z-[100] mt-2 left-0">
                    <CustomCalendar
                      value={date}
                      onChange={(newDate) => {
                        setDate(newDate);
                        setShowCalendar(false);
                      }}
                      onClose={() => setShowCalendar(false)}
                    />
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="border-t border-gray-100" />

          {/* Category */}
          <section>
            <button onClick={() => toggleSection('category')} className="flex items-center justify-between mb-3 w-full">
              <span className="font-semibold text-gray-900 text-sm">Category</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.category ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            {expandedSections.category && (<>
            {/* Category tabs */}
            <div className="flex gap-4 mb-3 border-b border-gray-100">
              {['places','equipment','activities'].map(t => (
                <button key={t} onClick={() => setCategoryTab(t)}
                  className={`pb-2 text-sm font-semibold capitalize transition-colors ${categoryTab === t ? 'text-[#4AA7A7] border-b-2 border-[#FEB538]' : 'text-gray-400 hover:text-gray-600'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {categoryOptions.map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)}
                    className="w-4 h-4 rounded border-gray-300 accent-[#4AA7A7] cursor-pointer" />
                  <span className="text-sm text-gray-700">{cat}</span>
                </label>
              ))}
            </div>
            </>)}
          </section>

          <div className="border-t border-gray-100" />

          {/* Rating */}
          <section>
            <button onClick={() => toggleSection('rating')} className="flex items-center justify-between mb-3 w-full">
              <span className="font-semibold text-gray-900 text-sm">Rating</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.rating ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            {expandedSections.rating && (
            <div className="space-y-2.5">
              {[5,4,3,null].map((r, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={rating === r} onChange={() => setRating(rating === r ? null : r)}
                    className="w-4 h-4 rounded border-gray-300 accent-[#4AA7A7] cursor-pointer" />
                  {r !== null ? (
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} className={`w-3.5 h-3.5 ${s <= r ? 'text-[#F5C842] fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-xs text-gray-500 ml-1">&amp; up</span>
                    </div>
                  ) : <span className="text-sm text-gray-700">Any rating</span>}
                </label>
              ))}
            </div>
            )}
          </section>

          <div className="border-t border-gray-100" />

          {/* Instant Book */}
          <section>
            <button onClick={() => toggleSection('instantBook')} className="flex items-center justify-between mb-3 w-full">
              <span className="font-semibold text-gray-900 text-sm">Instant Book</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.instantBook ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            {expandedSections.instantBook && (
            <div className="space-y-2.5">
              {[['any','Any'],['instant','Instant Book only'],['request','Request to book']].map(([val, label]) => (
                <label key={val} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={instantBook === val} onChange={() => setInstantBook(instantBook === val ? null : val)}
                    className="w-4 h-4 rounded border-gray-300 accent-[#4AA7A7] cursor-pointer" />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
            )}
          </section>

        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button onClick={handleReset}
            className="flex-1 py-3 rounded-full border border-[#FEB538] text-[#FEB538] text-sm font-semibold hover:bg-[#FEB538]/10 transition-colors">
            Reset Filter
          </button>
          <button onClick={handleApply}
            className="flex-1 py-3 rounded-full bg-[#4AA7A7] text-white text-sm font-semibold hover:bg-[#3d9090] transition-colors">
            Show Results
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
export default function UserExplorePage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const apiListings = useSelector(selectActivities);
  const listingsStatus = useSelector(selectActivitiesStatus);
  const pagination = useSelector(selectActivitiesPagination);

  const [activeTab, setActiveTab] = useState('all');
  const [activeSubFilter, setActiveSubFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const ITEMS_PER_PAGE = 10;
  const pillsScrollRef = useRef(null);

  const searchQuery = searchParams.get('search') || '';

  const scrollPills = (dir) => {
    if (pillsScrollRef.current) {
      pillsScrollRef.current.scrollBy({ left: dir * 240, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const category = TAB_TO_CATEGORY[activeTab];
    const { city, priceRange, sort, date, categories, rating, instantBook } = appliedFilters;
    const minPrice = priceRange?.[0] > 0 ? priceRange[0] : undefined;
    const maxPrice = priceRange?.[1] < 5000 ? priceRange[1] : undefined;

    // Build filter params
    const filterParams = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      category,
      search: searchQuery || undefined,
      city: city || undefined,
      minPrice,
      maxPrice,
      sort: sort || undefined,
    };

    // Add additional filters if present
    if (date) filterParams.date = date;
    if (categories && categories.length > 0) filterParams.type = categories.map(c => c.toLowerCase().replace(/\s+/g, '_')).join(',');
    if (rating != null) filterParams.rating = rating;
    if (instantBook && instantBook !== 'any') filterParams.instantBook = instantBook;

    dispatch(fetchBrowseListings(filterParams));
  }, [dispatch, currentPage, activeTab, appliedFilters, searchQuery]);

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

  const handleFiltersApply = (newFilters) => {
    setAppliedFilters(newFilters);
    setCurrentPage(1);
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
    <div className="flex flex-col flex-1 bg-[#F5F5F5]">

      {/* ── Main content: single white rounded card ── */}
      <main className="flex-1 flex flex-col w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm p-4 sm:p-6 lg:p-8">

          {/* ── Tabs row + View Toggles + Filter — inside the card ── */}
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
              {/* Single view toggle: shows "Map View" in grid mode, "Grid View" in map mode */}
              <button
                onClick={() => setViewMode(v => v === 'grid' ? 'map' : 'grid')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 border border-[#4AA7A7] text-[#4AA7A7] rounded-full text-sm font-medium hover:bg-[#4AA7A7] hover:text-white transition-colors whitespace-nowrap"
              >
                {viewMode === 'grid' ? 'Map View' : 'Grid View'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>

              {/* Filter icon button — always visible */}
              <button onClick={() => setFilterOpen(true)} className="flex items-center justify-center w-9 h-9 border border-[#4AA7A7] rounded-full text-[#4AA7A7] hover:bg-[#4AA7A7] hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Sub Filters — hidden on "All" tab ── */}
          {activeTab !== 'all' && (
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => scrollPills(-1)}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-[#228E8A] text-white hover:bg-[#1d7a77] transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div ref={pillsScrollRef} className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
                {subFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => handleSubFilterChange(filter.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                      activeSubFilter === filter.id
                        ? 'bg-[#228E8A] text-white border-[#228E8A]'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-[#228E8A] hover:text-[#228E8A]'
                    }`}
                  >
                    <span className="text-base leading-none">{filter.emoji}</span>
                    {filter.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => scrollPills(1)}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-[#228E8A] text-white hover:bg-[#1d7a77] transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* ── Grid / Map / States ── */}
          <div className="flex-1 flex flex-col">
          {viewMode === 'map' ? (
            <MapView listings={filteredListings} />
          ) : listingsStatus === 'loading' ? (
            <div className="flex-1 flex items-center justify-center py-24">
              <div className="w-8 h-8 border-4 border-[#4AA7A7] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : paginatedListings.length > 0 ? (
            <div className="flex flex-col flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {paginatedListings.map((listing) => (
                  <ListingCard key={listing._id || listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination — pushed to bottom */}
              <div className="flex-1" />
              {totalPages >= 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
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

        </div>
      </main>


      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={appliedFilters}
        onChange={handleFiltersApply}
      />

      <AppFooter />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
