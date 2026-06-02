"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import ForgotPasswordForm from "./ForgotPasswordForm";
import CheckEmailConfirmation from "./CheckEmailConfirmation";

export default function ForgotPasswordEmailPage() {
  const params = useSearchParams();
  const email = params.get("email");

  if (email) {
    return <CheckEmailConfirmation email={decodeURIComponent(email)} />;
  }

  return <ForgotPasswordForm />;
}
