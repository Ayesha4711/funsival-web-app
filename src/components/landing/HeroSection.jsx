"use client";

import React, { useState, useRef, useEffect } from "react";

const cities = [
  "Denver",
  "New York",
  "Los Angeles",
  "Hawaii",
  "Aurora",
  "Boulder",
  "Asper",
  "Pearl City"
];
const activities = [
  { name: "Sky Diving", icon: "🪂" },
  { name: "Jet Skiing", icon: "🚤" },
  { name: "Scuba Diving", icon: "🤿" },
  { name: "Jeep Rally", icon: "🚙" }
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function CalendarMonth({
  year,
  month,
  selectedStart,
  selectedEnd,
  onSelectDate,
  hovered,
  onHover
}) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const days = getDaysInMonth(year, month);
  let firstDay = getFirstDayOfMonth(year, month);
  firstDay = firstDay === 0 ? 6 : firstDay - 1;
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));

  return (
    <div className="flex-1 min-w-[220px]">
      <p className="text-center text-sm font-semibold text-gray-800 mb-3">
        {monthNames[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-0 mb-1">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d =>
          <div
            key={d}
            className="text-center text-[10px] text-gray-400 font-medium py-1"
          >
            {d}
          </div>
        )}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const ts = date.getTime();
          const isStart = selectedStart && selectedStart.getTime() === ts;
          const isEnd = selectedEnd && selectedEnd.getTime() === ts;
          const isToday = new Date().toDateString() === date.toDateString();
          const endOrHovered = selectedEnd || hovered;
          const inRange =
            selectedStart &&
            endOrHovered &&
            ts > selectedStart.getTime() &&
            ts < endOrHovered.getTime();
          return (
            <button
              key={i}
              onMouseEnter={() => onHover(date)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelectDate(date)}
              className={`text-[11px] h-8 w-full flex items-center justify-center rounded-full transition-colors
                ${isStart || isEnd ? "bg-[#4AA7A7] text-white font-bold" : ""}
                ${isToday && !isStart && !isEnd
                  ? "border border-[#4AA7A7] text-[#4AA7A7] font-semibold"
                  : ""}
                ${inRange ? "bg-[#4AA7A7]/15 text-[#4AA7A7]" : ""}
                ${!isStart && !isEnd && !inRange && !isToday
                  ? "text-gray-700 hover:bg-gray-100"
                  : ""}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function HeroSection() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchData, setSearchData] = useState({
    location: "",
    activity: "",
    from: "",
    unit: ""
  });
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
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

  return (
    <section className="relative w-full">
      {/* Hero image — height auto on mobile so content determines size, fixed on desktop */}
      <div className="relative w-full md:h-[560px] lg:h-[620px]">
        {/* Background image — absolute fills the whole container */}
        <picture className="absolute inset-0 w-full h-full">
          <source srcSet="/images/optimized/hero.webp" type="image/webp" />
          <img
            src="/images/optimized/hero.jpg"
            alt="Hero background"
            fetchPriority="high"
            decoding="sync"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </picture>
        <div className="absolute inset-0 bg-black/20" />

        {/* Mobile: stack btn + text + search card ON TOP of image */}
        <div className="relative z-10 md:hidden flex flex-col items-center pt-24 pb-6 px-4 gap-4">
          {/* Book Your Jump button */}
          <a href="/signup/role-selection">
            <button className="px-6 py-2.5 bg-[#FEB538] hover:bg-[#e09d2a] text-gray-900 font-semibold rounded-full text-sm transition-colors whitespace-nowrap">
              Book Your Jump
            </button>
          </a>

          {/* Hero text */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white leading-tight">
              All the fun, none of the commitment.
            </h1>
            <p className="text-sm text-white/90 mt-1">Find new fun. Leave the hassle.</p>
          </div>

          {/* Search card */}
          <div ref={searchRef} className="w-full bg-white rounded-2xl overflow-visible">
            {/* Where are you going? */}
            <div className="relative border-b border-gray-100">
              <button
                className={`w-full flex items-center gap-3 px-4 py-4 transition-all ${openDropdown === "city" ? "bg-gray-50" : ""}`}
                onClick={() => setOpenDropdown(openDropdown === "city" ? null : "city")}
              >
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className={`text-sm ${searchData.location ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                  {searchData.location || "Where are you going?"}
                </span>
              </button>
              {openDropdown === "city" && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input autoFocus type="text" placeholder="Select City" className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700"
                        value={searchData.location} onChange={e => setSearchData({ ...searchData, location: e.target.value })} />
                    </div>
                  </div>
                  <div className="py-1 max-h-52 overflow-y-auto">
                    {cities.filter(c => c.toLowerCase().includes(searchData.location.toLowerCase())).map(city => (
                      <button key={city} onClick={() => { setSearchData({ ...searchData, location: city }); setOpenDropdown(null); }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${searchData.location === city ? "bg-[#4AA7A7] text-white" : "text-gray-700 hover:bg-gray-50"}`}>
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
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35" />
                </svg>
                <span className={`text-sm ${searchData.activity ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                  {searchData.activity || "Activity type"}
                </span>
              </button>
              {openDropdown === "activity" && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="py-1">
                    {activities.map(act => (
                      <button key={act.name} onClick={() => { setSearchData({ ...searchData, activity: act.name }); setOpenDropdown(null); }}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${searchData.activity === act.name ? "bg-[#4AA7A7] text-white" : "text-gray-700 hover:bg-gray-50"}`}>
                        <span>{act.icon}</span><span>{act.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* From / Until side by side */}
            <div className="relative border-b border-gray-100">
              <button
                className={`w-full flex items-center gap-0 px-4 py-4 transition-all ${openDropdown === "date" ? "bg-gray-50" : ""}`}
                onClick={() => setOpenDropdown(openDropdown === "date" ? null : "date")}
              >
                <div className="flex items-center gap-3 flex-1">
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-sm ${selectedStart ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                    {selectedStart
                      ? `${String(selectedStart.getMonth()+1).padStart(2,"0")}/${String(selectedStart.getDate()).padStart(2,"0")}/${selectedStart.getFullYear()}`
                      : "From"}
                  </span>
                </div>
                <div className="w-px h-6 bg-gray-200 mx-3 shrink-0" />
                <div className="flex items-center gap-3 flex-1">
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-sm ${selectedEnd ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                    {selectedEnd
                      ? `${String(selectedEnd.getMonth()+1).padStart(2,"0")}/${String(selectedEnd.getDate()).padStart(2,"0")}/${selectedEnd.getFullYear()}`
                      : "Until"}
                  </span>
                </div>
              </button>
              {openDropdown === "date" && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-gray-100 z-50 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="flex gap-4 flex-1 justify-around">
                        <CalendarMonth year={calYear} month={calMonth} selectedStart={selectedStart} selectedEnd={selectedEnd}
                          onSelectDate={handleDateSelect} hovered={hovered} onHover={setHovered} />
                      </div>
                      <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
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
                onClick={() => console.log("Search", searchData)}
                className="w-full h-12 bg-[#4AA7A7] hover:bg-[#3d8f8f] text-white rounded-full flex items-center justify-center transition-colors font-semibold text-sm"
              >
                Search Adventures
              </button>
            </div>
          </div>{/* end mobile search card */}
        </div>{/* end mobile overlay stack */}

        {/* Desktop: text over image */}
        <div className="relative z-10 h-full hidden md:flex flex-col justify-center px-4 -translate-y-10">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-[#000000] mb-2 leading-tight">
              All the fun, none of the commitment.
            </h1>
            <p className="text-sm sm:text-base text-[#000000]">
              Find new fun. Leave the hassle.
            </p>
          </div>
        </div>
      </div>{/* end hero image wrapper */}

      {/* Desktop search bar — floats up over image bottom edge */}
      <div className="hidden md:block relative z-20 -mt-10 lg:-mt-12">
        <div ref={searchRef} className="relative max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="md:flex bg-white rounded-full px-4 py-4 items-center gap-1" style={{ boxShadow: "0px 4px 30px 0px #0000001A" }}>
            {/* ── Where ── */}
            <div className="flex-1 min-w-0 relative">
              <button
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${openDropdown === "city" ? "bg-gray-50 ring-2 ring-[#4AA7A7]" : ""}`}
                onClick={() => setOpenDropdown(openDropdown === "city" ? null : "city")}
              >
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-left min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium">Where?</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{searchData.location || "Add location, state"}</p>
                </div>
              </button>
              {openDropdown === "city" && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                      <input autoFocus type="text" placeholder="Select City" className="flex-1 text-xs bg-transparent focus:outline-none text-gray-700"
                        value={searchData.location} onChange={e => setSearchData({ ...searchData, location: e.target.value })} />
                    </div>
                  </div>
                  <div className="py-1 max-h-52 overflow-y-auto">
                    {cities.filter(c => c.toLowerCase().includes(searchData.location.toLowerCase())).map(city => (
                      <button key={city} onClick={() => { setSearchData({ ...searchData, location: city }); setOpenDropdown(null); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${searchData.location === city ? "bg-[#4AA7A7] text-white" : "text-gray-700 hover:bg-gray-50"}`}>
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
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="text-left min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium">Activity Type</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{searchData.activity || "Skydiving, jet skiing"}</p>
                </div>
              </button>
              {openDropdown === "activity" && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="py-1">
                    {activities.map(act => (
                      <button key={act.name} onClick={() => { setSearchData({ ...searchData, activity: act.name }); setOpenDropdown(null); }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${searchData.activity === act.name ? "bg-[#4AA7A7] text-white" : "text-gray-700 hover:bg-gray-50"}`}>
                        <span>{act.icon}</span><span>{act.name}</span>
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
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-medium">From</p>
                    <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                      {selectedStart
                        ? `${String(selectedStart.getMonth()+1).padStart(2,"0")}/${String(selectedStart.getDate()).padStart(2,"0")}/${selectedStart.getFullYear()}`
                        : <span className="text-gray-400 font-normal">01/01/2025</span>}
                    </p>
                  </div>
                  <span className="text-gray-300 text-xs shrink-0">—</span>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-medium">Until</p>
                    <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                      {selectedEnd
                        ? `${String(selectedEnd.getMonth()+1).padStart(2,"0")}/${String(selectedEnd.getDate()).padStart(2,"0")}/${selectedEnd.getFullYear()}`
                        : <span className="text-gray-400 font-normal">04/01/2025</span>}
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
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
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
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 gap-3">
                      <button onClick={() => { setSelectedStart(new Date()); setSelectedEnd(null); }} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Today</button>
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                        <span className="border border-gray-200 rounded-lg px-2 py-1.5">{selectedStart ? fmt(selectedStart) : "Jan 6, 2024"}</span>
                        <span className="text-gray-400">—</span>
                        <span className="border border-gray-200 rounded-lg px-2 py-1.5">{selectedEnd ? fmt(selectedEnd) : "Jan 12, 2024"}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="w-px h-10 bg-gray-200 shrink-0" />
            {/* ── Search Button ── */}
            <button
              onClick={() => console.log("Search", searchData)}
              className="w-12 h-12 bg-[#4AA7A7] hover:bg-[#3d8f8f] text-white rounded-full flex items-center justify-center transition-colors ml-1 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>{/* end desktop pill */}
        </div>{/* end searchRef wrapper */}
      </div>{/* end desktop search bar */}
    </section>
  );
}
