import UserDashboardShell from "@/components/user-dashboard/UserDashboardShell";
import SettingsPage from "@/components/shared/SettingsPage";

export const metadata = {
  title: "Settings | Funsival",
  description: "Manage your account settings",
};

export default function UserSettings() {
  return (
    <UserDashboardShell>
      <SettingsPage role="user" />
    </UserDashboardShell>
  );
}
