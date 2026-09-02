import { Country, State } from "country-state-city";
import { buildListingPricePayload, createEmptyPrice, normalizeListingPrice } from "./listingPrice";
import { normalizeDateValue, parseCalendarDate } from "@/components/shared/dateUtils";

/* Maps wizard duration key (e.g. "2h") → API duration shape */
const DURATION_MAP = {
  "30min": { value: 30, unit: "minutes" },
  "1h": { value: 1, unit: "hours" },
  "2h": { value: 2, unit: "hours" },
  "half_day": { value: 4, unit: "hours" },
  "full_day": { value: 8, unit: "hours" },
};

const RECURRING_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* API stores singular ("activity"/"place"/"equipment"), wizard uses plural for activities/places */
export const CATEGORY_TO_API = { activities: "activity", places: "place", equipment: "equipment" };
export const CATEGORY_FROM_API = { activity: "activities", place: "places", equipment: "equipment" };

export function formatDateForApi(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/* Normalize any freeform time string to HH:MM (24-hour) */
export function normalizeTimeToHHMM(raw) {
  if (!raw) return "";
  const s = String(raw).trim().toUpperCase();
  if (/^\d{2}:\d{2}$/.test(s)) return s;
  const hasAM = s.includes("AM");
  const hasPM = s.includes("PM");
  const digits = s.replace(/[^0-9:]/g, "");
  let h, m;
  if (digits.includes(":")) { [h, m] = digits.split(":").map(Number); }
  else if (digits.length <= 2) { h = Number(digits); m = 0; }
  else if (digits.length === 3) { h = Number(digits.slice(0, 1)); m = Number(digits.slice(1)); }
  else { h = Number(digits.slice(0, 2)); m = Number(digits.slice(2, 4)); }
  if (isNaN(h) || isNaN(m) || m < 0 || m > 59) return raw; // return original if unparseable
  if (hasAM) { if (h === 12) h = 0; } else if (hasPM) { if (h !== 12) h += 12; }
  if (h < 0 || h > 23) return raw;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function normalizeSlot(slot) {
  if (!slot || !slot.day || !slot.startTime || !slot.endTime) return null;
  const parsed = parseCalendarDate(slot.day);
  const isoDate = parsed ? formatDateForApi(parsed) : slot.day;
  return {
    date: isoDate,
    startTime: normalizeTimeToHHMM(slot.startTime),
    endTime: normalizeTimeToHHMM(slot.endTime),
    isAvailable: true,
  };
}

function buildRecurringAvailability(details) {
  const start = parseCalendarDate(details.recurringStartDate);
  const end = parseCalendarDate(details.recurringEndDate);
  if (!start || !end || start > end) return [];

  const availability = [];

  for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    const dayName = RECURRING_DAYS[current.getDay()];
    const date = formatDateForApi(current);
    const daySlots = details.recurringSlots?.[dayName] || [];

    daySlots.forEach((slot) => {
      if (slot && slot.startTime && slot.endTime && date) {
        availability.push({
          date,
          startTime: normalizeTimeToHHMM(slot.startTime),
          endTime: normalizeTimeToHHMM(slot.endTime),
          isAvailable: true,
        });
      }
    });
  }

  return availability;
}

/* Resolve the final availability array from either one-time slots or a recurring schedule */
export function buildAvailability(details) {
  const oneTimeAvailability = (details.slots || [])
    .map(normalizeSlot)
    .filter(Boolean);

  const recurringAvailability = buildRecurringAvailability(details);

  if (details.availabilityType === "recurring") return recurringAvailability;
  if (details.availabilityType === "one_time") return oneTimeAvailability;
  return oneTimeAvailability.length > 0 ? oneTimeAvailability : recurringAvailability;
}

/* ─── Build API payload from wizard data ───────────────────────────────────── */
export function buildListingPayload(data) {
  const { category, type, details = {}, price, status } = data;

  const duration = DURATION_MAP[details.duration] || { value: 0, unit: "hours" };
  const availability = buildAvailability(details);
  const firstSlot = availability[0] || {};
  const normalizedCategory = CATEGORY_TO_API[category] ?? category ?? "";

  const payload = {
    category: normalizedCategory,
    type: type || "",
    startTime: firstSlot.startTime || "",
    endTime: firstSlot.endTime || "",
    basicInformation: {
      activityTitle: details.title || "",
      location: details.location ||
        [details.placeCity, details.state, details.country]
          .filter(Boolean).join(", ") ||
        details.addressLine1 || "",
      description: details.description || "",
    },
    serviceDetails: {
      difficultyLevel: details.difficulty || "",
      duration,
      maxParticipants: normalizedCategory === "place" ? (details.maxGuests || 1) : (details.maxParticipants || 1),
      instructorName: details.instructorName || "",
      cancellationPolicy: details.cancellationPolicy || "",
      whatsIncluded: details.included || [],
      ...(normalizedCategory === "place" && {
        parkingSpace: details.parkingSpace || "",
        amenities: details.amenities || [],
        minRentalTime: details.minRentalTime || "",
        maxRentalTime: details.maxRentalTime || "",
      }),
      ...(normalizedCategory === "equipment" && {
        brand: details.brand || "",
        model: details.model || "",
      }),
    },
    placeLocation: {
      addressLine1: details.addressLine1 || "",
      addressLine2: details.addressLine2 || "",
      city: details.placeCity || "",
      state: details.state || "",
      country: details.country || "",
      postalCode: details.postalCode || "",
    },
    availability,
    price: buildListingPricePayload(category, price),
  };

  // Requirements is optional — only include it when the host actually provided some,
  // since the backend rejects an explicit empty array for this field.
  const requirementsList = (Array.isArray(details.requirementsList) && details.requirementsList.length > 0)
    ? details.requirementsList
    : (details.requirements
        ? details.requirements.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
        : []);
  if (requirementsList.length > 0) {
    payload.serviceDetails.requirements = requirementsList;
  }

  // AddListingWizard doesn't collect blob/data URLs; EditListingWizard passes photos through as-is
  payload.photos = Array.isArray(details.photos)
    ? details.photos.filter((photo) =>
        typeof photo === "string" &&
        photo &&
        !photo.startsWith("blob:") &&
        !photo.startsWith("data:")
      )
    : [];

  if (status !== undefined) payload.status = status;

  return payload;
}

/* ─── Reverse-map API response → wizard data (used by EditListingWizard) ───── */
export function apiToWizardData(raw) {
  const durationReverseMap = {
    30: "30min",
    1: "1h",
    2: "2h",
    4: "half_day",
    8: "full_day",
  };

  const dur = raw.serviceDetails?.duration;
  let durationKey = "";
  if (dur) {
    durationKey = durationReverseMap[dur.unit === "minutes" ? dur.value : dur.value] ?? "";
    // map by value+unit directly
    if (dur.unit === "minutes" && dur.value === 30) durationKey = "30min";
    else if (dur.unit === "hours" && dur.value === 1) durationKey = "1h";
    else if (dur.unit === "hours" && dur.value === 2) durationKey = "2h";
    else if (dur.unit === "hours" && dur.value === 4) durationKey = "half_day";
    else if (dur.unit === "hours" && dur.value === 8) durationKey = "full_day";
    else durationKey = durationKey || "";
  }

  const requirements = Array.isArray(raw.serviceDetails?.requirements)
    ? raw.serviceDetails.requirements
    : [];

  const availabilityEntries = Array.isArray(raw.availability)
    ? raw.availability.filter((s) => s?.date && s?.startTime && s?.endTime)
    : [];
  const slotDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const slots = availabilityEntries.length > 0
    ? availabilityEntries.map(s => ({ day: normalizeDateValue(s.date || ""), startTime: s.startTime || "", endTime: s.endTime || "" }))
    : [{ day: "", startTime: "", endTime: "" }];

  // Build recurringSlots grouped by day-of-week, deduplicating identical startTime+endTime
  // pairs that appear across multiple weeks (e.g. two Fridays in the same range).
  const recurringSlotsSeen = {
    Monday: new Set(), Tuesday: new Set(), Wednesday: new Set(),
    Thursday: new Set(), Friday: new Set(), Saturday: new Set(), Sunday: new Set(),
  };
  const recurringSlots = {
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
  };
  const parsedDates = [];
  availabilityEntries.forEach((slot) => {
    const date = parseCalendarDate(slot.date);
    if (date) {
      parsedDates.push(date);
      const dayName = slotDayNames[date.getDay()];
      const key = `${slot.startTime || ""}|${slot.endTime || ""}`;
      if (!recurringSlotsSeen[dayName].has(key)) {
        recurringSlotsSeen[dayName].add(key);
        recurringSlots[dayName].push({
          startTime: slot.startTime || "",
          endTime: slot.endTime || "",
        });
      }
    }
  });

  const recurringStartDate = parsedDates.length > 0
    ? formatDateForDisplay(parsedDates.reduce((min, date) => (date < min ? date : min), parsedDates[0]))
    : "";
  const recurringEndDate = parsedDates.length > 0
    ? formatDateForDisplay(parsedDates.reduce((max, date) => (date > max ? date : max), parsedDates[0]))
    : "";

  // Detect type: prefer explicit API field, fall back to entry count heuristic
  const rawAvailType = raw.availabilityType || raw.availability_type || "";
  const availabilityType = rawAvailType
    || (availabilityEntries.length > 1 ? "recurring"
      : availabilityEntries.length === 1 ? "one_time"
      : "");

  // Filter out blob URLs from photos (they won't work after refresh)
  const validPhotos = Array.isArray(raw.photos)
    ? raw.photos.filter(p => p && typeof p === "string" && !p.startsWith("blob:") && !p.startsWith("data:"))
    : [];

  // Convert country and state names to ISO codes for the dropdowns
  const countryName = raw.placeLocation?.country || "";
  const stateName = raw.placeLocation?.state || "";

  // Find country by name to get its ISO code
  const countryObj = Country.getAllCountries().find(
    c => c.name.toLowerCase() === countryName.toLowerCase()
  );
  const countryCode = countryObj?.isoCode || "";

  // Find state by name within the country to get its code
  let stateCode = "";
  if (countryCode && stateName) {
    const stateObj = State.getStatesOfCountry(countryCode).find(
      s => s.name.toLowerCase() === stateName.toLowerCase()
    );
    stateCode = stateObj?.isoCode || "";
  }

  const addressLine1 = raw.placeLocation?.addressLine1 || "";
  const derivedLocation = addressLine1
    ? [addressLine1, raw.placeLocation?.city, raw.placeLocation?.state, raw.placeLocation?.country].filter(Boolean).join(", ")
    : raw.basicInformation?.location || "";

  const details = {
    title: raw.basicInformation?.activityTitle || "",
    location: derivedLocation,
    description: raw.basicInformation?.description || "",
    difficulty: raw.serviceDetails?.difficultyLevel || "",
    duration: durationKey,
    maxParticipants: raw.serviceDetails?.maxParticipants || 1,
    instructorName: raw.serviceDetails?.instructorName || "",
    cancellationPolicy: raw.serviceDetails?.cancellationPolicy || "",
    included: Array.isArray(raw.serviceDetails?.whatsIncluded) ? raw.serviceDetails.whatsIncluded : [],
    requirements: requirements.join(", "),
    requirementsList: requirements,
    maxGuests: raw.serviceDetails?.maxParticipants || 2,
    parkingSpace: raw.serviceDetails?.parkingSpace || "",
    amenities: Array.isArray(raw.serviceDetails?.amenities) ? raw.serviceDetails.amenities : [],
    minRentalTime: raw.serviceDetails?.minRentalTime || "",
    maxRentalTime: raw.serviceDetails?.maxRentalTime || "",
    brand: raw.serviceDetails?.brand || "",
    model: raw.serviceDetails?.model || "",
    airConditioning: false,
    wifi: false,
    photos: validPhotos,
    slots,
    availabilityType,
    recurringSlots,
    recurringStartDate,
    recurringEndDate,
    addressLine1: raw.placeLocation?.addressLine1 || "",
    addressLine2: raw.placeLocation?.addressLine2 || "",
    placeCity: raw.placeLocation?.city || "",
    state: stateName,
    stateCode: stateCode,
    country: countryName,
    countryCode: countryCode,
    postalCode: raw.placeLocation?.postalCode || "",
  };

  const wizardCategory = CATEGORY_FROM_API[raw.category?.toLowerCase()] || raw.category || "";

  return {
    category: wizardCategory,
    type: raw.type || "",
    status: raw.status || "Active",
    details,
    price: normalizeListingPrice(wizardCategory || "", raw.price ?? createEmptyPrice(wizardCategory || "")),
  };
}

/* Dates stored in mm/dd/yyyy for CalendarField compatibility */
function formatDateForDisplay(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day   = String(date.getDate()).padStart(2, "0");
  const year  = date.getFullYear();
  return `${month}/${day}/${year}`;
}
