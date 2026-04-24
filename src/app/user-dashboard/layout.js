import UserDashboardShell from "@/components/user-dashboard/UserDashboardShell";
import { ProfileProvider } from "@/lib/ProfileContext";

export default function UserDashboardLayout({ children }) {
  return (
    <ProfileProvider>
      <UserDashboardShell>{children}</UserDashboardShell>
    </ProfileProvider>
  );
}
