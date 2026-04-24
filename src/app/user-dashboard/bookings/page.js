import { Suspense } from "react";
import MyReservationPage from "@/components/user-dashboard/MyReservationPage";

export default function BookingsPage() {
  return (
    <Suspense>
      <MyReservationPage />
    </Suspense>
  );
}
