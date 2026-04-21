import ActivityListingPage from '@/components/activities/ActivityListingPage';
import { jeepRallyActivities, jeepRallyFilters } from '@/data/activityData';


export default function JeepRallyPage() {
  return (
    <ActivityListingPage
      heroTitle="Conquer The Dunes, Leave Your Limits Behind"
      heroSubtitle="Off-road adventures across diverse terrains"
      heroBackground="/images/activities/jeeprally.svg"
      filters={jeepRallyFilters}
      activities={jeepRallyActivities}
    />
  );
}
