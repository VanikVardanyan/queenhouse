import { useTranslations } from "next-intl";
import { Phone, Mail } from "lucide-react";
import { BookingForm } from "@/components/booking-form";
import { SITE } from "@/lib/content";

export function Contact() {
  const t = useTranslations("contact");
  return (
    <section
      id="contact"
      className="border-b border-border bg-background py-24 md:py-32"
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

        <div className="grid gap-10 lg:grid-cols-[1fr_auto]">
          <BookingForm />
          <aside className="flex flex-col gap-3 self-start rounded-xl border border-border bg-card p-6 lg:w-72">
            <p className="text-sm text-muted-foreground">{t("calendarHint")}</p>
            <a
              href={`tel:${SITE.phoneE164}`}
              className="flex items-center gap-3 text-lg font-semibold transition-colors hover:text-primary"
            >
              <Phone className="h-5 w-5 text-primary" />
              {SITE.phone}
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-3 text-base transition-colors hover:text-primary"
            >
              <Mail className="h-5 w-5 text-primary" />
              {SITE.email}
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
