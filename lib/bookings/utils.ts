import type { Booking } from "@/lib/supabase/types";

const ISO_DATE_LEN = 10;

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, ISO_DATE_LEN);
}

function* eachDay(start: string, end: string): Generator<string> {
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last) {
    yield toIsoDate(cursor);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
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
  return set.has(toIsoDate(date));
}
