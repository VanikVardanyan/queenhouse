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
          <a
            href={`tel:${SITE.phoneE164}`}
            className="flex items-center gap-2 hover:text-foreground"
          >
            <Phone className="h-4 w-4" /> {SITE.phone}
          </a>
          <a
            href={`mailto:${SITE.email}`}
            className="flex items-center gap-2 hover:text-foreground"
          >
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
          <span className="mt-auto text-xs text-muted-foreground">
            {t("rights")}
          </span>
        </div>
      </div>
    </footer>
  );
}
