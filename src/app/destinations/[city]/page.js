import { Suspense } from "react";
import DestinationDetailPage from "@/components/activities/DestinationDetailPage";

export default function DestinationCityPage({ params }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <DestinationDetailPage params={params} />
    </Suspense>
  );
}
