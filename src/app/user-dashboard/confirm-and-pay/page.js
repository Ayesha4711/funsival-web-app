import { Suspense } from "react";
import ConfirmAndPayPage from "@/components/user-dashboard/ConfirmAndPayPage";

export default function ConfirmAndPay() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <ConfirmAndPayPage />
    </Suspense>
  );
}
