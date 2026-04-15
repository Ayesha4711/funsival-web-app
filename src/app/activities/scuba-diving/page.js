import ActivityListingPage from '@/components/activities/ActivityListingPage';
import { scubaDivingActivities, scubaDivingFilters } from '@/data/activityData';

export const metadata = {
  title: 'Scuba Diving Adventures - Discover The World Beneath The Waves | Funsival',
  description: 'Explore the underwater world with our scuba diving experiences. Coral reefs, wreck diving, and more.',
};

export default function ScubaDivingPage() {
  return (
    <ActivityListingPage
      heroTitle="Discover The World Beneath The Waves"
      heroSubtitle="Explore coral reefs, shipwrecks, and marine life"
      heroBackground="/images/activities/scuba-hero.jpg"
      heroBackgroundColor="bg-gradient-to-r from-blue-600 to-teal-500"
      filters={scubaDivingFilters}
      activities={scubaDivingActivities}
    />
  );
}
