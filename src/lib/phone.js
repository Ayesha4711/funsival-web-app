export const PHONE_COUNTRY_CODES = [
  { label: "Afghanistan", code: "+93" },
  { label: "Argentina", code: "+54" },
  { label: "Australia", code: "+61" },
  { label: "Austria", code: "+43" },
  { label: "Bahrain", code: "+973" },
  { label: "Bangladesh", code: "+880" },
  { label: "Belgium", code: "+32" },
  { label: "Brazil", code: "+55" },
  { label: "Canada", code: "+1" },
  { label: "Chile", code: "+56" },
  { label: "Colombia", code: "+57" },
  { label: "Denmark", code: "+45" },
  { label: "Egypt", code: "+20" },
  { label: "Ethiopia", code: "+251" },
  { label: "Finland", code: "+358" },
  { label: "France", code: "+33" },
  { label: "Germany", code: "+49" },
  { label: "India", code: "+91" },
  { label: "Indonesia", code: "+62" },
  { label: "Iran", code: "+98" },
  { label: "Iraq", code: "+964" },
  { label: "Ireland", code: "+353" },
  { label: "Italy", code: "+39" },
  { label: "Jordan", code: "+962" },
  { label: "Kenya", code: "+254" },
  { label: "Kuwait", code: "+965" },
  { label: "Lebanon", code: "+961" },
  { label: "Malaysia", code: "+60" },
  { label: "Mexico", code: "+52" },
  { label: "Morocco", code: "+212" },
  { label: "Nepal", code: "+977" },
  { label: "Netherlands", code: "+31" },
  { label: "New Zealand", code: "+64" },
  { label: "Nigeria", code: "+234" },
  { label: "Norway", code: "+47" },
  { label: "Oman", code: "+968" },
  { label: "Pakistan", code: "+92" },
  { label: "Philippines", code: "+63" },
  { label: "Poland", code: "+48" },
  { label: "Qatar", code: "+974" },
  { label: "Russia", code: "+7" },
  { label: "Saudi Arabia", code: "+966" },
  { label: "Singapore", code: "+65" },
  { label: "South Africa", code: "+27" },
  { label: "Spain", code: "+34" },
  { label: "Sri Lanka", code: "+94" },
  { label: "Sweden", code: "+46" },
  { label: "Switzerland", code: "+41" },
  { label: "Thailand", code: "+66" },
  { label: "Tunisia", code: "+216" },
  { label: "Turkey", code: "+90" },
  { label: "Ukraine", code: "+380" },
  { label: "United Arab Emirates", code: "+971" },
  { label: "United Kingdom", code: "+44" },
  { label: "United States", code: "+1" },
  { label: "Uruguay", code: "+598" },
  { label: "Viet Nam", code: "+84" },
];

const countryIsoByName = {
  afghanistan: "AF",
  argentina: "AR",
  australia: "AU",
  austria: "AT",
  bahrain: "BH",
  bangladesh: "BD",
  belgium: "BE",
  brazil: "BR",
  canada: "CA",
  chile: "CL",
  colombia: "CO",
  denmark: "DK",
  egypt: "EG",
  ethiopia: "ET",
  finland: "FI",
  france: "FR",
  germany: "DE",
  india: "IN",
  indonesia: "ID",
  iran: "IR",
  iraq: "IQ",
  ireland: "IE",
  italy: "IT",
  jordan: "JO",
  kenya: "KE",
  kuwait: "KW",
  "hong kong": "HK",
  "czech republic": "CZ",
  lebanon: "LB",
  malaysia: "MY",
  mexico: "MX",
  morocco: "MA",
  nepal: "NP",
  netherlands: "NL",
  "new zealand": "NZ",
  nigeria: "NG",
  norway: "NO",
  oman: "OM",
  pakistan: "PK",
  philippines: "PH",
  poland: "PL",
  qatar: "QA",
  russia: "RU",
  "saudi arabia": "SA",
  singapore: "SG",
  "south africa": "ZA",
  spain: "ES",
  "sri lanka": "LK",
  sweden: "SE",
  switzerland: "CH",
  thailand: "TH",
  tunisia: "TN",
  turkey: "TR",
  ukraine: "UA",
  "united arab emirates": "AE",
  "united kingdom": "GB",
  "united states": "US",
  uruguay: "UY",
  "viet nam": "VN",
};

export function countryToFlag(countryName = "") {
  const isoCode = countryIsoByName[String(countryName ?? "").toLowerCase()];
  if (!isoCode || isoCode.length !== 2) return "🌐";
  return isoCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

export function stripPhoneNumber(value = "") {
  return String(value ?? "").replace(/[^\d]/g, "").trim();
}

function getKnownCountryCodes() {
  return [...PHONE_COUNTRY_CODES]
    .map(({ code }) => code)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
}

export function parsePhoneNumber(value = "") {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) {
    return { countryCode: "+92", number: "" };
  }

  const knownCode = getKnownCountryCodes().find((code) => trimmed.startsWith(code));
  if (knownCode) {
    return {
      countryCode: knownCode,
      number: stripPhoneNumber(trimmed.slice(knownCode.length)).replace(/^0+/, ""),
    };
  }

  const match = trimmed.match(/^(\+\d{1,4})\s*(.*)$/);
  if (match) {
    return {
      countryCode: match[1],
      number: stripPhoneNumber(match[2]).replace(/^0+/, ""),
    };
  }

  return {
    countryCode: "+92",
    number: stripPhoneNumber(trimmed).replace(/^0+/, ""),
  };
}

export function formatPhoneNumber(countryCode = "+92", number = "") {
  const cleanNumber = stripPhoneNumber(number).replace(/^0+/, "");
  return cleanNumber ? `${countryCode}${cleanNumber}` : "";
}

export function validatePhoneNumber(value = "", options = {}) {
  const { allowLeadingZero = false } = options;
  const digits = stripPhoneNumber(value);
  if (digits.length < 7 || digits.length > 15) return false;
  if (!allowLeadingZero && digits.startsWith("0")) return false;
  return true;
}
