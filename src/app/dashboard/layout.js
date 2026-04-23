import DashboardShell from "@/components/dashboard/DashboardShell";
import { ProfileProvider } from "@/lib/ProfileContext";

export default function DashboardLayout({ children }) {
  return (
    <ProfileProvider>
      <DashboardShell>{children}</DashboardShell>
    </ProfileProvider>
  );
}
