"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { bookedDateSet, isDateBlocked } from "@/lib/bookings/utils";
import type { Booking, BookingInsert, House } from "@/lib/supabase/types";
import { BookingModal, type BookingDraft } from "./booking-modal";

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function findBookingForDate(date: Date, list: Booking[]): Booking | null {
  const iso = toIso(date);
  return (
    list.find((b) => b.start_date <= iso && b.end_date >= iso) ?? null
  );
}

export function BookingCalendar({ house }: { house: House }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<
    { booking?: Booking; range?: { from: string; to: string } } | null
  >(null);
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});

  useEffect(() => setMounted(true), []);

  const reload = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setBookings([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("house", house)
      .order("start_date");
    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  }, [house]);

  useEffect(() => {
    void reload();
  }, [reload]);

  function onSelect(value: { from?: Date; to?: Date } | undefined) {
    if (!value?.from) return;

    if (!value.to || toIso(value.from) === toIso(value.to)) {
      const existing = findBookingForDate(value.from, bookings);
      if (existing) {
        setModalInitial({ booking: existing });
        setModalOpen(true);
        setRange({});
        return;
      }
    }

    setRange(value);
    if (value.from && value.to) {
      setModalInitial({
        range: { from: toIso(value.from), to: toIso(value.to) },
      });
      setModalOpen(true);
    }
  }

  async function handleSave(draft: BookingDraft) {
    const supabase = createClient();
    if (!supabase) return;
    if (modalInitial?.booking) {
      await supabase
        .from("bookings")
        .update({
          start_date: draft.start_date,
          end_date: draft.end_date,
          note: draft.note || null,
        })
        .eq("id", modalInitial.booking.id);
    } else {
      const insert: BookingInsert = {
        house,
        start_date: draft.start_date,
        end_date: draft.end_date,
        note: draft.note || null,
      };
      await supabase.from("bookings").insert(insert);
    }
    setRange({});
    await reload();
  }

  async function handleDelete() {
    if (!modalInitial?.booking) return;
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("bookings").delete().eq("id", modalInitial.booking.id);
    setRange({});
    await reload();
  }

  const blocked = bookedDateSet(bookings);

  return (
    <div className="flex flex-col gap-4">
      {mounted ? (
        <Calendar
          mode="range"
          selected={range.from ? { from: range.from, to: range.to } : undefined}
          onSelect={onSelect}
          numberOfMonths={2}
          modifiers={{
            booked: (d: Date) => isDateBlocked(d, blocked),
          }}
          modifiersClassNames={{
            booked: "bg-primary/30 text-primary-foreground font-semibold",
          }}
          className="mx-auto"
        />
      ) : (
        <div className="mx-auto h-[400px] w-full max-w-2xl" />
      )}
      {loading && (
        <p className="text-center text-sm text-muted-foreground">Загрузка…</p>
      )}
      <BookingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={modalInitial}
        onSave={handleSave}
        onDelete={modalInitial?.booking ? handleDelete : undefined}
      />
    </div>
  );
}
