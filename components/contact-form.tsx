"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";

export const contactSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(5).max(40),
  email: z.string().email().optional().or(z.literal("")),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.string().optional(),
  message: z.string().max(2000).optional(),
  website: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: ContactInput) {
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-primary/40 bg-primary/10 p-6 text-center">
        <p className="text-base font-medium">{t("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...register("website")}
        className="hidden"
      />
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
        <Field label={t("checkIn")} error={errors.checkIn?.message}>
          <input
            {...register("checkIn")}
            type="date"
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
          />
        </Field>
        <Field label={t("checkOut")} error={errors.checkOut?.message}>
          <input
            {...register("checkOut")}
            type="date"
            className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground"
          />
        </Field>
      </div>
      <Field label={t("message")} error={errors.message?.message}>
        <textarea
          {...register("message")}
          rows={4}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"
        />
      </Field>
      {status === "error" && <p className="text-sm text-red-500">{t("error")}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
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
