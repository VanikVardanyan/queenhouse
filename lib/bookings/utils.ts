import type { Booking } from "@/lib/supabase/types";

/**
 * Convert a Date to a local YYYY-MM-DD string (no timezone shift).
 * `toISOString()` would convert to UTC and shift the day for non-UTC users.
 */
export function toLocalIso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Yields nights between check-in and check-out, EXCLUDING check-out day.
 * Hotel semantics: a booking 2 → 5 covers nights 2, 3, 4. The new guest
 * can check in on the afternoon of the 5th, so the 5th is not blocked.
 */
function* eachDay(start: string, end: string): Generator<string> {
  const cursor = new Date(`${start}T12:00:00`);
  const last = new Date(`${end}T12:00:00`);
  while (cursor < last) {
    yield toLocalIso(cursor);
    cursor.setDate(cursor.getDate() + 1);
  }
}

export function bookedDateSet(bookings: Booking[]): Set<string> {
  const set = new Set<string>();
  for (const b of bookings) {
    for (const day of eachDay(b.start_date, b.end_date)) {
      set.add(day);
    }
  }
  return set;
}

export function isDateBlocked(date: Date, set: Set<string>): boolean {
  return set.has(toLocalIso(date));
}
