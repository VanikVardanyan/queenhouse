# Queen House Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a premium multilingual marketing site for Queen House (two A-frame cabins in Vardablur, Lori) with disabled booking calendar, working contact form, and phase-2 hooks for real online booking.

**Architecture:** Next.js 15 App Router single-page-per-locale; `next-intl` for hy/ru/en routing; `next-themes` for light/dark; build-time HEIC→AVIF/WebP image pipeline; Resend-backed contact API; deployed to Vercel.

**Tech Stack:** Next.js 15, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui, Framer Motion, next-intl, next-themes, React Hook Form, Zod, Resend, sharp, heic-convert, Vitest, lucide-react, pnpm.

**Working dir:** `/Users/vanik/Desktop/projects/my projects/queenhouse`

---

## Phase 0 — Project Bootstrap

### Task 1: Initialize Next.js project + git

**Files:**
- Create: project root scaffolding
- Create: `.gitignore` (auto from create-next-app)
- Create: `.git/`

- [ ] **Step 1: Verify pnpm available**

Run:
```bash
pnpm --version
```
Expected: prints version (>= 9.0). If missing: `npm install -g pnpm`.

- [ ] **Step 2: Init Next.js in current directory**

Run from project root:
```bash
pnpm create next-app@latest . --typescript --tailwind --app --src-dir false --eslint --import-alias "@/*" --use-pnpm --turbopack --yes
```
Expected: Next.js 15 scaffold created. If prompts appear, accept defaults.

- [ ] **Step 3: Verify dev server runs**

Run:
```bash
pnpm dev
```
Open `http://localhost:3000` — should see Next.js welcome page. Stop with `Ctrl+C`.

- [ ] **Step 4: Add media folder to .gitignore**

Edit `.gitignore`, append:
```
# raw photos (use scripts/convert-media.ts to generate optimized assets)
/media/
# specs are tracked, but allow local notes
*.local.md
```

- [ ] **Step 5: Initial commit**

```bash
git init
git add .
git commit -m "chore: bootstrap next.js 15 + tailwind v4"
```

---

### Task 2: Install core dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime deps**

Run:
```bash
pnpm add next-intl next-themes framer-motion react-hook-form zod @hookform/resolvers resend lucide-react sharp heic-convert clsx tailwind-merge class-variance-authority
```

- [ ] **Step 2: Install dev deps**

Run:
```bash
pnpm add -D @types/heic-convert vitest @vitejs/plugin-react @testing-library/react @testing-library/dom jsdom @types/node tsx
```

- [ ] **Step 3: Add scripts to package.json**

Edit `package.json` `"scripts"` block to:
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "convert-media": "tsx scripts/convert-media.ts"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add core dependencies"
```

---

### Task 3: Configure TypeScript strict + path aliases

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: Tighten tsconfig**

Replace `tsconfig.json` `"compilerOptions"` block to include:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 2: Verify type-check passes**

Run:
```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: enable stricter typescript options"
```

---

### Task 4: Initialize shadcn/ui

**Files:**
- Create: `components.json`
- Create: `lib/utils.ts`
- Create: `app/globals.css` (will be modified later)

- [ ] **Step 1: Run shadcn init**

```bash
pnpm dlx shadcn@latest init
```
Answer prompts:
- Style: `Default`
- Base color: `Stone`
- CSS variables: `Yes`
- Tailwind config path: detected automatically
- import alias: `@/components` and `@/lib/utils`

- [ ] **Step 2: Add the components we need**

```bash
pnpm dlx shadcn@latest add button card calendar dialog form input label textarea sheet
```
Expected: components generated under `components/ui/`.

- [ ] **Step 3: Commit**

```bash
git add components.json components/ui lib/utils.ts app/globals.css
git commit -m "chore: scaffold shadcn/ui components"
```

---

### Task 5: Configure Tailwind theme tokens

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace Tailwind theme variables**

Replace the contents of `app/globals.css` with:
```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is([data-theme="dark"] *));

@theme inline {
  --font-display: var(--font-cormorant);
  --font-sans: var(--font-inter);
  --font-armenian: var(--font-noto-armenian);

  --color-background: var(--bg);
  --color-foreground: var(--fg);
  --color-surface: var(--surface);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-fg);
  --color-border: var(--border);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-fg);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-fg);
  --color-ring: var(--accent);

  --radius-lg: 0.75rem;
  --radius-md: 0.5rem;
  --radius-sm: 0.25rem;
}

:root {
  --bg: #f5f1e8;
  --fg: #0a0a0a;
  --surface: #ffffff;
  --muted: #ece6d6;
  --muted-fg: #5b5346;
  --border: #d9d2c0;
  --accent: #b8941f;
  --accent-fg: #0a0a0a;
  --secondary: #2d3b2d;
  --secondary-fg: #f5f1e8;
}

[data-theme="dark"] {
  --bg: #0a0a0a;
  --fg: #f5f1e8;
  --surface: #1a1a1a;
  --muted: #1f1f1f;
  --muted-fg: #a39c8a;
  --border: #2a2a2a;
  --accent: #d4af37;
  --accent-fg: #0a0a0a;
  --secondary: #2d3b2d;
  --secondary-fg: #f5f1e8;
}

html {
  color-scheme: light dark;
  scroll-behavior: smooth;
}

body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans), var(--font-armenian), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

:lang(hy) {
  font-family: var(--font-armenian), var(--font-sans), system-ui, sans-serif;
}

::selection {
  background: var(--accent);
  color: var(--accent-fg);
}
```

- [ ] **Step 2: Install tw-animate-css helper**

```bash
pnpm add tw-animate-css
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css package.json pnpm-lock.yaml
git commit -m "feat: define light/dark theme tokens"
```

---

## Phase 1 — i18n & Theme Foundation

### Task 6: Configure next-intl routing

**Files:**
- Create: `i18n/routing.ts`
- Create: `i18n/request.ts`
- Create: `middleware.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Create routing config**

`i18n/routing.ts`:
```typescript
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["hy", "ru", "en"],
  defaultLocale: "hy",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
```

- [ ] **Step 2: Create request config**

`i18n/request.ts`:
```typescript
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: Create middleware**

`middleware.ts`:
```typescript
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 4: Wire next-intl plugin**

Replace `next.config.ts` with:
```typescript
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const config: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default withNextIntl(config);
```

- [ ] **Step 5: Commit**

```bash
git add i18n middleware.ts next.config.ts
git commit -m "feat: configure next-intl routing for hy/ru/en"
```

---

### Task 7: Create translation message files

**Files:**
- Create: `i18n/messages/hy.json`
- Create: `i18n/messages/ru.json`
- Create: `i18n/messages/en.json`

- [ ] **Step 1: Create Armenian (default) messages**

`i18n/messages/hy.json`:
```json
{
  "meta": {
    "title": "Queen House — Թագավորական հանգիստ Լոռու սարերում",
    "description": "Երկու եռանկյուն փայտե տուն Վարդաբլուրում, Լոռու մարզ։ Տաքացվող ջակուզի, խարույկ, Wi-Fi։ Ամրագրման համար զանգահարեք։"
  },
  "nav": {
    "home": "Տուն",
    "houses": "Տներ",
    "amenities": "Հարմարություններ",
    "gallery": "Պատկերասրահ",
    "location": "Գտնվելու վայր",
    "contact": "Կապ",
    "callToBook": "Զանգահարել"
  },
  "hero": {
    "title": "Թագավորական հանգիստ Լոռու սարերում",
    "subtitle": "Երկու A-frame տուն · Վարդաբլուր, Լոռի",
    "primaryCta": "Կապ",
    "secondaryCta": "Տեսնել տները",
    "scrollHint": "Ոլորել ներքև"
  },
  "about": {
    "kicker": "Մեր մասին",
    "title": "Show must go on. In Lori.",
    "p1": "Queen House-ը երկու եռանկյուն փայտե տներ են Վարդաբլուր գյուղում՝ Լոռու մարզում։ Շրջակա անտառները, Ձորագետի կիրճը և Ստեփանավանի մոտակայքը այստեղ մնալու լավագույն պատճառներն են։",
    "p2": "Անունն ու լոգոն հարգանքի տուրք են Queen-ին և Ֆրեդդի Մերկուրիին։ Մենք հավատում ենք՝ լավ հանգիստը պետք է զգացվի որպես ներկայացում, որտեղ դուք գլխավոր հերոսն եք։"
  },
  "houses": {
    "kicker": "Մեր տները",
    "title": "Երկու տուն, մեկ ոճ",
    "house1": {
      "name": "Տուն №1 — The Crown",
      "description": "Եռանկյուն փայտե տուն՝ տաքացվող ջակուզիով և անտառի տեսարանով։"
    },
    "house2": {
      "name": "Տուն №2 — The Mercury",
      "description": "Քամերային տուն՝ խարույկի տարածքով և լեռնային տեսարանով։"
    },
    "callCta": "Զանգահարել ամրագրման համար"
  },
  "amenities": {
    "kicker": "Ինչ է ներառված",
    "title": "Հարմարություններ",
    "items": {
      "jacuzzi": "Տաքացվող ջակուզի",
      "firepit": "Խարույկ / մանղալ",
      "coffee": "Թեյ, սուրճ",
      "wifi": "Wi-Fi",
      "parking": "Կայանատեղի"
    }
  },
  "gallery": {
    "kicker": "Պատկերասրահ",
    "title": "Տեսնել մեր աչքերով",
    "openImage": "Բացել նկարը"
  },
  "location": {
    "kicker": "Գտնվելու վայր",
    "title": "Վարդաբլուր, Լոռի",
    "address": "Վարդաբլուր, Լոռու մարզ, Հայաստան",
    "fromYerevan": "Երևանից՝ ~130 կմ, ~1ժ 40րոպե",
    "fromStepanavan": "Ստեփանավանից՝ ~15 րոպե",
    "openInMaps": "Բացել Google Maps-ում"
  },
  "contact": {
    "kicker": "Կապ",
    "title": "Ամրագրեք ձեր հանգիստը",
    "comingSoon": "Շուտով՝ առցանց ամրագրում",
    "calendarHint": "Գները կախված են սեզոնից և տնից — զանգահարեք, արագ կպատասխանենք։",
    "form": {
      "name": "Ձեր անունը",
      "phone": "Հեռախոս",
      "email": "Էլ. փոստ (ոչ պարտադիր)",
      "checkIn": "Մուտքի ամսաթիվ",
      "checkOut": "Ելքի ամսաթիվ",
      "guests": "Հյուրերի քանակ",
      "message": "Հաղորդագրություն",
      "submit": "Ուղարկել",
      "submitting": "Ուղարկվում է…",
      "success": "Շնորհակալություն, մենք կպատասխանենք մեկ ժամվա ընթացքում։",
      "error": "Ինչ-որ բան սխալ գնաց։ Փորձեք հեռախոսով։"
    },
    "phoneLabel": "Հեռախոս",
    "emailLabel": "Էլ. փոստ"
  },
  "footer": {
    "rights": "© 2026 Queen House",
    "languageLabel": "Լեզու",
    "themeLabel": "Թեմա"
  },
  "theme": {
    "light": "Բաց",
    "dark": "Մուգ",
    "system": "Համակարգային"
  }
}
```

- [ ] **Step 2: Create Russian messages**

`i18n/messages/ru.json`:
```json
{
  "meta": {
    "title": "Queen House — Королевский отдых в горах Лори",
    "description": "Два треугольных деревянных дома в Вардаблуре, Лори. Подогреваемый джакузи, мангал, Wi-Fi. Бронирование по телефону."
  },
  "nav": {
    "home": "Главная",
    "houses": "Дома",
    "amenities": "Удобства",
    "gallery": "Галерея",
    "location": "Локация",
    "contact": "Контакты",
    "callToBook": "Позвонить"
  },
  "hero": {
    "title": "Королевский отдых в горах Лори",
    "subtitle": "Два A-frame дома · Вардаблур, Лори",
    "primaryCta": "Связаться",
    "secondaryCta": "Посмотреть дома",
    "scrollHint": "Прокрутить вниз"
  },
  "about": {
    "kicker": "О нас",
    "title": "Show must go on. In Lori.",
    "p1": "Queen House — это два треугольных деревянных дома в селе Вардаблур, Лорийская область. Леса вокруг, ущелье Дзорагет, близость к Степанавану — повод приехать и остаться.",
    "p2": "Название и логотип — оммаж Queen и Фредди Меркьюри. Мы верим, что отдых должен ощущаться как спектакль, где главный — вы."
  },
  "houses": {
    "kicker": "Наши дома",
    "title": "Два дома, один характер",
    "house1": {
      "name": "Дом №1 — The Crown",
      "description": "Треугольный деревянный дом с подогреваемым джакузи и видом на лес."
    },
    "house2": {
      "name": "Дом №2 — The Mercury",
      "description": "Камерный дом с зоной мангала и горным видом."
    },
    "callCta": "Позвонить для бронирования"
  },
  "amenities": {
    "kicker": "Что включено",
    "title": "Удобства",
    "items": {
      "jacuzzi": "Подогреваемый джакузи",
      "firepit": "Мангал / костровище",
      "coffee": "Чай, кофе",
      "wifi": "Wi-Fi",
      "parking": "Парковка"
    }
  },
  "gallery": {
    "kicker": "Галерея",
    "title": "Посмотреть нашими глазами",
    "openImage": "Открыть фото"
  },
  "location": {
    "kicker": "Локация",
    "title": "Вардаблур, Лори",
    "address": "Вардаблур, Лорийская область, Армения",
    "fromYerevan": "От Еревана: ~130 км, ~1ч 40мин",
    "fromStepanavan": "От Степанавана: ~15 мин",
    "openInMaps": "Открыть в Google Maps"
  },
  "contact": {
    "kicker": "Контакты",
    "title": "Забронируйте свой отдых",
    "comingSoon": "Скоро: онлайн-бронирование",
    "calendarHint": "Цены зависят от сезона и дома — позвоните, ответим быстро.",
    "form": {
      "name": "Ваше имя",
      "phone": "Телефон",
      "email": "Email (необязательно)",
      "checkIn": "Дата заезда",
      "checkOut": "Дата выезда",
      "guests": "Количество гостей",
      "message": "Сообщение",
      "submit": "Отправить",
      "submitting": "Отправляем…",
      "success": "Спасибо, ответим в течение часа.",
      "error": "Что-то пошло не так. Попробуйте по телефону."
    },
    "phoneLabel": "Телефон",
    "emailLabel": "Email"
  },
  "footer": {
    "rights": "© 2026 Queen House",
    "languageLabel": "Язык",
    "themeLabel": "Тема"
  },
  "theme": {
    "light": "Светлая",
    "dark": "Тёмная",
    "system": "Системная"
  }
}
```

- [ ] **Step 3: Create English messages**

`i18n/messages/en.json`:
```json
{
  "meta": {
    "title": "Queen House — Royal escape in Lori mountains",
    "description": "Two A-frame wooden cabins in Vardablur, Lori, Armenia. Heated jacuzzi, fire pit, Wi-Fi. Call to book."
  },
  "nav": {
    "home": "Home",
    "houses": "Houses",
    "amenities": "Amenities",
    "gallery": "Gallery",
    "location": "Location",
    "contact": "Contact",
    "callToBook": "Call us"
  },
  "hero": {
    "title": "Royal escape in Lori mountains",
    "subtitle": "Two A-frame cabins · Vardablur, Lori",
    "primaryCta": "Contact",
    "secondaryCta": "See houses",
    "scrollHint": "Scroll down"
  },
  "about": {
    "kicker": "About",
    "title": "Show must go on. In Lori.",
    "p1": "Queen House is two A-frame wooden cabins in Vardablur village, Lori province of Armenia. Forests, Dzoraget canyon, and Stepanavan nearby — reasons to come and stay.",
    "p2": "The name and logo are a quiet tribute to Queen and Freddie Mercury. We believe a great stay should feel like a show where you are the headliner."
  },
  "houses": {
    "kicker": "Our houses",
    "title": "Two cabins, one character",
    "house1": {
      "name": "House №1 — The Crown",
      "description": "A-frame cabin with heated jacuzzi and forest view."
    },
    "house2": {
      "name": "House №2 — The Mercury",
      "description": "Intimate cabin with fire pit area and mountain view."
    },
    "callCta": "Call to book"
  },
  "amenities": {
    "kicker": "What's included",
    "title": "Amenities",
    "items": {
      "jacuzzi": "Heated jacuzzi",
      "firepit": "Fire pit & BBQ",
      "coffee": "Tea & coffee",
      "wifi": "Wi-Fi",
      "parking": "Parking"
    }
  },
  "gallery": {
    "kicker": "Gallery",
    "title": "Through our eyes",
    "openImage": "Open photo"
  },
  "location": {
    "kicker": "Location",
    "title": "Vardablur, Lori",
    "address": "Vardablur, Lori Province, Armenia",
    "fromYerevan": "From Yerevan: ~130 km, ~1h 40min",
    "fromStepanavan": "From Stepanavan: ~15 min",
    "openInMaps": "Open in Google Maps"
  },
  "contact": {
    "kicker": "Contact",
    "title": "Book your stay",
    "comingSoon": "Booking online — coming soon",
    "calendarHint": "Prices vary by season and house — give us a call, we'll reply fast.",
    "form": {
      "name": "Your name",
      "phone": "Phone",
      "email": "Email (optional)",
      "checkIn": "Check-in date",
      "checkOut": "Check-out date",
      "guests": "Guests",
      "message": "Message",
      "submit": "Send",
      "submitting": "Sending…",
      "success": "Thanks, we'll reply within an hour.",
      "error": "Something went wrong. Please call us."
    },
    "phoneLabel": "Phone",
    "emailLabel": "Email"
  },
  "footer": {
    "rights": "© 2026 Queen House",
    "languageLabel": "Language",
    "themeLabel": "Theme"
  },
  "theme": {
    "light": "Light",
    "dark": "Dark",
    "system": "System"
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add i18n/messages
git commit -m "feat: add hy/ru/en translation messages"
```

---

### Task 8: Theme provider with no-FOUC

**Files:**
- Create: `components/theme-provider.tsx`
- Create: `components/theme-script.tsx`

- [ ] **Step 1: Create ThemeProvider wrapper**

`components/theme-provider.tsx`:
```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
```

- [ ] **Step 2: Inline no-FOUC script**

`components/theme-script.tsx`:
```tsx
export function ThemeScript() {
  const code = `(function(){try{var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=s==='light'||s==='dark'?s:(m?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
```

- [ ] **Step 3: Commit**

```bash
git add components/theme-provider.tsx components/theme-script.tsx
git commit -m "feat: add theme provider with no-fouc script"
```

---

## Phase 2 — Image Pipeline

### Task 9: Build the media conversion script

**Files:**
- Create: `scripts/convert-media.ts`
- Create: `public/images/optimized/.gitkeep`

- [ ] **Step 1: Write the conversion script**

`scripts/convert-media.ts`:
```typescript
import { readdir, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";
import heicConvert from "heic-convert";

const SRC = "media";
const OUT = "public/images/optimized";
const WIDTHS = [400, 1200, 2400] as const;

type ManifestEntry = {
  slug: string;
  width: number;
  height: number;
  blurDataURL: string;
};

async function toJpegBuffer(srcPath: string): Promise<Buffer> {
  const ext = parse(srcPath).ext.toLowerCase();
  const raw = await readFile(srcPath);
  if (ext === ".heic") {
    const out = await heicConvert({ buffer: raw, format: "JPEG", quality: 0.92 });
    return Buffer.from(out);
  }
  return raw;
}

async function processFile(filename: string): Promise<ManifestEntry | null> {
  const ext = parse(filename).ext.toLowerCase();
  if (![".heic", ".jpg", ".jpeg"].includes(ext)) {
    if (ext === ".dng") {
      console.warn(`[skip] ${filename}: DNG must be exported manually to JPEG.`);
    }
    return null;
  }

  const slug = parse(filename).name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const srcPath = join(SRC, filename);
  const buffer = await toJpegBuffer(srcPath);
  const baseImage = sharp(buffer).rotate();
  const metadata = await baseImage.metadata();
  const origWidth = metadata.width ?? 2400;
  const origHeight = metadata.height ?? 1600;

  for (const w of WIDTHS) {
    if (origWidth < w && w !== WIDTHS[0]) continue;
    const target = sharp(buffer).rotate().resize({ width: w, withoutEnlargement: true });
    await target.clone().avif({ quality: 60 }).toFile(join(OUT, `${slug}-${w}.avif`));
    await target.clone().webp({ quality: 75 }).toFile(join(OUT, `${slug}-${w}.webp`));
  }

  const blurBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: 16 })
    .jpeg({ quality: 40 })
    .toBuffer();
  const blurDataURL = `data:image/jpeg;base64,${blurBuffer.toString("base64")}`;

  console.log(`[ok] ${filename} → ${slug}`);
  return { slug, width: origWidth, height: origHeight, blurDataURL };
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const files = await readdir(SRC);
  const entries: ManifestEntry[] = [];
  for (const f of files) {
    if (f.startsWith(".")) continue;
    try {
      const entry = await processFile(f);
      if (entry) entries.push(entry);
    } catch (err) {
      console.error(`[fail] ${f}:`, err);
    }
  }
  entries.sort((a, b) => a.slug.localeCompare(b.slug));
  await writeFile(
    "lib/images-manifest.json",
    JSON.stringify(entries, null, 2),
    "utf8",
  );
  console.log(`\nDone: ${entries.length} images. Manifest at lib/images-manifest.json.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Create output dir placeholder**

```bash
mkdir -p public/images/optimized
touch public/images/optimized/.gitkeep
```

- [ ] **Step 3: Run conversion**

```bash
mkdir -p lib
pnpm convert-media
```
Expected: each photo logged as `[ok]`; DNG file logged as `[skip]`; manifest written.

- [ ] **Step 4: Commit converted assets + manifest**

```bash
git add scripts/convert-media.ts public/images/optimized lib/images-manifest.json
git commit -m "feat: add image conversion pipeline (heic→avif/webp)"
```

---

### Task 10: Image manifest module + curated lists

**Files:**
- Create: `lib/images.ts`

- [ ] **Step 1: Write the image module**

`lib/images.ts`:
```typescript
import manifest from "./images-manifest.json";

export type ImageAsset = {
  slug: string;
  width: number;
  height: number;
  blurDataURL: string;
  src: string;
  srcSet: { avif: string; webp: string };
};

const WIDTHS = [400, 1200, 2400];

function buildAsset(entry: (typeof manifest)[number]): ImageAsset {
  const base = `/images/optimized/${entry.slug}`;
  return {
    slug: entry.slug,
    width: entry.width,
    height: entry.height,
    blurDataURL: entry.blurDataURL,
    src: `${base}-1200.webp`,
    srcSet: {
      avif: WIDTHS.map((w) => `${base}-${w}.avif ${w}w`).join(", "),
      webp: WIDTHS.map((w) => `${base}-${w}.webp ${w}w`).join(", "),
    },
  };
}

export const images: ImageAsset[] = manifest.map(buildAsset);

export function getImage(slug: string): ImageAsset {
  const found = images.find((i) => i.slug === slug);
  if (!found) {
    throw new Error(`Image not found: ${slug}`);
  }
  return found;
}

export const heroImage: ImageAsset = images[0]!;
export const aboutImage: ImageAsset = images[1] ?? images[0]!;
export const house1Photos: ImageAsset[] = images.slice(2, 7);
export const house2Photos: ImageAsset[] = images.slice(7, 12);
export const galleryImages: ImageAsset[] = images.slice(0, 18);
```

> Note: After running the conversion, manually inspect the manifest and edit the slice indices to pick the best photos for each role. The slice approach is a safe default.

- [ ] **Step 2: Type-check**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/images.ts
git commit -m "feat: add image manifest module"
```

---

### Task 11: Logo SVGs

**Files:**
- Create: `public/logo-light.svg`
- Create: `public/logo-dark.svg`

- [ ] **Step 1: Convert source PNG/JPEG logo to SVG**

The source `media/image-14-02-25-01-51.JPEG` is white-on-black. For now, use a placeholder dual-asset approach:

Create `public/logo-dark.svg` (white logo for dark theme) by tracing the source file with an external tool (e.g., https://convertio.co/jpeg-svg/ or `potrace`) OR temporarily use the JPEG by copying to `public/logo-dark.jpeg` and creating an inverted version `public/logo-light.jpeg` (use a graphics tool to invert colors).

For the MVP, implement the pragmatic approach: copy the JPEG into `public/`:
```bash
cp "media/image-14-02-25-01-51.JPEG" public/logo-dark.jpeg
```

Then create an inverted version using sharp via a one-off script:
```bash
pnpm exec tsx -e "import sharp from 'sharp'; await sharp('media/image-14-02-25-01-51.JPEG').negate({alpha:false}).toFile('public/logo-light.jpeg');"
```

- [ ] **Step 2: Verify both files exist**

```bash
ls -la public/logo-*.jpeg
```
Expected: both files present.

- [ ] **Step 3: Commit**

```bash
git add public/logo-dark.jpeg public/logo-light.jpeg
git commit -m "feat: add logo assets (light + dark)"
```

> Replace JPEG logos with proper SVGs in a follow-up task once vector versions are available; current JPEGs ship at high quality but are a known optimization opportunity.

---

## Phase 3 — Layout Shell

### Task 12: Site constants

**Files:**
- Create: `lib/content.ts`

- [ ] **Step 1: Write constants**

`lib/content.ts`:
```typescript
export const SITE = {
  name: "Queen House",
  domain: "queenhouse.am",
  url: "https://queenhouse.am",
  email: "queenhouse.arm@gmail.com",
  phone: "+374 41 59 59 56",
  phoneE164: "+37441595956",
  instagram: null as string | null,
  address: {
    hy: "Վարդաբլուր, Լոռու մարզ, Հայաստան",
    ru: "Вардаблур, Лорийская область, Армения",
    en: "Vardablur, Lori Province, Armenia",
  },
  coords: { lat: 41.001, lng: 44.380 },
  mapsUrl: "https://www.google.com/maps?q=41.001,44.380",
} as const;

export const AMENITIES = [
  { key: "jacuzzi", emoji: "♨️" },
  { key: "firepit", emoji: "🔥" },
  { key: "coffee", emoji: "☕" },
  { key: "wifi", emoji: "📶" },
  { key: "parking", emoji: "🅿️" },
] as const;
```

> Update `coords`, `instagram`, and verify `mapsUrl` once the owner confirms exact location.

- [ ] **Step 2: Commit**

```bash
git add lib/content.ts
git commit -m "feat: add site constants module"
```

---

### Task 13: Root + locale layouts

**Files:**
- Create: `app/[locale]/layout.tsx`
- Modify: `app/layout.tsx` (delete or simplify — root layout becomes a passthrough)
- Delete: `app/page.tsx` (root page replaced by locale routing)
- Modify: `app/globals.css` already done in Task 5

- [ ] **Step 1: Replace root layout**

Replace `app/layout.tsx` with:
```tsx
import type { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
```

- [ ] **Step 2: Delete the original root page**

```bash
rm app/page.tsx
```

- [ ] **Step 3: Create locale layout with fonts and providers**

`app/[locale]/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Noto_Sans_Armenian } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "@/components/theme-script";
import { SITE } from "@/lib/content";
import type { ReactNode } from "react";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});
const notoArmenian = Noto_Sans_Armenian({
  subsets: ["armenian"],
  variable: "--font-noto-armenian",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL(SITE.url),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        hy: "/hy",
        ru: "/ru",
        en: "/en",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${SITE.url}/${locale}`,
      siteName: SITE.name,
      locale,
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${cormorant.variable} ${inter.variable} ${notoArmenian.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Type-check + dev sanity**

```bash
pnpm exec tsc --noEmit
pnpm dev
```
Open `http://localhost:3000/hy`. Expected: blank styled page (no 404). Stop server.

- [ ] **Step 5: Commit**

```bash
git add app
git commit -m "feat: add locale layout with fonts, theme, i18n providers"
```

---

### Task 14: Header component

**Files:**
- Create: `components/header.tsx`
- Create: `components/language-switcher.tsx`
- Create: `components/theme-toggle.tsx`

- [ ] **Step 1: Language switcher**

`components/language-switcher.tsx`:
```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";

const LABELS: Record<Locale, string> = { hy: "ՀԱՅ", ru: "РУС", en: "EN" };

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const current = useLocale() as Locale;

  function switchTo(next: Locale) {
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || `/${next}`);
  }

  return (
    <div className="flex items-center gap-1 text-xs font-medium tracking-wider">
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground">·</span>}
          <button
            type="button"
            onClick={() => switchTo(loc)}
            className={`uppercase transition-colors ${
              loc === current ? "text-accent" : "text-muted-foreground hover:text-foreground"
            }`}
            aria-current={loc === current ? "true" : undefined}
          >
            {LABELS[loc]}
          </button>
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Theme toggle**

`components/theme-toggle.tsx`:
```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted"
    >
      {mounted ? (
        isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4 opacity-0" />
      )}
    </button>
  );
}
```

- [ ] **Step 3: Header**

`components/header.tsx`:
```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Phone, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { SITE } from "@/lib/content";

const SECTIONS = ["home", "houses", "amenities", "gallery", "location", "contact"] as const;

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => setMounted(true), []);
  const logoSrc =
    mounted && resolvedTheme === "light" ? "/logo-light.jpeg" : "/logo-dark.jpeg";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href={`/${locale}#home`} className="flex items-center gap-3">
          <Image
            src={logoSrc}
            alt={SITE.name}
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
            priority
          />
          <span className="hidden font-display text-lg font-semibold tracking-wide md:inline">
            {SITE.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          {SECTIONS.map((s) => (
            <Link
              key={s}
              href={`/${locale}#${s}`}
              className="text-foreground/80 transition-colors hover:text-accent"
            >
              {t(s)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${SITE.phoneE164}`}
            className="hidden items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 md:inline-flex"
          >
            <Phone className="h-4 w-4" />
            {SITE.phone}
          </a>
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {SECTIONS.map((s) => (
              <Link
                key={s}
                href={`/${locale}#${s}`}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-base hover:bg-muted"
              >
                {t(s)}
              </Link>
            ))}
            <a
              href={`tel:${SITE.phoneE164}`}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-accent px-3 py-3 font-semibold text-accent-foreground"
            >
              <Phone className="h-4 w-4" /> {SITE.phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/header.tsx components/language-switcher.tsx components/theme-toggle.tsx
git commit -m "feat: add header with nav, language and theme switchers"
```

---

### Task 15: Page shell

**Files:**
- Create: `app/[locale]/page.tsx`

- [ ] **Step 1: Create the locale homepage**

`app/[locale]/page.tsx`:
```tsx
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/header";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Houses } from "@/components/sections/houses";
import { Amenities } from "@/components/sections/amenities";
import { Gallery } from "@/components/sections/gallery";
import { Location } from "@/components/sections/location";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Houses />
        <Amenities />
        <Gallery />
        <Location />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Stub all section components so import resolves**

Create empty stubs in `components/sections/`:

```bash
mkdir -p components/sections
for s in hero about houses amenities gallery location contact footer; do
  printf 'export function %s(){return null}\n' "$(echo $s | sed 's/.*/\u&/')" > components/sections/${s}.tsx
done
```

> The stub files use Title-cased exports (Hero, About, etc.). Each will be replaced in tasks 16–23.

- [ ] **Step 3: Type-check**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/page.tsx components/sections
git commit -m "feat: assemble page shell with section stubs"
```

---

## Phase 4 — Sections

### Task 16: Hero section

**Files:**
- Replace: `components/sections/hero.tsx`

- [ ] **Step 1: Implement Hero**

`components/sections/hero.tsx`:
```tsx
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import { heroImage } from "@/lib/images";

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  return (
    <section
      id="home"
      className="relative flex min-h-[92vh] w-full items-end overflow-hidden"
    >
      <Image
        src={heroImage.src}
        alt=""
        fill
        priority
        sizes="100vw"
        placeholder="blur"
        blurDataURL={heroImage.blurDataURL}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-20 pt-32 text-white md:px-8 md:pb-28">
        <h1 className="font-display text-5xl font-light leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-base text-white/85 md:text-lg">
          {t("subtitle")}
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href={`/${locale}#contact`}
            className="inline-flex items-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            {t("primaryCta")}
          </Link>
          <Link
            href={`/${locale}#houses`}
            className="inline-flex items-center rounded-md border border-white/40 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            {t("secondaryCta")}
          </Link>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/70">
        <ChevronDown className="h-5 w-5 animate-bounce" aria-hidden />
        <span className="sr-only">{t("scrollHint")}</span>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Visual sanity**

```bash
pnpm dev
```
Open `http://localhost:3000/hy`. Expected: full-screen hero with photo, headline, two buttons, scroll indicator. Stop server.

- [ ] **Step 3: Commit**

```bash
git add components/sections/hero.tsx
git commit -m "feat: hero section"
```

---

### Task 17: About section

**Files:**
- Replace: `components/sections/about.tsx`

- [ ] **Step 1: Implement About**

`components/sections/about.tsx`:
```tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import { aboutImage } from "@/lib/images";

export function About() {
  const t = useTranslations("about");
  return (
    <section id="about" className="border-b border-border bg-background py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-2 md:gap-16 md:px-8">
        <div className="flex flex-col justify-center gap-6">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {t("kicker")}
          </span>
          <h2 className="font-display text-4xl font-light leading-tight md:text-6xl">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("p1")}</p>
          <p className="text-lg text-muted-foreground">{t("p2")}</p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
          <Image
            src={aboutImage.src}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            placeholder="blur"
            blurDataURL={aboutImage.blurDataURL}
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/about.tsx
git commit -m "feat: about section"
```

---

### Task 18: Houses section + photo carousel

**Files:**
- Create: `components/photo-carousel.tsx`
- Replace: `components/sections/houses.tsx`

- [ ] **Step 1: Photo carousel**

`components/photo-carousel.tsx`:
```tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ImageAsset } from "@/lib/images";

export function PhotoCarousel({ photos, alt }: { photos: ImageAsset[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  if (photos.length === 0) return null;
  const photo = photos[idx]!;

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
      <Image
        src={photo.src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        placeholder="blur"
        blurDataURL={photo.blurDataURL}
        className="object-cover transition-opacity duration-300"
      />
      {photos.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => setIdx((idx - 1 + photos.length) % photos.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => setIdx((idx + 1) % photos.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  i === idx ? "w-4 bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Houses section**

`components/sections/houses.tsx`:
```tsx
import { useTranslations } from "next-intl";
import { Phone } from "lucide-react";
import { PhotoCarousel } from "@/components/photo-carousel";
import { house1Photos, house2Photos } from "@/lib/images";
import { SITE } from "@/lib/content";

export function Houses() {
  const t = useTranslations("houses");
  const houses = [
    { id: "house1", photos: house1Photos },
    { id: "house2", photos: house2Photos },
  ] as const;

  return (
    <section id="houses" className="border-b border-border bg-muted/30 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-14 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {t("kicker")}
          </span>
          <h2 className="font-display text-4xl font-light md:text-6xl">{t("title")}</h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {houses.map(({ id, photos }) => (
            <article
              key={id}
              className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-sm"
            >
              <PhotoCarousel photos={photos} alt={t(`${id}.name`)} />
              <h3 className="font-display text-2xl font-medium">{t(`${id}.name`)}</h3>
              <p className="text-muted-foreground">{t(`${id}.description`)}</p>
              <a
                href={`tel:${SITE.phoneE164}`}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                <Phone className="h-4 w-4" />
                {t("callCta")}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/sections/houses.tsx components/photo-carousel.tsx
git commit -m "feat: houses section with photo carousel"
```

---

### Task 19: Amenities section

**Files:**
- Replace: `components/sections/amenities.tsx`

- [ ] **Step 1: Implement Amenities**

`components/sections/amenities.tsx`:
```tsx
import { useTranslations } from "next-intl";
import { AMENITIES } from "@/lib/content";

export function Amenities() {
  const t = useTranslations("amenities");
  return (
    <section id="amenities" className="border-b border-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-14 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {t("kicker")}
          </span>
          <h2 className="font-display text-4xl font-light md:text-6xl">{t("title")}</h2>
        </div>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
          {AMENITIES.map(({ key, emoji }) => (
            <li
              key={key}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6 text-center"
            >
              <span className="text-4xl" aria-hidden>
                {emoji}
              </span>
              <span className="text-sm font-medium md:text-base">
                {t(`items.${key}`)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/amenities.tsx
git commit -m "feat: amenities section"
```

---

### Task 20: Gallery section + lightbox

**Files:**
- Create: `components/gallery-lightbox.tsx`
- Replace: `components/sections/gallery.tsx`

- [ ] **Step 1: Lightbox component**

`components/gallery-lightbox.tsx`:
```tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ImageAsset } from "@/lib/images";

export function GalleryLightbox({
  photos,
  open,
  initialIndex,
  onClose,
}: {
  photos: ImageAsset[];
  open: boolean;
  initialIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  useEffect(() => setIdx(initialIndex), [initialIndex]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % photos.length);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + photos.length) % photos.length);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, photos.length, onClose]);

  const photo = photos[idx];

  return (
    <AnimatePresence>
      {open && photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ originY: 0 }}
            className="relative flex h-full w-full items-center justify-center p-4 md:p-12"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Previous"
              onClick={() => setIdx((idx - 1 + photos.length) % photos.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => setIdx((idx + 1) % photos.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="relative h-full max-h-[85vh] w-full max-w-6xl">
              <Image
                src={photo.src}
                alt=""
                fill
                sizes="100vw"
                placeholder="blur"
                blurDataURL={photo.blurDataURL}
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70">
              {idx + 1} / {photos.length}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Gallery section**

`components/sections/gallery.tsx`:
```tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { galleryImages } from "@/lib/images";

export function Gallery() {
  const t = useTranslations("gallery");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  return (
    <section id="gallery" className="border-b border-border bg-muted/30 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-14 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {t("kicker")}
          </span>
          <h2 className="font-display text-4xl font-light md:text-6xl">{t("title")}</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {galleryImages.map((img, i) => (
            <button
              key={img.slug}
              type="button"
              onClick={() => {
                setIdx(i);
                setOpen(true);
              }}
              className={`group relative overflow-hidden rounded-lg ${
                i % 5 === 0 ? "aspect-[4/5] md:row-span-2" : "aspect-square"
              }`}
              aria-label={t("openImage")}
            >
              <Image
                src={img.src}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                placeholder="blur"
                blurDataURL={img.blurDataURL}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>
      <GalleryLightbox
        photos={galleryImages}
        open={open}
        initialIndex={idx}
        onClose={() => setOpen(false)}
      />
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/sections/gallery.tsx components/gallery-lightbox.tsx
git commit -m "feat: gallery with lightbox"
```

---

### Task 21: Location section

**Files:**
- Replace: `components/sections/location.tsx`

- [ ] **Step 1: Implement Location**

`components/sections/location.tsx`:
```tsx
import { useTranslations, useLocale } from "next-intl";
import { ExternalLink } from "lucide-react";
import { SITE } from "@/lib/content";

export function Location() {
  const t = useTranslations("location");
  const locale = useLocale() as "hy" | "ru" | "en";
  const mapsEmbed = `https://www.google.com/maps?q=${SITE.coords.lat},${SITE.coords.lng}&hl=${locale}&z=12&output=embed`;

  return (
    <section id="location" className="border-b border-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-14 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {t("kicker")}
          </span>
          <h2 className="font-display text-4xl font-light md:text-6xl">{t("title")}</h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-1">
            <p className="text-lg font-medium">{SITE.address[locale]}</p>
            <ul className="flex flex-col gap-2 text-muted-foreground">
              <li>{t("fromYerevan")}</li>
              <li>{t("fromStepanavan")}</li>
            </ul>
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <ExternalLink className="h-4 w-4" />
              {t("openInMaps")}
            </a>
          </div>
          <div className="overflow-hidden rounded-xl border border-border lg:col-span-2">
            <iframe
              src={mapsEmbed}
              title={t("title")}
              className="h-[400px] w-full md:h-[500px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/location.tsx
git commit -m "feat: location section with embedded map"
```

---

### Task 22: Disabled booking calendar component

**Files:**
- Create: `components/disabled-booking-calendar.tsx`

- [ ] **Step 1: Implement disabled calendar**

`components/disabled-booking-calendar.tsx`:
```tsx
"use client";

import { Calendar } from "@/components/ui/calendar";
import { useTranslations } from "next-intl";

export function DisabledBookingCalendar() {
  const t = useTranslations("contact");
  return (
    <div className="relative rounded-xl border border-border bg-surface p-4">
      <div aria-hidden className="pointer-events-none opacity-40">
        <Calendar
          mode="single"
          disabled={() => true}
          numberOfMonths={1}
          className="mx-auto"
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <span className="rounded-full bg-accent px-5 py-2 text-center text-xs font-semibold uppercase tracking-wider text-accent-foreground shadow-lg md:text-sm">
          {t("comingSoon")}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/disabled-booking-calendar.tsx
git commit -m "feat: disabled booking calendar with coming-soon badge"
```

---

### Task 23: Contact section UI (form not yet wired)

**Files:**
- Create: `components/contact-form.tsx`
- Replace: `components/sections/contact.tsx`

- [ ] **Step 1: Contact form (UI only — submit handler stubbed)**

`components/contact-form.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";

export const contactSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(5).max(40),
  email: z.string().email().optional().or(z.literal("")),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.string().optional(),
  message: z.string().max(2000).optional(),
  website: z.string().max(0).optional(), // honeypot
});

export type ContactInput = z.infer<typeof contactSchema>;

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: ContactInput) {
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-accent/40 bg-accent/10 p-6 text-center">
        <p className="text-base font-medium">{t("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} className="hidden" />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t("name")} error={errors.name?.message}>
          <input
            {...register("name")}
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
            autoComplete="name"
          />
        </Field>
        <Field label={t("phone")} error={errors.phone?.message}>
          <input
            {...register("phone")}
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
            autoComplete="tel"
            inputMode="tel"
          />
        </Field>
        <Field label={t("email")} error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
            autoComplete="email"
          />
        </Field>
        <Field label={t("guests")} error={errors.guests?.message}>
          <input
            {...register("guests")}
            type="number"
            min={1}
            max={20}
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
          />
        </Field>
        <Field label={t("checkIn")} error={errors.checkIn?.message}>
          <input
            {...register("checkIn")}
            type="date"
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
          />
        </Field>
        <Field label={t("checkOut")} error={errors.checkOut?.message}>
          <input
            {...register("checkOut")}
            type="date"
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
          />
        </Field>
      </div>
      <Field label={t("message")} error={errors.message?.message}>
        <textarea
          {...register("message")}
          rows={4}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
        />
      </Field>
      {status === "error" && (
        <p className="text-sm text-red-500">{t("error")}</p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 inline-flex h-12 items-center justify-center rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  );
}
```

- [ ] **Step 2: Contact section**

`components/sections/contact.tsx`:
```tsx
import { useTranslations } from "next-intl";
import { Phone, Mail } from "lucide-react";
import { DisabledBookingCalendar } from "@/components/disabled-booking-calendar";
import { ContactForm } from "@/components/contact-form";
import { SITE } from "@/lib/content";

export function Contact() {
  const t = useTranslations("contact");
  return (
    <section id="contact" className="border-b border-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-14 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            {t("kicker")}
          </span>
          <h2 className="font-display text-4xl font-light md:text-6xl">{t("title")}</h2>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <DisabledBookingCalendar />
            <p className="text-sm text-muted-foreground">{t("calendarHint")}</p>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6">
              <a
                href={`tel:${SITE.phoneE164}`}
                className="flex items-center gap-3 text-lg font-semibold transition-colors hover:text-accent"
              >
                <Phone className="h-5 w-5 text-accent" />
                {SITE.phone}
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-3 text-base transition-colors hover:text-accent"
              >
                <Mail className="h-5 w-5 text-accent" />
                {SITE.email}
              </a>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/sections/contact.tsx components/contact-form.tsx
git commit -m "feat: contact section with disabled calendar and form"
```

---

### Task 24: Footer

**Files:**
- Replace: `components/sections/footer.tsx`

- [ ] **Step 1: Implement Footer**

`components/sections/footer.tsx`:
```tsx
"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SITE } from "@/lib/content";

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale() as "hy" | "ru" | "en";
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const logoSrc =
    mounted && resolvedTheme === "light" ? "/logo-light.jpeg" : "/logo-dark.jpeg";

  return (
    <footer className="bg-muted/30 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-3 md:px-8">
        <div className="flex flex-col gap-4">
          <Image
            src={logoSrc}
            alt={SITE.name}
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
          <span className="font-display text-xl">{SITE.name}</span>
        </div>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <a href={`tel:${SITE.phoneE164}`} className="flex items-center gap-2 hover:text-foreground">
            <Phone className="h-4 w-4" /> {SITE.phone}
          </a>
          <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-foreground">
            <Mail className="h-4 w-4" /> {SITE.email}
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {SITE.address[locale]}
          </span>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("languageLabel")}
          </span>
          <LanguageSwitcher />
          <span className="mt-auto text-xs text-muted-foreground">{t("rights")}</span>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Visual sanity — full page**

```bash
pnpm dev
```
Open `http://localhost:3000/hy`. Scroll the whole page top to bottom — every section should render with content. Switch to `/ru` and `/en`. Toggle theme. Stop server.

- [ ] **Step 3: Commit**

```bash
git add components/sections/footer.tsx
git commit -m "feat: footer section"
```

---

## Phase 5 — Contact API

### Task 25: Vitest setup

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Configure Vitest**

`vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
});
```

- [ ] **Step 2: Sanity test**

Create `lib/__tests__/sanity.test.ts`:
```typescript
import { describe, it, expect } from "vitest";

describe("sanity", () => {
  it("runs", () => expect(1 + 1).toBe(2));
});
```

Run:
```bash
pnpm test
```
Expected: 1 test passes. Delete the file:
```bash
rm lib/__tests__/sanity.test.ts
rmdir lib/__tests__
```

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: configure vitest"
```

---

### Task 26: Rate-limit util (TDD)

**Files:**
- Create: `lib/rate-limit.test.ts`
- Create: `lib/rate-limit.ts`

- [ ] **Step 1: Write the failing test**

`lib/rate-limit.test.ts`:
```typescript
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

  it("allows again after the window passes", () => {
    rateLimit.check("1.1.1.1", { windowMs: 10, max: 1 });
    return new Promise((r) => setTimeout(r, 15)).then(() => {
      expect(rateLimit.check("1.1.1.1", { windowMs: 10, max: 1 })).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run test — verify failure**

```bash
pnpm test
```
Expected: fails with "rateLimit not found".

- [ ] **Step 3: Implement**

`lib/rate-limit.ts`:
```typescript
type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export const rateLimit = {
  check(key: string, opts: { windowMs: number; max: number }): boolean {
    const now = Date.now();
    const existing = store.get(key);
    if (!existing || existing.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + opts.windowMs });
      return true;
    }
    if (existing.count >= opts.max) return false;
    existing.count += 1;
    return true;
  },
  __reset() {
    store.clear();
  },
};
```

- [ ] **Step 4: Run test — verify passes**

```bash
pnpm test
```
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/rate-limit.ts lib/rate-limit.test.ts
git commit -m "feat: in-memory rate limiter with tests"
```

---

### Task 27: Contact API route

**Files:**
- Create: `app/api/contact/route.ts`
- Create: `app/api/contact/route.test.ts`
- Create: `.env.local` (untracked)
- Modify: `.env.example`

- [ ] **Step 1: Write the failing test**

`app/api/contact/route.test.ts`:
```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { rateLimit } from "@/lib/rate-limit";

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn().mockResolvedValue({ id: "test" }) },
  })),
}));

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
    const res = await POST(
      makeReq({ name: "Vanik", phone: "+374411234567" }),
    );
    expect(res.status).toBe(200);
  });

  it("silently 200s when honeypot is filled", async () => {
    const res = await POST(
      makeReq({ name: "x", phone: "+1", website: "spam" }, "8.8.8.8"),
    );
    expect(res.status).toBe(200);
  });

  it("rate-limits a second request from same IP", async () => {
    await POST(makeReq({ name: "A", phone: "+1" }, "5.5.5.5"));
    const res = await POST(makeReq({ name: "B", phone: "+2" }, "5.5.5.5"));
    expect(res.status).toBe(429);
  });
});
```

- [ ] **Step 2: Run — fails with no route**

```bash
pnpm test
```
Expected: fails to import `./route`.

- [ ] **Step 3: Implement the route**

`app/api/contact/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/components/contact-form";
import { rateLimit } from "@/lib/rate-limit";
import { SITE } from "@/lib/content";

export const runtime = "nodejs";

function getIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Honeypot: silently accept and drop
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
  const text = [
    `Name: ${name}`,
    `Phone: ${phone}`,
    email && `Email: ${email}`,
    checkIn && `Check-in: ${checkIn}`,
    checkOut && `Check-out: ${checkOut}`,
    guests && `Guests: ${guests}`,
    message && `\nMessage:\n${message}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await resend.emails.send({
      from: `Queen House <noreply@${SITE.domain}>`,
      to: SITE.email,
      replyTo: email || undefined,
      subject: `New booking inquiry from ${name}`,
      text,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run tests — verify passes**

```bash
pnpm test
```
Expected: 4 contact-route tests pass + 4 rate-limit tests pass.

- [ ] **Step 5: Add env example**

Create `.env.example`:
```
RESEND_API_KEY=
```

Create local env (untracked) for dev:
```bash
echo "RESEND_API_KEY=" > .env.local
```

- [ ] **Step 6: Commit**

```bash
git add app/api/contact .env.example
git commit -m "feat: contact api with validation, honeypot, rate limit, resend"
```

---

## Phase 6 — SEO + Polish

### Task 28: Sitemap and robots

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

- [ ] **Step 1: Sitemap**

`app/sitemap.ts`:
```typescript
import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routing.locales.map((locale) => ({
    url: `${SITE.url}/${locale}`,
    lastModified,
    changeFrequency: "weekly",
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE.url}/${l}`]),
      ),
    },
  }));
}
```

- [ ] **Step 2: Robots**

`app/robots.ts`:
```typescript
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat: sitemap and robots"
```

---

### Task 29: JSON-LD structured data

**Files:**
- Create: `components/json-ld.tsx`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: JSON-LD component**

`components/json-ld.tsx`:
```tsx
import { SITE } from "@/lib/content";

export function JsonLd({ locale }: { locale: "hy" | "ru" | "en" }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: SITE.name,
    description: "Two A-frame wooden cabins for daily rental in Vardablur, Lori, Armenia.",
    url: `${SITE.url}/${locale}`,
    telephone: SITE.phoneE164,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Vardablur",
      addressRegion: "Lori",
      addressCountry: "AM",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.coords.lat,
      longitude: SITE.coords.lng,
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Heated jacuzzi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Fire pit", value: true },
      { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Parking", value: true },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 2: Render in layout `<head>`**

Edit `app/[locale]/layout.tsx`:

Add import at top:
```tsx
import { JsonLd } from "@/components/json-ld";
```

Inside `<head>` block, after `<ThemeScript />`:
```tsx
<JsonLd locale={locale as "hy" | "ru" | "en"} />
```

- [ ] **Step 3: Commit**

```bash
git add components/json-ld.tsx app/[locale]/layout.tsx
git commit -m "feat: add LodgingBusiness json-ld"
```

---

### Task 30: Open Graph image

**Files:**
- Create: `app/[locale]/opengraph-image.tsx`

- [ ] **Step 1: Implement OG generator**

`app/[locale]/opengraph-image.tsx`:
```tsx
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "meta" });
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          background: "#0a0a0a",
          color: "#f5f1e8",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#d4af37", letterSpacing: 4, textTransform: "uppercase" }}>
          Queen House
        </div>
        <div style={{ fontSize: 72, lineHeight: 1.05, marginTop: 16 }}>{t("title")}</div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/opengraph-image.tsx
git commit -m "feat: dynamic open graph image per locale"
```

---

### Task 31: Verify build + Lighthouse

- [ ] **Step 1: Production build**

```bash
pnpm build
```
Expected: build succeeds with all 3 locale routes statically generated.

- [ ] **Step 2: Run prod**

```bash
pnpm start
```
Open `http://localhost:3000` (redirects to `/hy`).

- [ ] **Step 3: Lighthouse audit**

Open Chrome DevTools → Lighthouse → Mobile → run for `/hy`. Capture results. Targets:
- Performance ≥ 95
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 95

If any score < 90, note specifics and revisit. Common fixes:
- LCP issue → confirm hero `priority` and image sizes correct
- Layout shift → check font swap (already self-hosted via next/font)
- Missing alt text → audit images

Stop server.

- [ ] **Step 4: Commit anything fixed**

```bash
git add -A
git commit -m "perf: lighthouse pass" --allow-empty
```

---

## Phase 7 — Deploy

### Task 32: Push to GitHub + deploy to Vercel

- [ ] **Step 1: Create GitHub repo**

Run (requires `gh` CLI authed):
```bash
gh repo create queenhouse --private --source=. --remote=origin --push
```

- [ ] **Step 2: Connect Vercel**

In a browser:
1. Go to vercel.com/new
2. Import the `queenhouse` repo
3. Framework: Next.js (auto-detected)
4. Add env var: `RESEND_API_KEY` = (the real key from resend.com — create account, verify domain `queenhouse.am` once DNS active)
5. Deploy

- [ ] **Step 3: Configure custom domain**

Once `queenhouse.am` DNS is active:
1. In Vercel project → Settings → Domains
2. Add `queenhouse.am` and `www.queenhouse.am`
3. Follow DNS instructions (A record `76.76.21.21` for apex, CNAME for www)
4. Wait for HTTPS provisioning

- [ ] **Step 4: Smoke test production**

Once domain resolves:
- Visit `https://queenhouse.am/` → redirects to `/hy`
- Switch languages, switch theme
- Open every section, click phone link on mobile
- Submit contact form → owner receives email at `queenhouse.arm@gmail.com`
- Run Lighthouse on production URL

---

## Pre-Launch Checklist

Before announcing the site (owner action items, parallel to deploy):

- [ ] Replace house names *The Crown / The Mercury* with final names if desired (edit `i18n/messages/*.json`)
- [ ] Verify hero tagline copy in all 3 languages
- [ ] Confirm exact GPS coords; update `lib/content.ts`
- [ ] Confirm Yerevan/Stepanavan distance figures
- [ ] Provide Instagram handle (or confirm none → keep `null`)
- [ ] Manually export `IMG_4858.DNG` to JPEG, place in `media/`, re-run `pnpm convert-media`
- [ ] Pick the actual best photo for hero (edit indices in `lib/images.ts`)
- [ ] Get Resend API key, verify domain
- [ ] DNS for `queenhouse.am` pointed at Vercel

---

## Out-of-Scope (Phase 2 hooks left in place)

- Real online booking → swap `<DisabledBookingCalendar />` for an active component, add `app/api/bookings/`
- Payments (Stripe / Idram / Telcell)
- Reviews section
- Blog under `/[locale]/blog`
- Move rate-limit to Upstash Redis
- Replace JPEG logos with proper SVGs
