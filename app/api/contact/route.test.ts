import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: async () => ({ id: "test" }) };
  },
}));

const { POST } = await import("./route");

function makeReq(body: unknown, ip = "9.9.9.9") {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    rateLimit.__reset();
    process.env.RESEND_API_KEY = "test-key";
  });

  it("rejects invalid payload (no name/phone)", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it("accepts valid payload", async () => {
    const res = await POST(makeReq({ name: "Vanik", phone: "+374411234567" }));
    expect(res.status).toBe(200);
  });

  it("silently 200s when honeypot is filled", async () => {
    const res = await POST(
      makeReq(
        { name: "x", phone: "+37411111", website: "spam" },
        "8.8.8.8",
      ),
    );
    expect(res.status).toBe(200);
  });

  it("rate-limits a second request from same IP", async () => {
    await POST(makeReq({ name: "A", phone: "+37411111" }, "5.5.5.5"));
    const res = await POST(
      makeReq({ name: "B", phone: "+37422222" }, "5.5.5.5"),
    );
    expect(res.status).toBe(429);
  });
});
