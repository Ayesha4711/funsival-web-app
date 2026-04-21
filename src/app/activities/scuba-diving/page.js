import ActivityListingPage from '@/components/activities/ActivityListingPage';
import { scubaDivingActivities, scubaDivingFilters } from '@/data/activityData';


export default function ScubaDivingPage() {
  return (
    <ActivityListingPage
      heroTitle="Discover The World Beneath The Waves"
      heroSubtitle="Explore coral reefs, shipwrecks, and marine life"
      heroBackground="/images/activities/scubadiving.svg"
      filters={scubaDivingFilters}
      activities={scubaDivingActivities}
    />
  );
}
