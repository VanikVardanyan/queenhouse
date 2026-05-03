"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import {
  bookedDateSet,
  isDateBlocked,
  toLocalIso,
} from "@/lib/bookings/utils";
import type { Booking, House } from "@/lib/supabase/types";
import { HOUSES } from "@/lib/supabase/types";
import type { ContactInput } from "@/lib/contact-schema";

function rangeIsClean(
  from: Date,
  to: Date,
  blocked: Set<string>,
): boolean {
  // Note: end_date (checkout) itself is allowed even if next stay starts that day,
  // because we only need to check that nights between [from, to) are free.
  const cursor = new Date(from);
  while (cursor < to) {
    if (isDateBlocked(cursor, blocked)) return false;
    cursor.setDate(cursor.getDate() + 1);
  }
  return true;
}

export function BookingForm() {
  const t = useTranslations("contact.form");
  const tHouse = useTranslations("contact.availability");
  const [house, setHouse] = useState<House>("small");
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  const [dateError, setDateError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let cancelled = false;
    setCalendarLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setBlocked(new Set());
      setCalendarLoading(false);
      return;
    }
    supabase
      .from("bookings")
      .select("*")
      .eq("house", house)
      .gte("end_date", toLocalIso(new Date()))
      .then(({ data }) => {
        if (cancelled) return;
        setBlocked(bookedDateSet((data as Booking[]) ?? []));
        setCalendarLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [house]);

  const schema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .min(1, t("errors.required"))
          .max(100, t("errors.tooLong")),
        phone: z
          .string()
          .min(5, t("errors.phoneTooShort"))
          .max(40, t("errors.tooLong")),
        email: z
          .string()
          .email(t("errors.invalidEmail"))
          .optional()
          .or(z.literal("")),
        guests: z.string().optional(),
        message: z.string().max(2000, t("errors.tooLong")).optional(),
        website: z.string().optional(),
      }),
    [t],
  );

  type FormFields = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormFields>({ resolver: zodResolver(schema) });

  function onSelect(value: { from?: Date; to?: Date } | undefined) {
    if (!value?.from) {
      setRange({});
      return;
    }
    setDateError(null);
    if (value.to && !rangeIsClean(value.from, value.to, blocked)) {
      setDateError(t("datesHelp"));
      setRange({ from: value.from });
      return;
    }
    setRange(value);
  }

  function nights(): number {
    if (!range.from || !range.to) return 0;
    return Math.max(
      0,
      Math.round((+range.to - +range.from) / (1000 * 60 * 60 * 24)),
    );
  }

  async function onSubmit(values: FormFields) {
    setStatus("submitting");
    const payload: ContactInput = {
      ...values,
      house,
      checkIn: range.from ? toLocalIso(range.from) : undefined,
      checkOut: range.to ? toLocalIso(range.to) : undefined,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      reset();
      setRange({});
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-primary/40 bg-primary/10 p-8 text-center">
        <p className="text-base font-medium">{t("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...register("website")}
        className="hidden"
      />

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          1. {t("pickHouse")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {HOUSES.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHouse(h)}
              className={`flex-1 rounded-md border px-4 py-3 text-sm font-medium transition-colors sm:flex-initial ${
                house === h
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {tHouse(h === "small" ? "smallHouse" : "largeHouse")}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          2. {t("pickDates")}
        </h3>
        <p className="text-xs text-muted-foreground">{t("datesHelp")}</p>
        <div
          className={`rounded-xl border border-border bg-card p-2 ${calendarLoading ? "opacity-60" : ""}`}
        >
          {mounted ? (
            <Calendar
              mode="range"
              selected={range.from ? { from: range.from, to: range.to } : undefined}
              onSelect={onSelect}
              numberOfMonths={1}
              disabled={(d) =>
                d < new Date(new Date().toDateString()) ||
                isDateBlocked(d, blocked)
              }
              modifiers={{
                booked: (d: Date) => isDateBlocked(d, blocked),
              }}
              modifiersClassNames={{
                booked:
                  "!bg-muted !text-muted-foreground/60 line-through opacity-60",
              }}
              className="mx-auto"
            />
          ) : (
            <div className="mx-auto h-[300px] w-full" />
          )}
        </div>
        {range.from && range.to && (
          <p className="text-sm font-medium text-primary">
            {toLocalIso(range.from)} → {toLocalIso(range.to)}
            {nights() > 0 && (
              <span className="ml-2 text-muted-foreground">
                ({t("datesSelected", { nights: nights() })})
              </span>
            )}
          </p>
        )}
        {dateError && <p className="text-sm text-red-500">{dateError}</p>}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          3. {t("yourInfo")}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("name")} error={errors.name?.message}>
            <input
              {...register("name")}
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
              autoComplete="name"
            />
          </Field>
          <Field label={t("phone")} error={errors.phone?.message}>
            <input
              {...register("phone")}
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>
          <Field label={t("email")} error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
              autoComplete="email"
            />
          </Field>
          <Field label={t("guests")} error={errors.guests?.message}>
            <input
              {...register("guests")}
              type="number"
              min={1}
              max={20}
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
            />
          </Field>
        </div>
        <Field label={t("message")} error={errors.message?.message}>
          <textarea
            {...register("message")}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
          />
        </Field>
      </section>

      {status === "error" && (
        <p className="text-sm text-red-500">{t("error")}</p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  );
}
