import { useTranslations, useLocale } from "next-intl";
import { ExternalLink } from "lucide-react";
import { SITE } from "@/lib/content";

export function Location() {
  const t = useTranslations("location");
  const locale = useLocale() as "hy" | "ru" | "en";
  const mapsEmbed = `https://www.google.com/maps?q=${SITE.coords.lat},${SITE.coords.lng}&hl=${locale}&z=12&output=embed`;

  return (
    <section
      id="location"
      className="border-b border-border bg-background py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-14 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            {t("kicker")}
          </span>
          <h2 className="font-display text-4xl font-light md:text-6xl">
            {t("title")}
          </h2>
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
