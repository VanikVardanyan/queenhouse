"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
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

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

export function BookingCalendar({ house }: { house: House }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<
    { booking?: Booking; range?: { from: string; to: string } } | null
  >(null);
  const [selected, setSelected] = useState<Date | undefined>();
  const isDesktop = useIsDesktop();

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

  function onSelect(date: Date | undefined) {
    if (!date) return;
    setSelected(date);
    const existing = findBookingForDate(date, bookings);
    if (existing) {
      setModalInitial({ booking: existing });
    } else {
      const iso = toIso(date);
      setModalInitial({ range: { from: iso, to: iso } });
    }
    setModalOpen(true);
  }

  function handleModalChange(next: boolean) {
    setModalOpen(next);
    if (!next) setSelected(undefined);
  }

  function openAdd() {
    const today = toIso(new Date());
    setModalInitial({ range: { from: today, to: today } });
    setModalOpen(true);
  }

  async function handleSave(draft: BookingDraft) {
    const supabase = createClient();
    if (!supabase) throw new Error("Supabase կարգավորված չէ");
    if (modalInitial?.booking) {
      const { error } = await supabase
        .from("bookings")
        .update({
          start_date: draft.start_date,
          end_date: draft.end_date,
          note: draft.note || null,
        })
        .eq("id", modalInitial.booking.id);
      if (error) throw error;
    } else {
      const insert: BookingInsert = {
        house,
        start_date: draft.start_date,
        end_date: draft.end_date,
        note: draft.note || null,
      };
      const { error } = await supabase.from("bookings").insert(insert);
      if (error) throw error;
    }
    setSelected(undefined);
    await reload();
  }

  async function handleDelete() {
    if (!modalInitial?.booking) return;
    const supabase = createClient();
    if (!supabase) throw new Error("Supabase կարգավորված չէ");
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", modalInitial.booking.id);
    if (error) throw error;
    setSelected(undefined);
    await reload();
  }

  const blocked = bookedDateSet(bookings);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Սեղմեք ամսաթվի վրա՝ ավելացնելու կամ խմբագրելու համար։
        </p>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 md:w-auto"
        >
          <Plus className="h-4 w-4" /> Ավելացնել
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-primary" />
          Զբաղված
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-border bg-background" />
          Ազատ
        </span>
      </div>

      {mounted ? (
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          numberOfMonths={isDesktop ? 2 : 1}
          modifiers={{
            booked: (d: Date) => isDateBlocked(d, blocked),
          }}
          modifiersClassNames={{
            booked:
              "!bg-primary !text-primary-foreground !font-bold !rounded-full",
          }}
          className="mx-auto"
        />
      ) : (
        <div className="mx-auto h-[400px] w-full max-w-2xl" />
      )}
      {loading && (
        <p className="text-center text-sm text-muted-foreground">Բեռնում…</p>
      )}
      <BookingModal
        open={modalOpen}
        onOpenChange={handleModalChange}
        initial={modalInitial}
        onSave={handleSave}
        onDelete={modalInitial?.booking ? handleDelete : undefined}
      />
    </div>
  );
}
