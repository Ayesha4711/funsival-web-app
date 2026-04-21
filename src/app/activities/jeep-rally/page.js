import ActivityListingPage from '@/components/activities/ActivityListingPage';
import { jeepRallyActivities, jeepRallyFilters } from '@/data/activityData';

export const metadata = {
  title: 'Jeep Rally Adventures - Conquer The Dunes, Leave Your Limits Behind | Funsival',
  description: 'Off-road adventures through deserts, mountains, and jungles. Experience the thrill of jeep rallies.',
};

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
