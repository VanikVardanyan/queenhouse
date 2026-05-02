import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["hy", "ru", "en"],
  defaultLocale: "hy",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
