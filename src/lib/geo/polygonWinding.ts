type Position = [number, number]; // GeoJSON order: [lng, lat]

/** Shoelace formula — sign tells winding direction. */
export function signedRingArea(ring: Position[]): number {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

/** A polygon-with-hole only renders as a hole when the hole's winding is opposite the outer ring's. */
export function ensureOppositeWinding(outer: Position[], inner: Position[]): Position[] {
  const sameDirection = Math.sign(signedRingArea(outer)) === Math.sign(signedRingArea(inner));
  return sameDirection ? [...inner].reverse() : inner;
}
