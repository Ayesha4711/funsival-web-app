import ActivityListingPage from '@/components/activities/ActivityListingPage';
import { skydivingActivities, skydivingFilters } from '@/data/activityData';


export default function SkydivingPage() {
  return (
    <ActivityListingPage
      heroTitle="Feel the sky, live the rush"
      heroSubtitle="From 3,000 FT to 14,000 FT to 20,000 FT"
      heroBackground="/images/activities/skydiving.svg"
      filters={skydivingFilters}
      activities={skydivingActivities}
    />
  );
}
