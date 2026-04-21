import { Suspense } from "react";
import OTPVerificationPage from "@/components/features/OTPVerificationPage";

export const metadata = {
  title: "OTP Verification | Funsival",
  description: "Verify your Funsival account",
};

export default function Verify() {
  return (
    <Suspense>
      <OTPVerificationPage />
    </Suspense>
  );
}
