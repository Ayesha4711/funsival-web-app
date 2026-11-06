import test from 'node:test';
import assert from 'node:assert/strict';
import { bookingClock, canStartBooking } from '../src/lib/bookingClock.js';

test('recent reservations distinguish rejected, cancelled, awaiting host, and timed booking phases', async () => {
  const { getReservationStatusLabel } = await import('../src/lib/bookingClock.js');
  const booking = { startDate: '2026-10-15', endDate: '2026-10-15', startTime: '17:00', endTime: '18:00', listing: { timeZone: 'Asia/Karachi' } };
  const now = new Date('2026-10-15T12:30:00Z');
  assert.equal(getReservationStatusLabel({ ...booking, status: 'declined' }, now), 'Rejected');
  assert.equal(getReservationStatusLabel({ ...booking, status: 'cancelled' }, now), 'Cancelled');
  assert.equal(getReservationStatusLabel({ ...booking, status: 'awaiting_host_approval' }, now), 'Awaiting Host');
  assert.equal(getReservationStatusLabel({ ...booking, status: 'confirmed' }, new Date('2026-10-15T11:59:00Z')), 'Upcoming');
  assert.equal(getReservationStatusLabel({ ...booking, status: 'confirmed' }, now), 'In-progress');
  assert.equal(getReservationStatusLabel({ ...booking, status: 'confirmed' }, new Date('2026-10-15T13:00:00Z')), 'Completed');
  assert.equal(getReservationStatusLabel({ ...booking, status: 'awaiting_host_approval' }, new Date('2026-10-15T13:00:00Z')), 'Rejected');
  assert.equal(getReservationStatusLabel({ ...booking, status: 'listing_deleted' }, now), 'Listing Removed');
});

test('dated slots spanning listing midnight complete at the final slot rather than the latest clock time', async () => {
  const { getBookingEndAt, getBookingPhase, isBookingRequestExpired } = await import('../src/lib/bookingClock.js');
  const booking = { status: 'confirmed', startDate: '2026-10-12', endDate: '2026-10-13', listing: { timeZone: 'Asia/Karachi' }, slots: [
    { sourceDate: '2026-10-12', startTime: '21:00', endTime: '22:00' },
    { sourceDate: '2026-10-13', startTime: '00:00', endTime: '01:00' },
  ] };
  const clock = bookingClock('Asia/Karachi', new Date('2026-10-12T19:30:00Z'));
  assert.equal(getBookingEndAt(booking), Date.parse('2026-10-12T20:00:00Z'));
  assert.equal(getBookingPhase(booking, clock), 'in-progress');
  assert.equal(isBookingRequestExpired({ ...booking, status: 'pending' }, clock), false);
  assert.equal(getBookingPhase(booking, bookingClock('Asia/Karachi', new Date('2026-10-12T20:00:00Z'))), 'completed');
});

test('the listing calendar uses October 10 at 4:49 AM in Pakistan even though UTC is October 9', () => {
  const clock = bookingClock('Asia/Karachi', new Date('2026-10-09T23:49:00Z'));
  assert.equal(clock.date, '2026-10-10');
  assert.equal(canStartBooking('2026-10-09', '', clock), false);
  assert.equal(canStartBooking('2026-10-10', '', clock), true);
});

test('the booking calendar excludes yesterday immediately at listing-local midnight', () => {
  const clock = bookingClock('Asia/Karachi', new Date('2026-10-08T19:00:00Z'));
  assert.equal(clock.date, '2026-10-09');
  assert.equal(canStartBooking('2026-10-08', '23:59', clock), false);
  assert.equal(canStartBooking('2026-10-09', '00:01', clock), true);
});

test('changing the guest browser time zone leaves availability unchanged', () => {
  const originalTZ = process.env.TZ;
  try {
    for (const zone of ['Asia/Karachi', 'America/Los_Angeles', 'Pacific/Auckland']) {
      process.env.TZ = zone;
      const clock = bookingClock('America/New_York', new Date('2026-10-09T02:00:00Z'));
      assert.equal(clock.date, '2026-10-08');
      assert.equal(canStartBooking('2026-10-08', '23:00', clock), true);
      assert.equal(canStartBooking('2026-10-08', '21:00', clock), false);
    }
  } finally {
    if (originalTZ === undefined) delete process.env.TZ;
    else process.env.TZ = originalTZ;
  }
});

test('restored selections stop being valid when their start time or date passes', () => {
  const before = bookingClock('Asia/Karachi', new Date('2026-10-08T18:58:00Z'));
  const after = bookingClock('Asia/Karachi', new Date('2026-10-08T19:00:00Z'));
  assert.equal(canStartBooking('2026-10-08', '23:59', before), true);
  assert.equal(canStartBooking('2026-10-08', '23:59', after), false);
});

test('nonexistent and elapsed repeated daylight-saving times stay unavailable', () => {
  assert.equal(canStartBooking('2026-03-08', '02:30', bookingClock('America/New_York', new Date('2026-03-07T12:00:00Z'))), false);
  assert.equal(canStartBooking('2026-11-01', '01:30', bookingClock('America/New_York', new Date('2026-11-01T06:00:00Z'))), false);
});

test('cancellation disappears at 11 PM using the same clock as Completed and review eligibility', async () => {
  const { canCancelBooking, getBookingPhase, getBookingReviewLabel, canRequestBookingRefund } = await import('../src/lib/bookingClock.js');
  const booking = { status: 'confirmed', startDate: '2026-10-11', endTime: '23:00', startTime: '22:00', listing: { timeZone: 'Asia/Karachi' }, paymentStatus: 'held', payoutEligibleAt: '2026-10-12T18:00:00Z' };
  const before = bookingClock('Asia/Karachi', new Date('2026-10-11T17:59:59Z'));
  const ended = bookingClock('Asia/Karachi', new Date('2026-10-11T18:00:00Z'));
  assert.equal(canCancelBooking(booking, before), true);
  assert.equal(getBookingPhase(booking, before), 'in-progress');
  assert.equal(canCancelBooking(booking, ended), false);
  assert.equal(getBookingPhase(booking, ended), 'completed');
  assert.equal(getBookingReviewLabel(booking, ended), 'Leave a Review');
  assert.equal(canRequestBookingRefund(booking, ended.now), true);
  assert.equal(canCancelBooking({ ...booking, status: 'completed' }, before), false);
});

test('cancellation cutoff is independent of viewer zone and uses the last selected slot', async () => {
  const { canCancelBooking } = await import('../src/lib/bookingClock.js');
  const booking = { status: 'confirmed', startDate: '2026-10-11', slots: [{ startTime: '22:00', endTime: '23:00' }, { startTime: '20:00', endTime: '21:00' }], listing: { timeZone: 'Asia/Karachi' } };
  const previous = process.env.TZ;
  try {
    for (const viewer of ['Asia/Karachi', 'America/New_York', 'Pacific/Auckland']) {
      process.env.TZ = viewer;
      assert.equal(canCancelBooking(booking, bookingClock('Asia/Karachi', new Date('2026-10-11T17:59:59Z'))), true);
      assert.equal(canCancelBooking(booking, bookingClock('Asia/Karachi', new Date('2026-10-11T18:00:00Z'))), false);
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test('same-day unaccepted 12–1 AM booking shows rejected at 1 AM on both dashboards', async () => {
  const { isBookingRequestExpired, canCancelBooking } = await import('../src/lib/bookingClock.js');
  for (const status of ['pending', 'awaiting_host_approval']) {
    const booking = { status, startDate: '2026-10-12', startTime: '00:00', endTime: '01:00', listing: { timeZone: 'Asia/Karachi' } };
    const before = bookingClock('Asia/Karachi', new Date('2026-10-11T19:59:59Z'));
    const ended = bookingClock('Asia/Karachi', new Date('2026-10-11T20:00:00Z'));
    assert.equal(isBookingRequestExpired(booking, before), false);
    assert.equal(isBookingRequestExpired(booking, ended), true);
    assert.equal(canCancelBooking(booking, ended), false);
    assert.equal(isBookingRequestExpired({ ...booking, status: 'confirmed' }, ended), false);
  }
});
