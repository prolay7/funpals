/**
 * geoUtils.ts — Geographic utility functions.
 * Haversine formula for distance calculation (backup for PostGIS).
 */
export function milesToMeters(miles: number): number {
  return miles * 1609.344;
}

/**
 * haversineDistance — Calculate distance between two coordinates in miles.
 * @returns Distance in miles
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number { return (deg * Math.PI) / 180; }
