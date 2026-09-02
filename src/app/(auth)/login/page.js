import { Suspense } from "react";
import LoginPage from "@/components/features/LoginPage";

export default function Login() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
