"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/logo.svg";
import balloonImg from "@/assets/images/BallonImg.svg";

/**
 * AuthLayout
 *
 * Shared shell for all authentication screens.
 *
 * Layout behaviour:
 *  - Mobile  (< md / < 768px) : header → form only, NO image
 *  - iPad    (md–lg / 768–1023px) : header → form → balloon image BELOW with text overlay
 *  - Laptop  (lg+ / 1024px+)  : header → [balloon LEFT (wider) | form RIGHT] side-by-side
 */
export default function AuthLayout({
  children,
  showHero = true,
  maxWidthClass = "max-w-[450px]",
}) {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* ── Teal header bar ─────────────────────────────────────────────────── */}
      <header className="bg-primary px-8 py-4 flex items-center shrink-0 z-10">
        <Link href="/">
          <Image
            src={logo}
            alt="Funsival Logo"
            width={140}
            height={40}
            className="h-10 w-auto object-contain"
          />
        </Link>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">
        {/* ── LEFT: balloon panel (lg+ only) ────────────────────────────────── */}
        {showHero &&
          <div className="hidden lg:block lg:w-1/2 xl:w-[55%] shrink-0 py-6 px-6 xl:pt-10 xl:pb-22 xl:px-5 sticky top-0 h-screen">
            <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl">
              <Image
                src={balloonImg}
                alt="Hot air balloon illustration"
                fill
                className="object-cover object-center"
                priority
                unoptimized
              />
              {/* Dark gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent rounded-[2.5rem]" />
              {/* Overlay text */}
              <div className="absolute bottom-18 left-8 right-8 text-white">
                <h2 className="text-3xl xl:text-4xl font-extrabold text-secondary leading-tight mb-3">
                  Get Yourself Registered
                </h2>
                <p className="text-sm xl:text-base text-white/80 leading-relaxed max-w-xs line-clamp-2">
                  Lorem ipsum dolor sit amet consectetur. Nisl at ac morbi
                  viverra nunc tristique elit eu.
                </p>
                {/* Dot indicators */}
                <div className="flex gap-2 mt-5">
                  <span className="w-6 h-2 rounded-full bg-secondary" />
                  <span className="w-2 h-2 rounded-full bg-white/50" />
                  <span className="w-2 h-2 rounded-full bg-white/50" />
                </div>
              </div>
            </div>
          </div>}

        {/* ── RIGHT: form area ──────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col lg:overflow-y-auto">
          {/* Form content — vertically centred */}
          <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
            <div className={`w-full ${maxWidthClass} py-8`}>
              {children}
            </div>
          </div>

          {/* ── BOTTOM: balloon panel (iPad md–lg only, hidden on mobile & desktop) */}
          {showHero &&
            <div className="hidden md:block lg:hidden px-6 pb-20 md:px-8 md:pb-24">
              <div className="relative w-full h-80 md:h-96 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <Image
                  src={balloonImg}
                  alt="Hot air balloon illustration"
                  fill
                  className="object-cover object-center"
                  unoptimized
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent rounded-[2.5rem]" />
                {/* Overlay text */}
                <div className="absolute bottom-10 left-7 right-7 text-white">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-secondary leading-tight mb-2">
                    Get Yourself Registered
                  </h2>
                  <p className="text-sm text-white/80 leading-relaxed max-w-xs line-clamp-2">
                    Lorem ipsum dolor sit amet consectetur. Nisl at ac morbi
                    viverra nunc tristique elit eu.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <span className="w-6 h-2 rounded-full bg-secondary" />
                    <span className="w-2 h-2 rounded-full bg-white/50" />
                    <span className="w-2 h-2 rounded-full bg-white/50" />
                  </div>
                </div>
              </div>
            </div>}
        </div>
      </div>
    </div>
  );
}
