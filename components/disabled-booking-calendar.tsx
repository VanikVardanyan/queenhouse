"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useTranslations } from "next-intl";

export function DisabledBookingCalendar() {
  const t = useTranslations("contact");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative rounded-xl border border-border bg-card p-4">
      <div aria-hidden className="pointer-events-none min-h-[300px] opacity-40">
        {mounted && (
          <Calendar
            mode="single"
            disabled={() => true}
            numberOfMonths={1}
            className="mx-auto"
          />
        )}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <span className="rounded-full bg-primary px-5 py-2 text-center text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-lg md:text-sm">
          {t("comingSoon")}
        </span>
      </div>
    </div>
  );
}
