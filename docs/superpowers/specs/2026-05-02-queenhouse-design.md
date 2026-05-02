# Queen House — Website Design Spec

**Date:** 2026-05-02
**Status:** Approved (concept), pending user spec review
**Owner:** v.vardanyan@aitarget.com

## 1. Project Summary

A premium marketing website for **Queen House** — two A-frame wooden cabins in Vardablur, Lori (Armenia) rented by the day. The brand identity references the band Queen (logo features a Freddie Mercury silhouette and a crown), so the site mixes "rock royalty" theatricality with the warm, natural feel of mountain cabins.

The site is content-and-conversion focused: visitors learn about the place, see the houses, and contact the owner by phone. **Online booking is intentionally out of scope for MVP** — the calendar is shown disabled with a "coming soon" badge so the future capability is visible without committing to it now.

## 2. Goals & Non-Goals

### Goals
- Convey the brand's premium, theatrical character without being kitsch
- Drive phone calls and contact-form submissions to the owner
- Rank for searches like *"загородный дом Лори"*, *"A-frame Армения"*, *"Lori cabin rental"* in three languages
- Render fast on mobile (most traffic) — Lighthouse Performance ≥ 95
- Be ready to add real online booking in phase 2 without rewrites

### Non-Goals (MVP)
- Real online booking with payment
- User accounts / login
- Reviews section
- Blog / news
- FAQ section (can be added later if questions repeat)
- Pricing display (prices vary; visitors call to ask)

## 3. Audience & Languages

- **Default:** Armenian (`hy`) — local market, tourists from Yerevan
- **Russian (`ru`)** — Russian-speaking tourists, large segment in Armenia
- **English (`en`)** — international tourists

URL structure: `queenhouse.am/{hy|ru|en}/...`. Root `/` redirects to `/hy`. Each locale gets correct `<html lang>` and `hreflang` tags for SEO.

## 4. Brand & Visual Direction

### Concept
"Rock royalty meets Armenian mountains." Triangular A-frame houses become a stage; nature is the set; the guest is the star. Tone: premium, cinematic, warm — closer to a *whisky bar in the mountains* than a *family cabin booking site*.

### Color Palette

**Light theme:**
- Background: warm cream `#F5F1E8`
- Surface: off-white `#FFFFFF`
- Text: deep black `#0A0A0A`
- Accent (CTA, gold details): champagne `#B8941F` (darker for AA contrast on cream)
- Secondary (nature): forest green `#2D3B2D`

**Dark theme:**
- Background: deep black `#0A0A0A`
- Surface: charcoal `#1A1A1A`
- Text: cream `#F5F1E8`
- Accent: champagne gold `#D4AF37`
- Secondary: mossy green (same `#2D3B2D`)

**Theme behavior:**
- Default follows `prefers-color-scheme`
- Toggle in header (☀️/🌙); preference saved in `localStorage`
- Implementation: `next-themes`
- Both logo variants prepared (white-on-dark, black-on-light)

### Typography
- **Display / headings:** Cormorant Garamond (regal serif). Variable weight 300–700.
- **Body Latin/Cyrillic:** Inter
- **Body Armenian:** Noto Sans Armenian
- All loaded via `next/font/google` (zero CLS, self-hosted)

### Brand Touches
- Hero tagline plays on Queen lyrics in subtle, multilingual ways (final wording finalized in i18n JSON)
- Gallery lightbox opens with a *theater curtain* reveal animation (Framer Motion)
- Section dividers: ultra-large display numbers/letters reminiscent of concert posters
- **No autoplay audio anywhere**

### Anti-Patterns (explicitly avoided)
- Generic "warm-brown cottage" aesthetic
- Clip-art mountains/pines/sun icons
- Discount popups, exit-intent modals
- Cookie banners (avoided by skipping marketing cookies entirely)

## 5. Site Structure

Single-page long-form layout with anchor navigation, served per locale.

| # | Section | Anchor | Purpose |
|---|---------|--------|---------|
| 1 | Header (sticky) | — | Logo, nav, language switcher, theme toggle, click-to-call |
| 2 | Hero | `#home` | Fullscreen photo + tagline + 2 CTAs |
| 3 | About | `#about` | Short story; subtle Queen reference |
| 4 | Houses | `#houses` | Two cards, each with photo carousel + description |
| 5 | Amenities | `#amenities` | Icon grid: 5 amenities (extensible) |
| 6 | Gallery | `#gallery` | Masonry grid + lightbox |
| 7 | Location | `#location` | Map embed, address, distance from key cities |
| 8 | Contact / Booking | `#contact` | Disabled booking calendar + active contact form + phone |
| 9 | Footer | — | Logo, contacts, socials, copyright |

### Section Details

**Hero**
- Background: best A-frame photo at golden-hour or night (selected during build)
- Heading (per locale, finalized in i18n JSON): a tagline along the lines of *"Royal escape in Lori mountains"* / *"Թագավորական հանգիստ Լոռու սարերում"* / *"Королевский отдых в горах Лори"*
- Subhead: *"Two A-frame cabins · Vardablur, Lori"*
- CTA primary: "Контакты" / "Կապ" / "Contact" → smooth scroll to `#contact`
- CTA secondary: "Посмотреть дома" / "Տեսնել տները" / "See houses" → scroll to `#houses`
- Subtle scroll indicator at bottom

**About**
- Two-column layout (text + image). Stacks on mobile.
- 2–3 paragraphs: who/what/where; the Queen connection in one sentence
- Mentions Stepanavan, Dsegh, Dzoraget — to anchor for SEO

**Houses**
- Two large cards (stacked on mobile, side-by-side on desktop ≥1024px)
- Working names: **House №1 — The Crown**, **House №2 — The Mercury** (final names live in i18n JSON; can be edited without code changes)
- Each card: photo carousel (4–5 photos), 2–3 sentence description, "Звонить для бронирования / Call to book" CTA → `tel:+37441595956`

**Amenities**
- 5-column icon grid on desktop, 2-column on mobile
- Items (Armenian / Russian / English):
  - ♨️ Տաքացվող ջակուզի / Подогреваемый джакузи / Heated jacuzzi
  - 🔥 Խարույկ / մանղալ / Мангал / Fire pit & BBQ
  - ☕ Թեյ, սուրճ / Чай, кофе / Tea & coffee
  - 📶 Wi-Fi
  - 🅿️ Կայանատեղի / Парковка / Parking
- **Guest capacity:** to be confirmed by owner before launch — placeholder field in i18n JSON
- Structure supports adding more amenities later (heating, kitchen, pets policy, etc.) by appending to JSON, no code changes

**Gallery**
- Masonry grid, 12–20 best photos selected during build
- Click → fullscreen lightbox with arrow navigation, Esc to close, swipe on mobile
- All images served via `next/image` with blur placeholders

**Location**
- Map: Google Maps embed (lightweight) OR Mapbox if interactive markers needed (decision in implementation plan; default to Google Maps embed for simplicity)
- Address text: *Վարդաբլուր, Լոռի* (with Russian and English transliteration shown to non-Armenian visitors)
- Distance lines (final figures verified during implementation):
  - From Yerevan: ~130 km / 1h 40min
  - From Stepanavan: ~15 min
- Button: "Open in Google Maps" → external link with coords
- Coordinates: TBD — owner to provide exact pin location before launch

**Contact / Booking**
- Big block with three reach-out methods:
  - Phone (clickable `tel:`): `+374 41 59 59 56`
  - Email: `queenhouse.arm@gmail.com`
  - Instagram: TBD (owner to confirm handle, hide block if none)
- **Disabled booking calendar:**
  - shadcn `<Calendar>` component, all dates disabled, opacity reduced, cursor `not-allowed`
  - Overlay badge: *"Շուտով՝ առցանց ամրագրում / Скоро: онлайн-бронирование / Booking online — coming soon"* (centered, gold accent)
- **Active contact form** (below calendar):
  - Fields: name, phone (required), email (optional), check-in date, check-out date, guests count, message
  - Validation: React Hook Form + Zod
  - On submit → POST `/api/contact` → email via Resend to `queenhouse.arm@gmail.com`
  - Honeypot field + 1 request/min/IP rate limit (in-memory for MVP, can move to Upstash later)
  - Inline success state ("Спасибо, ответим в течение часа")
- Helper text near calendar: *"Цены зависят от сезона и дома — позвоните, ответим быстро"*

**Footer**
- Logo (small)
- Address, phone, email
- Social icons (Instagram, hide if no handle)
- Copyright: `© 2026 Queen House`
- Tiny language switcher repeated for accessibility

## 6. Technical Architecture

### Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| Styling | Tailwind CSS v4 with CSS variables for themes |
| UI primitives | shadcn/ui (Button, Card, Calendar, Dialog, Form, Input, Textarea) |
| Animations | Framer Motion |
| i18n | `next-intl` |
| Themes | `next-themes` |
| Forms | React Hook Form + Zod |
| Email | Resend (free tier) |
| Image pipeline | `next/image` + `sharp` + `heic-convert` (build-time script) |
| Icons | `lucide-react` |
| Fonts | `next/font` (Cormorant Garamond, Inter, Noto Sans Armenian) |
| Analytics | Vercel Analytics |
| Hosting | Vercel |
| VCS | Git + GitHub |
| Type checking | TypeScript (strict) |
| Linting | ESLint + Prettier |
| Pkg manager | pnpm (preferred) or npm |

### Folder Structure

```
queenhouse/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── not-found.tsx
│   ├── api/
│   │   └── contact/route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── sections/
│   │   ├── hero.tsx
│   │   ├── about.tsx
│   │   ├── houses.tsx
│   │   ├── amenities.tsx
│   │   ├── gallery.tsx
│   │   ├── location.tsx
│   │   ├── contact.tsx
│   │   └── footer.tsx
│   ├── ui/                      (shadcn-generated)
│   ├── header.tsx
│   ├── language-switcher.tsx
│   ├── theme-switcher.tsx
│   ├── house-card.tsx
│   ├── photo-carousel.tsx
│   ├── gallery-lightbox.tsx
│   ├── disabled-booking-calendar.tsx
│   └── contact-form.tsx
├── i18n/
│   ├── messages/
│   │   ├── hy.json
│   │   ├── ru.json
│   │   └── en.json
│   ├── routing.ts
│   └── request.ts
├── lib/
│   ├── images.ts              (image manifest with multilingual alt text)
│   ├── content.ts             (constants: address, phone, email, coords)
│   └── rate-limit.ts
├── public/
│   ├── images/
│   │   ├── optimized/         (generated: AVIF + WebP, 3 sizes each)
│   │   ├── logo-light.svg
│   │   └── logo-dark.svg
│   ├── favicon.ico
│   ├── og-image.jpg
│   └── robots.txt
├── scripts/
│   └── convert-media.ts       (HEIC/DNG → AVIF/WebP, run once)
├── media/                     (source photos, gitignored after conversion)
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── .env.local                 (RESEND_API_KEY)
├── .env.example
└── package.json
```

### Image Pipeline (key risk)

Source media is ~200 MB across HEIC, DNG, and JPG. Naïve embedding kills page weight.

1. **One-time build script** (`scripts/convert-media.ts`):
   - HEIC → JPEG (intermediate) via `heic-convert`
   - DNG: manually exported as JPEG (DNG conversion in Node is fragile; document this in README)
   - JPEG → AVIF + WebP via `sharp`, three widths each: 400w, 1200w, 2400w
   - Output to `public/images/optimized/`
   - Manifest written to `lib/images.ts` with dimensions for `next/image`
2. **Runtime**: `next/image` picks correct format/size per browser; uses `placeholder="blur"` from generated tiny base64 thumbnails
3. **Hero image**: marked `priority`; LCP candidate; preload hint
4. **Source media folder** (`media/`) excluded from git (large binaries); only optimized assets shipped

### Internationalization

- `next-intl` with `[locale]` segment routing
- Messages: flat-namespaced JSON (e.g., `hero.title`, `amenities.jacuzzi.label`)
- Fallback: `hy` (default)
- Server components read translations via `getTranslations()`
- Client components via `useTranslations()`
- Locale-aware metadata: `generateMetadata` per route
- Date formatting: `next-intl` `useFormatter` (relevant for booking dates later)

### Theming

- Tailwind v4 CSS variables in `globals.css`:
  - `--background`, `--foreground`, `--accent`, `--accent-foreground`, `--surface`, `--muted`, `--border`
- `next-themes` controls a `data-theme` attribute on `<html>`
- Inline script in `<head>` to set theme before paint (no FOUC)
- shadcn components use the same CSS variables, so they reflow automatically

### Contact API

- `app/api/contact/route.ts`:
  - Method: `POST`
  - Body: `{ name, phone, email?, checkIn?, checkOut?, guests?, message? }` (Zod-validated)
  - Honeypot: hidden `website` field — if filled, return 200 silently
  - Rate limit: 1 req / 60s / IP (in-memory `Map` for MVP — clearly noted as MVP-only)
  - Send via Resend → `queenhouse.arm@gmail.com`
  - On Resend failure: log error, return 500 with generic message
- `RESEND_API_KEY` in `.env.local`, configured in Vercel project settings

### SEO

- `generateMetadata` per locale: title, description, OG image, Twitter card
- `app/sitemap.ts` outputs entries for all 3 locales
- `app/robots.ts` with sitemap URL
- `<link rel="alternate" hreflang>` for each locale
- JSON-LD `LodgingBusiness` schema with name, address, phone, geo coords, amenities
- Canonical URL per locale

### Performance Targets

- Lighthouse Performance ≥ 95 (mobile)
- LCP < 2.5s on 4G
- CLS < 0.1
- Total page weight (above-the-fold) < 500 KB

### Testing (MVP scope)

MVP is a marketing site with one mutating endpoint. Test scope:
- Manual cross-browser smoke test (Chrome, Safari, Firefox; iOS + Android)
- Lighthouse CI on PRs
- Type-check + lint in CI
- Contact form: integration test using Resend's test mode (or mocked) + Zod schema unit test
- **Not in MVP**: full e2e Playwright suite (added in phase 2 alongside booking)

## 7. Phase 2 Hooks (out of MVP)

Designed so phase 2 doesn't require structural rewrites:

- Booking: replace `<DisabledBookingCalendar />` with active component; add `app/api/bookings/` routes
- Backend: add Supabase or Neon (Postgres) for availability + reservations
- PMS integration option: Lodgify or Hostaway API (skip own DB)
- Payments: Stripe (international) or Idram/Telcell (Armenia)
- Reviews: pull from Booking.com / Airbnb manually or via API
- Blog: add `/blog` MDX route under `[locale]`
- Multi-language SEO content: long-form pages under `/lori-guide`, `/things-to-do`

## 8. Open Items / Pre-Launch Checklist

Items the owner needs to confirm before launch (or accept defaults):

- [ ] Final tagline wording for hero (3 languages)
- [ ] Final house names (currently *The Crown* / *The Mercury*)
- [ ] Per-house descriptions (2–3 sentences each, 3 languages)
- [ ] Guest capacity per house
- [ ] Exact GPS coordinates for the map pin
- [ ] Verified distances from Yerevan and Stepanavan
- [ ] Instagram / Facebook handles (or confirm none)
- [ ] DNG file (`IMG_4858.DNG`) — needs manual JPEG export by owner
- [ ] HEIC files — auto-convertible via the build script
- [ ] `RESEND_API_KEY` (created during deploy)
- [ ] DNS records pointed at Vercel once domain activates

## 9. Out of Scope (explicitly)

- Online booking with real availability
- Payment processing
- User accounts
- Multi-property management beyond the existing two houses
- Native mobile app
- Email marketing / newsletter
- A/B testing infrastructure

## 10. Risks

| Risk | Mitigation |
|---|---|
| HEIC conversion brittleness | Document manual fallback in README; commit converted assets so future builds don't depend on conversion working |
| Domain not activated by launch | Site can run on `queenhouse.vercel.app` until DNS is ready |
| Resend free tier (100/day) exceeded | Form is low-volume; alert configured; can upgrade or move to Postmark |
| Owner unavailable to confirm open items | Fall back to placeholders; site still launches; copy edits via JSON take minutes |
| In-memory rate limit lost on serverless cold start | Acceptable for MVP; phase 2 moves to Upstash Redis |
