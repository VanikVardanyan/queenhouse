import { useTranslations } from "next-intl";
import { Phone, Users } from "lucide-react";
import { PhotoCarousel } from "@/components/photo-carousel";
import { house1Photos, house2Photos } from "@/lib/images";
import { SITE } from "@/lib/content";

export function Houses() {
  const t = useTranslations("houses");
  const photos = [...house1Photos, ...house2Photos];

  return (
    <section
      id="houses"
      className="border-b border-border bg-muted/30 py-24 md:py-32"
    >
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <div className="mb-14 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            {t("kicker")}
          </span>
          <h2 className="font-display text-4xl font-light md:text-6xl">
            {t("title")}
          </h2>
        </div>

        <PhotoCarousel photos={photos} alt={t("title")} />

        <p className="mt-10 max-w-2xl text-lg text-muted-foreground">
          {t("description")}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-sm font-medium">
            <Users className="h-4 w-4 text-primary" />
            {t("capacity.small")}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-sm font-medium">
            <Users className="h-4 w-4 text-primary" />
            {t("capacity.large")}
          </span>
        </div>

        <a
          href={`tel:${SITE.phoneE164}`}
          className="mt-10 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Phone className="h-5 w-5" />
          {t("callCta")}
        </a>
      </div>
    </section>
  );
}
