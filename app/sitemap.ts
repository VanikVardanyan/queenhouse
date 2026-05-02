import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routing.locales.map((locale) => ({
    url: `${SITE.url}/${locale}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE.url}/${l}`]),
      ),
    },
  }));
}
