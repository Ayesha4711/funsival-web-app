// Destination photography is independent of provider-uploaded listing photos.
// Add a city/country entry here when curating imagery for a new destination.
const cityImages = {
  'lahore|pakistan': '/images/destinations/lahore.webp',
  'dhahran|saudi arabia': '/images/destinations/dhahran.webp',
  'mau|india': '/images/destinations/mau.jpg',
  'new york|united states': '/images/optimized/newyork.webp',
  'new york city|united states': '/images/optimized/newyork.webp',
  'los angeles|united states': '/images/optimized/losangeles.webp',
};

const regionImages = {
  'eastern cape|south africa': '/images/destinations/eastern-cape.webp',
  'hawaii|united states': '/images/optimized/hawaii.webp',
  'colorado|united states': '/images/optimized/colorado.webp',
};

export const DEFAULT_DESTINATION_IMAGE = '/images/optimized/newyork.webp';

function normalize(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getDestinationImage({ city, state, country }) {
  const countryName = normalize(country);
  const normalizedCountry = ['us', 'usa', 'united states of america'].includes(countryName)
    ? 'united states'
    : countryName;

  return cityImages[`${normalize(city)}|${normalizedCountry}`]
    ?? regionImages[`${normalize(state)}|${normalizedCountry}`]
    ?? DEFAULT_DESTINATION_IMAGE;
}
