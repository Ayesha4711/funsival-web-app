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

function imageUrl(value) {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';
  return imageUrl(value.url ?? value.src ?? value.path ?? value.secure_url ?? value.imageUrl);
}

// Browse endpoints have used both a plain image URL and populated media objects.
export function getDestinationPhoto(destination = {}) {
  const candidates = [
    destination.image,
    destination.coverImage,
    destination.thumbnail,
    destination.photo,
    destination.images?.[0],
    destination.photos?.[0],
  ];
  const fromApi = candidates.map(imageUrl).find((url) => /^(https?:\/\/|\/)/i.test(url));
  return fromApi || getDestinationImage(destination);
}

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
