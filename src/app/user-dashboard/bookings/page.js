import { Suspense } from "react";
import MyReservationPage from "@/components/user-dashboard/MyReservationPage";

export const metadata = { title: "My Reservation — Funsival" };

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <MyReservationPage />
    </Suspense>
  );
}
