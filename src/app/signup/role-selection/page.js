import AccountTypeSelectionPage from "@/components/features/AccountTypeSelectionPage";

export const metadata = {
  title: "Choose Account Type | Funsival",
  description: "Select whether you want to join as a Host or a User",
};

export default function RoleSelection() {
  return <AccountTypeSelectionPage />;
}
