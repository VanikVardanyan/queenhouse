"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Booking } from "@/lib/supabase/types";

export type BookingDraft = {
  start_date: string;
  end_date: string;
  note: string;
};

export function BookingModal({
  open,
  onOpenChange,
  initial,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  initial: { booking?: Booking; range?: { from: string; to: string } } | null;
  onSave: (draft: BookingDraft) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!initial) return;
    if (initial.booking) {
      setStart(initial.booking.start_date);
      setEnd(initial.booking.end_date);
      setNote(initial.booking.note ?? "");
    } else if (initial.range) {
      setStart(initial.range.from);
      setEnd(initial.range.to);
      setNote("");
    }
  }, [initial]);

  const isEdit = Boolean(initial?.booking);

  async function handleSave() {
    setBusy(true);
    await onSave({ start_date: start, end_date: end, note });
    setBusy(false);
    onOpenChange(false);
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm("Удалить бронь?")) return;
    setBusy(true);
    await onDelete();
    setBusy(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Изменить бронь" : "Добавить бронь"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Заезд</span>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Выезд</span>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Заметка</span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Имя гостя, телефон, аванс…"
              className="rounded-md border border-border bg-background p-3"
            />
          </label>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy || !start || !end}
              className="flex-1 h-11 rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Сохраняем…" : "Сохранить"}
            </button>
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="h-11 rounded-md border border-red-500/50 px-4 text-sm font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-60"
              >
                Удалить
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
