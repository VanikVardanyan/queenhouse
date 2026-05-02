import { useTranslations } from "next-intl";
import { Phone, Mail } from "lucide-react";
import { DisabledBookingCalendar } from "@/components/disabled-booking-calendar";
import { ContactForm } from "@/components/contact-form";
import { SITE } from "@/lib/content";

export function Contact() {
  const t = useTranslations("contact");
  return (
    <section
      id="contact"
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

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <DisabledBookingCalendar />
            <p className="text-sm text-muted-foreground">{t("calendarHint")}</p>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
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
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
