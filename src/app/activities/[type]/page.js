import { Suspense } from "react";
import ActivityDetailPage from "@/components/activities/ActivityDetailPage";

export default function ActivityTypePage({ params }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <ActivityDetailPage params={params} />
    </Suspense>
  );
}
