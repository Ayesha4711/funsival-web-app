import { Country, State, City } from "country-state-city";

const NOMINATIM_HEADERS = { headers: { "Accept-Language": "en" } };

/* Forward geocode a free-form query, returning the top match or null */
export async function geocodeSearch(query, limit = 1) {
  if (!query || query.length < 3) return limit === 1 ? null : [];
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=${limit}`,
    NOMINATIM_HEADERS
  );
  const results = await res.json();
  return limit === 1 ? (results?.[0] ?? null) : results;
}

/* Reverse geocode lat/lon → structured, dropdown-ready address fields.
   Shared by "search & select" and "use current location" flows, which both
   need to resolve country/state ISO codes and snap the city to the
   country-state-city dataset so it matches the cascading dropdowns. */
export async function reverseGeocodeToAddressFields(lat, lon, fallbackName, currentPostalCode) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
    NOMINATIM_HEADERS
  );
  const data = await res.json();
  const addr = data.address || {};

  // Build address line 1 from street-level fields
  const road = addr.road || addr.pedestrian || addr.footway || addr.path || "";
  const houseNumber = addr.house_number || "";
  const addressLine1 = [houseNumber, road].filter(Boolean).join(" ") || data.display_name || fallbackName;

  // Resolve country ISO code
  const countryName = addr.country || "";
  const allCountries = Country.getAllCountries();
  const countryObj = allCountries.find(
    c => c.name.toLowerCase() === countryName.toLowerCase() ||
         c.isoCode === (addr.country_code || "").toUpperCase()
  );
  const countryCode = countryObj?.isoCode || "";

  // Resolve state ISO code
  const stateName = addr.state || addr.region || addr.county || "";
  let stateCode = "";
  if (countryCode) {
    const allStates = State.getStatesOfCountry(countryCode);
    const stateObj = allStates.find(st => st.name.toLowerCase() === stateName.toLowerCase());
    stateCode = stateObj?.isoCode || "";
  }

  // City: prefer city, then town, then village, then suburb
  const rawCity =
    addr.city || addr.town || addr.village || addr.suburb ||
    addr.municipality || addr.district || "";

  // Resolve city — may find it in a different state than what Nominatim returned
  let resolvedStateCode = stateCode;
  let resolvedStateName = stateName;
  let placeCity = "";
  if (rawCity && countryCode) {
    const lower = rawCity.toLowerCase();
    const allStates = State.getStatesOfCountry(countryCode);

    const tryState = (sc) => {
      const cities = City.getCitiesOfState(countryCode, sc);
      return cities.find(c => c.name.toLowerCase() === lower)
        || cities.find(c => c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase()));
    };

    // Try state from Nominatim first, then fall back to any state in the country
    let found = stateCode ? tryState(stateCode) : null;
    if (!found) {
      for (const st of allStates) {
        found = tryState(st.isoCode);
        if (found) {
          resolvedStateCode = st.isoCode;
          resolvedStateName = st.name;
          break;
        }
      }
    }

    placeCity = found ? found.name : rawCity;
  }

  const postalCode = addr.postcode || currentPostalCode || "";

  return {
    addressLine1,
    location: data.display_name || fallbackName,
    countryCode,
    country: countryObj?.name || countryName,
    stateCode: resolvedStateCode,
    state: resolvedStateName,
    placeCity,
    postalCode,
  };
}
