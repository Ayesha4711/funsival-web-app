import { Suspense } from "react";
import AccountSuccessPage from "@/components/features/AccountSuccessPage";


export default function SignupSuccess() {
  return (
    <Suspense>
      <AccountSuccessPage />
    </Suspense>
  );
}
