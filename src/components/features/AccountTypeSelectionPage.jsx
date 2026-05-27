"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import AuthLayout from "@/components/layout/AuthLayout";
import hostIllustration from "@/assets/icons/Host.jpg";
import userIllustration from "@/assets/icons/User.jpg";
import { CheckIcon } from "@/icons";

/* ─── Role Card Component ──────────────────────────────────────────────────── */
const RoleCard = ({ type, title, illustration, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(type)}
      style={{ borderRadius: "15px", border: "1px solid #D7D7D7" }}
      className={`relative flex flex-col items-center justify-center p-4 transition-all duration-300 cursor-pointer
        w-[140px] h-[120px] sm:w-[215px] sm:h-[171px]
        ${isSelected ? "bg-[#FFF5D9]" : "bg-white hover:bg-gray-50"}`}
    >
      {/* Checkmark indicator */}
      {isSelected &&
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-secondary flex items-center justify-center animate-in zoom-in-50 duration-300">
          <CheckIcon />
        </div>}

      {/* Illustration */}
      <div className="relative w-full flex-1 mb-2">
        <Image src={illustration} alt={title} fill className="object-contain" />
      </div>

      {/* Title */}
      <span
        className={`text-base font-semibold ${isSelected
          ? "text-[#FFA600]"
          : "text-black"}`}
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

  useEffect(() => {
    window.history.replaceState(null, "", "/");
    window.history.pushState(null, "", "/signup/role-selection");
  }, []);

  return (
    <AuthLayout maxWidthClass="max-w-2xl">
      {/* Heading */}
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-2xl xs:text-3xl md:text-4xl font-extrabold text-text mb-3">
          Create Your Account
        </h1>
        <p className="text-[#A1A1A1] text-sm md:text-base leading-relaxed">
          Lorem ipsum dolor sit amet consectetur. Sit libero ut adipiscing
          condimentum ullamcorper massa
        </p>
      </div>

      {/* Selection Grid */}
      <div className="flex justify-center gap-6 mb-10">
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

      {/* Continue button — same width as the two cards side by side */}
      <div className="w-full flex justify-center">
        <Button
          variant="accent"
          size="lg"
          className="w-74 sm:w-111.5 min-h-16 h-auto text-lg"
          showArrow={true}
          onClick={() => router.push(`/signup/${selectedRole}`)}
        >
          Continue
        </Button>
      </div>
    </AuthLayout>
  );
}
