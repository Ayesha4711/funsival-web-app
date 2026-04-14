"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import logo from "@/assets/images/logo.svg";
import celebrationImg from "@/assets/images/Celebration.jpg";

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function AccountSuccessPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      {/* ── Navbar ── */}
      <header className="bg-[var(--color-primary)] px-8 py-4 flex items-center shrink-0">
        <Image src={logo} alt="Funsival Logo" width={140} height={40} className="h-10 w-auto object-contain" />
      </header>

      {/* ── Content Wrapper (Centered) ── */}
      <main className="flex flex-1 items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center">
          
          {/* Illustration */}
          <div className="mb-8 relative w-64 h-64 sm:w-80 sm:h-80">
            <Image
              src={celebrationImg}
              alt="Account Celebration"
              fill
              className="object-contain animate-bounce-subtle"
              priority
            />
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text)] mb-3">
            Congratulations !!!
          </h1>
          
          <p className="text-[var(--color-text-muted)] text-base sm:text-lg mb-10 leading-relaxed font-medium">
            Great !! your profile is successfully created <br className="hidden sm:block" />
            now you can explore places, equipments and services.
          </p>

          {/* Action Button */}
          <Button
            variant="accent"
            size="lg"
            className="w-full max-w-xs h-16 text-lg"
            showArrow={true}
            onClick={() => router.push("/login")}
          >
            Continue
          </Button>
        </div>
      </main>

      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
