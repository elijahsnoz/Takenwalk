type OpeningHoursEntry = { day: number; opens: string; closes: string; closed: boolean };

/** Business.openingHours is a loosely-typed Json column — returns null (unknown) rather than guessing. */
export function isOpenNow(openingHours: unknown, now: Date = new Date()): boolean | null {
  if (!Array.isArray(openingHours)) return null;

  const entry = (openingHours as OpeningHoursEntry[]).find((e) => e.day === now.getDay());
  if (!entry || entry.closed) return false;

  const [openH, openM] = entry.opens.split(":").map(Number);
  const [closeH, closeM] = entry.closes.split(":").map(Number);
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  return minutesNow >= openH * 60 + openM && minutesNow < closeH * 60 + closeM;
}
