import { Suspense } from "react";
import TwoFAVerifyPage from "@/components/features/TwoFAVerifyPage";

export default function TwoFAPage() {
  return (
    <Suspense>
      <TwoFAVerifyPage />
    </Suspense>
  );
}
