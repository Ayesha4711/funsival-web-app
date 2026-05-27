import { Suspense } from "react";
import OTPVerificationPage from "@/components/features/OTPVerificationPage";


export default function Verify() {
  return (
    <Suspense>
      <OTPVerificationPage />
    </Suspense>
  );
}
