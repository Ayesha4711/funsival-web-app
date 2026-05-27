import { Suspense } from "react";
import ForgotPasswordEmailPage from "@/components/features/ForgotPasswordEmailPage";


export default function CheckEmail() {
  return (
    <Suspense>
      <ForgotPasswordEmailPage />
    </Suspense>
  );
}
