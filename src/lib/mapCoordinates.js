function coordinate(value, min, max) {
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

export function getListingCoordinates(listing) {
  const location = listing.placeLocation || {};
  const lat = coordinate(location.latitude ?? location.lat ?? listing.lat, -90, 90);
  const lon = coordinate(location.longitude ?? location.lon ?? location.lng ?? listing.lon ?? listing.lng, -180, 180);
  return lat !== null && lon !== null ? { lat, lon } : null;
}
