import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/contact-schema";
import { rateLimit } from "@/lib/rate-limit";
import { SITE } from "@/lib/content";

export const runtime = "nodejs";

function getIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0];
    if (first) return first.trim();
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const ip = getIp(req);
  const allowed = rateLimit.check(`contact:${ip}`, { windowMs: 60_000, max: 1 });
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY missing");
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const { name, phone, email, checkIn, checkOut, guests, message } = parsed.data;
  const lines: string[] = [
    `Name: ${name}`,
    `Phone: ${phone}`,
    email ? `Email: ${email}` : null,
    checkIn ? `Check-in: ${checkIn}` : null,
    checkOut ? `Check-out: ${checkOut}` : null,
    guests ? `Guests: ${guests}` : null,
    message ? `\nMessage:\n${message}` : null,
  ].filter((s): s is string => Boolean(s));

  try {
    await resend.emails.send({
      from: `Queen House <noreply@${SITE.domain}>`,
      to: SITE.email,
      replyTo: email || undefined,
      subject: `New booking inquiry from ${name}`,
      text: lines.join("\n"),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }
}
