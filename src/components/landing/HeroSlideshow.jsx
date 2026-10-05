"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";

const SLIDES = [
  { src: "/images/image.jpg", label: "Adventure outdoors" },
  { src: "/images/img.png", label: "Featured adventure 1" },
  { src: "/images/img4.png", label: "Featured adventure 2" },
  { src: "/images/img5.png", label: "Featured adventure 3" },
];

export default function HeroSlideshow({ children }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [focused, setFocused] = useState(false);

  const moveSlide = (direction) => {
    setActiveSlide((current) => (current + direction + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (paused || interacting || focused) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer;
    const updateTimer = () => {
      window.clearInterval(timer);
      if (!document.hidden && !reducedMotion.matches) {
        timer = window.setInterval(() => {
          setActiveSlide((current) => (current + 1) % SLIDES.length);
        }, 5000);
      }
    };

    updateTimer();
    document.addEventListener("visibilitychange", updateTimer);
    reducedMotion.addEventListener("change", updateTimer);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", updateTimer);
      reducedMotion.removeEventListener("change", updateTimer);
    };
  }, [paused, interacting, focused, activeSlide]);

  return (
    <div
      className="relative w-full md:h-[560px] lg:h-[620px]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured adventures"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      {SLIDES.map((slide, index) => (
        <div
          key={slide.src}
          aria-hidden={index !== activeSlide}
          className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${index === activeSlide ? "opacity-100" : "opacity-0"}`}
        >
          <Image
            src={slide.src}
            alt={slide.label}
            fill
            sizes="100vw"
            preload={index === 0}
            className="object-cover object-center"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-black/10" />

      {children}

      <div
        className="absolute bottom-3 md:bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-white backdrop-blur-sm"
        role="group"
        aria-label="Slideshow controls"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            moveSlide(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        <button type="button" onClick={() => moveSlide(-1)} aria-label="Previous slide" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white">
          <ChevronLeftIcon size={20} />
        </button>
        {SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActiveSlide(index)}
            aria-label={`Show slide ${index + 1}: ${slide.label}`}
            aria-current={index === activeSlide ? "true" : undefined}
            className="flex h-10 w-7 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-white"
          >
            <span className={`h-2 rounded-full transition-all motion-reduce:transition-none ${index === activeSlide ? "w-5 bg-[#FEB538]" : "w-2 bg-white/70"}`} />
          </button>
        ))}
        <button type="button" onClick={() => moveSlide(1)} aria-label="Next slide" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white">
          <ChevronRightIcon size={20} />
        </button>
        <button type="button" onClick={() => setPaused((current) => !current)} aria-label={paused ? "Play slideshow" : "Pause slideshow"} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white">
          <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
        </button>
      </div>
    </div>
  );
}
