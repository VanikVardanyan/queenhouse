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
      <video
        src="/videos/hero.mp4"
        poster={heroImage.src}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
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
            className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
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
