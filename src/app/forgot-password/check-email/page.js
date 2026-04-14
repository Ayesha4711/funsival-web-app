import { Suspense } from "react";
import ForgotPasswordEmailPage from "@/components/features/ForgotPasswordEmailPage";

export const metadata = {
  title: "Forgot Password | Funsival",
  description: "Reset your Funsival account password",
};

export default function CheckEmail() {
  return (
    <Suspense>
      <ForgotPasswordEmailPage />
    </Suspense>
  );
}
