import { useTranslations } from "next-intl";
import { AMENITIES } from "@/lib/content";

export function Amenities() {
  const t = useTranslations("amenities");
  return (
    <section
      id="amenities"
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
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
          {AMENITIES.map(({ key, emoji }) => (
            <li
              key={key}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center"
            >
              <span className="text-4xl" aria-hidden>
                {emoji}
              </span>
              <span className="text-sm font-medium md:text-base">
                {t(`items.${key}`)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
