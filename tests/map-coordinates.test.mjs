import test from 'node:test';
import assert from 'node:assert/strict';
import { getListingCoordinates } from '../src/lib/mapCoordinates.js';

test('backend coordinates support listings in western and southern hemispheres', () => {
  assert.deepEqual(getListingCoordinates({ placeLocation: { latitude: 37.7749, longitude: -122.4194 } }), { lat: 37.7749, lon: -122.4194 });
  assert.deepEqual(getListingCoordinates({ placeLocation: { latitude: -33.8688, longitude: 151.2093 } }), { lat: -33.8688, lon: 151.2093 });
});

test('zero and legacy coordinate fields are valid, missing or invalid coordinates need geocoding', () => {
  assert.deepEqual(getListingCoordinates({ placeLocation: { latitude: '0', longitude: '0' } }), { lat: 0, lon: 0 });
  assert.deepEqual(getListingCoordinates({ lat: 51.5, lng: -0.12 }), { lat: 51.5, lon: -0.12 });
  for (const placeLocation of [{ latitude: null, longitude: null }, { latitude: '', longitude: '' }, { latitude: 91, longitude: 0 }, { latitude: 0, longitude: 181 }]) {
    assert.equal(getListingCoordinates({ placeLocation }), null);
  }
});
