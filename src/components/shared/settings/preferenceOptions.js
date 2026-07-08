import { countryToFlag } from "@/lib/phone";

const currencyFlagMap = {
  AED: countryToFlag("United Arab Emirates"),
  AUD: countryToFlag("Australia"),
  BRL: countryToFlag("Brazil"),
  CAD: countryToFlag("Canada"),
  CHF: countryToFlag("Switzerland"),
  CNY: countryToFlag("China"),
  CZK: countryToFlag("Czech Republic"),
  DKK: countryToFlag("Denmark"),
  EUR: "🇪🇺",
  GBP: countryToFlag("United Kingdom"),
  HKD: countryToFlag("Hong Kong"),
  INR: countryToFlag("India"),
  JPY: countryToFlag("Japan"),
  MXN: countryToFlag("Mexico"),
  NOK: countryToFlag("Norway"),
  NZD: countryToFlag("New Zealand"),
  PKR: countryToFlag("Pakistan"),
  SAR: countryToFlag("Saudi Arabia"),
  SEK: countryToFlag("Sweden"),
  SGD: countryToFlag("Singapore"),
  TRY: countryToFlag("Turkey"),
  USD: countryToFlag("United States"),
  ZAR: countryToFlag("South Africa"),
};

export const CURRENCY_OPTIONS = [
  { code: "AED", name: "UAE Dirham" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "CZK", name: "Czech Koruna" },
  { code: "DKK", name: "Danish Krone" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "INR", name: "Indian Rupee" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "USD", name: "US Dollar" },
  { code: "ZAR", name: "South African Rand" },
].map((option) => ({
  ...option,
  flag: currencyFlagMap[option.code] || "🌐",
  searchText: `${option.name} ${option.code}`.toLowerCase(),
}));

export const TIMEZONE_OPTIONS = [
  {
    region: "US/CANADA",
    options: [
      { label: "Pacific Time - US & Canada", timeZone: "America/Los_Angeles" },
      { label: "Mountain Time - US & Canada", timeZone: "America/Denver" },
      { label: "Central Time - US & Canada", timeZone: "America/Chicago" },
      { label: "Eastern Time - US & Canada", timeZone: "America/New_York" },
      { label: "Alaska Time", timeZone: "America/Anchorage" },
      { label: "Hawaii Time", timeZone: "Pacific/Honolulu" },
    ].map((option) => ({
      ...option,
      searchText: `${option.label} ${option.timeZone} ${"US/CANADA"}`.toLowerCase(),
    })),
  },
  {
    region: "EUROPE",
    options: [
      { label: "Greenwich Mean Time", timeZone: "Europe/London" },
      { label: "Central European Time", timeZone: "Europe/Paris" },
      { label: "Eastern European Time", timeZone: "Europe/Athens" },
      { label: "Turkey Time", timeZone: "Europe/Istanbul" },
    ].map((option) => ({
      ...option,
      searchText: `${option.label} ${option.timeZone} EUROPE`.toLowerCase(),
    })),
  },
  {
    region: "ASIA",
    options: [
      { label: "Pakistan Standard Time", timeZone: "Asia/Karachi" },
      { label: "India Standard Time", timeZone: "Asia/Kolkata" },
      { label: "China Standard Time", timeZone: "Asia/Shanghai" },
      { label: "Japan Standard Time", timeZone: "Asia/Tokyo" },
      { label: "Singapore Standard Time", timeZone: "Asia/Singapore" },
      { label: "UAE Time", timeZone: "Asia/Dubai" },
    ].map((option) => ({
      ...option,
      searchText: `${option.label} ${option.timeZone} ASIA`.toLowerCase(),
    })),
  },
  {
    region: "AFRICA",
    options: [
      { label: "South Africa Standard Time", timeZone: "Africa/Johannesburg" },
      { label: "East Africa Time", timeZone: "Africa/Nairobi" },
      { label: "West Africa Time", timeZone: "Africa/Lagos" },
      { label: "Morocco Time", timeZone: "Africa/Casablanca" },
    ].map((option) => ({
      ...option,
      searchText: `${option.label} ${option.timeZone} AFRICA`.toLowerCase(),
    })),
  },
  {
    region: "OCEANIA",
    options: [
      { label: "Australian Western Time", timeZone: "Australia/Perth" },
      { label: "Australian Central Time", timeZone: "Australia/Adelaide" },
      { label: "Australian Eastern Time", timeZone: "Australia/Sydney" },
      { label: "New Zealand Time", timeZone: "Pacific/Auckland" },
    ].map((option) => ({
      ...option,
      searchText: `${option.label} ${option.timeZone} OCEANIA`.toLowerCase(),
    })),
  },
  {
    region: "LATIN AMERICA",
    options: [
      { label: "Mexico City Time", timeZone: "America/Mexico_City" },
      { label: "Brazil Time", timeZone: "America/Sao_Paulo" },
      { label: "Argentina Time", timeZone: "America/Argentina/Buenos_Aires" },
      { label: "Chile Time", timeZone: "America/Santiago" },
    ].map((option) => ({
      ...option,
      searchText: `${option.label} ${option.timeZone} LATIN AMERICA`.toLowerCase(),
    })),
  },
];

export function formatClockForTimeZone(timeZone, now = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  })
    .format(now)
    .replace(/\s/g, "")
    .toLowerCase();
}

