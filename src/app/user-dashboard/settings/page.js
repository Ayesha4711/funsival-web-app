import UserDashboardShell from "@/components/user-dashboard/UserDashboardShell";
import SettingsPage from "@/components/shared/SettingsPage";


export default function UserSettings() {
  return (
    <UserDashboardShell>
      <SettingsPage role="user" />
    </UserDashboardShell>
  );
}
