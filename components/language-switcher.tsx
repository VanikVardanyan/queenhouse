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
    const path = segments.join("/") || `/${next}`;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    router.push(path + hash, { scroll: false });
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
              loc === current
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
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
