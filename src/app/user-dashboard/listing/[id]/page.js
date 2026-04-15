import { Suspense } from "react";
import ListingDetailPage from "@/components/user-dashboard/ListingDetailPage";

export default function ListingDetail({ params }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <ListingDetailPage params={params} />
    </Suspense>
  );
}
