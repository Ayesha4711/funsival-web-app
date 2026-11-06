"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapPinIcon, SearchIcon, SkierIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import CalendarMonth from "@/components/shared/CalendarMonth";
import HeroSlideshow from "./HeroSlideshow";
import {
  fetchBrowseDestinations,
  selectBrowseDestinations,
  setLandingSearch,
} from "@/store/slices/activitiesSlice";

const CATEGORY_OPTIONS = [
  { category: "place", label: "Places", icon: "🏝️" },
  { category: "activity", label: "Activities", icon: "🪂" },
  { category: "equipment", label: "Equipment", icon: "🎒" },
];

const SEARCH_LABEL_STYLE = {
  fontFamily: "var(--font-sofia-pro), 'Sofia Pro', sans-serif",
  fontWeight: 300,
  fontSize: "16px",
  lineHeight: "100%",
  letterSpacing: "0%",
  color: "#000000",
};
const SEARCH_SUBTEXT_STYLE = {
  fontFamily: "var(--font-sofia-pro), 'Sofia Pro', sans-serif",
  fontWeight: 300,
  fontSize: "16px",
  lineHeight: "100%",
  letterSpacing: "0%",
  color: "#ADADAD",
};

function toDateInput(d) {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function HeroSection() {
  const dispatch = useDispatch();
  const destinations = useSelector(selectBrowseDestinations);

  const [openDropdown, setOpenDropdown] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [activity, setActivity] = useState(null); // { category, label }
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const mobileSearchRef = useRef(null);
  const desktopSearchRef = useRef(null);

  useEffect(() => {
    dispatch(fetchBrowseDestinations({ limit: 50 }));
  }, [dispatch]);

  const cityOptions = React.useMemo(() => {
    const seen = new Set();
    const out = [];
    destinations.forEach((d) => {
      const label = [d.city, d.state].filter(Boolean).join(", ") || d.city;
      const key = label.toLowerCase();
      if (label && !seen.has(key)) {
        seen.add(key);
        out.push(label);
      }
    });
    return out;
  }, [destinations]);

  useEffect(() => {
    function handleClick(e) {
      const insideMobileSearch = mobileSearchRef.current?.contains(e.target);
      const insideDesktopSearch = desktopSearchRef.current?.contains(e.target);
      if (!insideMobileSearch && !insideDesktopSearch) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleDateSelect = date => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date);
      setSelectedEnd(null);
    } else {
      if (date < selectedStart) {
        setSelectedEnd(selectedStart);
        setSelectedStart(date);
      } else {
        setSelectedEnd(date);
      }
      setOpenDropdown(null);
    }
  };

  const fmt = d =>
    d
      ? `${[
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec"
        ][d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
      : "";

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(y => y + 1);
    } else setCalMonth(m => m + 1);
  };
  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(y => y - 1);
    } else setCalMonth(m => m - 1);
  };

  const secondMonth = calMonth === 11 ? 0 : calMonth + 1;
  const secondYear = calMonth === 11 ? calYear + 1 : calYear;

  const handleSearch = () => {
    if (selectedStart && selectedEnd && selectedEnd < selectedStart) return;

    const location = locationInput.trim();
    const category = activity?.category ?? null;
    const from = selectedStart ? toDateInput(selectedStart) : "";
    const until = selectedEnd ? toDateInput(selectedEnd) : "";

    dispatch(setLandingSearch({ location, category, from, until }));
    setOpenDropdown(null);

    // Stay on the landing page and scroll to whichever section can show
    // results for this search — Browse by Adventure only has activity-type
    // cards, so an Activities search (or no category at all) goes there;
    // otherwise a location search goes to Browse by Destination.
    const targetId =
      category === "activity" || (!category && !location)
        ? "browse-by-adventure"
        : location
          ? "browse-by-destination"
          : "browse-by-adventure";

    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <section className="hero-section relative w-full">
      {/* Hero image — height auto on mobile so content determines size, fixed on desktop */}
      <HeroSlideshow>

        {/* Mobile: stack btn + text + search card ON TOP of image */}
        <div className="hero-mobile-content relative z-10 md:hidden flex flex-col items-center pt-24 pb-20 px-4 gap-4">
          {/* Hero text */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white leading-tight">
              Find your next<br /><span>adventure.</span>
            </h1>
            <p className="text-sm text-white/90 mt-1">Discover and book unforgettable activities.</p>
          </div>

          {/* Search card */}
          <div ref={mobileSearchRef} className="w-full bg-white rounded-2xl overflow-visible">
            {/* Where are you going? */}
            <div className="relative border-b border-gray-100">
              <button
                className={`w-full flex items-center gap-3 px-4 py-4 transition-all ${openDropdown === "city" ? "bg-gray-50" : ""}`}
                onClick={() => setOpenDropdown(openDropdown === "city" ? null : "city")}
              >
                <MapPinIcon size={20} className="text-gray-400 shrink-0" />
                <span className="mobile-search-field-copy"><small>Where are you going?</small><b className={locationInput ? "" : "is-placeholder"}>{locationInput || "Choose a destination"}</b></span>
              </button>
              {openDropdown === "city" && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                      <MapPinIcon size={16} className="text-gray-400 shrink-0" />
                      <input autoFocus type="text" placeholder="Search city, state, country" className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700"
                        value={locationInput} onChange={e => setLocationInput(e.target.value)} />
                    </div>
                  </div>
                  <div className="py-1 max-h-52 overflow-y-auto">
                    {cityOptions.filter(c => c.toLowerCase().includes(locationInput.toLowerCase())).map(city => (
                      <button key={city} onClick={() => { setLocationInput(city); setOpenDropdown(null); }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${locationInput === city ? "bg-[#4AA7A7] text-white" : "text-gray-700 hover:bg-gray-50"}`}>
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Activity type */}
            <div className="relative border-b border-gray-100">
              <button
                className={`w-full flex items-center gap-3 px-4 py-4 transition-all ${openDropdown === "activity" ? "bg-gray-50" : ""}`}
                onClick={() => setOpenDropdown(openDropdown === "activity" ? null : "activity")}
              >
                <SearchIcon size={20} className="text-gray-400 shrink-0" />
                <span className="mobile-search-field-copy"><small>What do you want to do?</small><b className={activity?.label ? "" : "is-placeholder"}>{activity?.label || "Choose an activity"}</b></span>
              </button>
              {openDropdown === "activity" && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {CATEGORY_OPTIONS.map(t => (
                      <button key={t.category} onClick={() => { setActivity(t); setOpenDropdown(null); }}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${activity?.category === t.category ? "bg-[#4AA7A7] text-white" : "text-gray-700 hover:bg-gray-50"}`}>
                        <span>{t.icon}</span><span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* From / Until side by side */}
            <div className="relative border-b border-gray-100">
              <button
                className={`mobile-search-dates w-full flex items-center gap-0 px-4 py-4 transition-all ${openDropdown === "date" ? "bg-gray-50" : ""}`}
                onClick={() => setOpenDropdown(openDropdown === "date" ? null : "date")}
              >
                <span className="mobile-search-field-copy"><small>When</small><b className={selectedStart || selectedEnd ? "" : "is-placeholder"}>{selectedStart ? fmt(selectedStart) : "Add dates"}{selectedStart && selectedEnd ? ` – ${fmt(selectedEnd)}` : ""}</b></span>
              </button>
              {openDropdown === "date" && (
                <>
                  <div className="mobile-date-picker absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-gray-100 z-50 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon size={16} className="text-gray-500" />
                      </button>
                      <div className="flex gap-4 flex-1 justify-around">
                        <CalendarMonth year={calYear} month={calMonth} selectedStart={selectedStart} selectedEnd={selectedEnd}
                          onSelectDate={handleDateSelect} hovered={hovered} onHover={setHovered} />
                      </div>
                      <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
                        <ChevronRightIcon size={16} className="text-gray-500" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 gap-3">
                      <button onClick={() => { setSelectedStart(new Date()); setSelectedEnd(null); }} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Today</button>
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <span className="border border-gray-200 rounded-lg px-2 py-1.5">{selectedStart ? fmt(selectedStart) : "Start"}</span>
                        <span className="text-gray-400">—</span>
                        <span className="border border-gray-200 rounded-lg px-2 py-1.5">{selectedEnd ? fmt(selectedEnd) : "End"}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Search Adventures button */}
            <div className="p-3">
              <button
                onClick={handleSearch}
                className="w-full h-12 bg-[#4AA7A7] hover:bg-[#3d8f8f] text-white rounded-full flex items-center justify-center gap-2 transition-colors font-semibold text-sm"
              >
                <SearchIcon size={16} /> Search Adventures
              </button>
            </div>
          </div>{/* end mobile search card */}
          <div className="mobile-popular-search" aria-label="Popular searches">
            <b>Popular</b>
            {[["Jet Skiing", "jet-skiing"], ["Parasailing", "parasailing"], ["ATV Tours", "atv"], ["Skydiving", "skydiving"], ["Boat Rentals", "boat-rental"]].map(([label, type]) => <a key={type} href={`/activities/${encodeURIComponent(type)}`}>{label}</a>)}
          </div>
        </div>{/* end mobile overlay stack */}

        {/* Desktop: text over image */}
        <div className="hero-copy relative z-10 h-full hidden md:flex flex-col justify-center px-4 -translate-y-10">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <h1 className="hero-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-white mb-2 leading-tight">
              Find your next<br /> <span className="hero-title-highlight">adventure.</span>
            </h1>
            <p className="hero-subtitle text-sm sm:text-base text-white/90">
              Discover and book unforgettable activities and experiences near you or wherever you're headed. Local providers, real prices, instant booking.
            </p>
          </div>
        </div>
      </HeroSlideshow>

      {/* Desktop search bar — floats up over image bottom edge */}
      <div className="hero-desktop-search hidden md:block relative z-20 -mt-10 lg:-mt-12">
        <div ref={desktopSearchRef} className="relative max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="md:flex bg-white rounded-full px-4 py-4 items-center gap-1" style={{ boxShadow: "0px 4px 30px 0px #0000001A" }}>
            {/* ── Where ── */}
            <div className="flex-1 min-w-0 relative">
              <button
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${openDropdown === "city" ? "bg-gray-50 ring-2 ring-[#4AA7A7]" : ""}`}
                onClick={() => setOpenDropdown(openDropdown === "city" ? null : "city")}
              >
                <MapPinIcon size={20} className="text-gray-400 shrink-0" />
                <div className="text-left min-w-0">
                  <p style={SEARCH_LABEL_STYLE}>Where?</p>
                  <p style={SEARCH_SUBTEXT_STYLE} className="truncate">{locationInput || "City, address, state"}</p>
                </div>
              </button>
              {openDropdown === "city" && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                      <input autoFocus type="text" placeholder="Search city, state, country" className="flex-1 text-xs bg-transparent focus:outline-none text-gray-700"
                        value={locationInput} onChange={e => setLocationInput(e.target.value)} />
                    </div>
                  </div>
                  <div className="py-1 max-h-52 overflow-y-auto">
                    {cityOptions.filter(c => c.toLowerCase().includes(locationInput.toLowerCase())).map(city => (
                      <button key={city} onClick={() => { setLocationInput(city); setOpenDropdown(null); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${locationInput === city ? "bg-[#4AA7A7] text-white" : "text-gray-700 hover:bg-gray-50"}`}>
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="w-px h-10 bg-gray-200 shrink-0" />
            {/* ── Activity ── */}
            <div className="flex-1 min-w-0 relative">
              <button
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${openDropdown === "activity" ? "bg-gray-50 ring-2 ring-[#4AA7A7]" : ""}`}
                onClick={() => setOpenDropdown(openDropdown === "activity" ? null : "activity")}
              >
                <SkierIcon size={20} className="text-gray-800 shrink-0" />
                <div className="text-left min-w-0">
                  <p style={SEARCH_LABEL_STYLE}>Activity Type</p>
                  <p style={SEARCH_SUBTEXT_STYLE} className="truncate">{activity?.label || "Choose an activity"}</p>
                </div>
              </button>
              {openDropdown === "activity" && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {CATEGORY_OPTIONS.map(t => (
                      <button key={t.category} onClick={() => { setActivity(t); setOpenDropdown(null); }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${activity?.category === t.category ? "bg-[#4AA7A7] text-white" : "text-gray-700 hover:bg-gray-50"}`}>
                        <span>{t.icon}</span><span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="w-px h-10 bg-gray-200 shrink-0" />
            {/* ── Dates ── */}
            <div className="flex-1 min-w-0 relative">
              <button
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${openDropdown === "date" ? "bg-gray-50 ring-2 ring-[#4AA7A7]" : ""}`}
                onClick={() => setOpenDropdown(openDropdown === "date" ? null : "date")}
              >
                <CalendarIcon size={20} className="text-gray-800 shrink-0" />
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-left">
                    <p style={SEARCH_LABEL_STYLE}>From</p>
                    <p style={SEARCH_SUBTEXT_STYLE} className="whitespace-nowrap">
                      {selectedStart
                        ? `${String(selectedStart.getMonth()+1).padStart(2,"0")}/${String(selectedStart.getDate()).padStart(2,"0")}/${selectedStart.getFullYear()}`
                        : "Start date"}
                    </p>
                  </div>
                  <span className="text-gray-300 text-xs shrink-0">—</span>
                  <div className="text-left">
                    <p style={SEARCH_LABEL_STYLE}>Until</p>
                    <p style={SEARCH_SUBTEXT_STYLE} className="whitespace-nowrap">
                      {selectedEnd
                        ? `${String(selectedEnd.getMonth()+1).padStart(2,"0")}/${String(selectedEnd.getDate()).padStart(2,"0")}/${selectedEnd.getFullYear()}`
                        : "End date"}
                    </p>
                  </div>
                </div>
              </button>
              {openDropdown === "date" && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                  <div className="absolute top-full right-0 left-auto mt-2 bg-white rounded-2xl border border-gray-100 z-50 p-4 w-[340px] lg:w-[520px]">
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon size={16} className="text-gray-500" />
                      </button>
                      <div className="flex gap-4 lg:gap-8 flex-1 justify-around">
                        <CalendarMonth year={calYear} month={calMonth} selectedStart={selectedStart} selectedEnd={selectedEnd}
                          onSelectDate={handleDateSelect} hovered={hovered} onHover={setHovered} />
                        <div className="hidden lg:block">
                          <CalendarMonth year={secondYear} month={secondMonth} selectedStart={selectedStart} selectedEnd={selectedEnd}
                            onSelectDate={handleDateSelect} hovered={hovered} onHover={setHovered} />
                        </div>
                      </div>
                      <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
                        <ChevronRightIcon size={16} className="text-gray-500" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 gap-3">
                      <button onClick={() => { setSelectedStart(new Date()); setSelectedEnd(null); }} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Today</button>
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <span className="border border-gray-200 rounded-lg px-2 py-1.5">{selectedStart ? fmt(selectedStart) : "Start"}</span>
                        <span className="text-gray-400">—</span>
                        <span className="border border-gray-200 rounded-lg px-2 py-1.5">{selectedEnd ? fmt(selectedEnd) : "End"}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="w-px h-10 bg-gray-200 shrink-0" />
            {/* ── Search Button ── */}
            <button
              onClick={handleSearch}
              className="hero-search-button h-12 bg-[#4AA7A7] hover:bg-[#3d8f8f] text-white rounded-full flex items-center justify-center transition-colors ml-1 shrink-0"
            >
              <SearchIcon size={17} /> <span>Search Adventures</span>
            </button>
          </div>{/* end desktop pill */}
        </div>{/* end searchRef wrapper */}
        <div className="hero-popular-search" aria-label="Popular searches">
          <span>Popular</span>
          {[
            ["Jet Skiing", "jet-skiing"], ["Parasailing", "parasailing"],
            ["ATV Tours", "atv"], ["Skydiving", "skydiving"], ["Boat Rentals", "boat-rental"],
          ].map(([label, type]) => <a key={type} href={`/activities/${encodeURIComponent(type)}`}>{label}</a>)}
        </div>
      </div>{/* end desktop search bar */}
    </section>
  );
}
