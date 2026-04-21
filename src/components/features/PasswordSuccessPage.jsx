"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import AuthLayout from "@/components/layout/AuthLayout";
import celebrationImg from "@/assets/images/Celebration.jpg";

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function PasswordSuccessPage() {
  const router = useRouter();

  return (
    <AuthLayout showHero={false}>
      {/* Illustration */}
      <div className="mb-8 relative w-64 h-64 sm:w-72 sm:h-72 mx-auto">
        <Image
          src={celebrationImg}
          alt="Celebration"
          fill
          className="object-contain animate-bounce-subtle"
          priority
        />
      </div>

      <h1 className="text-3xl font-extrabold text-text mb-3 text-center">
        Congratulations !!!
      </h1>

      <p className="text-[#A1A1A1] text-base mb-10 leading-relaxed font-medium text-center">
        Great !! Your password has been changed successfully.
      </p>

      <Button
        variant="accent"
        size="lg"
        className="w-full min-h-[4rem] h-auto text-lg"
        showArrow={true}
        onClick={() => router.push("/login")}
      >
        Explore Now
      </Button>

      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </AuthLayout>
  );
}
