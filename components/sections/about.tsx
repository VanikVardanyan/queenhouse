import Image from "next/image";
import { useTranslations } from "next-intl";
import { aboutImage } from "@/lib/images";

export function About() {
  const t = useTranslations("about");
  return (
    <section id="about" className="border-b border-border bg-background py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-2 md:gap-16 md:px-8">
        <div className="flex flex-col justify-center gap-6">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
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
