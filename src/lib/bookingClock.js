import { DateTime } from 'luxon';

// Availability dates are calendar labels; start times belong to the listing.
export function bookingClock(timeZone = 'UTC', now = new Date()) {
  const values = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(now).map(part => [part.type, part.value]));
  return { timeZone, now: now.getTime(), date: `${values.year}-${values.month}-${values.day}`, time: `${values.hour}:${values.minute}:${values.second}` };
}

export function canStartBooking(date, time, clock) {
  const day = String(date || '').split('T')[0];
  if (day < clock.date || !day) return false;
  if (!time) return true;
  const label = `${day}T${time}`;
  const local = DateTime.fromISO(label, { zone: clock.timeZone });
  if (!local.isValid || local.toFormat("yyyy-MM-dd'T'HH:mm") !== label) return false;
  return Math.min(...local.getPossibleOffsets().map(d => d.toMillis())) > clock.now;
}
