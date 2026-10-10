import test from 'node:test';
import assert from 'node:assert/strict';
import { getListingRate, PRICE_LABELS } from '../src/lib/listingPricing.js';

test('selected pricing modes use their own rates without falling back to another mode', () => {
  const listing = { price: { hourly: 20, daily: 200, perPerson: 50 } };
  assert.equal(getListingRate(listing, 'daily'), 200);
  assert.equal(getListingRate(listing, 'hourly'), 20);
  assert.equal(getListingRate(listing, 'perPerson'), 50);
  assert.equal(getListingRate({ price: { hourly: 20 } }, 'daily'), null);
  assert.equal(getListingRate({ price: { daily: 0 } }, 'daily'), null);
  assert.equal(getListingRate({ basicInformation: { dailyRate: '150' } }, 'daily'), 150);
  assert.equal(PRICE_LABELS.daily, 'Daily');
});
