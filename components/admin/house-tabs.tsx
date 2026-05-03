"use client";

import type { House } from "@/lib/supabase/types";
import { HOUSES } from "@/lib/supabase/types";

const LABELS: Record<House, string> = {
  small: "Տուն 2 հյուրի համար",
  large: "Տուն 4 հյուրի համար",
};

export function HouseTabs({
  value,
  onChange,
}: {
  value: House;
  onChange: (h: House) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {HOUSES.map((h) => (
        <button
          key={h}
          type="button"
          onClick={() => onChange(h)}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-initial sm:px-4 ${
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
