# Admin & Availability Calendar — Design Spec

**Date:** 2026-05-03
**Status:** Pending user review
**Owner:** v.vardanyan@aitarget.com (admin: queenhouse.arm@gmail.com)

## 1. Project Summary

Add a private admin panel where the owner marks dates as already reserved (after taking a phone booking), and replace the disabled booking calendar on the public site with a real availability calendar showing which dates are taken per house. Booking acceptance and payments remain phone-only — this spec is **not** a booking acceptance system; it's a "show what's already taken" feature plus a private tool for the owner to maintain that data.

## 2. Goals & Non-Goals

### Goals
- Owner can log into `/admin` from any device (phone, laptop) without remembering a password
- Owner can mark a date range as booked for one of two houses, with an optional free-text note (guest name, deposit info, phone, etc.)
- Owner can edit and delete existing bookings
- Public visitors see a real availability calendar per house — booked dates grey/disabled, free dates highlighted
- Zero ongoing cost on free Supabase tier
- Two independent calendars per house (no shared availability)

### Non-Goals (this phase)
- Online booking acceptance (still phone-only)
- Payment processing
- Multi-user admin / role management
- iCal export/import (Booking.com / Airbnb sync)
- Email notifications when admin adds bookings
- Mobile native app

## 3. Audience

**Admin:** single user — owner with email `queenhouse.arm@gmail.com`. All other emails rejected by Supabase Row-Level Security regardless of how they try to authenticate.

**Public:** site visitors looking at `/`, `/hy`, `/ru`, `/en` — see availability info before deciding to call.

## 4. Architecture

### Stack
- **Supabase** (free tier — 500MB Postgres, 50K monthly auth users, unlimited API requests)
- **Magic-link auth** (no passwords, owner enters email → gets one-tap login link)
- **Row-Level Security (RLS)** — public read access, write access only to whitelisted email
- **Next.js client + server actions** — one new route `/admin`, no separate API endpoints needed (Supabase client handles CRUD with RLS-protected access)

### Data Model

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

create index on bookings (house, start_date, end_date);

alter table bookings enable row level security;

create policy "anyone can read" on bookings
  for select using (true);

create policy "only owner can write" on bookings
  for all
  using ((select auth.email()) = 'queenhouse.arm@gmail.com')
  with check ((select auth.email()) = 'queenhouse.arm@gmail.com');
```

**House values:**
- `'small'` — for 2 guests
- `'large'` — for 4 guests

(stored as text since it's a stable enum of two values; no separate houses table needed for MVP)

### Auth Flow

1. Owner navigates to `/admin`
2. No session cookie → show login form: email input + "Send link"
3. Owner submits email → Supabase Auth sends magic link to that email
4. Owner opens email on their device → clicks link → Supabase redirects to our callback URL with auth tokens
5. Our callback (`/admin/auth/callback`) sets the session cookie and redirects to `/admin`
6. `/admin` checks session → if authenticated, render admin UI
7. All write operations use the authenticated client → RLS verifies email is `queenhouse.arm@gmail.com`
8. Anyone else who completes auth (e.g., types their own email) gets a session, but RLS blocks all writes — they see read-only data, can't break anything

### Routing

- `/admin` — admin dashboard (not locale-prefixed; only used by owner)
- `/admin/auth/callback` — magic-link return handler
- Public site (locale-prefixed) gains availability data; no new public routes

The next-intl proxy must be updated to skip the `/admin` path so it doesn't redirect to `/hy/admin`.

## 5. Public Site Changes

### Component swap
- `<DisabledBookingCalendar />` (current — fully disabled with "coming soon" badge) is replaced by `<AvailabilityCalendar />`.
- Removes the "Booking online — coming soon" badge.

### `<AvailabilityCalendar />` UI
- Two tabs at the top: **«Дом для 2 гостей»** / **«Дом для 4 гостей»** (translated for hy/ru/en)
- Calendar shows the next 6 months (paginated month-by-month)
- Booked dates: muted/grey background, `cursor: not-allowed`, hover shows "Занято" tooltip (no notes — those are private)
- Available dates: normal styling
- Past dates: greyed out, non-interactive
- Helper text below: "Выбранные даты заняты. Свободные — позвоните для брони" (per locale)

### Data fetch
- Server component fetches bookings for the next 12 months in `Contact` section render
- Anonymous Supabase client (uses `anon` public key)
- Cached at the edge for 60s — refresh delay is acceptable since admin updates are infrequent

## 6. Admin UI

### Layout
- Single-page admin dashboard at `/admin`
- Localized in Russian only (single user, no need for multilingual)
- Mobile-responsive (owner will use it from phone often)

### When not logged in
- Centered card: "Queen House Admin"
- Email input
- "Отправить ссылку для входа" button
- After submit: "Проверьте почту — ссылка отправлена на {email}"

### When logged in
- Header bar: «Queen House Admin» + email + «Выйти»
- Tabs: **«Дом для 2 гостей»** | **«Дом для 4 гостей»** (preserved in URL hash so refresh keeps tab)
- Below tabs: 3-month calendar view (current + next 2 months), scrollable
- Each existing booking is highlighted with the accent color and shows a small note preview on hover
- Click empty date → "Add booking" mode → second click defines range → modal opens
- Modal: «Заметка (необязательно)» textarea, «Сохранить» / «Отмена»
- Click existing booking → modal: edit note, delete button, save button

### Component structure
```
app/admin/
├── page.tsx                  # router-level: check session, render login or dashboard
├── auth/callback/route.ts    # magic-link callback handler
└── layout.tsx                # bare layout (no locale, no theme switcher)

components/admin/
├── login-form.tsx            # client: email + send link
├── booking-calendar.tsx      # client: calendar with bookings overlaid
├── booking-modal.tsx         # client: add/edit/delete booking
└── house-tabs.tsx            # client: tab switcher

lib/supabase/
├── client.ts                 # browser client (anon key)
├── server.ts                 # server client (cookies, anon key)
└── types.ts                  # shared Booking type
```

## 7. Environment Variables

Added to `.env.local` (dev) and Vercel (Production / Preview / Development):

| Var | Source | Public? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings → API → Project URL | yes (client-readable) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings → API → anon public | yes (client-readable, RLS-gated) |
| `NEXT_PUBLIC_SITE_URL` | `https://queenhouse.am` | yes (used to build magic-link redirect) |

Note: no `service_role` key needed. Everything uses anon key + RLS.

## 8. Validation & Edge Cases

- Date range validation: `end_date >= start_date` enforced by DB CHECK constraint
- Overlapping bookings for same house: allowed (admin's responsibility — sometimes overlaps make sense for partial-day handovers)
- Past dates in admin: editable but visually de-emphasized
- Empty note: allowed (note is optional)
- Bookings array could grow indefinitely — clean up via manual delete; no auto-purge in MVP
- Magic-link email rate-limit: Supabase enforces ~1/min/email out of the box

## 9. Out of Scope — Phase 3 hooks

Designed so phase 3 doesn't require structural rewrites:
- Add `app/api/bookings/` for online booking acceptance with payment integration (Stripe / Idram)
- Move public AvailabilityCalendar to interactive booking flow with form
- Add `bookings.guest_email`, `bookings.guest_phone`, `bookings.payment_status` columns
- Email notifications via Resend when new online booking comes in
- iCal feed at `/api/bookings.ics` for syncing with Booking.com listings

## 10. Risks

| Risk | Mitigation |
|---|---|
| Owner can't access email at the moment of booking | Magic links last 24h; owner can request a new one |
| Owner accidentally deletes a booking | Confirmation step in the delete button; phase 3 can add soft-delete |
| Wrong email gets a session (typo) | RLS blocks all writes; the wrong session is harmless |
| Supabase free tier limits | 500MB DB easily covers 1000+ bookings/year; auth limits irrelevant for 1 user |
| Magic-link goes to spam | Add Supabase to email allowlist; owner aware to check spam first time |

## 11. Pre-Launch Checklist

Items the owner needs to confirm/provide before this ships:

- [ ] Supabase project created (`https://tvpolsuyqxfkwqrjggpp.supabase.co` ✅)
- [ ] `anon public` key shared with developer
- [ ] Admin email confirmed: `queenhouse.arm@gmail.com`
- [ ] Owner verified they receive emails to that address (test the magic link)
- [ ] Vercel env vars set
- [ ] DB schema applied via Supabase SQL editor
- [ ] RLS policies active and tested

## 12. Estimate

~5 hours of focused work split across:
- Supabase setup + schema + RLS (30 min)
- Supabase client wiring + env (15 min)
- AvailabilityCalendar public component (1 h)
- Admin auth flow with magic link (1 h)
- Admin booking calendar with CRUD (2 h)
- Polish + deploy + smoke test (30 min)
