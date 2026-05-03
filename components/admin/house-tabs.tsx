"use client";

import type { House } from "@/lib/supabase/types";
import { HOUSES } from "@/lib/supabase/types";

const LABELS: Record<House, string> = {
  small: "Дом для 2 гостей",
  large: "Дом для 4 гостей",
};

export function HouseTabs({
  value,
  onChange,
}: {
  value: House;
  onChange: (h: House) => void;
}) {
  return (
    <div className="flex gap-2">
      {HOUSES.map((h) => (
        <button
          key={h}
          type="button"
          onClick={() => onChange(h)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            value === h
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          }`}
        >
          {LABELS[h]}
        </button>
      ))}
    </div>
  );
}
