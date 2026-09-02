// Known activity subcategories from the spec, keyed by the type slug values
// hosts pick from in StepType.jsx (snake_case). Types not in this map still
// get a working page via getActivityMetadata's generated fallback.
const ACTIVITY_METADATA = {
  skydiving: {
    title: "Feel the sky, live the rush",
    description: "From 13,000 ft to freefall at 200 km/h.",
    banner: "/images/activities/skydiving.svg",
  },
  horse_riding: {
    title: "Ride into the wild",
    description: "Explore trails and open country on horseback.",
    banner: null,
  },
  scuba_diving: {
    title: "Dive into the deep blue",
    description: "Discover reefs and marine life beneath the surface.",
    banner: "/images/activities/scubadiving.svg",
  },
  paragliding: {
    title: "Soar above it all",
    description: "Glide over stunning landscapes from thousands of feet up.",
    banner: null,
  },
  zipline: {
    title: "Zip through the treetops",
    description: "High-speed thrills stretched across breathtaking views.",
    banner: null,
  },
  jeep_rally: {
    title: "Conquer the terrain",
    description: "Off-road adventure through rugged, unforgettable trails.",
    banner: "/images/activities/jeeprally.svg",
  },
  hang_gliding: {
    title: "Take flight, no engine required",
    description: "Ride the thermals with nothing but wind beneath your wings.",
    banner: null,
  },
  bungee_jumping: {
    title: "Leap of a lifetime",
    description: "Freefall from great heights with a rebound you'll never forget.",
    banner: null,
  },
  bowling: {
    title: "Strike up some fun",
    description: "Classic lanes, classic thrills — for all skill levels.",
    banner: null,
  },
  trampoline: {
    title: "Bounce to new heights",
    description: "Flips, jumps, and airtime for every age.",
    banner: null,
  },
  golf: {
    title: "Perfect your swing",
    description: "Scenic courses and a relaxed pace of play.",
    banner: null,
  },
  boating: {
    title: "Set sail on open water",
    description: "Cruise, fish, or explore the coastline at your own pace.",
    banner: null,
  },
  snowboarding: {
    title: "Carve fresh powder",
    description: "Hit the slopes on boards built for every rider.",
    banner: null,
  },
  surfing: {
    title: "Catch the perfect wave",
    description: "Ride the swell at some of the best breaks around.",
    banner: null,
  },
  adventure_atvs: {
    title: "Off-road, all the way",
    description: "Powerful ATVs built for rugged, muddy adventure.",
    banner: null,
  },
  atv: {
    title: "Off-road, all the way",
    description: "Powerful ATVs built for rugged, muddy adventure.",
    banner: null,
  },
  jet_skiing: {
    title: "Ride the waves",
    description: "High-speed fun on the open water.",
    banner: null,
  },
  jetski: {
    title: "Ride the waves",
    description: "High-speed fun on the open water.",
    banner: null,
  },
};

export function getActivityMetadata(type, fallbackLabel, count = 0) {
  const known = ACTIVITY_METADATA[type];
  if (known) return known;

  const label = fallbackLabel || type;
  return {
    title: label,
    description: `Discover ${count} ${label.toLowerCase()} experience${count === 1 ? "" : "s"}.`,
    banner: null,
  };
}

export default ACTIVITY_METADATA;
