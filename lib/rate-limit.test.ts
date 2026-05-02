import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    rateLimit.__reset();
  });

  it("allows the first request", () => {
    expect(rateLimit.check("1.1.1.1", { windowMs: 60_000, max: 1 })).toBe(true);
  });

  it("blocks the second request inside the window", () => {
    rateLimit.check("1.1.1.1", { windowMs: 60_000, max: 1 });
    expect(rateLimit.check("1.1.1.1", { windowMs: 60_000, max: 1 })).toBe(false);
  });

  it("allows different IPs independently", () => {
    rateLimit.check("1.1.1.1", { windowMs: 60_000, max: 1 });
    expect(rateLimit.check("2.2.2.2", { windowMs: 60_000, max: 1 })).toBe(true);
  });

  it("allows again after the window passes", async () => {
    rateLimit.check("1.1.1.1", { windowMs: 10, max: 1 });
    await new Promise((r) => setTimeout(r, 15));
    expect(rateLimit.check("1.1.1.1", { windowMs: 10, max: 1 })).toBe(true);
  });
});
