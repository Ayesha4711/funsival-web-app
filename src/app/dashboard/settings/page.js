import { Suspense } from "react";
import SettingsPage from "@/components/shared/SettingsPage";

export default function Settings() {
  return (
    <Suspense>
      <SettingsPage showFooter={false} />
    </Suspense>
  );
}
