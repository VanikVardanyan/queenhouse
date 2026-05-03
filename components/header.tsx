"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { Phone, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { SITE } from "@/lib/content";

const SECTIONS = [
  "home",
  "houses",
  "amenities",
  "gallery",
  "location",
  "contact",
] as const;

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => setMounted(true), []);
  const logoSrc =
    mounted && theme === "light" ? "/logo-light.jpeg" : "/logo-dark.jpeg";

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
              className="text-foreground/80 transition-colors hover:text-primary"
            >
              {t(s)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${SITE.phoneE164}`}
            className="hidden items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 md:inline-flex"
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
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-3 font-semibold text-primary-foreground"
            >
              <Phone className="h-4 w-4" /> {SITE.phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
