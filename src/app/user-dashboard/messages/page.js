import UserDashboardShell from "@/components/user-dashboard/UserDashboardShell";
import MessagesPage from "@/components/shared/MessagesPage";

export const metadata = {
  title: "Messages | Funsival",
  description: "Your messages and conversations",
};

export default function UserMessages() {
  return (
    <UserDashboardShell>
      <MessagesPage />
    </UserDashboardShell>
  );
}
