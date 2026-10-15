import { DateTime } from 'luxon';

export function getReservationStatusLabel(reservation, now = new Date()) {
  const raw = String(reservation?.status || reservation?.bookingStatus || reservation?.state || '').toLowerCase();
  const booking = { ...reservation, status: raw };
  const clock = bookingClock(reservation?.listing?.timeZone || reservation?.listingSnapshot?.timeZone || 'UTC', now);
  if (raw === 'declined' || raw === 'rejected') return 'Rejected';
  if (raw === 'cancelled' || raw === 'canceled') return 'Cancelled';
  if (raw === 'listing_deleted' || raw === 'listing-deleted') return 'Listing Removed';
  if (raw === 'completed') return 'Completed';
  if (isBookingRequestExpired(booking, clock)) return 'Rejected';
  if (raw === 'pending' || raw === 'awaiting_host_approval' || raw === 'awaitinghostapproval') return 'Awaiting Host';
  if (raw === 'confirmed') {
    return { upcoming: 'Upcoming', 'in-progress': 'In-progress', completed: 'Completed' }[getBookingPhase(booking, clock)];
  }
  if (raw === 'upcoming') return 'Upcoming';
  if (raw === 'active' || raw === 'in-progress' || raw === 'in_progress') return 'In-progress';
  return 'Awaiting Host';
}

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

export function getBookingEndAt(booking, timeZone = booking.listing?.timeZone || 'UTC') {
  if (booking.slots?.some(slot => slot.sourceDate)) {
    const ends = booking.slots.map(slot => DateTime.fromISO(`${String(slot.sourceDate || booking.startDate).split('T')[0]}T${slot.endTime}`, { zone: timeZone })).filter(end => end.isValid);
    return ends.length ? Math.max(...ends.map(end => end.toMillis())) : null;
  }
  const day = String(booking.endDate || booking.startDate || '').split('T')[0];
  const endTime = booking.slots?.length
    ? booking.slots.map(slot => slot.endTime).filter(Boolean).sort().at(-1)
    : booking.endTime;
  const end = DateTime.fromISO(`${day}T${endTime || '23:59'}`, { zone: timeZone });
  return end.isValid ? end.toMillis() : null;
}

export function getBookingReviewLabel(booking, clock = bookingClock(booking.listing?.timeZone || 'UTC')) {
  if (!['confirmed', 'completed'].includes(booking.status)) return null;
  if (booking.reviewStatus?.reason === 'only_booking_guest_can_review') return null;
  const end = getBookingEndAt(booking, clock.timeZone);
  if (end === null || clock.now < end || clock.now > end + 7 * 24 * 60 * 60 * 1000) return null;
  return booking.reviewStatus?.hasSubmitted || booking.reviewStatus?.canEdit || booking.review ? 'Edit Review' : 'Leave a Review';
}

export function canRequestBookingRefund(booking, now = Date.now()) {
  if (booking.reviewStatus?.hasSubmitted) return false;
  if (booking.paymentStatus !== 'held' || !booking.payoutEligibleAt || booking.activeRefundRequest) return false;
  return Number(now) < new Date(booking.payoutEligibleAt).getTime();
}

export function canCancelBooking(booking, clock = bookingClock(booking.listing?.timeZone || 'UTC')) {
  if (!['pending', 'awaiting_host_approval', 'confirmed'].includes(booking.status)) return false;
  return !isBookingRequestExpired(booking, clock) && getBookingPhase(booking, clock) !== 'completed';
}

export function getBookingPhase(booking, clock = bookingClock(booking.listing?.timeZone || 'UTC')) {
  const startDate = String(booking.startDate || '').split('T')[0];
  const slots = booking.slots || [];
  const firstSlot = slots.slice().sort((a, b) => String(a.sourceDate || startDate).localeCompare(String(b.sourceDate || startDate)) || String(a.startTime).localeCompare(String(b.startTime)))[0];
  const startTime = firstSlot?.startTime || booking.startTime;
  const start = DateTime.fromISO(`${firstSlot?.sourceDate || startDate}T${startTime || '00:00'}`, { zone: clock.timeZone });
  const end = getBookingEndAt(booking, clock.timeZone);
  if (end !== null && clock.now >= end) return 'completed';
  if (!start.isValid || clock.now < start.toMillis()) return 'upcoming';
  return 'in-progress';
}

export function isBookingRequestExpired(booking, clock = bookingClock(booking.listing?.timeZone || 'UTC')) {
  const status = String(booking.status || booking.bookingStatus || booking.state || '').toLowerCase();
  if (!['pending', 'awaiting_host_approval'].includes(status)) return false;
  const day = String((booking.slots?.some(slot => slot.sourceDate) ? booking.endDate || booking.startDate : booking.startDate) || '').split('T')[0];
  const hasEndTime = booking.endTime || booking.slots?.some(slot => slot.endTime);
  const end = hasEndTime ? getBookingEndAt(booking, clock.timeZone) : null;
  return (/^\d{4}-\d{2}-\d{2}$/.test(day) && day < clock.date)
    || (end !== null && clock.now >= end);
}
