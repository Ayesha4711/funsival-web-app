import ActivityListingPage from '@/components/activities/ActivityListingPage';
import { jetSkiingActivities, jetSkiingFilters } from '@/data/activityData';


export default function JetSkiingPage() {
  return (
    <ActivityListingPage
      heroTitle="Adventure Backed by Safety"
      heroSubtitle="High-speed water adventures with professional instructors"
      heroBackground="/images/activities/scubadiving.svg"
      filters={jetSkiingFilters}
      activities={jetSkiingActivities}
    />
  );
}
