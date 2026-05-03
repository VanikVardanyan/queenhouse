# Admin & Availability Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a private `/admin` route where the owner marks date ranges as booked per house with a free-text note, and replace the disabled booking calendar on the public site with a real availability calendar that reads the same data.

**Architecture:** Supabase Postgres for storage (one `bookings` table) and Supabase Auth (magic link) for admin login, gated by Row-Level Security tied to a single owner email. Next.js App Router serves both the public locale-prefixed pages and the new non-localized `/admin` route. All DB access goes through the browser/server Supabase clients with the publishable key — no custom API routes.

**Tech Stack:** Next.js 15 App Router (existing), `@supabase/supabase-js@2`, `@supabase/ssr`, React Hook Form (existing), Tailwind v4 (existing), shadcn/ui Calendar (existing), Vitest (existing).

**Working dir:** `/Users/vanik/Desktop/projects/my projects/queenhouse`

**Spec:** `docs/superpowers/specs/2026-05-03-admin-availability-design.md`

---

## File Structure (created/modified by this plan)

```
queenhouse/
├── app/
│   ├── admin/
│   │   ├── layout.tsx                  NEW — bare layout (Russian, no theme provider)
│   │   ├── page.tsx                    NEW — login form OR dashboard depending on session
│   │   └── auth/callback/route.ts      NEW — magic-link return handler
│   └── [locale]/                       (existing, untouched)
├── components/
│   ├── admin/
│   │   ├── login-form.tsx              NEW — email input + send magic link
│   │   ├── booking-calendar.tsx        NEW — admin calendar with existing bookings highlighted
│   │   ├── booking-modal.tsx           NEW — add/edit/delete booking with note
│   │   └── house-tabs.tsx              NEW — 2-tab switcher (small/large house)
│   ├── availability-calendar.tsx       NEW — public read-only calendar
│   ├── disabled-booking-calendar.tsx   DELETED (replaced)
│   └── sections/contact.tsx            MODIFIED — swap calendar
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   NEW — browser Supabase client
│   │   ├── server.ts                   NEW — server Supabase client (cookies)
│   │   └── types.ts                    NEW — Booking row type
│   └── bookings/
│       ├── utils.ts                    NEW — date helpers (range to Set, overlap)
│       └── utils.test.ts               NEW — unit tests
├── i18n/messages/
│   ├── hy.json                         MODIFIED — public calendar strings
│   ├── ru.json                         MODIFIED — public calendar strings
│   └── en.json                         MODIFIED — public calendar strings
├── proxy.ts                            MODIFIED — exclude /admin from locale routing
├── docs/superpowers/specs/db-schema.sql NEW — pasteable into Supabase SQL editor
├── .env.local                          (already has Supabase URL + key)
└── .env.example                        (already has the var names)
```

---

## Phase 0 — Supabase Setup

### Task 1: Install Supabase SDK packages

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add deps**

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add supabase sdk"
```

---

### Task 2: Apply DB schema in Supabase dashboard

**Files:**
- Create: `docs/superpowers/specs/db-schema.sql`

- [ ] **Step 1: Write the schema file**

`docs/superpowers/specs/db-schema.sql`:
```sql
create table bookings (
  id          uuid primary key default gen_random_uuid(),
  house       text not null check (house in ('small', 'large')),
  start_date  date not null,
  end_date    date not null,
  note        text,
  created_at  timestamptz default now(),
  check (end_date >= start_date)
);

create index bookings_house_dates_idx on bookings (house, start_date, end_date);

alter table bookings enable row level security;

create policy "anyone can read"
  on bookings for select
  using (true);

create policy "only owner can write"
  on bookings for all
  using ((select auth.email()) = 'queenhouse.arm@gmail.com')
  with check ((select auth.email()) = 'queenhouse.arm@gmail.com');
```

- [ ] **Step 2: Apply in Supabase dashboard (manual)**

User opens https://supabase.com/dashboard/project/tvpolsuyqxfkwqrjggpp/sql/new, pastes the file contents, clicks Run. Confirm: Table editor → `bookings` exists with RLS enabled.

- [ ] **Step 3: Configure auth redirect URL**

In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://queenhouse.am`
- Additional Redirect URLs: `http://localhost:3000/admin/auth/callback`, `https://queenhouse.am/admin/auth/callback`, `https://queenhouse-sigma.vercel.app/admin/auth/callback`

Save.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/db-schema.sql
git commit -m "docs: add bookings db schema reference"
```

---

## Phase 1 — Supabase Clients & Types

### Task 3: Booking type module

**Files:**
- Create: `lib/supabase/types.ts`

- [ ] **Step 1: Write the type file**

`lib/supabase/types.ts`:
```typescript
export type House = "small" | "large";

export type Booking = {
  id: string;
  house: House;
  start_date: string; // ISO date YYYY-MM-DD
  end_date: string;
  note: string | null;
  created_at: string;
};

export type BookingInsert = {
  house: House;
  start_date: string;
  end_date: string;
  note?: string | null;
};

export type BookingUpdate = {
  start_date?: string;
  end_date?: string;
  note?: string | null;
};

export const HOUSES: House[] = ["small", "large"];

export const ADMIN_EMAIL = "queenhouse.arm@gmail.com";
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/types.ts
git commit -m "feat: add supabase booking types"
```

---

### Task 4: Browser Supabase client

**Files:**
- Create: `lib/supabase/client.ts`

- [ ] **Step 1: Write the browser client**

`lib/supabase/client.ts`:
```typescript
"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/client.ts
git commit -m "feat: add browser supabase client"
```

---

### Task 5: Server Supabase client

**Files:**
- Create: `lib/supabase/server.ts`

- [ ] **Step 1: Write the server client**

`lib/supabase/server.ts`:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          try {
            toSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll throws in Server Components; safe to ignore — middleware refreshes
          }
        },
      },
    },
  );
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/server.ts
git commit -m "feat: add server supabase client"
```

---

### Task 6: Date utilities (TDD)

**Files:**
- Create: `lib/bookings/utils.test.ts`
- Create: `lib/bookings/utils.ts`

- [ ] **Step 1: Write the failing test**

`lib/bookings/utils.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run — verify failure**

```bash
pnpm test
```
Expected: fails with `Cannot find module './utils'`.

- [ ] **Step 3: Implement**

`lib/bookings/utils.ts`:
```typescript
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
```

- [ ] **Step 4: Run — verify passes**

```bash
pnpm test
```
Expected: 5 new tests pass + existing 8 = 13 total.

- [ ] **Step 5: Commit**

```bash
git add lib/bookings
git commit -m "feat: bookings date utilities with tests"
```

---

## Phase 2 — Public Availability Calendar

### Task 7: i18n strings for availability calendar

**Files:**
- Modify: `i18n/messages/hy.json`
- Modify: `i18n/messages/ru.json`
- Modify: `i18n/messages/en.json`

- [ ] **Step 1: Add to hy.json**

In `i18n/messages/hy.json`, replace the `contact.comingSoon` and `contact.calendarHint` keys (and add new `contact.availability` block) so the `contact` object includes:
```json
    "availability": {
      "smallHouse": "Տուն 2 հյուրի համար",
      "largeHouse": "Տուն 4 հյուրի համար",
      "booked": "Զբաղված",
      "loading": "Բեռնում…"
    },
    "calendarHint": "Ընտրեք ամսաթիվը — զանգահարեք ամրագրման համար։",
```

(remove the existing `comingSoon` line — it's no longer used)

- [ ] **Step 2: Add to ru.json**

In `i18n/messages/ru.json`, similarly:
```json
    "availability": {
      "smallHouse": "Дом для 2 гостей",
      "largeHouse": "Дом для 4 гостей",
      "booked": "Занято",
      "loading": "Загрузка…"
    },
    "calendarHint": "Выберите дату — позвоните для бронирования.",
```

- [ ] **Step 3: Add to en.json**

```json
    "availability": {
      "smallHouse": "Cabin for 2 guests",
      "largeHouse": "Cabin for 4 guests",
      "booked": "Booked",
      "loading": "Loading…"
    },
    "calendarHint": "Pick a date — call us to book.",
```

- [ ] **Step 4: Commit**

```bash
git add i18n/messages
git commit -m "feat: i18n for availability calendar"
```

---

### Task 8: AvailabilityCalendar component

**Files:**
- Create: `components/availability-calendar.tsx`

- [ ] **Step 1: Implement**

`components/availability-calendar.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { bookedDateSet, isDateBlocked } from "@/lib/bookings/utils";
import type { Booking, House } from "@/lib/supabase/types";
import { HOUSES } from "@/lib/supabase/types";

export function AvailabilityCalendar() {
  const t = useTranslations("contact");
  const [house, setHouse] = useState<House>("small");
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("bookings")
      .select("*")
      .eq("house", house)
      .gte("end_date", new Date().toISOString().slice(0, 10))
      .then(({ data }) => {
        if (cancelled) return;
        setBlocked(bookedDateSet((data as Booking[]) ?? []));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [house]);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex gap-2">
        {HOUSES.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => setHouse(h)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              house === h
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {t(`availability.${h === "small" ? "smallHouse" : "largeHouse"}`)}
          </button>
        ))}
      </div>
      <div className={loading ? "opacity-50" : ""}>
        <Calendar
          mode="single"
          numberOfMonths={1}
          disabled={(d) => d < new Date(new Date().toDateString()) || isDateBlocked(d, blocked)}
          className="mx-auto"
        />
      </div>
      {loading && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {t("availability.loading")}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/availability-calendar.tsx
git commit -m "feat: public availability calendar"
```

---

### Task 9: Replace DisabledBookingCalendar with AvailabilityCalendar

**Files:**
- Modify: `components/sections/contact.tsx`
- Delete: `components/disabled-booking-calendar.tsx`

- [ ] **Step 1: Update contact section import**

In `components/sections/contact.tsx`, replace line:
```tsx
import { DisabledBookingCalendar } from "@/components/disabled-booking-calendar";
```
with:
```tsx
import { AvailabilityCalendar } from "@/components/availability-calendar";
```

And replace `<DisabledBookingCalendar />` with `<AvailabilityCalendar />`.

- [ ] **Step 2: Delete obsolete file**

```bash
rm components/disabled-booking-calendar.tsx
```

- [ ] **Step 3: Type-check**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Smoke test in dev**

```bash
pnpm dev
```
Open `http://localhost:3000/hy#contact`. Expected: tabs visible (Small/Large), calendar renders, no booked dates yet (table is empty). Stop server.

- [ ] **Step 5: Commit**

```bash
git add components/sections/contact.tsx components/disabled-booking-calendar.tsx
git commit -m "feat: swap disabled calendar for live availability"
```

---

## Phase 3 — Admin Auth

### Task 10: Skip /admin in next-intl proxy

**Files:**
- Modify: `proxy.ts`

- [ ] **Step 1: Update matcher**

Replace `proxy.ts` content:
```typescript
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 2: Commit**

```bash
git add proxy.ts
git commit -m "fix: exclude /admin from locale routing"
```

---

### Task 11: Admin layout

**Files:**
- Create: `app/admin/layout.tsx`

- [ ] **Step 1: Write bare layout**

`app/admin/layout.tsx`:
```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Queen House Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/layout.tsx
git commit -m "feat: bare admin layout"
```

---

### Task 12: Login form component

**Files:**
- Create: `components/admin/login-form.tsx`

- [ ] **Step 1: Write the form**

`components/admin/login-form.tsx`:
```tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg(null);
    const supabase = createClient();
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/admin/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="mx-auto mt-24 max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
      <h1 className="font-display text-2xl font-medium">Queen House Admin</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Введите email для получения ссылки.
      </p>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-11 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "sending" ? "Отправляем…" : "Отправить ссылку"}
        </button>
        {status === "sent" && (
          <p className="text-sm text-primary">
            Ссылка отправлена на {email}. Откройте письмо и нажмите ссылку.
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-500">Ошибка: {errorMsg}</p>
        )}
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/login-form.tsx
git commit -m "feat: admin login form"
```

---

### Task 13: Magic-link callback route

**Files:**
- Create: `app/admin/auth/callback/route.ts`

- [ ] **Step 1: Implement**

`app/admin/auth/callback/route.ts`:
```typescript
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/admin`);
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/auth/callback/route.ts
git commit -m "feat: magic-link callback handler"
```

---

### Task 14: Admin page (login OR dashboard placeholder)

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Write the gate**

`app/admin/page.tsx`:
```tsx
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/admin/login-form";
import { ADMIN_EMAIL } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return <LoginForm />;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="font-display text-3xl">Queen House Admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
      <p className="mt-6 text-muted-foreground">Загрузка панели бронирований…</p>
    </div>
  );
}
```

- [ ] **Step 2: Smoke test in dev**

```bash
pnpm dev
```
Open `http://localhost:3000/admin`. Expected: login form (you're not logged in). Try entering `queenhouse.arm@gmail.com` → click → check email → click link → after redirect see "Queen House Admin" and your email. Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: admin page with magic-link gate"
```

---

## Phase 4 — Admin CRUD

### Task 15: House tabs component

**Files:**
- Create: `components/admin/house-tabs.tsx`

- [ ] **Step 1: Write tabs**

`components/admin/house-tabs.tsx`:
```tsx
"use client";

import type { House } from "@/lib/supabase/types";
import { HOUSES } from "@/lib/supabase/types";

const LABELS: Record<House, string> = {
  small: "Дом для 2 гостей",
  large: "Дом для 4 гостей",
};

export function HouseTabs({
  value,
  onChange,
}: {
  value: House;
  onChange: (h: House) => void;
}) {
  return (
    <div className="flex gap-2">
      {HOUSES.map((h) => (
        <button
          key={h}
          type="button"
          onClick={() => onChange(h)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            value === h
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          }`}
        >
          {LABELS[h]}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/house-tabs.tsx
git commit -m "feat: admin house tabs"
```

---

### Task 16: Booking modal (UI only)

**Files:**
- Create: `components/admin/booking-modal.tsx`

- [ ] **Step 1: Write the modal shell**

`components/admin/booking-modal.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Booking } from "@/lib/supabase/types";

export type BookingDraft = {
  start_date: string;
  end_date: string;
  note: string;
};

export function BookingModal({
  open,
  onOpenChange,
  initial,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  initial: { booking?: Booking; range?: { from: string; to: string } } | null;
  onSave: (draft: BookingDraft) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!initial) return;
    if (initial.booking) {
      setStart(initial.booking.start_date);
      setEnd(initial.booking.end_date);
      setNote(initial.booking.note ?? "");
    } else if (initial.range) {
      setStart(initial.range.from);
      setEnd(initial.range.to);
      setNote("");
    }
  }, [initial]);

  const isEdit = Boolean(initial?.booking);

  async function handleSave() {
    setBusy(true);
    await onSave({ start_date: start, end_date: end, note });
    setBusy(false);
    onOpenChange(false);
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm("Удалить бронь?")) return;
    setBusy(true);
    await onDelete();
    setBusy(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Изменить бронь" : "Добавить бронь"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Заезд</span>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Выезд</span>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Заметка</span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Имя гостя, телефон, аванс…"
              className="rounded-md border border-border bg-background p-3"
            />
          </label>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy || !start || !end}
              className="flex-1 h-11 rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Сохраняем…" : "Сохранить"}
            </button>
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="h-11 rounded-md border border-red-500/50 px-4 text-sm font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-60"
              >
                Удалить
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/booking-modal.tsx
git commit -m "feat: admin booking modal ui"
```

---

### Task 17: Admin booking calendar (read + add/edit)

**Files:**
- Create: `components/admin/booking-calendar.tsx`

- [ ] **Step 1: Write the calendar**

`components/admin/booking-calendar.tsx`:
```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { bookedDateSet, isDateBlocked } from "@/lib/bookings/utils";
import type { Booking, BookingInsert, House } from "@/lib/supabase/types";
import { BookingModal, type BookingDraft } from "./booking-modal";

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function findBookingForDate(date: Date, list: Booking[]): Booking | null {
  const iso = toIso(date);
  return (
    list.find(
      (b) => b.start_date <= iso && b.end_date >= iso,
    ) ?? null
  );
}

export function BookingCalendar({ house }: { house: House }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<
    { booking?: Booking; range?: { from: string; to: string } } | null
  >(null);
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});

  const reload = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("house", house)
      .order("start_date");
    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  }, [house]);

  useEffect(() => {
    void reload();
  }, [reload]);

  function onSelect(value: { from?: Date; to?: Date } | undefined) {
    if (!value?.from) return;

    // If user clicked a single date that already has a booking → open edit
    if (!value.to || toIso(value.from) === toIso(value.to)) {
      const existing = findBookingForDate(value.from, bookings);
      if (existing) {
        setModalInitial({ booking: existing });
        setModalOpen(true);
        setRange({});
        return;
      }
    }

    setRange(value);
    if (value.from && value.to) {
      setModalInitial({
        range: { from: toIso(value.from), to: toIso(value.to) },
      });
      setModalOpen(true);
    }
  }

  async function handleSave(draft: BookingDraft) {
    const supabase = createClient();
    if (modalInitial?.booking) {
      await supabase
        .from("bookings")
        .update({
          start_date: draft.start_date,
          end_date: draft.end_date,
          note: draft.note || null,
        })
        .eq("id", modalInitial.booking.id);
    } else {
      const insert: BookingInsert = {
        house,
        start_date: draft.start_date,
        end_date: draft.end_date,
        note: draft.note || null,
      };
      await supabase.from("bookings").insert(insert);
    }
    setRange({});
    await reload();
  }

  async function handleDelete() {
    if (!modalInitial?.booking) return;
    const supabase = createClient();
    await supabase.from("bookings").delete().eq("id", modalInitial.booking.id);
    setRange({});
    await reload();
  }

  const blocked = bookedDateSet(bookings);

  return (
    <div className="flex flex-col gap-4">
      <Calendar
        mode="range"
        selected={range}
        onSelect={onSelect}
        numberOfMonths={2}
        modifiers={{
          booked: (d: Date) => isDateBlocked(d, blocked),
        }}
        modifiersClassNames={{
          booked: "bg-primary/30 text-primary-foreground font-semibold",
        }}
        className="mx-auto"
      />
      {loading && (
        <p className="text-center text-sm text-muted-foreground">Загрузка…</p>
      )}
      <BookingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={modalInitial}
        onSave={handleSave}
        onDelete={modalInitial?.booking ? handleDelete : undefined}
      />
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/booking-calendar.tsx
git commit -m "feat: admin booking calendar with crud"
```

---

### Task 18: Wire admin dashboard

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Replace dashboard placeholder**

Replace the logged-in branch in `app/admin/page.tsx` so the file becomes:
```tsx
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/admin/login-form";
import { AdminDashboard } from "@/components/admin/dashboard";
import { ADMIN_EMAIL } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return <LoginForm />;
  }

  return <AdminDashboard email={user.email} />;
}
```

- [ ] **Step 2: Create the dashboard component**

`components/admin/dashboard.tsx`:
```tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { HouseTabs } from "./house-tabs";
import { BookingCalendar } from "./booking-calendar";
import type { House } from "@/lib/supabase/types";

export function AdminDashboard({ email }: { email: string }) {
  const [house, setHouse] = useState<House>("small");

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="font-display text-2xl">Queen House Admin</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">{email}</span>
          <button
            type="button"
            onClick={signOut}
            className="rounded-md border border-border px-3 py-1.5 hover:bg-muted"
          >
            Выйти
          </button>
        </div>
      </header>
      <div className="mt-6 flex flex-col gap-6">
        <HouseTabs value={house} onChange={setHouse} />
        <BookingCalendar house={house} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Smoke test**

```bash
pnpm dev
```
Open `http://localhost:3000/admin`, log in via magic link. Expected:
- See "Queen House Admin" + your email + "Выйти"
- Tabs: Дом для 2 / Дом для 4
- Calendar (2 months)
- Click date range → modal → enter note → save → modal closes → date highlighted on calendar
- Click highlighted date → modal opens with existing data → edit → save
- Click highlighted date → click Delete → confirm → booking gone

Stop server.

- [ ] **Step 5: Commit**

```bash
git add app/admin/page.tsx components/admin/dashboard.tsx
git commit -m "feat: wire admin dashboard with calendar crud"
```

---

## Phase 5 — Production Deploy

### Task 19: Add Supabase env vars to Vercel + deploy

**Files:**
- (no code changes; Vercel dashboard action)

- [ ] **Step 1: Push current branch to remote**

```bash
git push
```

- [ ] **Step 2: Add env vars in Vercel UI (manual)**

Go to https://vercel.com/dashboard → `queenhouse` → Settings → Environment Variables. Add for **Production, Preview, Development**:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tvpolsuyqxfkwqrjggpp.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_mShJRmmUR3lFvgj5sKOvcw_BHHNO7WW` |
| `NEXT_PUBLIC_SITE_URL` | `https://queenhouse.am` |

Save each.

- [ ] **Step 3: Trigger redeploy**

Deployments → latest → ⋯ menu → **Redeploy** → confirm. Wait ~2 min for build to finish.

- [ ] **Step 4: Smoke test prod**

Visit:
- `https://queenhouse.am/` → public site loads, calendar shows tabs and is interactive
- `https://queenhouse.am/admin` → login form
- Submit `queenhouse.arm@gmail.com` → email arrives → click link → returns to admin panel
- Add a test booking → confirm it appears in the public availability calendar (different browser/incognito)
- Delete the test booking

---

## Pre-Implementation Checklist

Before starting Task 1:

- [x] Spec written and approved (`docs/superpowers/specs/2026-05-03-admin-availability-design.md`)
- [x] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `.env.local` for dev (already there from earlier)
- [ ] Owner has access to the inbox `queenhouse.arm@gmail.com` to receive magic-link emails

---

## Post-Implementation Sanity Checks

After Task 19:

- [ ] Public calendar shows booked dates as disabled per house
- [ ] Switching between Small/Large house tabs reloads correct data
- [ ] Magic link email arrives within 30 seconds
- [ ] Wrong email (e.g., your personal) gets a session but cannot insert/update/delete (RLS blocks)
- [ ] Sign Out works and returns to login form
- [ ] `https://queenhouse.am/admin` is **not** indexed by Google (`robots: noindex` in admin layout)
