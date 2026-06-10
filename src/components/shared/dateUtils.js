/**
 * Shared date utility helpers used across listing wizards and forms.
 */

/**
 * Normalize a raw date string to mm/dd/yyyy display format.
 *
 * Accepts:
 *   - ISO format:      "yyyy-mm-dd"   → "mm/dd/yyyy"
 *   - Legacy format:   "mm/dd/yyyy"   → returned as-is
 *   - Already correct: anything else  → returned as-is
 *
 * Returns an empty string for null / undefined / unparseable input.
 */
export function normalizeDateValue(value) {
  if (!value) return "";
  // Strip time portion from full ISO datetime strings (e.g. "2025-09-25T00:00:00.000Z")
  const str = String(value).trim().split("T")[0];

  // ISO format: yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split("-");
    return `${month}/${day}/${year}`;
  }

  // Already mm/dd/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }

  // Return as-is for anything else (partial, display-only, etc.)
  return str;
}

/**
 * Parse a date string (ISO, ISO datetime, or mm/dd/yyyy) into a Date object.
 * Returns null if the input is invalid.
 */
export function parseCalendarDate(value = "") {
  if (!value) return null;
  // Strip time portion from full ISO datetime strings (e.g. "2025-09-25T00:00:00.000Z")
  const str = String(value).trim().split("T")[0];
  let year, month, day;

  if (str.includes("-")) {
    // ISO format: yyyy-mm-dd
    [year, month, day] = str.split("-").map(Number);
  } else if (str.includes("/")) {
    // Legacy mm/dd/yyyy
    [month, day, year] = str.split("/").map(Number);
  } else {
    return null;
  }

  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isFinite(date.getTime()) ? date : null;
}
