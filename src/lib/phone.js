export const PHONE_COUNTRY_CODES = [
  { label: "PK", code: "+92" },
  { label: "US", code: "+1" },
  { label: "GB", code: "+44" },
  { label: "AE", code: "+971" },
  { label: "SA", code: "+966" },
  { label: "CA", code: "+1" },
  { label: "AU", code: "+61" },
  { label: "IN", code: "+91" },
];

export function stripPhoneNumber(value = "") {
  return String(value ?? "").replace(/[^\d\s()\-]/g, "").trim();
}

export function parsePhoneNumber(value = "") {
  const trimmed = String(value ?? "").trim();
  const match = trimmed.match(/^(\+\d{1,4})\s*(.*)$/);
  if (!match) return { countryCode: "+92", number: trimmed };
  return { countryCode: match[1], number: match[2] };
}

export function formatPhoneNumber(countryCode = "+92", number = "") {
  const cleanNumber = stripPhoneNumber(number);
  return cleanNumber ? `${countryCode} ${cleanNumber}` : "";
}

export function validatePhoneNumber(value = "") {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}
