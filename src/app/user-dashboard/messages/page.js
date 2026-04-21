import UserDashboardShell from "@/components/user-dashboard/UserDashboardShell";
import MessagesPage from "@/components/shared/MessagesPage";


export default function UserMessages() {
  return (
    <UserDashboardShell>
      <MessagesPage />
    </UserDashboardShell>
  );
}
