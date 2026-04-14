"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import AuthLayout from "@/components/layout/AuthLayout";
import hostIllustration from "@/assets/icons/Host.jpg";
import userIllustration from "@/assets/icons/User.jpg";

/* ─── Icons ────────────────────────────────────────────────────────────────── */
const CheckIcon = () =>
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>;

/* ─── Role Card Component ──────────────────────────────────────────────────── */
const RoleCard = ({ type, title, illustration, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(type)}
      className={`relative flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-300 cursor-pointer w-full h-[220px] sm:h-[260px]
        ${isSelected
          ? "bg-[#FFF5D9] border-secondary shadow-sm"
          : "bg-white border-[#E0E0E0] hover:border-primary-light"}`}
    >
      {/* Checkmark indicator */}
      {isSelected &&
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-secondary flex items-center justify-center animate-in zoom-in-50 duration-300">
          <CheckIcon />
        </div>}

      {/* Illustration */}
      <div className="relative w-full h-3/5 mb-4">
        <Image src={illustration} alt={title} fill className="object-contain" />
      </div>

      {/* Title */}
      <span
        className={`text-2xl font-bold ${isSelected
          ? "text-gray-400"
          : "text-secondary"}`}
      >
        {title}
      </span>
    </div>
  );
};

/* ─── Main Page Component ───────────────────────────────────────────────────── */
export default function AccountTypeSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("host");

  return (
    <AuthLayout maxWidthClass="max-w-2xl">
      {/* Heading */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-text mb-3">
          Create Your Account
        </h1>
        <p className="text-[#A1A1A1] text-base leading-relaxed ">
          Lorem ipsum dolor sit amet consectetur. Sit libero ut adipiscing
          condimentum ullamcorper massa
        </p>
      </div>

      {/* Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <RoleCard
          type="host"
          title="Host"
          illustration={hostIllustration}
          isSelected={selectedRole === "host"}
          onSelect={setSelectedRole}
        />
        <RoleCard
          type="user"
          title="User"
          illustration={userIllustration}
          isSelected={selectedRole === "user"}
          onSelect={setSelectedRole}
        />
      </div>

      {/* Continue button */}
      <div className="w-full">
        <Button
          variant="accent"
          size="lg"
          className="w-full min-h-[4rem] h-auto text-lg"
          showArrow={true}
          onClick={() => router.push(`/signup/${selectedRole}`)}
        >
          Continue
        </Button>
      </div>
    </AuthLayout>
  );
}
