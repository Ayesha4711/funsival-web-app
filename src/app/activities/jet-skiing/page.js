import ActivityListingPage from '@/components/activities/ActivityListingPage';
import { jetSkiingActivities, jetSkiingFilters } from '@/data/activityData';

export const metadata = {
  title: 'Jet Skiing Adventures - Adventure Backed by Safety | Funsival',
  description: 'Experience the thrill of jet skiing with our guided tours and racing experiences.',
};

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
