import test from 'node:test';
import assert from 'node:assert/strict';
import { bookingClock, canStartBooking } from '../src/lib/bookingClock.js';

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
