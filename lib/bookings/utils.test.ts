import { describe, it, expect } from "vitest";
import { bookedDateSet, isDateBlocked } from "./utils";
import type { Booking } from "@/lib/supabase/types";

const sample: Booking[] = [
  {
    id: "1",
    house: "small",
    start_date: "2026-06-01",
    end_date: "2026-06-03",
    note: null,
    created_at: "2026-05-01T00:00:00Z",
  },
  {
    id: "2",
    house: "small",
    start_date: "2026-06-10",
    end_date: "2026-06-10",
    note: null,
    created_at: "2026-05-01T00:00:00Z",
  },
];

describe("bookedDateSet", () => {
  it("expands a multi-day range to a set of all dates inclusive", () => {
    const set = bookedDateSet([sample[0]!]);
    expect(set.size).toBe(3);
    expect(set.has("2026-06-01")).toBe(true);
    expect(set.has("2026-06-02")).toBe(true);
    expect(set.has("2026-06-03")).toBe(true);
  });

  it("includes single-day ranges", () => {
    const set = bookedDateSet([sample[1]!]);
    expect(set.size).toBe(1);
    expect(set.has("2026-06-10")).toBe(true);
  });

  it("merges multiple bookings", () => {
    const set = bookedDateSet(sample);
    expect(set.size).toBe(4);
  });
});

describe("isDateBlocked", () => {
  it("returns true for a blocked date", () => {
    const set = bookedDateSet(sample);
    expect(isDateBlocked(new Date("2026-06-02T12:00:00Z"), set)).toBe(true);
  });

  it("returns false for a free date", () => {
    const set = bookedDateSet(sample);
    expect(isDateBlocked(new Date("2026-06-05T12:00:00Z"), set)).toBe(false);
  });
});
