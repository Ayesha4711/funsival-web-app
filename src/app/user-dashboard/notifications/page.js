import UserDashboardShell from "@/components/user-dashboard/UserDashboardShell";
import NotificationsPage from "@/components/shared/NotificationsPage";

export const metadata = {
  title: "Notifications | Funsival",
  description: "Your notifications",
};

export default function UserNotifications() {
  return (
    <UserDashboardShell>
      <NotificationsPage />
    </UserDashboardShell>
  );
}
