/**
 * geoUtils.test.ts — Unit tests for geographic utility functions.
 */
import { haversineDistance, milesToMeters } from '../../src/utils/geoUtils';

describe('milesToMeters', () => {
  it('converts 1 mile to ~1609 meters', () => {
    expect(milesToMeters(1)).toBeCloseTo(1609.344, 0);
  });
  it('converts 0 miles to 0 meters', () => {
    expect(milesToMeters(0)).toBe(0);
  });
});

describe('haversineDistance', () => {
  it('returns 0 for same coordinates', () => {
    expect(haversineDistance(40.7128, -74.0060, 40.7128, -74.0060)).toBe(0);
  });

  it('returns approximate distance between NYC and LA (~2450 miles)', () => {
    const dist = haversineDistance(40.7128, -74.006, 34.0522, -118.2437);
    expect(dist).toBeGreaterThan(2400);
    expect(dist).toBeLessThan(2500);
  });
});
