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
    <section
      id="houses"
      className="border-b border-border bg-muted/30 py-24 md:py-32"
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
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {houses.map(({ id, photos }) => (
            <article
              key={id}
              className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <PhotoCarousel photos={photos} alt={t(`${id}.name`)} />
              <h3 className="font-display text-2xl font-medium">
                {t(`${id}.name`)}
              </h3>
              <p className="text-muted-foreground">{t(`${id}.description`)}</p>
              <a
                href={`tel:${SITE.phoneE164}`}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
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
