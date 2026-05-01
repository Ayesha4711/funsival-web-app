import { Suspense } from "react";
import SettingsPage from "@/components/shared/SettingsPage";

export default function UserSettings() {
  return (
    <Suspense>
      <SettingsPage role="user" />
    </Suspense>
  );
}
