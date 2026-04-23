"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import heroImg from "@/assets/images/mmain-landing-img.svg";

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
  const [calYear, setCalYear] = useState(2024);
  const [calMonth, setCalMonth] = useState(0);
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
      {/* Hero image wrapper */}
      <div className="relative w-full h-[380px] sm:h-[480px] md:h-[560px] lg:h-[620px] overflow-hidden">
        <Image
          src={heroImg}
          alt="Hero background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />

        {/* Hero text */}
        <div className="relative z-10 h-full flex flex-col justify-center px-4 -translate-y-10">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-[#000000] mb-2 leading-tight ">
              All the fun, none of the commitment.
            </h1>
            <p className="text-sm sm:text-base text-[#000000]">
              Rent the fun. Leave the hassle.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar — half inside hero on md+; sits just below on mobile */}
      <div className="relative z-20 -mt-5 md:-mt-10 lg:-mt-12">
        <div ref={searchRef} className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl md:rounded-full shadow-xl p-3 md:px-4 md:py-4 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-1">
            {/* ── Where ──────────────────────────────────────────────────── */}
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
                <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
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

            <div className="hidden md:block w-px h-10 bg-gray-200 shrink-0" />
            <div className="block md:hidden h-px w-full bg-gray-100" />

            {/* ── Activity Type ───────────────────────────────────────────── */}
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
                <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                      <input autoFocus type="text" placeholder="Select Activity" className="flex-1 text-xs bg-transparent focus:outline-none text-gray-700" />
                    </div>
                  </div>
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

            <div className="hidden md:block w-px h-10 bg-gray-200 shrink-0" />
            <div className="block md:hidden h-px w-full bg-gray-100" />

            {/* ── From / Until ────────────────────────────────────────────── */}
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
                  <div className="fixed md:absolute inset-x-4 md:inset-x-auto bottom-4 md:bottom-auto md:top-full md:right-0 md:left-auto md:mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-4 md:w-[340px] lg:w-[520px]">
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

            <div className="hidden md:block w-px h-10 bg-gray-200 shrink-0" />

            {/* ── Search Button ───────────────────────────────────────────── */}
            <button
              onClick={() => console.log("Search", searchData)}
              className="w-full md:w-12 h-12 bg-[#4AA7A7] hover:bg-[#3d8f8f] text-white rounded-xl md:rounded-full flex items-center justify-center transition-colors md:ml-1 shrink-0"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="md:hidden ml-2 font-bold text-sm">Search</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
