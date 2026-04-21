import ActivityListingPage from '@/components/activities/ActivityListingPage';
import { skydivingActivities, skydivingFilters } from '@/data/activityData';

export const metadata = {
  title: 'Skydiving Adventures - Feel the sky, live the rush | Funsival',
  description: 'Experience the ultimate thrill of skydiving. From tandem jumps to paragliding adventures.',
};

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
