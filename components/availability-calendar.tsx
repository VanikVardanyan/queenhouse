"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { bookedDateSet, isDateBlocked } from "@/lib/bookings/utils";
import type { Booking, House } from "@/lib/supabase/types";
import { HOUSES } from "@/lib/supabase/types";

export function AvailabilityCalendar() {
  const t = useTranslations("contact");
  const [house, setHouse] = useState<House>("small");
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("bookings")
      .select("*")
      .eq("house", house)
      .gte("end_date", new Date().toISOString().slice(0, 10))
      .then(({ data }) => {
        if (cancelled) return;
        setBlocked(bookedDateSet((data as Booking[]) ?? []));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [house]);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex gap-2">
        {HOUSES.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => setHouse(h)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              house === h
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {t(`availability.${h === "small" ? "smallHouse" : "largeHouse"}`)}
          </button>
        ))}
      </div>
      <div className={loading ? "opacity-50" : ""}>
        <Calendar
          mode="single"
          numberOfMonths={1}
          disabled={(d) =>
            d < new Date(new Date().toDateString()) || isDateBlocked(d, blocked)
          }
          className="mx-auto"
        />
      </div>
      {loading && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {t("availability.loading")}
        </p>
      )}
    </div>
  );
}
