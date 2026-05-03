import { describe, it, expect } from "vitest";
import { bookedDateSet, isDateBlocked } from "./utils";
import type { Booking } from "@/lib/supabase/types";

// Hotel semantics: end_date = check-out morning, NOT a blocked night.
const sample: Booking[] = [
  {
    id: "1",
    house: "small",
    start_date: "2026-06-01",
    end_date: "2026-06-04", // 3 nights: 01, 02, 03; checkout 04
    note: null,
    created_at: "2026-05-01T00:00:00Z",
  },
  {
    id: "2",
    house: "small",
    start_date: "2026-06-10",
    end_date: "2026-06-11", // 1 night: 10; checkout 11
    note: null,
    created_at: "2026-05-01T00:00:00Z",
  },
];

describe("bookedDateSet", () => {
  it("blocks nights between check-in and check-out, exclusive of check-out", () => {
    const set = bookedDateSet([sample[0]!]);
    expect(set.size).toBe(3);
    expect(set.has("2026-06-01")).toBe(true);
    expect(set.has("2026-06-02")).toBe(true);
    expect(set.has("2026-06-03")).toBe(true);
    expect(set.has("2026-06-04")).toBe(false); // checkout day — free
  });

  it("blocks one night for a single-night booking", () => {
    const set = bookedDateSet([sample[1]!]);
    expect(set.size).toBe(1);
    expect(set.has("2026-06-10")).toBe(true);
    expect(set.has("2026-06-11")).toBe(false); // checkout day
  });

  it("merges multiple bookings", () => {
    const set = bookedDateSet(sample);
    expect(set.size).toBe(4);
  });

  it("allows back-to-back bookings on the same checkout/checkin day", () => {
    const back2back: Booking[] = [
      {
        ...sample[0]!,
        id: "a",
        start_date: "2026-07-01",
        end_date: "2026-07-05",
      },
      {
        ...sample[0]!,
        id: "b",
        start_date: "2026-07-05", // new check-in same day as previous checkout
        end_date: "2026-07-08",
      },
    ];
    const set = bookedDateSet(back2back);
    // First: 01, 02, 03, 04 (4 nights). Second: 05, 06, 07 (3 nights).
    expect(set.size).toBe(7);
    expect(set.has("2026-07-04")).toBe(true);
    expect(set.has("2026-07-05")).toBe(true); // now the second booking's first night
    expect(set.has("2026-07-08")).toBe(false);
  });
});

describe("isDateBlocked", () => {
  it("returns true for a blocked night", () => {
    const set = bookedDateSet(sample);
    expect(isDateBlocked(new Date("2026-06-02T12:00:00Z"), set)).toBe(true);
  });

  it("returns false for a checkout day", () => {
    const set = bookedDateSet(sample);
    expect(isDateBlocked(new Date("2026-06-04T12:00:00Z"), set)).toBe(false);
  });

  it("returns false for a free date", () => {
    const set = bookedDateSet(sample);
    expect(isDateBlocked(new Date("2026-06-05T12:00:00Z"), set)).toBe(false);
  });
});
