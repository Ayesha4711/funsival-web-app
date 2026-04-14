import { Suspense } from "react";
import ResetPasswordPage from "@/components/features/ResetPasswordPage";

export const metadata = {
  title: "Reset Password | Funsival",
  description: "Create a new password for your Funsival account",
};

export default function Reset() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}
